# ICDC Documentation: Templates

This directory holds reusable templates for ICDC Jira tickets and related artifacts. Templates encode the team's agreed work shapes so a reader of any single ticket can find what they need without asking, and so structurally similar tickets across the project look structurally similar.

Templates are organized by **work lane**: the team has two primary functions (software development and data management), and each function has its own set of templates.

---

## Inventory

| Template | Lane | Status | Canonical Example | Notes |
|---|---|---|---|---|
| `epic-templates.md` | Every epic | **v2.1 (2026-10-13): lean template, identical shape to CTDC Section 7b** | ICDC-4264 | Card line plus 🎯 Epic Statement · 🧬 Description · 🗺️ Scope · ✅ Definition of Done · 📝 Notes; standing data variant (7e-D) with 🔗 Upstream & Downstream and ⚠️ Risks & Mitigations. Replaces the v1 Application Pages and Products templates; `7e-4-products.md` was removed. |
| `data-submission-epic-template.md` | Data management: one epic per study submission (parent of the family) | **v1.1 (2026-10-13): mirrors CTDC DO-EPIC v1.2** | ICDC-4267 | Card line plus 9 sections (🎯 Epic Summary · 🧬 Context & Background · 🏁 Goal / Objectives · 🗂️ Submission Details · 🚦 Submission Lifecycle · ✅ Definition of Done · ⚠️ Risks & Mitigations · 📅 Submission Chronology · 📝 Notes). Title `ICDC Data Submission: <Program Short Name> <Study Short Name> <version>` (same pattern as CTDC; children reuse the token); owned by Philip Musk (Data Concierge). The review, IndexD, loading, and submission modeling tasks are children through the Epic Link. ICDC differences from CTDC: no dbGaP or megazip tasks, no DHDM row, the Data Submission Review task is a child. Replaces the catch-all ICDC Data epic for submissions. |
| ~~`data-submission-user-story-template.md`~~ | Data management: former submission umbrella | **⛔ Retired 2026-10-13** | none | Replaced by the Data Submission Epic. Never used on a live ICDC submission; a user story cannot hold tasks as children on this Jira instance. Kept for reference. |
| `indexd-registration-task-template.md` | Data management: loading data | **v8 (2026-10-22): lockstep with CTDC DO-INDEX v11** (4 sections; table is Submission, CRDC Submission ID, Release Package, Sample GUID, one row per indexed submission) | ICDC-4193; ICDC-4194 (wording reference) | Same layout and rules as CTDC; platform specifics differ (bucket `nci-cbiit-caninedatacommons-dev`, AWS account `152091478849`, open-access `acl`, `file_uuid`, study record link when one exists). Indexing team is the DCF; standing `ICDC Data Related` sprint (id 6645); `Relates` to each submission's DHDM tracker; spot-check requires a non-empty `acl`; close trigger does not gate the load. |
| `data-submission-review-task-template.md` | Data management: loading data (pre-load gate) | **v1 (2026-07-30): ICDC-original** | TBD | ICDC-unique pre-load quality gate: download the loading TSVs directly from the CRDC Submission Portal, load into a local Neo4j + local OpenSearch, and view through the ICDC Dev frontend to catch data-entry errors (spelling, stray characters, unresolvable DOIs, bad counts) BEFORE the Data Loading Task runs. Task; owned by Philip Musk (Data Concierge); `Relates` to the parent Data Submission user story and the paired Data Loading Task. No Release Package / bucket rows (none exist at review time). Canonical TBD. |
| `data-loading-task-template.md` | Data management: loading data | **v2 (2026-10-22)** | ICDC-4176; ICDC-4195 (multi-submission) | Lockstep with CTDC DO-LOAD v10. Four sections (Load Summary · Submission & Artifacts · Loading Workflow · Testing Signoff). Every tier loads through the Prefect data loading pipeline (Neo4j load plus OpenSearch reindex). Submission & Artifacts is one row per submission with the two constants as bullets above. No counts (they are in the Release Packages), no Pre-load phase, no handoff wording, Developer field required, `Relates` to the DHDM tracker, added to the standing `ICDC Data Related` sprint (id 6645) at creation, title `Data Loading: <Program> <Study> <version>`, run records in a comment. |
| `data-modeling-for-study-submission-template.md` | Data management: modeling data (submission-driven) | **v1 (2026-07-30): mirrors CTDC** | TBD | Ported from CTDC. **Submission-driven** modeling: a study submission requests new nodes/properties/PVs; anchored on that study's CDE Request Workbook (owned by the Data Concierge, Philip Musk). 6 sections (adds a ⭐ Data Concierge section). Model repo `icdc-model-tool`; DM Fed Lead review (Heather Creasy). Canonical TBD. |
| `data-model-update-task-template.md` | Data management: modeling data (internally-driven) | **v1 (2026-07-30): mirrors CTDC** | TBD | Ported from CTDC. **Internally-driven** modeling: initiated by the ICDC project itself (roadmap / data team), not a study; anchored on the single persistent ICDC Internal CDE Request Workbook. 5 sections (no Data Concierge section); owned by Philip Musk. Canonical TBD. |
| `user-story-template.md` | Software development: user story | **v3 (2026-10-13): one functional Acceptance Criteria list (no Performance & Quality) and unit tests only, identical to CTDC §7a v4** | ICDC-4244 | 👤 User Story · ✅ Acceptance Criteria · 🚫 Out of Scope · 🧪 Testing Requirements (Unit Tests). No Story Summary: the Jira Summary field is the one-line title. No In Scope list: the Acceptance Criteria define what the story delivers. Dropped CTDC's Parent Epic & Context and Notes sections (Epic Link field + native Jira links carry them); no Jira keys in the body. CTDC §7a slimmed to the same shape 2026-09-04. Issue type `User Story`. Canonical ICDC-4244 (C3DC card on the Human Relevance tab). |
| `design-task-template.md` | Software development: design task | **v2 (2026-10-09): Jira wiki authoring; CTDC v4 now has the identical 6-section shape** | ICDC-4242 | 🎯 Design Summary · 🔗 Links · 🎨 Design Scope · 📐 Design Deliverables · 🖼️ Figma File · ✅ Definition of Done. Dropped CTDC's 🧩 Design System & Standards section; 3 standard deliverables; 5-item DoD; `Design: …` summary prefix; designer (Hannah Stogsdill) as Assignee + Developer. One design task per user story, `Relates`-linked in Jira, never cited in the body; italic-colon bullets, no em dashes. Canonical ICDC-4242 (ICDC↔C3DC interoperability prototype). |
| `devops-task-template.md` | Infrastructure: DevOps task (anything but release promotions) | **v1 (2026-10-13): mirrors CTDC 7l v1** | ICDC-4274 | 🎯 Task Summary · 🧭 Scope · 🌐 Environments · 🔑 Environment Variables · 🎫 ServiceNow Requests · 🚦 Workflow · ✅ Definition of Done. `DevOps: …` summary prefix; all four tiers always listed; upper tiers go through an NCI ServiceNow request to CloudOne; never a secret value in Jira. ICDC specifics: Prefect worker sets and the nonprod bucket boundary, Neo4j, Jenkins retired. Canonical ICDC-4274 (upper-tier Prefect workers, Jenkins to Prefect migration). |
| `general-task-template.md` | Any task no other template covers: backend or API work, spikes, audits and surveys, documentation | **v1 (2026-10-13): mirrors CTDC** | ICDC-4284 | 🎯 Task Summary · 🧭 Scope · 🚦 Workflow · ✅ Definition of Done: the DevOps task template without its infrastructure sections. |
| `invicti-scan-epic-template.md` | Security: monthly Invicti scan cycle (epic) | **v1 (2026-09-15): ICDC-original** | September 2026 epic (first built on the template) | 🎯 Overview · 📊 Severity Breakdown · ⏱️ SLA Due Dates · 🆕 New Findings · 🔁 Carryover Findings · ✅ Resolved Since Last Scan · 🚫 Dispositions · 🚀 Promotion Strategy. One epic per month covering every environment scanned; owns only findings first observed that month plus one verification task; carryover findings are linked with `Relates`, never cloned. Prior-shape references ICDC-4120 and ICDC-4210. Workflow in `claude/sops/invicti-monthly-scan-sop.md`. |
| `invicti-finding-task-template.md` | Security: one finding from an Invicti scan (task) | **v1 (2026-09-15): ICDC-original** | September 2026 Tomcat High (first built on the template) | 🎯 Finding · 🧠 Why It Matters · 🔧 Remedy · ✅ Acceptance Criteria · ⏱️ SLA. `[SEC-<SEV>]` summary prefix with the CVE ID when present; mandatory Jira due date derived from first-observed scan date plus the NCI SLA window; one task per finding across all environments; regressions reopen rather than clone; false-positive and accepted-risk tasks close as Won't Fix with the justification in a comment. |
| `release-notes-template.md` | Software releases: GitHub release notes on `CBIIT/bento-icdc-frontend`, shown on the ICDC News page | **v1 (2026-10-23): ported from CTDC v1** | First release published on it | Scope from the Fix Version query verified against merged code; Build Details written without outer pipes so the News page parser reads it (Frontend, Backend, File Service, Interop, Data Retriever; no Auth); six sections, category named in Security, Bug Fix, and Known Limitation labels; companion to the Software Release Playbook (`../conventions/software-release-playbook.md`) |

---

## Why two lanes

The ICDC team's work splits cleanly along two operational lanes:

- **Software development**: designing, coding, testing, releasing the React frontend (Bento framework) and supporting services. Verified against application *behavior*. Tracked with epic templates by grouping (see ICDC SKILL.md Section 7e: Pages / Microservices / Features / Products / Infrastructure / Sandbox / Data).
- **Data management**: managing study data submissions (COTC trials and others), modeling the shape of ICDC's data in `icdc-model-tool`, and loading data into ICDC's **Neo4j + OpenSearch** stack (Dev runs locally; QA / Stage / Prod via Jenkins). Verified against application *contents* and schema state.

Data management has two sub-functions:

- **Loading data**: taking a study's contents (metadata, files, IndexD entries) and getting them into ICDC's databases. Tracked with the **Data Loading Task** template (and its upstream sibling, the **IndexD Registration Task** template).
- **Modeling data**: changing the *shape* of what ICDC's databases can hold. The split is by **driver, not size**: a change **requested by a study submission** uses the **Data Modeling for Study Submission** template (anchored on that study's CDE Request Workbook, owned by the Data Concierge), while a change **initiated internally by the ICDC project** uses the **Data Model Update Task** template (anchored on the single persistent ICDC Internal CDE Request Workbook). Even a one-property internal change is a Model Update Task, and even a tiny study-requested change is Study-Submission modeling.

This README's purpose is to make every template discoverable. The software development lane now has two ticket-level templates here (`user-story-template.md`, `design-task-template.md`); its epic templates live in `epic-templates.md`.

A third, smaller lane was added 2026-09-15: **security remediation**, driven by the monthly NCI Invicti scans. It has its own epic and task templates (above) and its own SOP under `claude/sops/`, because its cadence (monthly, externally triggered) and its completion bar (NCI remediation SLA, verified by the next scan) differ from both primary lanes.

---

## Important: differences from CTDC

These templates were ported from the CTDC documentation repo (`CBIIT/ctdc-documentation`): a sister project under the same Cancer Research Data Commons (CRDC) umbrella that uses many of the same patterns. But CTDC and ICDC are **structurally different** in ways that matter for data management:

| Concept | CTDC | ICDC |
|---|---|---|
| File access control | Open + controlled (two tiers) | **Open access only** |
| Consent codes / `acl` field | Required for controlled studies (e.g., `phs004135.c1`) | **Not applicable** |
| Login required for file downloads | Yes: NIH eRA Commons via CRDC Fence | **No: all files downloadable without login** |
| External handoff for IndexD | Yes: DCF via CRINTAKE | **Same: DCF via CRINTAKE + DCF Google Drive (CRINTAKE-478); no `acl`** |
| Data Model repo | `CBIIT/ctdc-model` | `CBIIT/icdc-model-tool` |
| Graph metadata store | Memgraph | **Neo4j** (loader connects via `bolt://…:7687`) |
| Loader repo | `CBIIT/crdc-ctdc-dataloader` | `CBIIT/icdc-dataloader` |
| Loading pipeline | Prefect, every tier: local Neo4j into a single Memgraph, OpenSearch populated by backup and restore | **Prefect, every tier: Neo4j load plus an OpenSearch reindex per environment** |
| Application surface terminology | Participants, Studies, Specimens | **Cases, Studies, Samples** |
| Submission ingestion source | CRDC Submission Portal | **CRDC Submission Portal (COP / COTC trials enter via the Portal)** |
| Submission parent | Data Submission Epic per submission (DO-EPIC, since 2026-09-25) | **Same: Data Submission Epic per submission (since 2026-10-13), owned by Philip Musk (ICDC Data Concierge); all submission-related tasks are its children through the Epic Link** |

The templates here have been adapted for these differences where the adaptation is obvious. Where it isn't, **`[ICDC-VERIFY]` callouts** flag the assumptions that need Ambar Rana's review before the templates become canonical.

---

## Universal patterns (these DO carry over from CTDC)

The following shape principles apply to every ICDC template and are NOT marked `[ICDC-VERIFY]`; they're agreed conventions:

- **Tasks execute; the submission epic deliberates.** A Task description carries only what the assignee needs to execute. Open questions, risks, ownership directories, and link inventories belong on the Data Submission Epic, not on the Task.
- **No Linked Work section.** Jira's native Links panel (right sidebar) shows Epic Link, Relates links, Blocks links, and remote links. Duplicating this in the description body is noise.
- **No Collaboration & Handoffs section.** Ownership is implicit in the Jira assignee field + comment audit trail.
- **No Open Questions / Risks section on Tasks.** Risks live on the Data Submission Epic.
- **Address-row naming discipline.** Submission & Artifacts rows that point at *where things live* hold an address, not a content description (e.g., "Object Files Location" names a bucket; "Release Package" names the source-of-truth S3 path).
- **Jira wiki authoring (since 2026-10-09, matching CTDC).** The shared Jira connector runs with `DISABLE_JIRA_MARKUP_TRANSLATION=true`: nothing converts Markdown, and whatever is sent is stored exactly (raw `###` and `**` showed up on ICDC-4193 before this rule). Author every description and comment in Jira wiki markup and pass descriptions in `additional_fields` as `{"description": "..."}`:
  - h3 heading: `h3. 🎯 *Title*` (emoji, then bold title)
  - Labeled line: `* *Label*: content`; never em dashes (TPM preference, 2026-09-04)
  - Bold `*bold*`; italic `_italic_`; monospace `{{code_name}}`
  - Bullet `* item` and numbered `# item`, both at column 0
  - Table: header row `||h||h||`, data rows `|c|c|`; no in-cell line breaks
  - Link: `[text|url]`
  - Literal braces: `\{` and `\}`
  - Blank line after every heading. After pushing, read the description back and confirm it starts with `h3.`, not `###`.
- **No Jira ticket keys in any description body.** Epic Link, `Relates`, `Blocks`, and Cloners links live in Jira's Links panel; repeating them in the text is redundant and goes stale. Applies to every template in both lanes (TPM rule, 2026-09-04). The one exception is the security epic's Carryover and Resolved tables, where the task key is the data being tabulated.
- **Two-step ticket creation.** `jira_create_issue` with a placeholder description, then `jira_update_issue` with the full Jira wiki body.
- **Epic Link to the Data Submission Epic** (`customfield_12350`) is mandatory on every submission-related task. Set via `jira_update_issue` after ticket creation.
- **`Relates` link between the paired IndexD Registration Task and the Data Loading ticket** is mandatory when both exist. Registration is paired with, but does not technically block, the load: use `Relates`, not `Blocks`.

---

## Lessons learned

Lessons-learned and revision history for these templates live in **`claude/decisions/`** (ICDC's ADR directory) rather than a `lessons-learned/` subfolder. This matches ICDC's existing ADR pattern.

Look for files prefixed with the template name and dated, e.g., `claude/decisions/2026-05-27-indexd-registration-template-v1-draft.md` (when that decision document is filed).

---

## Chronology

| Date | Event |
|---|---|
| 2026-05-27 | Initial port from CTDC: README, IndexD Registration Task v1-DRAFT, Data Loading Task v1-DRAFT committed |
| 2026-05-28 | Templates revised against first real ICDC tickets (ICDC-4175 / ICDC-4176) + `icdc-dataloader`: Neo4j confirmed (not Memgraph), hybrid Dev-local / Jenkins pipeline, User Story load type, `Relates` (not `Blocks`), reduced five-row artifacts table, most `[ICDC-VERIFY]` items resolved |
| 2026-07-30 | Data Loading Task revised (PR against `main`): slimmed to 4-section shape, corrected loader script name `DataLoader.py` → `loader.py`, added the Dev-local `loader.py` command block (`--dataset`, dry-run then load), named ICDC-4176 canonical. Same fixes applied to the live tickets ICDC-4174 / ICDC-4176. |
| 2026-07-30 | Ported the **Data Submission User Story** template from CTDC v2 (the parent-of-the-family), filled with ICDC info; owned by Philip Musk (ICDC Data Concierge); child tasks link via `Relates`; DHDM dropped, dbGaP `NA` for open-access. Committed directly to `main`. |
| 2026-07-30 | Added the **Data Submission Review Task** template: an ICDC-original pre-load quality gate (local Neo4j + OpenSearch review of the Portal's loading TSVs, viewed via the Dev frontend, before the Data Loading Task). Task owned by Philip Musk (Data Concierge). Committed directly to `main`. |
| 2026-07-30 | Ported both **data-modeling** templates from CTDC (Data Modeling for Study Submission (submission-driven, 6 sections) and Data Model Update Task (internally-driven, 5 sections)) encoding the driver-based split. DM Fed Lead = Heather Creasy; internal owner = Philip Musk; internal CDE workbook linked. |
| 2026-07-30 | Promoted ICDC-4193 (Data Indexing: COTC021 v.3) to the IndexD Registration Task template's canonical example (replacing the placeholder ICDC-4175); folded the four ticket refinements + CTDS→DCF rename into the template. |
| 2026-10-13 | Added `general-task-template.md` (4 sections) for tasks no other template covers; identical in CTDC. Data model update template: communication channel is the ICDC Internal CDE Curation Teams channel (internal data modeling with the SI team). |
| 2026-10-13 | User story Story Summary removed (it restated the User Story; the Jira Summary field is the title): user stories are 4 sections. |
| 2026-10-13 | User story Scope replaced by 🚫 Out of Scope: In Scope only restated the Acceptance Criteria; Out of Scope records deliberate exclusions. Epic Scope and design task Design Scope are unchanged. |
| 2026-10-13 | User stories, tasks, and epics carry no Performance & Quality section or quality-bar item: the bar is a team-wide standard QA checks. User story Testing Requirements is unit tests only; integration and manual test cases are QA's. |
| 2026-10-13 | Epics: `epic-templates.md` rewritten to the lean shape (v2.1), matching CTDC Section 7b; section 4 is the Definition of Done (Acceptance Criteria belong to user stories); epics close with status only, no resolution; `7e-4-products.md` removed. |
| 2026-10-09 | Template sync with CTDC: every template moved to Jira wiki authoring (`h3. 🎯 *Title*` headers; Universal patterns rewritten); em dashes removed; IndexD v5 dropped the 📝 Notes section (4 sections, matching CTDC v8, which adopted ICDC's one-row-per-submission table); design task v2 and user story v2 note that CTDC now has the identical shape. |
| 2026-10-13 | Ported CTDC's **DevOps Task** template (7l v1) as `devops-task-template.md`, same 7 sections, with an ICDC specifics block; first tickets built on it are the four upper-tier Prefect tasks in the Jenkins to Prefect migration (canonical ICDC-4274). Committed directly to `main`. |
| 2026-10-13 | Ported CTDC's **Data Submission Epic** (DO-EPIC v1.1) as `data-submission-epic-template.md`: one epic per study submission, children through the Epic Link. Retired the Data Submission user story template (never used live). Child task templates (review, IndexD, loading, submission modeling) now name the submission epic as their parent instead of the catch-all ICDC Data epic plus a `Relates` link to a story; internally driven model updates go to ICDC Internal Data Modeling. Committed directly to `main`. |
| 2026-10-22 | Data Loading Task v2, realigned with CTDC DO-LOAD v10: loading moved to Prefect for every tier (local Dev run, `loader.py` command block and Jenkins lower/upper-tier steps removed); Submission & Artifacts is one row per submission so a load spanning several Release Packages lists each beside its Submission ID (the semicolon-in-one-cell table dropped the late Deep WGS submission on ICDC-4195); Load Summary has no counts and Expected Counts is not adopted (counts are in the Release Packages); Pre-load phase removed; title convention, required Developer field, no-handoff rule and DHDM `Relates` link and standing `ICDC Data Related` sprint (id 6645) rule added; Prefect run links go in a comment. Data-loading references in SKILL.md, the study submission SOP, `architecture/domain-context.md`, the epic and review-task templates, and the differences-from-CTDC table updated to Prefect. |
| 2026-10-22 | IndexD Registration Task v6, realigned with CTDC DO-INDEX v9: DCF named throughout; standing `ICDC Data Related` sprint (id 6645); `Relates` to each submission's DHDM tracker; explicit no-ticket-keys rule; close trigger no longer clears the paired load (they run in parallel); spot-check pass requires a non-empty `acl` and failures surface on the Data Submission Epic; study record link is \"when one exists\"; changelog moved to the bottom. |
| 2026-10-22 | IndexD Registration Task v8 (lockstep with CTDC DO-INDEX v11): CRDC Submission ID column restored after Submission, so the table matches the Data Loading Task's IDs row for row. |
| 2026-10-22 | IndexD Registration Task v7 (lockstep with CTDC DO-INDEX v10): table slimmed to Submission, Release Package, Sample GUID. CRDC Submission ID, Index? and Intake batch dropped; metadata-only submissions no longer get a row (they stay on the Data Loading Task). |
| 2026-09-04 | Added the software-development lane's **User Story** (ported from CTDC §7a, slimmed 7→5 sections) and **Design Task** (ported from CTDC v2, slimmed 7→6 sections) templates; canonical ICDC-4244 and ICDC-4242 (ICDC↔C3DC interoperability prototype under the Human Relevance epic ICDC-3882). CTDC §7a slimmed to the same 5-section shape in lockstep. Committed directly to `main`. |
| 2026-09-15 | Added the security lane: **Invicti Scan Remediation Epic** and **Invicti Finding Task** templates (both ICDC-original), plus the **Monthly Invicti Security Scan Remediation SOP** at `claude/sops/invicti-monthly-scan-sop.md`. Motivated by NCI Security moving ICDC to a monthly Invicti cadence (September 2026 Prod and Stage reports). Encodes the NCI remediation SLA (Critical 15/30, High 30/60, Medium 60/90, Low 180 days, public/internal), the finding-not-scan tracking rule, and the false-positive / accepted-risk disposition path. Committed directly to `main`. |
| Pending | ICDC SKILL.md update encoding the loading/modeling + submission-vs-internal decision tree |
| Pending | Ambar Rana review of all four data templates; `[ICDC-VERIFY]` callouts resolved; templates promoted from v1-DRAFT to v1 canonical |

---

## Cross-project note

CTDC and ICDC maintain **separate** template repositories deliberately. Although both projects share patterns (Bento framework, CRDC ecosystem, NCI/CBIIT sponsorship), shared templates would create drift hazards: changes in one project's workflow would silently affect the other.

If a template pattern proves genuinely useful in one project, it can be ported to the other (as this set was ported from CTDC to ICDC), but each project owns its own templates and is responsible for maintaining them against its own workflows.

Reference repo: `CBIIT/ctdc-documentation` → `claude/templates/` for the CTDC versions of these templates.
