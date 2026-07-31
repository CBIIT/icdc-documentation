---
name: icdc-sprint-command-center
description: "Operational knowledge base for the ICDC Sprint Command Center Claude project. Contains SOPs, workflow templates, JQL recipes, stakeholder doc standards, domain context, Jira quirks, and session recovery procedures for the Integrated Canine Data Commons (ICDC) engineering team."
---

# ICDC Sprint Command Center — Skill Knowledge Base

> **Project:** Integrated Canine Data Commons (ICDC)  
> **Ecosystem:** Cancer Research Data Commons (CRDC)  
> **Team:** React web application engineers  
> **Claude Project:** Sprint Command Center  
> **Last Updated:** 2026-05-28 (§3: Developer field = customfield_23650 for all issue types; data-management ticket dev/label conventions)

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

The Integrated Canine Data Commons (ICDC) is part of NCI's Cancer Research Data Commons (CRDC) and serves canine cancer study data for comparative oncology, the study of cancers dogs develop naturally to advance human cancer research through NCI's Comparative Oncology Program. It is a React (Bento Framework) web app live at caninecommons.cancer.gov, backed by a Spring Boot GraphQL service over OpenSearch. Study data is loaded by Jenkins jobs running `loader.py` (icdc-dataloader), IDC/TCIA external-node data is populated on a Jenkins schedule by the Python Data Retriever ETL into OpenSearch, and My Files exports flow outbound to the Cancer Genomics Cloud via Interop's `storeManifest`. It handles multiomics data and covers surfaces such as the Studies page, Explore Dashboard, Case and Study Details, My Files, and the Data Model Navigator (DMN), which renders the versioned ICDC Data Model from icdc-model-tool.

Full domain reference has moved to `claude/architecture/domain-context.md`; read it when you need the detail.

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

### Developer Field — `customfield_23650` for All Issue Types

The Developer field is the source of truth for **who actually implemented the work** — always read it, never Assignee (the Assignee on a closed ticket is often the QA who closed it, or the TPM coordinating it). Populate Developer alongside Assignee on any ticket that involved real development.

**Use `customfield_23650` for every issue type — Task, Bug, AND Story.** It is a multi-user picker and takes an array even for a single person:

| Issue Type | Developer Field | Format | Example |
|---|---|---|---|
| Task | `customfield_23650` | Array of usernames | `{"customfield_23650": ["ranaab"]}` |
| Bug | `customfield_23650` | Array of usernames | `{"customfield_23650": ["udosent2"]}` |
| Story | `customfield_23650` | Array of usernames | `{"customfield_23650": ["ranaab"]}` |

- **`customfield_18250` ("Developer Legacy") is a deprecated field — treat it as unused.** Despite the name suggesting a Story-specific field, it is NOT where the Developer value lives on Stories, and it is absent from Task-type screen schemes (always null on Tasks). Confirmed on ICDC-4176 (a User Story): the developer sits in `customfield_23650`, `customfield_18250` is null, and the Jira UI "Developer" field reads from `23650`. Do not read or write `18250`.
- When generating demo schedules, release reports, or ownership analyses, **always read `customfield_23650` — not Assignee** — to determine who did the work.
- An **empty Developer field is correct** for any ticket that involved no development — tickets closed with no code change (e.g., "works as designed," duplicates) and, by design, data-management coordination tickets (see next).

### Data-Management Tickets — Developer & Label Conventions

ICDC data-management work splits into two **paired** ticket types with **opposite** Developer and label conventions. They look similar but are owned and classified differently — get this right.

| Ticket type | Example | Development? | Developer (`customfield_23650`) | `Data-Concierge` label |
|---|---|---|---|---|
| **Data loading** (load a study into ICDC) | ICDC-4176 | **Yes** — engineering pipelines: local Neo4j + `loader.py`, Jenkins lower/upper-tier, OpenSearch ETL | **Populated** — the engineer who ran the load | **No** — loading is engineering, not the Data Concierge service |
| **IndexD registration** (register file GUIDs with DCF) | ICDC-4175 | **No** — coordination with DCF to mint/register GUIDs; nothing is built | **Empty by design** | **Yes** — registration *is* part of the Data Concierge service |

- **Do not "fix" an empty Developer field on an IndexD-registration task** — empty is the correct state.
- **Do not "fix" a populated Developer field on a data-loading task** — it should name the engineer who ran the pipeline.
- The `Data-Concierge` label tracks the Data Concierge **service**, which covers the DCF registration/indexing handoff — **not** the engineering load. When drafting or normalizing these tickets, apply the label to registration tasks and omit it from loading tasks.

### Data-Management Work — Which Template

ICDC data-management work has two sub-functions, and each has its own templates in `claude/templates/`. Pick by **what the work is**; for modeling, pick by **who drives it** (not how big it is).

**Loading data** — getting a study's *contents* into ICDC's databases:

- *Pre-load review* → **Data Submission Review Task** template — a local Neo4j + OpenSearch check of the CRDC Submission Portal's loading TSVs, viewed in the Dev frontend to catch data-entry errors *before* the load. Issue type **Task**; owned by Philip Musk (Data Concierge); carries the `Data-Concierge` label.
- *IndexD registration* → **IndexD Registration Task** template — mint file GUIDs via the shared DCF handoff. Issue type **Task**; `Data-Concierge` label; Developer field empty by design (coordination, not engineering).
- *The load itself* → **Data Loading Task** template — promote a validated Release Package through Dev → QA → Stage → Prod. Issue type **Task**; Developer field populated; **no** `Data-Concierge` label (engineering).

**Modeling data** — changing the *shape* of the ICDC data model (`CBIIT/icdc-model-tool`). The split is by **driver, not size**:

- *A change requested by a study submission* → **Data Modeling for Study Submission** template. Anchored on that study's CDE Request Workbook (owned by the Data Concierge, Philip Musk); carries a ⭐ Data Concierge section; requires a `Relates` link to the parent Data Submission user story. Issue type **Task**.
- *A change initiated internally by the ICDC project* (application roadmap / data team) → **Data Model Update Task** template. Anchored on the single persistent **ICDC Internal CDE Request Workbook** (project-owned, no individual owner); owned by Philip Musk; no study, no Data Concierge section. Issue type **Task**.
- The rule is the **driver**: a study-requested change is Study-Submission modeling *even if it is one property*; an internally-driven change is a Model Update Task *even if it is tiny*. Both pass the **DM Federal Lead & SME review** gate (Heather Creasy) and record term-level detail in a CDE Request Workbook — the ticket itself never enumerates terms, permissible values, or counts.

**The umbrella:** every study submission has a parent **Data Submission user story** (owned by Philip Musk, the ICDC Data Concierge) that all of the above *submission-related* tasks (review, IndexD registration, data loading, study-submission modeling) link back to via `Relates`. Internally-driven model updates have no submission user story.

**Developer / label convention for modeling tickets:** populate the **Developer** field (`customfield_23650`) with the person who makes the `icdc-model-tool` change (Data Model Author: Mark Jensen); modeling tickets do **not** carry the `Data-Concierge` label (modeling is engineering, though the Data Concierge coordinates study-driven modeling).

### Other Custom Fields
| Field | Custom Field ID | Notes |
|-------|----------------|-------|
| Epic Link (child → epic) | `customfield_12350` | Set via update after creation |
| Epic Name | `customfield_12351` | Set on the epic issue itself |
| Developer (all issue types) | `customfield_23650` | Multi-user, array format — canonical |
| Developer Legacy | `customfield_18250` | Deprecated; unused — do not read or write |

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
- **Developer field, not Assignee** — see Section 3 (Jira Quirks). On ICDC the Assignee on a closed ticket is often QA; the Developer field (`customfield_23650`, canonical for all issue types) is the source of truth for who built it.

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

## 7e. 🏛️ Epic Templates by Grouping

The full epic-template library (all groupings and per-section formats) has moved to `claude/templates/epic-templates.md`. Use that file when drafting or normalizing an epic; the standing rules (emoji + bold h3 section headers, required section order, Jira-wiki rendering) live there.

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
| 1 | **Slack announcement** | Slack message in `#icdc` | Channel ID `CE0EA6W93` | 24–48 hours before meeting |
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

**ICDC roster note:** When prepping presenter sheets for ICDC, reference the team using their **Slack User IDs** from Section 11 (Team Roster) — for example, `<@U01TADC2E67>` for Ambar Rana. The display-name handles in the table (`@ambar rana`, `@Toyo Udosen`) are visual-reference only; in actual Slack messages composed via the API, you must use `<@UXXXXXXXXX>` syntax to ping a real person. See Section 14 (Slack Communication Reference) for the full distinction and examples.

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
- **Three data pathways are demo-relevant.** When framing what shipped in a release, be precise about which pathway changed (Jenkins `loader.py` for study data ingestion, Data Retriever Python ETL for external-node data, Interop `storeManifest` for CGC export — see Section 2 for the full reference). Misframing pathways in a demo announcement is a common mistake.
- **Vocabulary discipline.** Never say "DMN v2.0" or "Data Model Navigator v2.0" — see Section 2's Data Model vs. DMN rule. Versioning applies to the Data Model content, not the Navigator tool.
- **Developer-field shoutouts.** When calling out who built what in a Slack announcement, pull from the Developer field, not Assignee. Tagging the QA who closed the ticket as the builder is a real and common mistake on ICDC.

---

## 11. 👥 Team Roster & Contacts

> Update this section as team membership changes.
>
> **Two different Slack identifiers** appear in the table below, and they serve different purposes:
> - **Slack User ID** (e.g., `U01TADC2E67`) — the immutable user ID. Use this in API-composed messages with `<@U01TADC2E67>` syntax to actually ping the person. This is what you use when drafting through the Slack MCP.
> - **Slack Display Handle** (e.g., `@ambar rana`) — the human-readable name shown in the Slack UI. Useful for prep sheets and visual reference, but does NOT ping when used literally in an API-composed message.
>
> See Section 14 (Slack Communication Reference) for full details on when to use which.

### Active Team Members

| Role | Name | Email | Jira Username | Slack User ID | Slack Display Handle |
|------|------|-------|---------------|---------------|----------------------|
| Senior Technical PM | Gina Kuffel | gina.kuffel@nih.gov | `kuffelgr` | `U025MCK7MD3` | `@Gina Kuffel` |
| Tech Lead / Full-Stack | Ambar Rana | ambar.rana@nih.gov | `ranaab` | `U01TADC2E67` | `@ambar rana` |
| Backend Engineer | Eric Miller | eric.miller4@nih.gov | `millerer` | `U03SEJFGU7L` | `@Eric Miller` |
| Frontend Engineer | Toyo Udosen | toyo.udosen@nih.gov | `udosent2` | `U01MJCG0MS8` | `@Toyo Udosen` |
| DevOps | Charles Ngu | charles.ngu@nih.gov | `nguca` | `U04L21QJGNM` | `@Charles Ngu` |
| QA / SDET | Valentina Epishina | valentina.epishina@nih.gov | `epishinavv` | `U02PMPFHBRN` | `@Valentina Epishina` |
| Design / UX | Hannah Stogsdill | hannah@toastandtiger.com | `stogsdillhh` | `U08GNMQPMFX` | `@Hannah Stogsdill` |
| UI / UX | Peter Scrufari | scrufaripp@nih.gov | `scrufaripp` | `U07C6CJRL05` | `@Peter Scrufari` |
| Business Analyst, FNL/BACS — leads ICDC Data team | Philip Musk | philip.musk@nih.gov | `muskp2` | `UE1AJ02EB` | `@Philip Musk` |
| Infrastructure Contributor | Michael Fleming | michael.fleming@nih.gov | `flemingme` | *(not yet confirmed)* | *(not yet confirmed)* |

### Guidance for Slack Communications

- For **API-composed Slack messages** (drafted through the MCP via `slack_send_message` or `slack_send_message_draft`), use the **Slack User ID** with the `<@UXXX>` syntax to actually ping the person. Example: `<@U01TADC2E67>` will render as a clickable, pinging mention of Ambar Rana.
- For **prep sheets, decks, or other reference material** that humans will read but not paste into Slack, the Slack Display Handle is fine for readability.
- **Never** put a literal `@ambar rana` string into an API-composed Slack message and expect it to ping — Slack treats it as plain text.
- See Section 14 (Slack Communication Reference) for full mention-syntax rules and known formatting failures.
- If a team member is not yet in the table (e.g., new hires, rotating contractors), look up their User ID with the `slack_search_users` tool before drafting — do not guess.

### NCI / CBIIT Stakeholders

| Role | Name | Notes |
|------|------|-------|
| NCI/CBIIT Stakeholders | — | NCI leadership, data submitters, COP research community |
| Data Model Author | Mark Jensen | NIH/NCI — author of `icdc-model-tool` |
| DataHub Adoption Driver (historical) | Todd Pihl | FNL/BACS — drove DMN adoption in CRDC DataHub circa 2023 |
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
    domain-context.md               ← ICDC domain reference (moved out of SKILL.md Section 2).
  epics/
    ICDC-XXXX.md                    ← One file per epic. Claude-optimized briefing.
  decisions/
    sprint-43-scope.md              ← Rationale for Sprint 43 security sprint scope.
    *.md                            ← Other scope, architecture, and process decisions.
  conventions/
    workflow.md                     ← Team conventions Claude applies automatically.
    study-submission-sop.md         ← End-to-end Study Submission SOP: CRDC Submission Portal to ICDC production release.
    slack-communication.md          ← Slack communication reference (moved out of SKILL.md Section 14).
  templates/
    README.md                                       ← Template inventory + canonical tickets; read first to pick a data-management template.
    data-submission-user-story-template.md          ← Parent Data Submission user story for a submission.
    data-submission-review-task-template.md         ← Pre-load Data Submission Review task.
    indexd-registration-task-template.md            ← ICDC IndexD registration ticket.
    data-loading-task-template.md                   ← ICDC data-loading ticket.
    data-modeling-for-study-submission-template.md  ← Submission-driven data-modeling ticket.
    data-model-update-task-template.md              ← Internally-driven data model update ticket.
    epic-templates.md                               ← Epic template library (moved out of SKILL.md Section 7e).
```

### Current Files

| File | When to Fetch |
|------|--------------|
| `claude/architecture/file-download-and-auth-stack.md` | Working on file download architecture, generating or updating the ICDC Architecture leadership `.docx`, or answering technical questions about the download/auth stack |
| `claude/epics/ICDC-4120.md` | Starting work on the Invicti security remediation epic |
| `claude/decisions/sprint-43-scope.md` | Questions arise about why CSP/SRI were deferred, or Sprint 43 scope |
| `claude/conventions/workflow.md` | Onboarding a new session, or when a workflow question comes up (e.g., PR strategy, SDL, role clarification) |
| `claude/templates/README.md` | Deciding which data-management template applies; template inventory + canonical tickets (read first) |
| `claude/templates/data-submission-user-story-template.md` | Drafting the parent Data Submission user story for a submission |
| `claude/templates/data-submission-review-task-template.md` | Drafting the pre-load Data Submission Review task |
| `claude/templates/indexd-registration-task-template.md` | Drafting an ICDC IndexD registration ticket |
| `claude/templates/data-loading-task-template.md` | Drafting or normalizing an ICDC data-loading ticket |
| `claude/templates/data-modeling-for-study-submission-template.md` | Drafting a submission-driven data-modeling ticket |
| `claude/templates/data-model-update-task-template.md` | Drafting an internally-driven data model update ticket |
| `claude/conventions/study-submission-sop.md` | Running or referencing the end-to-end Study Submission SOP (CRDC Submission Portal through ICDC production release) |
| `claude/architecture/domain-context.md` | Needing the full ICDC domain reference (moved out of SKILL.md Section 2) |
| `claude/templates/epic-templates.md` | Drafting or normalizing an epic; the full epic template library (moved out of SKILL.md Section 7e) |
| `claude/conventions/slack-communication.md` | Composing ICDC Slack posts; channels, audiences, and message conventions (moved out of SKILL.md Section 14) |

### Fetch Strategy by Session Type

| Session Type | Fetch These Files |
|---|---|
| Epic-specific work (tickets, updates, doc generation) | `claude/epics/ICDC-XXXX.md` for that epic |
| Architecture leadership doc generation or update | `claude/architecture/file-download-and-auth-stack.md` |
| Sprint planning or retrospective | `claude/conventions/workflow.md` |
| New session after a long gap | `claude/conventions/workflow.md` |
| Scope or deferral question | `claude/decisions/` — the relevant decision file |
| Data-management ticket drafting (load / IndexD) | the relevant `claude/templates/` file |
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

### 🔁 Building in `icdc-documentation` — mirror `ctdc-documentation` (reference repo)

When building or extending anything in this `icdc-documentation` repo — templates, workflows, decision records, architecture notes, or this SKILL.md — use **`CBIIT/ctdc-documentation`** as the reference implementation. CTDC is ICDC's sister project under the same CRDC umbrella, runs the same Bento framework, and its `claude/` knowledge base is more mature, so it is the model to mirror — adapting for ICDC's specifics rather than copying verbatim.

- **Structure to mirror.** `ctdc-documentation/claude/` organizes content as `templates/`, `workflows/`, `architecture/`, and `lessons-learned/` (ICDC uses `decisions/` for that role), plus a top-level `README.md` component-library index and `SKILL.md`. When adding a new kind of artifact, check where CTDC puts it first.
- **Templates index.** The ICDC template inventory — every template mapped to its file and canonical Jira ticket — lives in `claude/templates/README.md`; keep it current when templates are added or revised. CTDC's equivalent index is in `claude/README.md`, mirrored in its SKILL.md §9a "Canonical Example Index."
- **Always translate, never copy verbatim.** CTDC and ICDC differ in ways that matter: graph store (Memgraph vs **Neo4j**), model repo (`ctdc-model` vs **`icdc-model-tool`**), loader (`crdc-ctdc-dataloader`, all-Jenkins vs **`icdc-dataloader`**, hybrid Dev-local `loader.py`), application surfaces (Participants / Studies / Specimens vs **Cases / Studies / Samples**), and file access (controlled + open vs **open-access only**). The "differences from CTDC" table in `claude/templates/README.md` is the running list — consult it before porting anything.
- **Reference, don't share.** CTDC and ICDC keep separate repos deliberately; port useful patterns, but each repo owns and maintains its own copy. Never create a cross-repo dependency.

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
- When a new ICDC Slack channel is created or an existing channel's purpose changes, update Section 14a (Channel Routing)
- When a team member joins, leaves, or changes role, pull their Slack User ID via `slack_search_users` and update both Section 11 (Team Roster) AND any Section 14 references
- If a new Slack formatting failure mode is discovered (e.g., a syntax that triggers `invalid_blocks`), add it to Section 14d (Known Failures) so the next session avoids it
- When a per-grouping epic template (7e-1 through 7e-7) evolves — new sections, emoji changes, content rules, or new gotchas — update the template here AND consider a normalization pass across all existing epics in that grouping so they stay consistent
- When the Application Pages roster in Section 7e-1 changes (new page epic created, existing page epic retitled, page route changes), update both the roster table in 7e-1 AND the cross-epic linkage list in 7e-shared

### 13a. Epic Template Status Tracker

Track which per-grouping epic templates are drafted vs. still TBD. Each future session that drafts a new template fills in that row.

| Grouping | Template Status | Example Epic for Drafting |
|---|---|---|
| Application Pages (7e-1) | ✅ Drafted v1 (2026-05-05) | ICDC-2036 (Home — anchor) |
| Microservices (7e-2) | 🚧 TBD | TBD |
| Features (7e-3) | 🚧 TBD | TBD |
| Products (7e-4) | ✅ Drafted v1 (2026-05-05) | ICDC-4134 (Synthetic Data Generator — anchor) |
| Infrastructure (7e-5) | 🚧 TBD | TBD |
| Security (7e-6) | 🚧 TBD | TBD (candidate: ICDC-4120 Invicti remediation) |
| Data (7e-7) | 🚧 TBD | TBD |

---

## 14. 💬 Slack Communication Reference

The Slack communication reference (channels, audiences, and message conventions) has moved to `claude/conventions/slack-communication.md`.
