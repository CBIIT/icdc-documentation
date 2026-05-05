---
name: icdc-sprint-command-center
description: "Operational knowledge base for the ICDC Sprint Command Center Claude project. Contains SOPs, workflow templates, JQL recipes, stakeholder doc standards, domain context, Jira quirks, and session recovery procedures for the Integrated Canine Data Commons (ICDC) engineering team."
---

# ICDC Sprint Command Center — Skill Knowledge Base

> **Project:** Integrated Canine Data Commons (ICDC)  
> **Ecosystem:** Cancer Research Data Commons (CRDC)  
> **Team:** React web application engineers  
> **Claude Project:** Sprint Command Center  
> **Last Updated:** 2026-05-05

---

## 1. Session Recovery & Infrastructure

### 🐳 Docker / MCP Recovery

If any MCP tool (Jira/Atlassian, etc.) is unavailable or returns a connection error, **Docker is not running** on the user's machine. Do not attempt workarounds, do not ask for manual data. Surface the issue immediately:

> "🐳 **Docker doesn't appear to be running.** The Jira/Atlassian MCP container needs to be active. Please start Docker and restore the container, then let me know when it's back up and I'll pick up right where we left off."

Wait for the user to confirm Docker is running before retrying any Jira operations.

### 🔄 MCP Session Initialization

After any session gap or cold start, **re-initialize the Atlassian MCP connection before the first tool call**. If tools fail on the first attempt, the fix is to refresh the project session and resend the message — do not retry in a loop or attempt workarounds.

---

## 2. Domain Context

### About ICDC

The **Integrated Canine Data Commons (ICDC)** is part of the NCI's Cancer Research Data Commons (CRDC). It provides researchers with access to canine cancer study data, enabling comparative oncology research between dogs and humans. Dogs develop many of the same cancers as humans naturally, making canine data scientifically valuable for translational research.

- **Frontend:** React web application (Bento Framework)
- **GitHub org:** CBIIT
- **Key repos:**
  - `bento-icdc-frontend` — React frontend
  - `bento-icdc-backend` — Spring Boot backend (GraphQL; reads/writes OpenSearch indices)
  - `crdc-icdc-data-retriever` — **Python ETL** that fetches external-node data (IDC, TCIA) and writes to OpenSearch's `external_data` index. Runs on a **Jenkins schedule**, not in response to runtime requests.
  - `bento-icdc-interoperation` — Node.js service. **As of Release 4.3.0.528, its active role is the outbound CGC export** (`storeManifest` GraphQL mutation → S3 upload → CloudFront pre-signed URL → Seven Bridges). The legacy `studiesByProgram` / `studyLinks` queries in this repo are now dead code after the FE cutover in ICDC-4022.
  - `icdc-dataloader` — Data ingestion pipeline. Home of `DataLoader.py`, the Python job that runs via Jenkins to load ICDC study data from approved source files.
  - `icdc-model-tool` — Data model representations and build tools
  - `icdc-deployments` — Deployment configurations
  - `icdc-devops` — DevOps infrastructure
- **Sister project:** Clinical and Translational Data Commons (CTDC) — same ecosystem, separate Jira project
- **Jira project key:** `ICDC`

### Multiomics Context

The team works with multiomics data — this means datasets that combine multiple biological measurement types (genomics, proteomics, transcriptomics, etc.). When writing tickets or summaries for stakeholders, explain multiomics concepts simply: *"data that measures many different biological signals from the same samples, like reading both the DNA instructions and the proteins those instructions produce — but here applied to canine cancer studies."*

### 🧭 Verify Before You Write — Architecture Claims Discipline

> **This rule exists because architecture claims compound: one wrong framing in a prep sheet becomes a wrong framing in a Slack post, a release note, a leadership doc. Get the source of truth before writing anything stakeholder-facing.**

Before writing any stakeholder-facing description of an ICDC service, integration, or data flow, **read the primary sources** in this order:

1. **Repo README and top-level code** — `main.py` / `app.js` / `routes/` for the service in question. The README describes intent; the code describes current reality, and the two often diverge after major redesigns.
2. **GraphQL schema (`graphql/schema.graphql`) or API route files** — these reveal what endpoints/queries actually exist today and what's been removed or deprecated.
3. **Config files** (e.g., `config/icdc.yaml`) — these show which external systems the service actually talks to and which indices/topics/buckets it writes to.
4. **Related Jira tickets** — search by the service name. Review the ticket arc (original creation → redesigns → most recent work) to understand the narrative. Pay special attention to tickets labeled "redesign," "rewrite," or "migration."
5. **Release notes** — for how the user-visible change is being communicated externally.

**Do not rely on prior session memory, prior artifacts, or analogy to other services.** ICDC services have been redesigned multiple times; a description that was accurate a year ago may be completely wrong today. Example: the Data Retriever was originally a Node.js real-time microservice; it's now a Python batch ETL. Interop was originally an IDC/TCIA proxy; it's now a CGC export mechanism. Infer from code + Jira + config, not from memory.

**If any of these sources are inaccessible (MCP down, repo not loaded), stop and surface that, rather than guessing.**

### ⚠️ How ICDC Moves Data — The Three Pathways

> **This is the canonical reference for how data flows into, within, and out of ICDC. Misrepresenting any of these pathways is a significant factual error.**

ICDC has three distinct data-movement pathways. Each is owned, scheduled, and scoped differently.

#### 1. Study data ingestion — **Jenkins jobs running `DataLoader.py`** (inbound, batch)

- **What it does:** Loads all ICDC study data — samples, cases, diagnoses, files, clinical trial metadata — into the ICDC databases from approved source files.
- **Mechanism:** Scheduled **Jenkins jobs** running `DataLoader.py` from the `icdc-dataloader` repo. Not API calls. Not on-the-fly loads. Not the Data Retriever (which is unrelated — Data Retriever deals exclusively with external API data).
- **Pipeline stages:** Full SDL promotion path — **DEV → QA → Stage → Production**. Each promotion is its own Jira ticket (e.g., COTC021 v.2 Stage was ICDC-4053, Prod was ICDC-4061).
- **Ownership:** Managed by dedicated Jenkins pipelines outside the application team's direct control.
- **Cadence:** Scheduled, validated, QA'd ahead of release. Never spontaneous.
- **Demo implications:** When advising presenters, do NOT suggest anything like "refresh the TSV," "reload the data file," or "rerun the load" as a mid-demo action. There is no in-app way to swap or refresh data loaded via Jenkins. The data visible in a demo environment is what Jenkins promoted to that environment.

#### 2. External-node data retrieval — **Data Retriever (Python ETL, Jenkins-scheduled)** (inbound, batch)

- **What it does:** Fetches IDC and TCIA dataset metadata via REST/GraphQL APIs, fuzzy-matches collections to ICDC study designations, and writes one OpenSearch document per study into the `external_data` index. The frontend reads that index via the BE's `externalDataOverview` query — it does not call the Data Retriever at request time.
- **Mechanism:** **Python ETL** in the `crdc-icdc-data-retriever` repo, invoked as `python main.py --config config/icdc.yaml` from a **Jenkins schedule** (cadence TBD, but scheduled — not runtime). Writes the results to OpenSearch `external_data`. Optionally publishes SNS success/failure notifications.
- **Scope as of Release 4.3.0.528:** The data it produces powers the **Studies page** and the **Study Details "Supporting Data" tab**. It does NOT touch Explore Dashboard, Case Details, My Files, DMN, or any other page.
- **Key architectural property:** Because the FE reads OpenSearch (via BE) rather than calling IDC/TCIA live, external-node outages cannot crash ICDC pages. That resilience is achieved by eliminating the real-time dependency — not by runtime graceful-degradation logic.
- **Historical note:** This replaces the older real-time Node.js Interoperability microservice. See §2 / Data Retriever Architecture below for the full arc.

#### 3. Data export to the Cancer Genomics Cloud — **InterOp `storeManifest`** (outbound)

- **What it does:** When a researcher clicks "Export to CGC" from the My Files cart, the FE sends the file manifest (CSV-formatted) to Interop's `storeManifest` GraphQL mutation. Interop uploads the manifest to S3, signs a CloudFront URL for the uploaded object, and returns the URL to the FE, which hands it off to Seven Bridges.
- **Mechanism:** `bento-icdc-interoperation` repo. The relevant code is `graphql/schema.graphql` (`storeManifest(manifest: String!): String`) plus `connectors/s3-connector.js` (S3 PUT + CloudFront signed URL generation).
- **Direction:** ICDC → Seven Bridges (outbound only).
- **Related ticket this release:** ICDC-4093 (Export to CGC functional again) sits in this pathway.
- **⚠️ Stale README caveat:** The `bento-icdc-interoperation` README still describes the legacy IDC/TCIA real-time proxy role, which was replaced by the Data Retriever. The schema (`graphql/schema.graphql`) still exposes the old `studiesByProgram` and `studyLinks` queries, but after the ICDC-4022 FE cutover they are dead code. README cleanup is tracked separately.

#### ⚠️ Common misframings to avoid

- ❌ "InterOp feeds IDC/TCIA data into ICDC." — WRONG (as of Release 4.3.0.528). That role moved to the Data Retriever; Interop's active role is now CGC export.
- ❌ "The Data Retriever is a runtime microservice / Spring Boot service / real-time backend API." — WRONG. It is a **Python batch ETL** invoked via CLI on a Jenkins schedule. Data flows through OpenSearch, not through runtime calls to the Data Retriever.
- ❌ "DataLoader.py is complementary to the Data Retriever." — WRONG. DataLoader.py is part of `icdc-dataloader` (Pathway 1) and loads ICDC study data via Jenkins. It has nothing to do with external APIs, OpenSearch `external_data`, or the Data Retriever.
- ❌ "The Data Retriever has graceful-degradation logic that handles external outages at runtime." — WRONG framing. The Data Retriever is a batch job; resilience to external-node outages comes from the fact that the FE never calls those external APIs at request time — it reads OpenSearch. If an external API is down when the Data Retriever runs, the batch job logs it and the OpenSearch data stays at its last-successful state.
- ❌ "All ICDC data is loaded via Jenkins OR via API." — MISLEADING. Study data is loaded via Jenkins `DataLoader.py` (Pathway 1). External-node enrichment is loaded via the Data Retriever, also via Jenkins (Pathway 2). CGC export flows through Interop `storeManifest` (Pathway 3, outbound). All three are distinct.
- ✅ "Study data is loaded by Jenkins running `DataLoader.py`. IDC/TCIA external-node data is populated on a Jenkins schedule by the Data Retriever Python ETL, which writes to OpenSearch. CGC export runs through Interop's `storeManifest` mutation, which uploads a manifest to S3 and returns a signed CloudFront URL."

### 📡 Data Retriever Architecture — A Multi-Year Backend Redesign

> **This is Eric Miller's body of work. Release 4.3.0.528 is the deployment milestone that wraps up four years of evolution. When framing it for stakeholders, honor the scope of the redesign — don't reduce it to "the FE now calls a new endpoint."**

#### The full arc

| Phase | Year | Key tickets | What happened |
|---|---|---|---|
| **Original Interoperability microservice** | 2022 | ICDC-2800, ICDC-2862 | Eric built a Node.js microservice to proxy real-time calls to IDC and TCIA on behalf of the frontend. FE queried `studiesByProgram` via GraphQL; Interop called the external APIs and returned enriched data in-request. |
| **Runtime resilience band-aid** | 2023 | ICDC-3238 | Because the direct-call architecture was fragile — any IDC/TCIA outage could cascade to the FE — the team added error handling so study pages could still render partial data. This was treatment, not cure. |
| **Full redesign / rewrite** | 2025 | ICDC-3923, ICDC-3938, ICDC-3523 | Eric redesigned the service from the ground up: **Node.js → Python**, **real-time request proxy → Jenkins-scheduled batch ETL**, **in-request fetch → OpenSearch-backed reads**, **ICDC-specific → YAML-configurable and generalizable to other CRDC projects**. New repo: `crdc-icdc-data-retriever`. New BE query (`externalDataOverview`) and new OpenSearch index (`external_data`). |
| **Generalization for CCDI** | 2025 | ICDC-4035 | Extended the redesigned service to support raw-fetch mode, multi-host OpenSearch writes, and per-project output customization — so CCDI and other future CRDC projects can adopt it. |
| **This release (4.3.0.528)** | 2026 | ICDC-4096, ICDC-4097, ICDC-4102, ICDC-4108, ICDC-3556, **ICDC-4022** | External API investigation, Dev pipeline rebuild, QA image deploy, env vars across tiers, and — critically — the FE cutover from `studiesByProgram` (Interop GraphQL) to `externalDataOverview` (BE OpenSearch). **This is the deployment milestone that retires the real-time Interop IDC/TCIA proxy role.** |

#### Why this matters architecturally

The shift from runtime proxy to batch ETL isn't a cosmetic change — it fundamentally decouples ICDC from the availability of external data commons. A TCIA outage that would have crashed the Studies page in 2023 now has zero user-visible impact: the FE reads OpenSearch; the next Data Retriever run will pick up fresh data when TCIA is back. It also establishes a pattern that any future CRDC external-node integration (CDA API, other commons) can plug into without bespoke code.

#### Current scope — Release 4.3.0.528

The Data Retriever's OpenSearch output currently powers:
- The **Studies page** (imaging collection counts, CRDC node counts, repo links)
- The **Study Details "Supporting Data" tab** (IDC and TCIA per-collection metadata, aggregated)

It does NOT power: Explore Dashboard, Case Details, My Files, DMN, or any other page.

#### Correct narrative framing

- ✅ "Eric rewrote the service from Node.js real-time proxy to a Python Jenkins-scheduled ETL. External-node data now lives in OpenSearch; the FE reads it via the BE's `externalDataOverview` query. This release is the deployment milestone — Dev, QA, env vars, and the FE cutover all landed."
- ✅ "This wraps up years of incremental work by Eric. The architecture went from 'FE calls Interop, Interop calls IDC/TCIA live' to 'Jenkins runs the Data Retriever, Data Retriever writes to OpenSearch, FE reads OpenSearch via BE.' Totally decoupled at the user-facing layer."
- ✅ "Toyo's FE change (ICDC-4022) — the cutover from `studiesByProgram` to `externalDataOverview` — is the visible payoff of Eric's multi-year redesign."
- ❌ "The Data Retriever is a new Spring Boot microservice." — WRONG tech stack and WRONG runtime model.
- ❌ "The Data Retriever handles IDC/TCIA calls in real time with graceful degradation." — WRONG runtime model. The ETL writes to OpenSearch; the FE never waits on an external API.
- ❌ "This release introduced the Data Retriever." — WRONG. The redesign shipped in 2025; this release is the deployment milestone that retires the old proxy role.

#### Jira mapping for Release 4.3.0.528

| Ticket | Developer | What shipped |
|---|---|---|
| ICDC-4096 | Eric | Investigate IDC API endpoint used by Data Retriever for Study Details |
| ICDC-4097 | Eric | Investigate TCIA API endpoint used by Data Retriever for Study Details |
| ICDC-4102 | Charles | Reconfigure Data Retriever pipeline for ICDC Dev environment |
| ICDC-4108 | Charles | Deploy Data Retriever image to QA via `deploy-release` GitHub Actions pipeline |
| ICDC-3556 | Charles | Env vars for newly deployed Data Retriever code/service across tiers |
| **ICDC-4022** | **Toyo** | **FE cutover: `studiesByProgram` (Interop) → `externalDataOverview` (BE/OpenSearch)** |

### ⚠️ Vocabulary Discipline — Data Model vs. Data Model Navigator

> **This is a precision issue that matters. Misuse confuses stakeholders and misrepresents what shipped.**

The **Data Model** and the **Data Model Navigator (DMN)** are two distinct things and must never be conflated:

| Term | What it is | Where it lives | How it versions |
|---|---|---|---|
| **ICDC Data Model** | The authoritative schema definition — nodes, relationships, properties, controlled vocabularies — expressed in YAML files (`icdc-model.yml`, `icdc-model-props.yml`) | `icdc-model-tool` GitHub repo | Semantic versioning of the schema content (e.g., **Data Model v2.0**) |
| **Data Model Navigator (DMN)** | The React-based web tool that *renders* the Data Model as an interactive graph + table with search, faceted filtering, download hub, etc. | `bento-icdc-frontend` (deployed at caninecommons.cancer.gov) | Ships as part of ICDC frontend releases (e.g., 4.3.0.528) — **not** independently versioned |

#### Correct framing

- ✅ **"ICDC Data Model v2.0"** — a milestone in the schema definition; surfaced in the DMN automatically on release
- ✅ **"The Data Model Navigator now displays ICDC Data Model v2.0"** — the tool showing the new content
- ✅ **"New CDE Info column added to the DMN Table View"** — a DMN feature improvement
- ❌ **"Data Model Navigator v2.0"** — WRONG. The DMN itself is not versioned this way.
- ❌ **"DMN v2.0"** — WRONG, same reason.
- ❌ **"Version 2 of the Data Model Navigator"** — WRONG, same reason.

#### The mental model

- The **Data Model** is the *content*.
- The **Data Model Navigator** is the *tool that shows the content*.
- When the Data Model changes, the DMN automatically reflects it at runtime — no DMN deployment is required. That's the whole point.
- When we say "v2.0", we almost always mean the Data Model. If we're talking about a DMN change, describe the specific feature (CDE Info column, version history surface, Reactflow migration, etc.) — not a version number.

**Applies to all artifacts:** Slack posts, prep sheets, release notes, leadership docs, Jira ticket summaries, sprint reviews. If you catch yourself writing "DMN v2.0" or "Data Model Navigator v2.0," stop and reframe.

### Comparative Oncology Context — ICDC-Specific

> ⚠️ **This context is unique to ICDC.** Do not apply comparative oncology framing to CTDC work.

ICDC's scientific mission is rooted in the **Comparative Oncology Program (COP)** — an NCI initiative that studies cancers occurring naturally in dogs to advance human cancer research. Dogs and humans share many of the same cancer types (osteosarcoma, lymphoma, bladder cancer, etc.), and because dogs develop these cancers spontaneously — not in a lab — their data is more representative of real human disease than rodent models.

When writing stakeholder content or ticket descriptions that reference the scientific purpose of ICDC, you can use this framing: *"By studying cancers that dogs develop naturally, researchers in NCI's Comparative Oncology Program can find patterns that may apply to human patients — accelerating discoveries that benefit both species."*

Key vocabulary for this context:
- **COP** = Comparative Oncology Program (NCI)
- **Comparative oncology** = cross-species cancer research
- **Spontaneous tumors** = cancers that develop naturally, not induced in a lab
- **Translational research** = research designed to move findings from the lab into clinical practice

---

## 3. ⚠️ ICDC-Specific Jira Quirks

These are known behavioral differences in the ICDC Jira instance. Follow precisely — deviating from these patterns causes silent failures.

### Epic Linking — Custom Field Required

The ICDC Jira instance uses a **non-standard custom field** for epic linking. The standard `epicKey` parameter does not work reliably.

**Correct pattern for linking a child ticket to an epic:**
1. Create the issue normally with `jira_create_issue`
2. Immediately follow up with `jira_update_issue` using:
   ```json
   { "customfield_12350": "ICDC-XXXX" }
   ```
3. For batch-created issues (`jira_batch_create_issues`), the epic link also does **not** apply at creation time — every ticket in the batch needs the individual `jira_update_issue` follow-up with `customfield_12350`.

**Never assume epic linking worked without verifying** — always confirm with a follow-up `jira_get_issue` check if there's any doubt.

### Developer Field — Issue-Type Dependent

The ICDC Jira instance uses **different custom fields for the Developer value depending on issue type**. Always populate both Assignee AND Developer when assigning tickets — the Developer field is the source of truth for who actually implemented the work (Assignee is typically QA closing the ticket).

| Issue Type | Developer Field | Format | Example |
|---|---|---|---|
| Task | `customfield_23650` (multi-user picker) | Array of usernames | `{"customfield_23650": ["ranaab"]}` |
| Story | `customfield_18250` ("Developer Legacy", single user) | String username | `{"customfield_18250": "ranaab"}` |
| Bug | `customfield_23650` (same as Task) | Array of usernames | `{"customfield_23650": ["udosent2"]}` |

- `customfield_18250` is **absent from Task-type screen schemes** (always null on Tasks). Confirmed via live inspection of ICDC-4121.
- When generating demo schedules, release reports, or ownership analyses, **always read the Developer field — not Assignee** — to determine who did the work.
- Tickets closed with no code change (e.g., "works as designed," duplicates) correctly have an empty Developer field.

### Other Custom Fields
| Field | Custom Field ID | Notes |
|-------|----------------|-------|
| Epic Link (child → epic) | `customfield_12350` | Set via update after creation |
| Epic Name | `customfield_12351` | Set on the epic issue itself |
| Developer (Task, Bug) | `customfield_23650` | Multi-user, array format |
| Developer Legacy (Story) | `customfield_18250` | Single user, string format |

### Issue Types
- **Confirmed working:** `Epic`, `Task`
- **Use with caution:** `Story` — verify it exists in the project before using
- **Bugs:** Use `Task` with a `[BUG]` prefix in the summary if the Bug issue type is unavailable

### Assignee Format
- Use full email address: e.g., `ambar.rana@nih.gov`
- Do not use display names or usernames alone

---

## 4. Scope Boundaries — Which Claude Project to Use

| Task | Go To |
|------|-------|
| Sprint planning, ticket management, daily standups | **Sprint Command Center** (this project) |
| Portfolio-level planning, roadmaps, cross-project priorities | **Portfolio & Roadmap** project |
| Browser testing, screenshots, UI automation | **QA & Testing** project |
| Microsoft/Azure documentation lookup | Web search or dedicated project |

---

## 5. JQL Recipes

Frequently used JQL queries for the ICDC project.

### Current Sprint
```
project = ICDC AND sprint in openSprints() ORDER BY priority DESC
```

### Blocked Items
```
project = ICDC AND sprint in openSprints() AND status = "Blocked" ORDER BY updated ASC
```

### Epic and All Child Issues — Standard Query
```
project = ICDC AND "Epic Link" = ICDC-XXXX ORDER BY issuetype DESC, status ASC
```

### ⚠️ Epic Coverage — Wide Net (use when standard query misses tickets)

The `"Epic Link"` field only returns **formally linked** tickets. Tickets that mention the epic in their description but lack the field association will be invisible to this query. Use a key-range or date-based fallback:

```
-- Key range (when you know the approximate ticket range)
issue >= ICDC-XXXX AND issue <= ICDC-YYYY AND project = ICDC

-- Date-based (when you know when the work was created)
created >= "YYYY-MM-DD" AND project = ICDC ORDER BY created ASC
```

### Service / Repo Topic Search — Wide Net

When you need to see all tickets related to a service, do not rely on the Epic Link alone — the service may span multiple epics (original build, redesigns, deployments). Use both summary and description:

```
project = ICDC AND (summary ~ "Data Retriever" OR description ~ "Data Retriever") ORDER BY created DESC
```

This is especially important for services that have been redesigned — the arc often spans 3+ epics over multiple years.

### Recently Updated (last 24 hours — daily standup prep)
```
project = ICDC AND updated >= -24h ORDER BY updated DESC
```

### Overdue (past due date, not done)
```
project = ICDC AND due < now() AND status != Done ORDER BY due ASC
```

### Unassigned Open Issues
```
project = ICDC AND sprint in openSprints() AND assignee is EMPTY AND status != Done
```

### Items in Review/QA (good for standup)
```
project = ICDC AND sprint in openSprints() AND status in ("In Review", "QA", "Testing")
```

### Security / Scan Labels — Use with Caution
```
-- Label searches are NOT reliable for finding all tickets in ICDC
-- Labels like "invicti-scan" or "security" may miss orphaned tickets
-- Always supplement with a key-range or date-based fallback
project = ICDC AND labels = "invicti-scan" ORDER BY created ASC
```

---

## 6. Stakeholder Document Standards

### Epic Summary Document (for leadership/stakeholders)

When asked to produce an epic summary `.docx` for leadership, follow this structure:

1. **Cover / Title Block**
   - Epic title and Jira key
   - Date prepared
   - Prepared by (TPM name)
   - Status badge (In Progress / Complete / At Risk)

2. **Executive Summary** (3–5 sentences)
   - What problem does this epic solve?
   - Why does it matter to researchers/users?
   - What is the expected outcome?

3. **Scope & Objectives**
   - Bulleted list of in-scope deliverables
   - Out-of-scope callouts if relevant

4. **Work Breakdown** (table)
   - Columns: Ticket Key | Summary | Type | Status | Assignee | Story Points
   - Group by: Epics → Tasks → Bugs

5. **Progress Summary**
   - % complete (done tickets / total tickets)
   - Story points burned vs. total
   - Sprint association

6. **Risks & Blockers**
   - Any tickets currently blocked
   - Dependencies on other teams or systems

7. **Diagrams & Visuals**
   - Include any architecture diagrams, data flow diagrams, or mockups attached to tickets
   - If no attachments exist, note: *"No diagrams attached to this epic at time of publication."*

8. **Next Steps / Open Questions**

### Formatting Rules for Stakeholder Docs
- Use **US Letter** page size (never A4)
- Font: Arial throughout
- Brand color for headers: NCI Blue `#20558A`
- Keep technical jargon minimal — if it must be used, add a plain-English parenthetical
- Tables preferred over bullet walls for multi-ticket data
- Include Jira links as footnotes, not inline URLs (keeps docs readable in print)

---

### 🏛️ Architecture Leadership Documents (`.docx`)

A second category of leadership document exists alongside epic summaries: **architecture leadership overviews**. These are distilled, non-technical `.docx` files that translate technical architecture documents into stakeholder-readable summaries.

**The pattern:**
- The **source of truth** is a `.md` architecture reference file in `claude/architecture/` in this repo (e.g., `claude/architecture/file-download-and-auth-stack.md`)
- The **leadership deliverable** is a `.docx` distilled from it, stored in the **ICDC Architecture** folder in SharePoint
- The two are maintained in parallel — the `.md` evolves with engineering details; the `.docx` is updated when the leadership-facing content materially changes
- The `.docx` version is **independent** from the `.md` version — start at `v1.0` for the first published `.docx` regardless of what version the source `.md` is at

**Document structure for architecture leadership overviews** (7 sections, in this order):

1. **Purpose** — what this document covers and who it's for
2. **Background** — what types of data/files exist and how they're accessed (use a table)
3. **Integration Points** — what NCI/CRDC services are involved and why (explain in plain English; no service internals)
4. **How It Works** — numbered plain-English step-by-step flow of the end-to-end process
5. **Access Model** — table summarizing authentication and access control rules
6. **Audit & Compliance** — what gets recorded per download/event, and any known gaps
7. **Key Notes for Leadership** — bullet summary of the most important facts for a program officer or CIO

**Naming convention:** `[PROJECT]_[Topic]_LeadershipOverview_v{MAJOR}_{MINOR}.docx`
- Example: `ICDC_FileDownload_LeadershipOverview_v1_0.docx`

**Versioning:**

| Version Bump | When to Use |
|---|---|
| `v1.0` | First published `.docx` for this topic |
| `vX.(Y+1)` | Minor update — wording, corrections, clarifications |
| `v(X+1).0` | Major revision — significant new content, structural change, or underlying architecture changed |

> **Never overwrite an existing file.** Always create a new versioned file.

**Storage:** SharePoint → **ICDC Architecture** folder

**Source `.md` location:** `CBIIT/icdc-documentation/claude/architecture/`

**When to update the `.docx`:** When the source `.md` changes in a way that affects leadership-relevant content (e.g., a compliance gap is resolved, an access model changes, a new integration point is added). Purely technical corrections to the `.md` that don't change the leadership narrative do not require a new `.docx`.

---

## 7. ☀️ Sprint Reporting Templates

### 7a. Daily Standup Prep Checklist
Run these checks before each standup:
1. Pull blocked items: `status = "Blocked"` in current sprint
2. Pull items with no update in 48+ hours: `updated <= -48h` in current sprint
3. Surface anything that moved to Done since yesterday
4. Flag any tickets past their due date
5. Note any tickets with no assignee
6. Flag any tickets **not formally linked to their epic** (common ICDC issue — check `customfield_12350`)

---

### 7b. 🔢 Verify Before You Count — A Rule, Not a Suggestion

**Always verify Jira totals in code before building charts, narrative, or deck content.** Never hand-count from a JSON dump.

**Required workflow:**
1. Pull the sprint/release/epic tickets with a single `jira_search`
2. Write a short Node or Python script that reads the raw JSON, tallies by status / type / assignee, and prints counts
3. Use those verified counts to populate the deck, doc, or Slack message
4. Never guess or eyeball the totals from chat or JSON

**Why this matters:** Confusing "In Progress" with "In Progress + Ready for Review + Ready for QA + Testing" is easy when they're all `In Progress` category. Confusing "Reopened" with "Open" is easy. Hand-counting a 40-ticket sprint across 8 statuses is where mistakes land in stakeholder materials.

**Also verify before building:**
- **Sprint name** — the sprint being reviewed is NOT the active sprint (active = next one). Use `jira_get_sprints_from_board` with board `574` to confirm dates match the meeting date.
- **Ticket counts per metric** — total, done, carry-over, by status, by type, by assignee. All should sum correctly.
- **Release scope** — cross-reference GitHub release notes against Jira `fixVersion` query. Gaps reveal tagging hygiene issues.
- **Developer field, not Assignee** — see Section 3 (Jira Quirks). On ICDC the Assignee on a closed ticket is often QA; the Developer field (`customfield_23650` for Tasks/Bugs, `customfield_18250` for Stories) is the source of truth for who built it.

---

### 7c. Sprint Review Summary Format (Enhanced)

```
## Sprint [N] Review — ICDC
**Sprint Dates:** [start] → [end] (pulled from Jira, not memory)
**Sprint Goal:** [exact goal text from Jira sprint record]

### 🎯 Goal Scorecard
[X] of [Y] goals delivered. Each goal scored: ✓ DELIVERED / ▲ PARTIAL / ✗ NOT STARTED.
Score against the Jira-recorded sprint goal, not raw ticket completion.

### 📊 Velocity (by ticket count — team does not track story points)
- Total tickets: X
- Done / Closed: Y (Z%)
- In Motion (In Progress + Ready for Review + Ready for QA + Testing): A
- On Hold: B
- Open / Reopened: C
- Carry-overs: (Total − Done)

### 🧩 Breakdown by Work Type
- Tasks: done / total
- Bugs: done / total
- Stories (if used): done / total

### 👥 Who Closed What
Table of Done tickets by **Developer field** (not Assignee), ordered by count descending.
On ICDC, Developer is the source of truth — Assignee is often QA who closed the ticket.

### 🚀 Release Scope (if a release shipped in this sprint)
- Versions shipped (FE, BE, Data Retriever, Interop, Dataloader, DMN if applicable)
- Tickets by fixVersion
- Data gaps worth naming (versions without Jira tickets; tickets shipped without fixVersion tags)

### ✅ Completed Work
[table: key | summary | type | developer | assignee]

### 🔄 Carried Over
[table: key | summary | status | developer | reason]

### 🚩 Risks & Flags
[list with color coding: 🟥 high / 🟨 medium / 🟩 info]

### 🎤 Demo Schedule (if combined with release demo)
[table: slot | time | feature | demo lead | supporting | tickets]

### 🔄 Retro Format
Liked · Lacked · Learned (not Start/Stop/Continue). 10-min silent brainstorm.
Retro board URL: [varies per sprint — confirm with TPM]
```

---

### 7d. 🔄 Retrospective Format

**The ICDC team uses Liked · Lacked · Learned** — same format as CTDC. Do not default to Start/Stop/Continue.

| Rule | Value |
|---|---|
| **Format** | Liked · Lacked · Learned |
| **Silent brainstorm duration** | 10 minutes |
| **Full retro block** | 20 minutes (10 silent + 10 group/discuss/vote) |
| **Retro tool** | [retrotool.io](https://retrotool.io) |
| **Board URL** | Varies per sprint — **always confirm with the TPM before referencing in materials** |
| **Action items** | Owner + deadline required or they won't happen |

**Facilitation flow:**
1. Open board link (10 min silent brainstorm — everyone drops cards, no talking)
2. Group similar cards
3. Discuss as a team
4. Dot-vote the top 3 action items
5. Assign owners and deadlines

**Sprint-in-motion caveat:** When a retro happens mid-sprint (next sprint has already started), action items coming out of the retro can't go into next sprint planning because that's already happened. Triage options: insert into the in-flight sprint as additions, or defer to the following sprint. State this explicitly when opening the retro so the team calibrates expectations.

---

## 8. Ticket Writing Standards

### Task Format (primary issue type for ICDC)
```
**Summary:** [Brief, actionable description]

**Context:**
[1–2 sentences on why this work is needed and what system/component it affects]

**Acceptance Criteria:**
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

**Technical Notes:**
[Any relevant implementation context, environment details, or dependencies]

**Related:**
- Epic: ICDC-XXXX
- Design: [link if applicable]
- Security scan reference: [if applicable]
```

### Bug Format
```
**Environment:** [dev / qa / stage / prod]
**Severity:** [Critical / High / Medium / Low]

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

**Screenshots/Logs:**
[Attach or paste]

**Related Epic:** ICDC-XXXX
```

### Security Finding Format
When creating tickets from Invicti or other security scan reports:
```
**Source:** [Invicti / Manual / Dependency scan]
**Severity:** [High / Medium / Low / Best Practice]
**Environment Scanned:** [dev / qa / stage / prod]
**Scan Date:** [YYYY-MM-DD]

**Finding:**
[Plain-English description of the vulnerability]

**Technical Detail:**
[CVE number, affected library/version, endpoint, header name, etc.]

**Remediation:**
[What needs to change — upgrade version, set header, disable feature, etc.]

**Acceptance Criteria:**
- [ ] Fix implemented in [component]
- [ ] Verified clean in [environment]
- [ ] No regression in related functionality

**Related Epic:** ICDC-XXXX
**Labels:** invicti-scan, security
```

---

## 9. 🎨 Sprint Review & Release Demo Deck Standards

Combined Sprint Review + Release Demo + Retro decks follow this standard. Built with the `pptxgenjs` npm package and delivered as `.pptx`.

### 9a. Build Tool & Setup

- **Package:** `pptxgenjs` (global npm install: `npm install -g pptxgenjs`)
- **Layout:** `LAYOUT_WIDE` (13.333" × 7.5")
- **QA workflow:** Build → convert to PDF via `soffice` → rasterize with `pdftoppm` → inspect each slide image → fix defects → re-render once. Stop after one fix cycle unless a new user-visible defect appears.

### 9b. Palette & Typography

| Element | Value |
|---|---|
| **Primary (NIH Blue)** | `#20558A` |
| **Primary dark (NIH Blue Dark)** | `#143458` — dark slide backgrounds |
| **Accent light** | `#EAF1F8` — alternating rows, soft card backgrounds |
| **Accent red (NIH Red)** | `#BE0000` — sparingly, for risk callouts and the single repeat motif |
| **Supporting green** | `#16A34A` — "Done" / delivered / positive |
| **Supporting amber** | `#D97706` — carry-over / warning |
| **Text ink** | `#1F2937` |
| **Muted text** | `#64748B` |
| **Subtle dividers** | `#E2E8F0` |
| **Header font** | Georgia (bold) |
| **Body font** | Calibri |

### 9c. Standard Slide Order (Combined Review + Release + Retro)

1. **Cover** (dark bg) — Sprint number, release tag, meeting date/time, sprint dates, preparer block
2. **Agenda** (light bg) — Numbered card rows, duration per block, total
3. **Sprint [N] by the Numbers** — Big stat callout + status doughnut chart
4. **Sprint [N] Goal Scorecard** — "X of Y goals delivered" + one card per goal (✓/▲/✗)
5. **Breakdown by Work Type** — Stacked bar (Done vs Carry-over) by Task / Bug / Story + takeaways panel
6. **Who Closed What** — Horizontal bar by Developer (not Assignee — see Section 3) + shout-out callout
7. **Release [version] Overview** (dark bg, section break) — 4 stat cards
8. **Demo Schedule** — Table: slot | time | feature | presenter(s) | tickets
9–12. **Presenter Intro Slides** — One per demo slot: role eyebrow, presenter card(s), "What you'll see" bullets, ticket refs
13. **Looking Ahead: Sprint [N+1]** — Carry-over chart + key flags panel
14. **Up Next: Retrospective** (dark bg, section break) — Title + format + timebox
15. **Retro Board Link** — Call to action with clickable retrotool URL + ground rules strip

### 9d. Design Rules (what NOT to do)

- **Never put red accent bars under slide titles.** Accent lines under titles read as AI-generated slop. Use whitespace or a dark background instead. A red motif line elsewhere on the slide (between content blocks, not attached to a heading) is OK.
- **Never let big stat numbers overflow their text box.** `fontSize: 72` in an `h: 1.2` box with `valign: "middle"` will clip the top of the glyph. Use `fontSize: 64` in `h: 1.3` with valign middle, or size the box generously.
- **Multi-presenter slots** get a single slide with two presenter cards stacked vertically on the left, "What you'll see" bullets on the right. Allocate 8 min instead of 5–6 for two-presenter demos.

### 9e. Presenter Intro Slide Structure

Each demo slot gets one intro slide with this layout:

- **Top-left:** `SLOT N` in red eyebrow caps
- **Top-right:** duration (e.g., `8 MINUTES`) in muted caps
- **Title:** feature name in large Georgia bold
- **Subtitle:** plain-English "why this matters" in italic NIH Blue
- **Left column (1 or 2 cards):** Role eyebrow + Name in Georgia + focus sentence in muted Calibri
- **Right column:** "What you'll see" bullets (use square bullets, `bullet: { code: "25A0" }`)
- **Bottom-right:** Ticket references in muted + bold NIH Blue

---

## 10. 🎤 Demo Day Artifacts Workflow

A combined Sprint Review + Release Demo + Retro meeting produces a specific set of artifacts. Build them in this order and deliver on this schedule.

### 10a. The Five Artifacts

| # | Artifact | Format | Destination | Timing |
|---|---|---|---|---|
| 1 | **Slack announcement** | Slack message in `#icdc-discussions` | Channel ID TBD — pull via `slack_search_channels` on first use | 24–48 hours before meeting |
| 2 | **Sprint Review deck** | `.pptx` | Used live in meeting | Ready 24h before meeting |
| 3 | **Per-presenter prep sheets** | `.md` per presenter | DM to each presenter | 24h before meeting |
| 4 | **Retro board** | retrotool.io board | URL in deck + Slack announcement | Created by TPM before meeting |
| 5 | **Goal scorecard framing** | Built into deck slide 4 | — | Built with deck |

### 10b. Per-Presenter Prep Sheets

**One sheet per person**, not per slot. If a presenter owns two slots, both go in their one sheet.

Each prep sheet contains:
- Meeting date/time + slot(s) + total airtime
- Pre-meeting checklist (what to open, what to test, what to pre-load)
- Context on what they're showing and why
- Talking points with suggested wording (not a script — they can borrow or discard)
- Step-by-step live demo walkthrough
- Likely questions with prepared answers
- "If something goes wrong" fallbacks
- Ticket reference list

**Distribution:** DM each prep sheet privately 24 hours before the meeting (not the channel — they contain presenter-specific prompts). Thursday afternoon is the sweet spot for a Friday meeting; earlier and presenters forget.

**ICDC roster note:** When prepping presenter sheets for ICDC, reference the team using their **Slack handles** from Section 11 (Team Roster). The handles are display-name format (e.g., `@ambar rana`, `@Toyo Udosen`), not username format. Use them verbatim.

### 10c. Goal Scorecard Framing

Always pull the sprint goal from Jira (`jira_get_sprints_from_board`, then check the `goal` field on the sprint object). Score each goal against the real outcome in the sprint:

| Marker | Meaning |
|---|---|
| ✓ **DELIVERED** | Goal fully met |
| ▲ **PARTIAL** | Progress made but not complete |
| ✗ **NOT STARTED** | Goal not addressed |

Headline format: *"X of Y goals delivered."* This reframes a sprint more favorably for leadership than raw ticket completion % alone. When the raw completion rate is low (e.g., 28%) but major goals were delivered (e.g., release shipped, major data load completed), the scorecard tells a more accurate story.

### 10d. ICDC-Specific Demo Day Notes

- **No data-release vs software-release split.** ICDC is all open access — there's no separate data-release announcement channel like CTDC has. Sprint review and release demo combine into a single meeting and a single Slack post.
- **Three data pathways are demo-relevant.** When framing what shipped in a release, be precise about which pathway changed (Jenkins `DataLoader.py` for study data ingestion, Data Retriever Python ETL for external-node data, Interop `storeManifest` for CGC export — see Section 2 for the full reference). Misframing pathways in a demo announcement is a common mistake.
- **Vocabulary discipline.** Never say "DMN v2.0" or "Data Model Navigator v2.0" — see Section 2's Data Model vs. DMN rule. Versioning applies to the Data Model content, not the Navigator tool.
- **Developer-field shoutouts.** When calling out who built what in a Slack announcement, pull from the Developer field, not Assignee. Tagging the QA who closed the ticket as the builder is a real and common mistake on ICDC.

---

## 11. 👥 Team Roster & Contacts

> Update this section as team membership changes.
>
> **Slack handles** are the exact strings that appear when typing `@` and the person's name in the `#icdc` channel. Use these verbatim in any Slack drafts — do not substitute usernames, email prefixes, or display name variations.

### Active Team Members

| Role | Name | Email | Jira Username | Slack Handle |
|------|------|-------|---------------|--------------|
| Senior Technical PM | Gina Kuffel | gina.kuffel@nih.gov | `kuffelgr` | `@Gina Kuffel` |
| Tech Lead / Full-Stack | Ambar Rana | ambar.rana@nih.gov | `ranaab` | `@ambar rana` |
| Backend Engineer | Eric Miller | eric.miller4@nih.gov | `millerer` | `@Eric Miller` |
| Frontend Engineer | Toyo Udosen | toyo.udosen@nih.gov | `udosent2` | `@Toyo Udosen` |
| DevOps | Charles Ngu | charles.ngu@nih.gov | `nguca` | `@Charles Ngu` |
| QA / SDET | Valentina Epishina | valentina.epishina@nih.gov | `epishinavv` | `@Valentina Epishina` |
| Design / UX | Hannah Stogsdill | — | `stogsdillhh` | `@Hannah Stogsdill` |
| UI / UX | Peter Scrufari | — | `scrufaripp` | `@Peter Scrufari` |
| Business Analyst (NIH/NCI) | Philip Musk | — | `muskp2` | `@Philip Musk` |
| Infrastructure Contributor | Michael Fleming | michael.fleming@nih.gov | `flemingme` | *(not yet confirmed)* |

### Guidance for Slack Communications

- When drafting Slack announcements, demo schedules, or sprint comms, **use the exact Slack handle string** from the table above (including the `@` prefix).
- Slack handles here are display names, **not** usernames — do not strip spaces or change capitalization.
- Gina's handle `@Gina Kuffel` is included so sign-offs and tags can be applied consistently.
- If a team member is not yet in the table (e.g., new hires, rotating contractors), ask before drafting — do not guess.

### NCI / CBIIT Stakeholders

| Role | Name | Notes |
|------|------|-------|
| NCI/CBIIT Stakeholders | — | NCI leadership, data submitters, COP research community |
| Data Model Author | Mark Jensen | NIH/NCI — author of `icdc-model-tool` |
| DataHub Adoption Driver | Todd Pihl | NCI/CBIIT — drove DMN adoption in CRDC DataHub |
| COP PI | Dr. Amy K. LeBlanc | NCI Comparative Oncology Program — PI for COTC021/COTC022 |

---

## 12. 🗂️ Claude Knowledge Base — Reference Library

> ⚠️ **Fetch-on-demand only. Do NOT auto-fetch these files at the start of every session.**
>
> Loading all files upfront consumes context window space before any real work begins.
> Instead, fetch the relevant file(s) only when a task genuinely requires that context.
> See the fetch strategy guide below.

The `claude/` folder in this repo is a structured knowledge base that complements live Jira data. It stores things Jira cannot: decisions, rationale, team conventions, and epic-level briefings optimized for Claude to read quickly.

### Folder Structure

```
claude/
  SKILL.md                          ← This file. SOPs, JQL, Jira quirks, doc standards.
  architecture/
    file-download-and-auth-stack.md ← Technical architecture reference (source of truth for leadership .docx)
  epics/
    ICDC-XXXX.md                    ← One file per epic. Claude-optimized briefing.
  decisions/
    sprint-43-scope.md              ← Rationale for Sprint 43 security sprint scope.
    *.md                            ← Other scope, architecture, and process decisions.
  conventions/
    workflow.md                     ← Team conventions Claude applies automatically.
```

### Current Files

| File | When to Fetch |
|------|--------------|
| `claude/architecture/file-download-and-auth-stack.md` | Working on file download architecture, generating or updating the ICDC Architecture leadership `.docx`, or answering technical questions about the download/auth stack |
| `claude/epics/ICDC-4120.md` | Starting work on the Invicti security remediation epic |
| `claude/decisions/sprint-43-scope.md` | Questions arise about why CSP/SRI were deferred, or Sprint 43 scope |
| `claude/conventions/workflow.md` | Onboarding a new session, or when a workflow question comes up (e.g., PR strategy, SDL, role clarification) |

### Fetch Strategy by Session Type

| Session Type | Fetch These Files |
|---|---|
| Epic-specific work (tickets, updates, doc generation) | `claude/epics/ICDC-XXXX.md` for that epic |
| Architecture leadership doc generation or update | `claude/architecture/file-download-and-auth-stack.md` |
| Sprint planning or retrospective | `claude/conventions/workflow.md` |
| New session after a long gap | `claude/conventions/workflow.md` |
| Scope or deferral question | `claude/decisions/` — the relevant decision file |
| Quick one-off ticket work | No fetch needed — pull live from Jira |

### How to Add New Files

- **New epic created?** Generate `claude/epics/ICDC-XXXX.md` alongside the Jira tickets.
- **Scope or process decision made?** Add a `claude/decisions/YYYY-MM-topic.md` entry.
- **Team convention changes?** Update `claude/conventions/workflow.md`.
- **New architecture doc added?** Add it under `claude/architecture/` and add a row to the "Current Files" table above.
- **New file added?** Add a row to the "Current Files" table above so it stays discoverable.

### Document Storage Convention

| Artifact Type | Storage Location |
|---|---|
| Leadership-facing architecture overviews (`.docx`) | SharePoint → **ICDC Architecture** folder |
| Leadership-facing epic summaries (`.docx`) | SharePoint (ICDC SharePoint) |
| Claude knowledge base (`.md` briefings, decisions, conventions, architecture) | This repo under `claude/` |

All stores are maintained in parallel. SharePoint is for stakeholder access; GitHub is for Claude context and team reference.

---

## 13. 🔧 Maintenance Notes

- This file lives at `CBIIT/icdc-documentation/claude/SKILL.md`
- Update JQL recipes when Jira workflow statuses change
- Update the Jira Quirks section immediately if new custom field behaviors are discovered
- Update the Team Roster (Section 11) when team members are added, removed, or roles change
- Update domain context when new repos or major architectural changes occur
- Review stakeholder doc standards before each major release cycle
- New SOPs or workflow patterns discovered in Claude conversations should be added here via PR
- When new files are added to `claude/`, update Section 12 (Knowledge Base) so they remain discoverable
- When a new architecture leadership `.docx` is published, update the Document Storage Convention table in Section 12 if applicable
- When deck standards or demo-day workflows change, update Sections 9 and 10 (Deck Standards and Demo Day Workflow)
- Update the Sprint Review Summary template (Section 7c) when Jira workflow statuses change so the velocity buckets stay accurate
