### 🔎 Data Submission Review Task Template (v1 — 2026-07-30)

> **Status:** **v1 (2026-07-30).** ICDC-original — there is no CTDC equivalent. This is ICDC's pre-load quality gate: before the Data Loading Task ever runs, the loading TSVs are pulled straight from the CRDC Submission Portal and loaded into a **local Neo4j + local OpenSearch**, then viewed through the ICDC Dev frontend to catch submitter-side data-entry errors (spelling mistakes, stray/non-printing characters, DOIs that don't resolve, malformed values) while they are still cheap to fix. Mirrors the Data Loading Task template's four-section shape. **Revision (2026-07-31):** Data Submission Review Tasks are created unassigned (the assignee is set later during sprint triage or when work begins), matching the Data Loading Task standard; the `Data-Concierge` label still applies. **Revision (2026-07-31, table):** the Submission & Artifacts table dropped the separate CRDC Submission Portal row as redundant with the CRDC Submission ID (the Submission ID already identifies the submission in the Portal); the table is now two rows (CRDC Submission ID, Study).

> **Use this template for the pre-load review of every ICDC study submission** — the quality gate that runs **before** the paired Data Loading Task. Canonical example: **TBD** (the first ICDC Data Submission Review task drafted under this template becomes the canonical example). This template covers the **submission-review** work pattern within the loading-data sub-function: it is the prerequisite quality check that clears a submission for loading, not the load itself (use the Data Loading Task template for that) and not IndexD registration. See "When NOT to use this template" at the end.

**Why this template**

ICDC catches submitter-side data-entry problems *before* committing a submission to the real Dev → QA → Stage → Prod load. A submission's loading TSVs can carry subtle errors that pass structural validation but are still wrong: a misspelled value, an unintentionally inserted character (a stray tab, a smart quote, a non-printing / encoding artifact), a DOI or URL that doesn't resolve, a count that doesn't look right. The cheapest place to find these is a **local load** the reviewer can eyeball in the application UI. This task does exactly that: download the loading TSVs directly from the CRDC Submission Portal, load them into a local Neo4j + local OpenSearch, view them through the ICDC Dev frontend, and log every issue. A clean review clears the paired Data Loading Task to proceed; a review that finds problems sends them back to the Data Submitter to correct and resubmit before any pipeline load happens.

This is distinct from the two other loading-data tasks: it is **not** the Data Loading Task (which promotes a validated Release Package through Jenkins into Dev → QA → Stage → Prod), and it is **not** IndexD registration (which mints file GUIDs). It runs earliest of all — typically **before a Release Package or any S3 artifact even exists**.

**Tasks execute; user stories deliberate.** Like the other data-management tasks, this Task carries only what the reviewer needs to execute. Open questions and risks belong on the parent Data Submission user story, not here.

**Anatomy (read once before drafting)**

- **Source artifacts** — the loading TSV files are downloaded **directly from the CRDC Submission Portal** for this submission. At review time there is typically **no Release Package** and **nothing in any S3 bucket yet** — the Portal is the source of truth for the review.
- **Loader** — `CBIIT/icdc-dataloader` (`loader.py`), run locally (the same script as the Data Loading Task's Dev-local step).
- **Local stores** — a **local Neo4j** instance (from a Dev Neo4j dump) and a **local OpenSearch** instance. Nothing is written to the shared Dev / QA / Stage / Prod environments.
- **Viewer** — the ICDC Dev frontend pointed at the local Neo4j + OpenSearch, so the reviewer sees the submission exactly as the application would render it (Cases, Studies, Samples, Files, Explore Dashboard).
- **No Jenkins, no shared environments, no buckets.** The whole review is local.

**Section order (4 sections, exactly this sequence)**

Each section header is an `h3` Markdown heading using the emoji + bold title format shown. Don't omit, reorder, or merge sections. If a section genuinely has no content, state so explicitly rather than dropping the header.

1. `### 🎯 **Review Summary**` — Two to three sentences: which submission is being pre-checked, that this is the quality gate run **before** the paired Data Loading Task, and what a clean result clears.

2. `### 📦 **Submission & Artifacts**` — Required field. A slim two-row table. There is no Release Package or object-files bucket yet, so those rows are intentionally absent; the CRDC Submission ID identifies exactly what to review (it is the submission's identity in the CRDC Submission Portal, where the reviewer downloads the loading TSVs).

   | Field | Value | Notes |
   |---|---|---|
   | CRDC Submission ID | *(CRDC Submission Portal ID; one per submission; link it to the Portal submission if a URL is handy)* | The anchor for the review, and the submission's identity in the CRDC Submission Portal (where the loading TSVs are downloaded from). The review runs before a Release Package exists, so this is the identifier the reviewer works from; nothing is in S3 at review time. |
   | Study (acronym + version) | *(e.g., `COTC030 v.1`)* | New study vs. addition to an existing study. |

   **Naming discipline**: the CRDC Submission ID names the review's input by identity (the submission in the Portal, where the loading TSVs live), not by a content description.

3. `### 🚦 **Review Workflow**` — Numbered list. The entire review is **local**: a local Neo4j + local OpenSearch loaded via `loader.py`, viewed through the ICDC Dev frontend pointed at those local instances. Nothing touches the shared environments.

   1. Download the loading TSV files for this submission **directly from the CRDC Submission Portal** to the local machine.
   2. Stand up a **local Neo4j** instance (from a Dev Neo4j dump) and a **local OpenSearch** instance. Pull the latest data model from `CBIIT/icdc-model-tool`. Create a `data-loader-config.yml` from `CBIIT/icdc-dataloader/config/data-loader-config.example.yml` pointed at the local instances.
   3. Run `loader.py` against the local Neo4j — dry-run to validate node/relationship counts, then load:
   ```
   python3 loader.py config/data-loader-config.yml --dataset path/to/<submission>-loading-tsvs --dry-run
   python3 loader.py config/data-loader-config.yml --dataset path/to/<submission>-loading-tsvs
   ```
   4. Trigger the local OpenSearch ETL so the frontend can read the records.
   5. Point the ICDC Dev frontend at the local Neo4j + OpenSearch and browse the study — Cases, Studies, Samples, Files, and the Explore Dashboard.
   6. Run the **Review Checklist** (Section 4) against both the rendered application data and the raw TSVs; log every issue in the Review Findings table.
   7. **Disposition.** If the review is clean, note it — this clears the paired Data Loading Task to proceed. If issues are found, coordinate with the Data Submitter to correct them and **resubmit through the CRDC Submission Portal**; a fresh review round runs against the corrected submission before any load. **A clean review is the trigger to close this task and clear the load.**

4. `### 📋 **Review Findings**` — The completion record. First the checklist the reviewer runs, then the findings log (or an explicit "clean" note).

   **Review checklist** — inspect for:

   - *Spelling / typos* — misspelled values in free-text and controlled fields.
   - *Stray or non-printing characters* — stray tabs, smart quotes, trailing whitespace, encoding artifacts, unintended inserted characters.
   - *Unresolvable DOIs / URLs* — every DOI and external URL resolves.
   - *Counts* — node and relationship counts (Cases, Samples, Files, etc.) match expectations for the study.
   - *Required IDs* — present, well-formed, and unique; no missing or duplicated identifiers.
   - *Permissible values* — enum / controlled-vocabulary fields carry only valid values.
   - *Dates & numbers* — well-formed and in range.
   - *Relationships* — no orphaned nodes; parent/child links resolve.
   - *Rendering* — the expected Cases / Studies / Samples / Files surfaces render correctly in the Dev frontend.

   **Findings log** — one row per issue (or a single "Clean — no issues found" row):

   | # | Issue | Where (node.field / record) | Type | Action / disposition |
   |---|---|---|---|---|
   | | | | | |

**Standing emoji set (4 entries)**

| Section | Emoji |
|---|---|
| Review Summary | 🎯 *(shared with Data Loading Task)* |
| Submission & Artifacts | 📦 *(shared with Data Loading Task)* |
| Review Workflow | 🚦 *(shared with Data Loading Task)* |
| Review Findings | 📋 *(unique to the Data Submission Review task)* |

**Required content rules**

- **Scope is pre-load submission review only.** A local load of the Portal's loading TSVs to catch data-entry errors before the pipeline load. **The actual load** uses the Data Loading Task template. **IndexD registration** uses the IndexD Registration Task template. **Schema / model changes** use a modeling template.
- **Runs before the Data Loading Task.** This review is the gate; a clean review clears the paired Data Loading Task to proceed. Link the two via `Relates`.
- **Issue type is Task.** Do not use Story or Subtask.
- **Created unassigned.** The assignee is left empty at creation; it is set later during sprint triage or when work begins. Apply the **`Data-Concierge`** label; submission review is Data Concierge work. *(If the team later decides to treat this as pure engineering like the load, drop the label.)*
- **Parent Epic via `customfield_12350`** — ICDC-3342 (ICDC Data). **`Relates` link to the parent Data Submission user story** (owned by Philip Musk). **`Relates` link to the paired Data Loading Task** (this review gates it).
- **No Release Package / bucket rows in Submission & Artifacts.** At review time there is no Release Package and nothing in S3; the CRDC Submission Portal is the source. Carry only the two rows shown (CRDC Submission ID and Study).
- **The whole review is local.** Local Neo4j + local OpenSearch + the Dev frontend pointed at them; never the shared Dev / QA / Stage / Prod environments.
- **Review Findings is the completion record** — there is no separate signoff table. A clean review (no outstanding findings) is the close trigger.
- **No WBS label and no SOP reference** — ICDC has neither for this task at present.
- **Rendering-safe authoring** — section headers use `### **Title**`; tables use Jira-wiki `||header||` syntax, NOT GitHub-flavored Markdown `|h|h|`.

**Writing-and-publishing workflow**

1. Confirm the submission exists in the CRDC Submission Portal and its loading TSVs are downloadable. (A Release Package is **not** required — this review runs before one exists.)
2. Confirm this is a pre-load review, not the actual load, IndexD registration, or modeling.
3. Identify the parent Data Submission user story and the paired Data Loading Task (add the `Relates` links after creation).
4. Create the review task via `jira_create_issue` with `issue_type = "Task"`, a short placeholder description, the parent epic (ICDC-3342) via `customfield_12350`, and the `Data-Concierge` label. Leave it unassigned at creation; the assignee is set later during sprint triage or when work begins.
5. Push the full body via `jira_update_issue` (two-step create-then-update).
6. Add the `Relates` links (parent Data Submission user story; paired Data Loading Task).
7. Verify the rendered description with a UI screenshot.
8. As the review runs, the reviewer fills the Review Findings table. **A clean review closes the task and clears the load.**

**When NOT to use this template**

- **The actual data load** (promoting a validated Release Package through Jenkins into Dev → QA → Stage → Prod) → **Data Loading Task** template.
- **IndexD registration** (minting file GUIDs) → **IndexD Registration Task** template.
- **Data modeling / schema changes** → the Data Modeling for Study Submission template or the Data Model Update Task template.
- **The submission umbrella** (coordinating the whole submission end to end) → the parent **Data Submission user story**.

**Canonical example**

**TBD.** The first ICDC Data Submission Review task drafted under this template will become the canonical example.
