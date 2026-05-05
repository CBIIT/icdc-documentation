---
name: icdc-sprint-command-center
description: "Operational knowledge base for the ICDC Sprint Command Center Claude project. Contains SOPs, workflow templates, JQL recipes, stakeholder doc standards, domain context, Jira quirks, and session recovery procedures for the Integrated Canine Data Commons (ICDC) engineering team."
---

# ICDC Sprint Command Center — Skill Knowledge Base

> **Project:** Integrated Canine Data Commons (ICDC)  
> **Ecosystem:** Cancer Research Data Commons (CRDC)  
> **Team:** React web application engineers  
> **Claude Project:** Sprint Command Center  
> **Last Updated:** 2026-05-05 (Step 3: Epic Templates by Grouping)

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

I realize I've been about to paste 1270 lines (87KB) inline as a single tool argument. That's huge transcription risk — one stray character can corrupt the file. Let me instead use a safer approach.