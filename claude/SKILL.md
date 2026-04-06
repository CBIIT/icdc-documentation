---
name: icdc-sprint-command-center
description: "Operational knowledge base for the ICDC Sprint Command Center Claude project. Contains SOPs, workflow templates, JQL recipes, stakeholder doc standards, domain context, Jira quirks, and session recovery procedures for the Integrated Canine Data Commons (ICDC) engineering team."
---

# ICDC Sprint Command Center — Skill Knowledge Base

> **Project:** Integrated Canine Data Commons (ICDC)  
> **Ecosystem:** Cancer Research Data Commons (CRDC)  
> **Team:** React web application engineers  
> **Claude Project:** Sprint Command Center  
> **Last Updated:** 2026-04-06

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
  - `bento-icdc-backend` — Spring Boot backend
  - `icdc-dataloader` — Data ingestion pipeline
  - `icdc-model-tool` — Data model representations and build tools
  - `icdc-deployments` — Deployment configurations
  - `icdc-devops` — DevOps infrastructure
- **Sister project:** Clinical and Translational Data Commons (CTDC) — same ecosystem, separate Jira project
- **Jira project key:** `ICDC`

### Multiomics Context

The team works with multiomics data — this means datasets that combine multiple biological measurement types (genomics, proteomics, transcriptomics, etc.). When writing tickets or summaries for stakeholders, explain multiomics concepts simply: *"data that measures many different biological signals from the same samples, like reading both the DNA instructions and the proteins those instructions produce — but here applied to canine cancer studies."*

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

### Other Custom Fields
| Field | Custom Field ID | Notes |
|-------|----------------|-------|
| Epic Link (child → epic) | `customfield_12350` | Set via update after creation |
| Epic Name | `customfield_12351` | Set on the epic issue itself |

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

## 7. Sprint Reporting Templates

### Daily Standup Prep Checklist
Run these checks before each standup:
1. Pull blocked items: `status = "Blocked"` in current sprint
2. Pull items with no update in 48+ hours: `updated <= -48h` in current sprint
3. Surface anything that moved to Done since yesterday
4. Flag any tickets past their due date
5. Note any tickets with no assignee
6. Flag any tickets **not formally linked to their epic** (common ICDC issue — check `customfield_12350`)

### Sprint Review Summary Format
```
## Sprint [N] Review — ICDC
**Sprint Dates:** [start] → [end]
**Goal:** [sprint goal text from Jira]

### Velocity
- Committed: X points
- Completed: Y points
- Completion Rate: Z%

### Completed Work
[table: key | summary | points]

### Carried Over
[table: key | summary | reason for carry-over]

### Blockers Encountered
[list]

### Notes for Next Sprint
[list]
```

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

## 9. Key Contacts & Roles

> Update this section as team membership changes.

| Role | Name / Email | Notes |
|------|-------------|-------|
| Senior Technical PM | gina.kuffel@nih.gov | Primary contact for ICDC and CTDC. Reporter on most epics. |
| Dev Lead | ambar.rana@nih.gov | Primary engineering contact for ICDC. Epic owner. |
| QA Engineer / SDET | valentina.epishina@nih.gov | Software Developer in Test — handles QA validation, not feature development |
| Stakeholders | — | NCI leadership, data submitters, COP research community |

---

## 10. Claude Knowledge Base — Reference Library

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

## 11. Maintenance Notes

- This file lives at `CBIIT/icdc-documentation/claude/SKILL.md`
- Update JQL recipes when Jira workflow statuses change
- Update the Jira Quirks section immediately if new custom field behaviors are discovered
- Update domain context when new repos or major architectural changes occur
- Review stakeholder doc standards before each major release cycle
- New SOPs or workflow patterns discovered in Claude conversations should be added here via PR
- When new files are added to `claude/`, update Section 10 (Knowledge Base) so they remain discoverable
- When a new architecture leadership `.docx` is published, update the Document Storage Convention table in Section 10 if applicable
