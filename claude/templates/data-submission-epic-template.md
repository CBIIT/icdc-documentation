### 📥 Data Submission Epic Template (v1, mirrors CTDC DO-EPIC v1.1, filled with ICDC info)

> **Use this template for every ICDC study data submission.** One epic per study submission (and per version, when a study submits again). It replaces the Data Submission user story (retired 2026-10-13, never used on a live ICDC submission) and takes study submissions out of the catch-all ICDC Data epic, which held every submission's tasks side by side. Canonical example: the COTC021 v.3 submission epic, the first built on this template.

**Why this template**

A study submission has a real start (the Submission Request Form) and a real finish (the study verified in Production with its files downloadable). That makes it an epic: it holds the Data Submission Review, IndexD registration, data loading, and submission data modeling tasks as native children, and it closes when the study is live. On this Jira instance a user story cannot hold tasks as children, which is why the ported Data Submission user story needed a `Relates` link from every task; the epic replaces those links with the Epic Link. Each epic is also one card on the epic Kanban board, which is how leadership already talks about the work ("where is COTC021 v.3?").

**Title and Epic Name**

`ICDC Data Submission: <Study Short Name> <version>`, using the version string the study's tasks already use. Example: `ICDC Data Submission: COTC021 v.3`. Set the Epic Name (`customfield_12351`) to the same string. Every child task reuses the same `<Study Short Name> <version>` token verbatim, so one `summary ~ "<token>"` search finds the whole family:

| Child | Title |
|---|---|
| Pre-load review (Data Submission Review Task) | `Data Submission Review: <token>` |
| IndexD registration (IndexD Registration Task) | `Data Indexing: <token>` |
| Data loading (Data Loading Task) | `Data Loading: <token>` |
| Submission data modeling (Data Modeling for Study Submission) | `Data Modeling: <token>` |

**Card line + section order (card line, then 9 sections, exactly this sequence)**

Each section header is an `h3.` Jira wiki heading using the emoji + bold title format shown. Author in Jira wiki markup (see `README.md`, "Universal patterns").

0. **Card line** (no header): one plain sentence, 140 characters or fewer, for the epic Kanban card. Same rule as every ICDC epic (`epic-templates.md` 7e item 0).
1. `h3. 🎯 *Epic Summary*`: One short paragraph. What this submission brings into ICDC and why, written as a goal (not as a user story). Example: *"Integrate the COTC021 v.3 submission into ICDC: guide the submission through the CRDC Submission Portal, obtain the Release Package, and see the data reviewed, indexed, loaded, and verified so the study is correctly integrated and its files are downloadable in Production at caninecommons.cancer.gov."*
2. `h3. 🧬 *Context & Background*`: The study, its program, and its history in ICDC (new study or existing study, prior versions, why this submission now), ending with who benefits. The comparative oncology value (what the canine data offers human cancer research) and FAIR stated where they fall naturally. No protocol text copied from the submission.
3. `h3. 🏁 *Goal / Objectives*`: Three to five bullets for this submission (for example: released and marked Complete in the Portal; the pre-load review passes; every file registered in IndexD; loaded through Dev, QA, Stage, and Prod with signoff).
4. `h3. 🗂️ *Submission Details*`: Two-column `||Field||Value||` table, in this row order. Rows a submission does not have are left out, not filled with placeholders.

   | Row | Notes |
   |---|---|
   | SharePoint Folder | Link; the submission's working documents; always first; created at SRF approval |
   | Submission Request Form (SRF) | Link; SRF approval triggers Concierge assignment and the SharePoint folder |
   | CRDC Data Submission Request Date | |
   | Submission ID | Monospace; assigned by the Portal when the submission is created |
   | Program | `NA` when the study has no program |
   | Program Short Name | `NA` when the study has no program |
   | Study Name | |
   | Study Short Name | The source of the title token |
   | Associated Publications | When known |
   | Study Status in ICDC | New study, or existing study with a new version |
   | Submitter / Submission Team | |
   | ICDC Data Concierge | Defaults to Philip Musk |
   | CDE Request Workbook | Link; only when the submission requests model changes |

   No dbGaP rows: ICDC's canine data is open access. No Data Hub Data Modeling (DHDM) row: ICDC does not use it. No bucket rows: the Release Package and object-file locations live on the Data Loading task.

5. `h3. 🚦 *Submission Lifecycle*`: One lead line linking the ICDC Data Operations SOP (`claude/conventions/data-operations-study-submission-sop.md`), then the outline. Each step with its own child task is executed and tracked there.
   1. The submitter files the Data Submission Request through the CRDC Submission Portal; the Submission Review Committee approves it.
   2. The Data Concierge supports the submitter throughout.
   3. Any required data model and CDE changes run as a separate submission data modeling task; backend queries and frontend features are reviewed for any model change.
   4. Validation completes in the CRDC Submission Portal.
   5. A pre-load review loads the submitter's TSVs into a local Neo4j and OpenSearch and checks them through the Dev frontend before release.
   6. The submission is released to the Data Commons; the immutable Release Package goes to engineering.
   7. Files are registered in IndexD through DCF.
   8. Metadata loads to Dev for verification; the submission is then marked Complete, which moves the object files into the production bucket.
   9. Data loads to QA, Stage, and Prod, with testing at each tier.
   10. Production verification confirms the study renders and its files download.
6. `h3. ✅ *Definition of Done*`: The closure conditions: what must be true to close the epic, written as outcomes. The epic itself is not tested; verification happens on the child tasks. Standard set: the pre-load review passes with no open data-entry errors; released and marked Complete with the Release Package with engineering; every file registered in IndexD and its GUID resolves; loaded Dev, QA, Stage, Prod with signoff and nothing loaded directly to Prod; the study renders correctly in Production and its files download; the CDE Request Workbook records the released model version (when the submission required model changes). Add submission-specific outcomes (for example new model fields rendering) as needed.
7. `h3. ⚠️ *Risks & Mitigations*`: `||Risk||Impact||Mitigation||` table, three to seven rows, specific to this submission. Offer these standing risks where they apply: the data model lags the submission; submitter package quality or validation errors; a correction after release needs the submission reopened for a new Release Package; new properties missing from the OpenSearch index mappings break frontend rendering; a software release gated on this data release.
8. `h3. 📅 *Submission Chronology*`: `_Current as of <date>_` then a dated bullet log of **submission milestones and decisions only**: request filed, approvals, review passed, released, marked Complete, loaded to each tier, verified in Prod, and decisions that change the plan. **Never record data model version releases**; they change too often and the modeling task and model repo track them.
9. `h3. 📝 *Notes*`: Two bullets at most: what closes the epic (the study verified in Production and every child task Closed), and prior-version lineage. The next version of the study gets its own epic.

**Standing emoji set (9 entries)**

| Section | Emoji |
|---|---|
| Epic Summary | 🎯 |
| Context & Background | 🧬 |
| Goal / Objectives | 🏁 |
| Submission Details | 🗂️ |
| Submission Lifecycle | 🚦 |
| Definition of Done | ✅ |
| Risks & Mitigations | ⚠️ |
| Submission Chronology | 📅 |
| Notes | 📝 |

**Not on the epic (and where it lives instead)**

- **Aggregate counts** (cases, diagnoses, treatments, samples, files, data volume): the Data Loading task, checked by testers at each tier.
- **Node, property, CDE, and permissible value detail**: the CDE Request Workbook and the submission data modeling task.
- **Bucket locations and the Release Package path**: the Data Loading and IndexD Registration tasks.
- **Data model versions**: the submission data modeling task and the `icdc-model-tool` repo.

**Links and hierarchy**

- **Children (Epic Link `customfield_12350` = this epic):** the Data Submission Review, IndexD registration, data loading, and submission data modeling tasks. They link to each other with `Relates`, never `Blocks`.
- **Internally driven model changes** are not children: they belong to the ICDC Internal Data Modeling epic.
- **Prior version's epic or study record:** `Relates` (version lineage).
- No `Supports` links; the Epic Link replaces them.

**Metadata**

- Issue type **Epic**; priority **Major**; component **Data**; label **`Data-Concierge`**; assignee Philip Musk (ICDC Data Concierge).
- Status follows the epic workflow; the epic closes (transition `Closed`, no resolution) when the study is verified in Production and every child is Closed, with a comment naming the Production verification.
- Epics are not placed in sprints; the child tasks are.

**Content rules**

- No Jira ticket keys in the body.
- No em dashes; colons for label lead-ins.
- No `TBD` placeholders: leave a row out, or use the skeleton phrase `_To be completed by the Data Concierge._` for an empty prose section.
- Underscored identifiers in `{{...}}` monospace; underscores in link URLs percent-encoded as `%5F`, parentheses as `%28` / `%29`; curly braces escaped as `\{...\}`.

**Writing-and-publishing workflow**

1. `jira_create_issue` with `issue_type = "Epic"`, a one-line placeholder description, and the Epic Name in `customfield_12351`.
2. Set the summary and Epic Name to the title convention; set label `Data-Concierge`, priority Major, component Data, assignee Philip Musk.
3. Push the full description via `jira_update_issue` (raw Jira wiki in `additional_fields` as `{"description": "..."}`).
4. Set the Epic Link on each child task via `jira_update_issue` `additional_fields` `{"customfield_12350": "<EPIC>"}` and confirm with JQL `"Epic Link" = <EPIC>`; rename children to the title token.
5. Remove any `Supports` links; the Epic Link carries the hierarchy.
6. Verify the render in the Jira UI.

**Provenance**

Mirrors CTDC's Data Submission Epic (DO-EPIC v1.1, piloted on CTDC-2110), filled with ICDC info. ICDC differences: no dbGaP validation task or dbGaP rows (open access); no megazip task; no DHDM row; the ICDC-original Data Submission Review task is a child; the submission data modeling task is a child of this epic (ICDC has no standing Submission Data Modeling epic), while internally driven model changes go to ICDC Internal Data Modeling; the SharePoint Folder row leads Submission Details.

**Changelog**

- **v1 (2026-10-13)**: Initial ICDC port of CTDC DO-EPIC v1.1. Replaces the Data Submission user story template (retired the same day, never used on a live submission) and moves study submissions out of the catch-all ICDC Data epic. Title `ICDC Data Submission: <Study Short Name> <version>`.
