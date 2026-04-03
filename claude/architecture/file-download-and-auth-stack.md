# ICDC File Download & Authorization Stack

**Document Type:** Architecture Reference  
**Prepared by:** Gina Kuffel, Senior TPM, BACS/FNL  
**Date:** April 2026  
**Source:** Source code review — `CBIIT/bento-files` @ `6b4b40a`, `CBIIT/bento-auth` @ `master`  
**Related Jira:** ICDC-1700 (direct file download, ICDC 3.2.0, June 2021)

---

## 1. Overview

This document captures the complete technical architecture governing how ICDC enables users to download files directly from the application — from the moment a user clicks the download icon in the React frontend, through the authorization chain, to the moment bytes arrive from S3. It covers three distinct services and their integration with the Gen3 / NIH identity infrastructure.

The key insight: **ICDC is not a direct client of Gen3 Fence.** It is a client of `bento-auth`, which itself is the Fence OAuth2 client. Fence is not in the hot path of file downloads — it is only involved at login time.

---

## 2. Feature History — When File Download Was Enabled

### 2.1 Phase 1: Manifest Downloads (ICDC 1.0, Late 2019)

ICDC's first file-related capability was **manifest downloads** — not direct file downloads. Because ICDC stores large scientific files (BAM, FASTQ, etc., often multiple gigabytes), users could not simply click to download them. Instead, they assembled a cart of files and downloaded a **CSV manifest** — a text file containing file UUIDs, names, and MD5 checksums — which could then be submitted to a cloud compute environment (e.g., Seven Bridges) to access the actual data.

Key ICDC 1.0 tickets:

| Ticket | Capability |
|---|---|
| ICDC-833 | User selects case-level files for analysis |
| ICDC-923 | User downloads CSV manifest of case-level files |
| ICDC-931/932 | User selects and downloads CSV manifest of study-level files |
| ICDC-852 | Initial cart concept for queuing files for export |

### 2.2 Phase 2: Direct File Download (ICDC 3.2.0, June 2021)

ICDC-1700 introduced **direct file download** — clicking a download icon saves the actual file to the user's local machine with no cloud environment required.

**Rules established by ICDC-1700:**
- Files **≤ 12MB** → Download icon rendered in the `Access` column; clicking saves file locally
- Files **> 12MB** → No download icon; `Access` column shows "cloud access only" icon with tooltip: *"Because of its size and/or format, this file must be accessed via the My Files workflow"*
- Applied to four surfaces: Study Detail files grid, Dashboard Files tab, Case Detail files grid, My Files cart
- Design rationale: targeted at document-like files (Word protocols, Excel supplements, PDF pathology reports)

ICDC-1813 (same release window, June 9, 2021) was the immediate follow-on bug fix — `.xls` format files were not triggering direct download correctly.

**ICDC-1700 resolution date:** June 9, 2021  
**Release:** ICDC 3.2.0

> **Note:** ICDC-1759 (add in-app viewer for BAM/VCF files in addition to download) and ICDC-1820 (QA test ticket for direct download) remain **Open/To Do** as of Sprint 43. The viewer half of the original vision was never implemented — only the download path shipped.

---

## 3. Service Architecture

Three distinct services handle the download path:

```
React Frontend
    │
    │  GET /api/files/:fileId  (with session cookie)
    ▼
┌─────────────────────────────────────────────────┐
│                  bento-files                    │
│  Node.js / Express microservice                 │
│  Repo: CBIIT/bento-files                        │
│                                                 │
│  1. Reads session cookie → userInfo from MySQL  │
│  2. Checks userInfo.acl vs file ACL             │
│  3. Queries ICDC GraphQL backend for            │
│     file_location (s3:// URI)                   │
│  4. Generates pre-signed S3 or CloudFront URL   │
│  5. Logs download event to Neo4j                │
│  6. Returns signed URL to frontend              │
└─────────────────────────────────────────────────┘
    │
    │  Session cookie validated at login via:
    ▼
┌─────────────────────────────────────────────────┐
│                  bento-auth                     │
│  Node.js / Express auth microservice            │
│  Repo: CBIIT/bento-auth                         │
│                                                 │
│  Supported IDPs:                                │
│    - NIH / Login.gov  (idps/nih.js)             │
│    - Google           (idps/google.js)          │
│    - Test IDP         (dev only)                │
│                                                 │
│  On login:                                      │
│  1. Redirects user to NIH/Login.gov             │
│  2. Receives OAuth2 authorization code          │
│  3. Exchanges code for NIH access token         │
│  4. Calls NIH userinfo endpoint → profile       │
│  5. Looks up user ACLs in Bento backend (Neo4j) │
│  6. Writes userInfo + ACLs to MySQL session     │
│  7. Returns session cookie to browser           │
└─────────────────────────────────────────────────┘
    │
    │  OAuth2 Authorization Code Flow
    ▼
┌─────────────────────────────────────────────────┐
│      NIH IAM / Gen3 Fence / Login.gov           │
│      External Identity Provider                 │
│      (not in the hot path for downloads)        │
└─────────────────────────────────────────────────┘

    After signed URL is returned:
    Browser ──────────────────────────────────► AWS S3 / CloudFront
                  (direct, no app server involved)
```

---

## 4. bento-files Deep Dive

### 4.1 Entry Point (`routes/files.js`)

```js
router.get('/:fileId', async function(req, res, next) {
  await getFile(req.params.fileId, req, res, next);
});

async function getFile(fileId, req, res, next) {
  const cookie = req.headers.cookie;
  let response = await getURL(fileId, cookie);
  await storeDownloadEvent(req.session?.userInfo, fileId);
  res.send(response);
}
```

The file ID (UUID) is extracted from the URL path. The browser session cookie is captured and passed downstream. `storeDownloadEvent` writes an audit record to Neo4j after the URL is generated.

A two-segment variant (`/:prefix/:fileId`) handles files whose storage paths include a folder prefix.

### 4.2 Storage Backend Selection (`connectors/index.js`)

`bento-files` supports multiple storage backends, selected at startup via `config.source` (environment variable `URL_SRC`):

| Value | Connector | Description |
|---|---|---|
| `SIGNED_S3` | `S3Connector.js` | AWS SDK v3 pre-signed S3 URLs |
| `CLOUD_FRONT` | `cloudFrontConnector.js` | AWS CloudFront signed URLs |
| `INDEXD` | `indexdConnector.js` | Gen3 IndexD service |
| `LOCAL` | `localConnector.js` | Local filesystem (dev) |
| `PUBLIC_S3` | `publicS3Connector.js` | Public S3 (no signing) |
| `DUMMY` | `dummyConnector.js` | Returns file location as-is (dev default) |

### 4.3 Pre-Signed URL Generation

**S3Connector** (`connectors/S3Connector.js`):

```js
async function getSignedURL(fileLocation) {
  // fileLocation: "s3://<bucket>/<key>"
  const { Bucket, Key } = parseFileLocation(fileLocation);
  const client = new S3Client({});
  const command = new GetObjectCommand({ Bucket, Key });
  return await getSignedUrl(client, command, { expiresIn: config.urlExpiresInSeconds });
}
```

The server's **IAM role** (attached to the EC2/ECS instance) provides the credentials. The resulting URL is a time-limited, cryptographically signed URL that allows the bearer to `GET` the specific S3 object directly — no application involvement in the file transfer itself.

**CloudFrontConnector** (`connectors/cloudFrontConnector.js`):

Same concept but via AWS CloudFront (CDN layer). Uses a CloudFront key pair (`CF_KEY_PAIR_ID`, `CF_PRIVATE_KEY`). Default expiry: **24 hours** (`60 * 60 * 24` seconds).

**Configuration notes:**
- `URL_EXPIRES_IN_SECONDS` controls expiry for both S3 and CloudFront connectors
- `FAKE=true` bypasses signing entirely — connector returns raw `file_location` (local dev only)
- Default expiry if unset: 24 hours

### 4.4 File Location Lookup (`model/icdc.js`)

For ICDC, the file's storage location is retrieved from Neo4j via the ICDC GraphQL backend:

```graphql
query file($file_id: String) {
  file(uuid: $file_id) {
    file_location
  }
}
```

The session cookie is forwarded as a request header in this GraphQL call, allowing the backend to enforce access control. `file_location` returns an `s3://` URI string.

Other projects (CTDC, CDS, C3DC, GMB, BENTO) have their own model files with project-specific GraphQL queries and field mappings.

### 4.5 Authorization Middleware (`utils/auth.js`)

Applied to all routes except `/ping` and `/version`. Decision logic:

```
1. AUTH_ENABLED=false?           → allow (open mode)
2. Path in exceptions list?       → allow
3. req.session.userInfo present?  → No  → 401 Unauthenticated
4. AUTHORIZATION_ENABLED=false?  → allow (authenticated, no ACL check)
5. Fetch file ACL from backend GraphQL
6. Extract user's APPROVED ACLs from session
7. isAdminUser(userInfo)?         → Yes → allow unconditionally
8. isAuthorizedAccess(userAcl, fileAcl)? → Yes → allow → generate URL
                                          → No  → 403 Forbidden
```

**The `OPEN` special case (`services/file-auth.js`):**  
If a file's ACL list contains the string `"open"`, any authenticated user may download it — regardless of their own ACL grants. This is how ICDC's publicly accessible document-like files (PDFs, protocols, etc.) work. No specific access approval is required; login alone is sufficient.

**ACL approval filter (`services/user-auth.js`):**  
Users may have pending or rejected access requests visible in their session. Only entries with `accessStatus === "APPROVED"` are extracted and used for access decisions. Pending requests do not grant download rights.

### 4.6 Download Audit Logging (`neo4j/neo4j-operations.js`)

After a URL is successfully generated, a `DownloadEvent` is written to Neo4j containing:
- `userID` — from session (`userInfo.userID`), or `"Anonymous User"` if unauthenticated
- `email` — from session
- `idp` — the Identity Provider used to log in (e.g., `"NIH"`, `"LOGIN_GOV"`, `"GOOGLE"`)
- `file_format`, `file_name`, `file_size` — looked up from Neo4j by file UUID
- `fileID` — the UUID of the downloaded file

### 4.7 Session Storage

Session state is stored in **MySQL** (`express-mysql-session`), optionally enabled via `MYSQL_SESSION_ENABLED=true`. When disabled, in-memory sessions are used (non-persistent across restarts).

Session expiry is controlled by `SESSION_TIMEOUT` (default: 30 minutes). The MySQL store checks for expired sessions every 10 seconds.

---

## 5. bento-auth Deep Dive — The Gen3 / NIH Integration

### 5.1 What bento-auth Does

`bento-auth` is a standalone Node.js/Express microservice that handles all user authentication for the Bento platform ecosystem. It is the **only service that communicates directly with external Identity Providers** (NIH/Fence, Google). `bento-files` never calls Fence — it trusts the session that `bento-auth` already established.

### 5.2 Supported Identity Providers

| IDP | File | How It Works |
|---|---|---|
| **NIH / Login.gov** | `idps/nih.js` | OAuth2 via NIH IAM / Gen3 Fence; `preferred_username` determines sub-IDP |
| **Google** | `idps/google.js` | OAuth2 via Google Cloud Identity |
| **Test IDP** | `idps/testIDP.js` | Development only (`NODE_ENV=development`) |

### 5.3 NIH / Gen3 Fence OAuth2 Flow

This is the production login path for ICDC users.

```
1.  User clicks "Login with NIH"
2.  bento-auth redirects browser to NIH/Login.gov authorization endpoint
3.  User authenticates at NIH (eRA Commons, Login.gov, etc.)
4.  NIH redirects back to bento-auth callback with authorization code
5.  bento-auth calls getNIHToken(code, redirectURL)
        → POST to NIH token endpoint
        → Returns: { access_token, refresh_token, id_token }
6.  bento-auth calls nihUserInfo(token)
        → GET to NIH userinfo endpoint
        → Returns: { email, first_name, last_name, preferred_username, ... }
7.  getIDP(preferred_username) determines sub-IDP
        → e.g., "NIH" vs "LOGIN_GOV" based on username format
8.  bento-auth looks up or creates user in Bento backend (GraphQL/Neo4j)
        → Retrieves user's acl array (list of approved data access arms)
9.  userInfo written to MySQL-backed session:
        { userID, email, name, lastName, idp, tokens, acl, role, userStatus }
10. Session cookie returned to browser
11. Subsequent requests to bento-files carry this cookie automatically
```

### 5.4 Token Validation on Subsequent Requests

`bento-auth` exposes an `authenticated()` method per IDP that re-validates the stored access token by calling the IDP's userinfo endpoint. If the token has expired, the call fails and the session is considered invalid. For NIH, this calls `nihUserInfo(tokens)` — a live check against the NIH Fence userinfo endpoint.

`bento-files` does not call this directly. It trusts the session established at login time. Token re-validation would occur if `bento-auth` is called again (e.g., on a page refresh that triggers the `AUTH_URL` endpoint).

### 5.5 Logout

For NIH and Login.gov IDPs, logout calls `nihLogout(tokens)` which revokes the token at the NIH Fence endpoint. Google handles its own logout flow. The MySQL session record is also destroyed.

---

## 6. Complete Token / Credential Flow Summary

| Stage | What Is Exchanged | Where |
|---|---|---|
| Login | OAuth2 authorization code → NIH access + refresh tokens | `bento-auth ↔ NIH Fence` |
| User profile fetch | Access token → user profile (name, email, IDP) | `bento-auth → NIH userinfo endpoint` |
| ACL fetch | Authenticated session → user's approved ACL array | `bento-auth → ICDC GraphQL/Neo4j` |
| Session establishment | userInfo + ACLs → session cookie | `bento-auth → MySQL → browser` |
| Download request | Session cookie → `userInfo` lookup | `browser → bento-files → MySQL` |
| File location | Session cookie (forwarded) → `s3://` URI | `bento-files → ICDC GraphQL/Neo4j` |
| Pre-signed URL | Server IAM role credentials → time-limited signed URL | `bento-files → AWS S3/CloudFront` |
| File transfer | Pre-signed URL → file bytes | `browser → S3 directly` |

**Key point:** Fence is only in the critical path at **login time**. Every subsequent download decision is made using the cached session in MySQL. The AWS pre-signed URL is what actually gates the file transfer, and it is generated using the server's IAM role — not user credentials.

---

## 7. Configuration Reference

### bento-files Environment Variables

| Variable | Purpose | Notes |
|---|---|---|
| `URL_SRC` | Storage backend | `SIGNED_S3`, `CLOUD_FRONT`, `INDEXD`, `LOCAL`, `PUBLIC_S3`, `DUMMY` |
| `BACKEND_URL` | ICDC GraphQL backend URL | Used for file location + ACL queries |
| `AUTH_ENABLED` | Enable/disable authentication | `true` in production |
| `AUTHORIZATION_ENABLED` | Enable/disable ACL file-level checks | `true` in production |
| `AUTH_URL` | URL of `bento-auth` service | e.g., `http://bento-auth/api/auth/authorized` |
| `PROJECT` | Project identifier | `ICDC`, `CTDC`, `CDS`, `C3DC`, `GMB`, `BENTO` |
| `URL_EXPIRES_IN_SECONDS` | Pre-signed URL expiry | Default: 86400 (24 hours) |
| `MYSQL_SESSION_ENABLED` | Use MySQL for session storage | `true` in production |
| `SESSION_TIMEOUT` | Session TTL in seconds | Default: 1800 (30 minutes) |
| `NEO4J_URI/USER/PASSWORD` | Neo4j connection for audit logging | |
| `FAKE` | Bypass CloudFront signing | `true` for local dev only |

### bento-auth Environment Variables (relevant subset)

| Variable | Purpose |
|---|---|
| `AUTH_URL` | NIH/Fence OAuth2 authorization endpoint |
| `TOKEN_URL` | NIH/Fence token endpoint |
| `USERINFO_URL` | NIH/Fence userinfo endpoint |
| `CLIENT_ID` / `CLIENT_SECRET` | OAuth2 client credentials registered with NIH |
| `SESSION_SECRET` | Cookie signing secret |

---

## 8. Multi-Project Notes

`bento-files` is a shared Bento platform component used across the CRDC ecosystem. The `PROJECT` environment variable switches which GraphQL query model is loaded:

| Project | Model File | Notes |
|---|---|---|
| ICDC | `model/icdc.js` | Queries `file.file_location` by UUID |
| CTDC | `model/ctdc.js` | CTDC-specific field mapping |
| CDS | `model/cds.js` | CDS-specific field mapping |
| C3DC | `model/c3dc.js` | C3DC-specific field mapping |
| GMB | `model/gmb.js` | GMB-specific field mapping |
| BENTO | `model/bento.js` | Generic Bento field mapping |

All projects share the same auth middleware, connector, and audit logging infrastructure. Only the GraphQL query and field extraction callback differ per project.

---

## 9. Open Items & Known Gaps

| Item | Detail |
|---|---|
| **ICDC-1759** (Open) | User story for in-app BAM/VCF file *viewer* — the other half of the original ICDC-1700 vision. Never implemented. |
| **ICDC-1820** (Open) | QA test ticket for direct file download. Formally untested in Jira despite feature being live since ICDC 3.2.0. |
| **Token re-validation timing** | `bento-files` trusts the session at rest; it does not re-validate the NIH access token on every download request. If a token expires between login and download, the session may still appear valid until MySQL TTL expires. |
| **`URL_EXPIRES_IN_SECONDS` value** | Default is 24 hours. The actual production value for ICDC should be verified — too short risks URL expiry during slow downloads of large files at the 12MB boundary; too long is a security concern. |
| **`ICDC-1445`** (On Hold) | User story for manifest download from within the Files Cart — still on hold as of last check. |

---

## 10. Source Code References

| File | Repo | Purpose |
|---|---|---|
| `routes/files.js` | `bento-files` | Route handler; entry point for all download requests |
| `utils/auth.js` | `bento-files` | Auth/ACL middleware applied to all file routes |
| `connectors/index.js` | `bento-files` | Storage backend selector |
| `connectors/S3Connector.js` | `bento-files` | AWS SDK v3 pre-signed S3 URL generation |
| `connectors/cloudFrontConnector.js` | `bento-files` | CloudFront signed URL generation |
| `connectors/indexdConnector.js` | `bento-files` | Gen3 IndexD integration (alternative backend) |
| `model/index.js` | `bento-files` | Project-aware GraphQL query dispatcher |
| `model/icdc.js` | `bento-files` | ICDC-specific GraphQL query for `file_location` |
| `services/file-auth.js` | `bento-files` | ACL comparison logic; `OPEN` special case |
| `services/user-auth.js` | `bento-files` | Admin role check; approved ACL extraction |
| `services/session.js` | `bento-files` | MySQL-backed session configuration |
| `neo4j/neo4j-operations.js` | `bento-files` | Download event audit logging to Neo4j |
| `config.js` | `bento-files` | All environment variable mappings |
| `app.js` | `bento-files` | Express app bootstrap; middleware registration order |
| `idps/index.js` | `bento-auth` | IDP router (NIH, Google, Test) |
| `idps/nih.js` | `bento-auth` | NIH/Login.gov OAuth2 client; calls `nih-auth` service |
| `config.js` | `bento-auth` | Auth service environment variable mappings |

*Commit reviewed: `CBIIT/bento-files@6b4b40a` — April 2026*
