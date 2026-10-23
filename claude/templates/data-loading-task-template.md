### 📦 Data Loading Task Template (v2)

> **Use this template for every ICDC data management task that loads a study submission into ICDC (either a new study or a study update to an existing study) and promotes it through Dev → QA → Stage → Prod.** Canonical examples: the COTC030 load (**ICDC-4176**) for a single submission, and the COTC021 v.3 load (**ICDC-4195**) for a study update spanning several submissions. This template covers the **loading-data** sub-function of the team's data management work. It is **not** for changes to the data model itself, and **not** for the paired IndexD registration that registers the file GUIDs this load consumes (that uses the IndexD Registration Task template). Kept in lockstep with CTDC's Data Loading Task template (DO-LOAD v10); the differences are the platform specifics in the anatomy below. See "When NOT to use this template" at the end.

**Why this template**

The ICDC team has two primary functions: **software development** (the React frontend on the Bento framework and its supporting services; verified against application *behavior*) and **data management** (managing study data submissions such as the COTC trials, modeling the shape of ICDC's data, and loading data into ICDC's databases; verified against application *contents* and schema state).

Data management has two sub-functions:

- **Loading data**: taking a study's *contents* (metadata, files, IndexD entries) into ICDC's databases. Tracked with **this** template and its paired sibling, the IndexD Registration Task template.
- **Modeling data**: changing the *shape* of what ICDC's databases can hold. Tracked with the Data Modeling for Study Submission template or the Data Model Update Task template.

Application pages (Cases, Studies, Samples, the Explore Dashboard, the Files surface) update when new data is loaded. That is the application rendering new data with unchanged behavior and an unchanged schema, not a sign of software or model work. If code is changing, it's the wrong template. If the schema is changing, that's a modeling Task that must land first.

**Tasks execute; the submission epic deliberates.** A Task carries only what the assignee needs to execute the load. Open questions, risks, ownership directories, and link inventories belong on the Data Submission Epic, not on the Task. Jira's native Links panel carries every relationship, including the paired IndexD Registration Task, so the description never restates them.

**Pipeline & store anatomy (read once before drafting)**

- **Source artifacts**: each CRDC submission produces its own **Release Package** (the metadata loading TSVs plus the indexd.tsv manifest) in the ICDC Release Package bucket `nci-cbiit-caninedatacommons-dev`, in a per-release directory created when the study is released from the CRDC Submission Portal. Object files live in the shared CRDC object-files bucket `nci-crdc-data-bucket-prod`. One study update can span several submissions, so one load can consume several Release Packages.
- **Loading pipeline**: **Prefect.** Every tier (Dev, QA, Stage, Prod) loads through the Prefect data loading pipeline; there is no local Dev run and no Jenkins step for data loading.
- **Historical note: the hybrid Jenkins pipeline**: the August 2026 batch (COTC021 v.3, COTC022 v.3, COTC030) was the last loaded on the earlier hybrid pipeline: Dev locally with `loader.py`, QA through lower-tier Jenkins, Stage and Prod through upper-tier Jenkins, each followed by its OpenSearch Loader job. Those tickets keep a hybrid Loading Workflow because that is how the loads ran; do not rewrite a completed load's workflow to Prefect.
- **Loader**: `CBIIT/icdc-dataloader` (`loader.py`), modified to run inside the Prefect pipeline.
- **Graph database**: **Neo4j**, ICDC's canonical metadata store. The pipeline writes nodes and relationships here.
- **Search index**: **OpenSearch.** The Explore Dashboard, autocomplete, and filters read from OpenSearch, not from Neo4j. Every load must be followed by an OpenSearch reindex from Neo4j before the frontend reflects it.
- **Contrast with CTDC**: CTDC loads through a local Neo4j into a single Memgraph and then uses backup and restore to populate its OpenSearch instances. ICDC writes to Neo4j and reindexes OpenSearch per environment.

**Section order (4 sections, exactly this sequence)**

Each section header is a Jira wiki `h3.` heading using the emoji + bold title format shown. Don't omit, reorder, or merge sections.

1. `h3. 🎯 *Load Summary*`: One to two sentences: what's being loaded (the study or study update) and a **bold new-vs-existing study marker**, matching the IndexD Registration Task. Do **not** add counts (files, samples, publications: they are in the Release Packages), enumerate the application surfaces the load lights up, or mention the data model. The paired IndexD relationship is conveyed by the Jira link, not restated here. Example: *"Load the COTC021 v.3 study update into ICDC across all four environments (Dev → QA → Stage → Prod). **COTC021 is an existing ICDC study; this is a study update (v.3), not a new study.**"*

2. `h3. 📦 *Submission & Artifacts*`: Required. Two bare-value constant bullets, then a table with **one row per CRDC submission** the load consumes. No intro sentence, no explanatory text on the constants. Study identity (program, study name, submitter, chronology) lives on the Data Submission Epic and the study record, linked via the native Links panel, not here.

   ```
   * *AWS Account ID*: {{152091478849}}
   * *Release Package bucket*: {{nci-cbiit-caninedatacommons-dev}}

   ||Submission||CRDC Submission ID||Release Package||
   |COTC021 Methylation|<submission-id>|[<timestamp>-<submission-id>/|<S3 console URL>]|
   |COTC021 Deep WGS|<submission-id>|[<timestamp>-<submission-id>/|<S3 console URL>]|
   |Publication corrections|<submission-id>|[<timestamp>-<submission-id>/|<S3 console URL>]|
   ```

   **Columns:**
   - *Submission*: the submission's name in the CRDC Submission Portal (for example "COTC021 Methylation"). Use the same name as the paired IndexD Registration Task's table so the two tickets line up row for row.
   - *CRDC Submission ID*: issued by the CRDC Submission Portal. Plain text, no `{{ }}`. The deployed data model version for the load is derivable from it.
   - *Release Package*: the directory name within the Release Package bucket, rendered as a clickable S3-console link. It holds that submission's metadata loading TSVs and indexd.tsv manifest, and is the source of truth for what gets loaded. Until the study is released from the CRDC Submission Portal the directory does not exist, so use PLACEHOLDER.

   **Clickable Release Package links**: render each as a Jira wiki link `[<timestamp>-<submission-id>/|<url>]`. A wiki link inside a table cell renders correctly on this instance. URL format, with the `prefix=` value being the same directory URL-encoded (colons as `%3A`):

   ```
   https://us-east-1.console.aws.amazon.com/s3/buckets/nci-cbiit-caninedatacommons-dev?region=us-east-1&prefix=<URL-ENCODED-DIR>/&showversions=false
   ```

   **Every submission gets a row**, including metadata-only submissions (publication corrections, study-detail refreshes) that have no object files: the load still consumes their Release Package. A submission that arrives after the ticket is written is added as a new row, never as narrative elsewhere in the body.

   **Why one row per submission**: one study update can span several CRDC submissions, each with its own Release Package. The earlier four-row field/value table put every Submission ID in one cell and every Release Package in another, semicolon-separated, and relied on matching positions across cells. On ICDC-4195 that drifted: a fourth submission (Deep WGS) arrived later and never made it into the lists. A row per submission keeps each Submission ID beside its own Release Package and makes a late arrival a single new row. This mirrors the IndexD Registration Task table, so the paired tickets read the same way.

3. `h3. 🚦 *Loading Workflow*`: Numbered list of the end-to-end promotion, grouped by tier with a bold label. Every tier loads through the Prefect data loading pipeline. Put a blank line after the section heading and after each bold tier label so the numbered lists render cleanly. Steps state the outcome to reach, not how the pipeline gets there.

   **Dev**
   1. Run the Prefect data loading pipeline for Dev.
   2. Verify the Neo4j load and OpenSearch reindex completed, the new data renders in the application, and the counts match the Release Packages. Record in Testing Signoff.

   **QA**
   3. Run the Prefect data loading pipeline for QA.
   4. QA verification: data renders on the expected pages, counts match the Release Packages, file downloads resolve, and there are no regressions on existing studies. Tester initials Testing Signoff on completion.

   **Stage**
   5. Run the Prefect data loading pipeline for Stage.
   6. Stage verification: same checks as QA, plus production-parity sanity checks. Tester initials Testing Signoff on completion.

   **Prod**
   7. Run the Prefect data loading pipeline for Prod.
   8. Prod verification at the live application URL (`caninecommons.cancer.gov`), same checks as QA. Tester initials Testing Signoff on completion. **This is the trigger to close the ticket.**


4. `h3. ✅ *Testing Signoff*`: The completion record. Tester fills in date and initials per environment as work progresses. **Prod signoff is the trigger to transition the ticket to Closed.**

   | Environment | Testing Completion Date | Tester Initials |
   |---|---|---|
   | Dev | | |
   | QA | | |
   | Stage | | |
   | Prod | | |

**Not in the description**: pipeline run records (Prefect flow-run links, run parameters) and counts. Run records go in a plain-text ticket comment; counts are in the Release Packages.

**Sections omitted**

- ❌ **📊 Expected Counts**: not used in ICDC or CTDC; the counts are in the Release Packages.
- ❌ **🧪 Verification Surfaces**, **📊 Per-Environment Verification**, and the per-environment verification checklist: folded into the per-tier workflow steps and the Testing Signoff record. Matches CTDC.
- ❌ **📝 Notes**: terminology and reminders are not task-level; keep tasks slim.
- ❌ **Pre-load workflow phase**: its checks (Release Packages present, object files present, model version deployed, IndexD registration underway) are upstream work tracked on other tickets and inferable from the artifacts table. Matches CTDC.
- ❌ **🔗 Linked Work**, **🤝 Collaboration & Handoffs**, **🔍 Open Questions / Risks**: the native Links panel and the Data Submission Epic carry these.

**Standing emoji set (4 entries)**

| Section | Emoji |
|---|---|
| Load Summary | 🎯 *(shared with IndexD Registration Task)* |
| Submission & Artifacts | 📦 *(shared with IndexD Registration Task)* |
| Loading Workflow | 🚦 *(shared with IndexD Registration Task)* |
| Testing Signoff | ✅ *(unique to data loading task)* |

**Required content rules**

- **Scope is loading-data work only.** Schema or model changes use a modeling template. IndexD registration uses the IndexD Registration Task template. Software development uses the software development family. See "When NOT to use this template."
- **No Acceptance Criteria, Open Questions / Risks, Verification Surfaces, Per-Environment Verification, Expected Counts, or Notes sections.** Data loading is operational SOP work; the completion bar is the Testing Signoff table. Risks belong on the Data Submission Epic.
- **One Task per end-to-end load**: Dev through Prod, not one ticket per environment. The Testing Signoff table is the single source of truth for where the load is in the pipeline.
- **Every tier loads through the Prefect data loading pipeline.** No local Dev run and no Jenkins step.
- **No handoff wording in the workflow** ("assign for QA", "reassign to the TPM"): the handoff is the ticket's status change in Jira.
- **Issue type is Task.** Do not use Story or Subtask.
- **Title convention:** `Data Loading: <Program Short Name> <Study Short Name> <version>`: reuse the exact token from the Data Submission Epic title verbatim, for example `Data Loading: COP COTC021 v.3`.
- **Parent Epic field set via `customfield_12350`** to the study's Data Submission Epic.
- **Developer field is required.** Set `customfield_23650` to the engineer who runs the load. `customfield_18250` ("Developer Legacy") is deprecated and stays empty.
- **Leave the ticket Unassigned at creation** per standing convention; the assignee is set during sprint triage or when work begins.
- **The Data Loading task carries no label**: the load is performed by engineering; the `Data-Concierge` label belongs to the paired IndexD Registration task.
- **Sprint: always add the ticket to the standing `ICDC Data Related` sprint at creation** (board 574, sprint id 6645; a permanent future-state sprint that holds all data-operations work). Never leave it in the backlog and never place it in a numbered development sprint; pass the new key to `jira_add_issues_to_sprint` right after creation. Matches CTDC's `CTDC Data Related` sprint.
- **`Relates` link to each submission's Data Hub tracking ticket (DHDM-XXX).** DHDM tracks per submission, so a load spanning several submissions links several DHDM tickets.
- **`Relates` link to the paired IndexD Registration Task** when one exists: the two run in parallel; do **not** use `Blocks`. Also `Relates` to the Data Submission Review Task and the study record.
- **No other ticket keys in the body.** The study record, the DHDM trackers, the paired IndexD Registration Task, the Data Submission Review Task, and the epic are carried by the Epic Link and the native Links panel. If a reference only exists as text, add it as a native link instead.
- **Submission & Artifacts table is mandatory and complete.** One row per submission the load consumes, metadata-only submissions included, every column populated. Use PLACEHOLDER explicitly when a value is pending upstream; never leave a cell blank or fold several submissions into one cell.
- **Run records go in a comment, not the description.** Post Prefect flow-run links as a plain-text comment grouped by environment, one line per submission. The description stays the template; run records accumulate in comments.
- **Jira wiki authoring** (connector Markdown translation is off, so what is sent is stored exactly; see `claude/templates/README.md`, "Universal patterns"): `h3. {emoji} *Title*` headers; `* *Label*: content` labeled lines; `*` bullets and `#` numbered lists at column 0; `*bold*`; `{{monospace}}`; tables `||header||` / `|cell|`; links `[text|url]`; curly braces escaped as `\{...\}`. Blank line after every heading. After pushing, read the description back and confirm it starts with `h3.`, not `###`.

**Writing-and-publishing workflow**

1. Confirm each Release Package exists in `nci-cbiit-caninedatacommons-dev`. The paired IndexD registration runs in parallel. Surface any open questions on the Data Submission Epic, not the Task.
2. Confirm this is a data load, not a model update or software development. If the schema is changing, a modeling Task lands first.
3. Identify the Data Submission Epic (set as the Epic Link at creation) and the paired IndexD Registration Task (add via a native `Relates` link after creation, never `Blocks`).
4. Create via `jira_create_issue` with `issue_type = "Task"`, the title from the convention above, a placeholder description, the parent epic via `customfield_12350`, and the Developer via `customfield_23650`. Add no label. Leave Unassigned.
5. Push the full body via `jira_update_issue`, authored in Jira wiki markup.
6. Add the ticket to the `ICDC Data Related` sprint (id 6645) via `jira_add_issues_to_sprint`.
7. Add the `Relates` links (each submission's DHDM tracker, paired IndexD task, Data Submission Review task, study record).
8. Verify the rendered description with a UI screenshot.
9. As each environment completes, the tester adds date and initials to Testing Signoff; post the Prefect run links as a comment.
10. **Prod signoff is the close trigger**: once the Prod row is filled in, transition to Closed.

**When NOT to use this template**

- **IndexD registration (registering GUIDs)** → IndexD Registration Task template, the parallel sibling.
- **Data modeling** → Data Modeling for Study Submission (study-driven) or Data Model Update Task (internally-driven).
- **Software development** → software development template family.
- **CRDC platform changes** (Fence, IndexD, Submission Portal upgrades) → owned by CRDC platform teams; out of ICDC scope.
- **Pure file-creation tickets** (generating a metadata loading file or other upstream artifact) → upstream artifact-creation tasks that feed this load; tracked separately.

If a submission needs schema changes before it can load, that's a modeling Task the load is blocked on; if it needs IndexD registration, that's the paired IndexD Registration Task running in parallel. Both are separate tickets carried by native Jira links.

**Changelog**

- **2026-10-22 historical note** (no version bump): recorded that the August 2026 batch (COTC021 v.3, COTC022 v.3, COTC030) was the last loaded on the hybrid pipeline (Dev local `loader.py`; QA lower-tier Jenkins; Stage and Prod upper-tier Jenkins), with Prefect replacing it for every load after. Completed loads keep the workflow they actually ran.
- **v2 (2026-10-22)**: Realigned with CTDC DO-LOAD v10 (same section layout and rules; platform specifics differ). Loading moved to **Prefect** for every tier: removed the local Dev run, the `loader.py` command block, and the Jenkins lower/upper-tier steps. Submission & Artifacts is **one row per submission** (Submission, CRDC Submission ID, Release Package) with the two constants as bare-value bullets above, so a load spanning several Release Packages lists each beside its Submission ID; motivated by ICDC-4195, where the semicolon-in-one-cell table dropped a late submission. Load Summary slimmed to one to two sentences with no counts (counts are in the Release Packages); Expected Counts deliberately not adopted. Removed the Pre-load workflow phase (its checks are upstream work, as in CTDC). Added the title convention, a required Developer field, the no-handoff rule, a `Relates` link to each submission's DHDM Data Hub tracker, removal of the per-environment verification checklist, and the standing `ICDC Data Related` sprint (id 6645) rule. Run records (Prefect flow-run links) go in a comment. No ticket keys in the body. Changelog moved to the bottom.
- **v1 (2026-07-30)**: Canonical. Ported from CTDC v5 and revised against ICDC-4175 / ICDC-4176 and `icdc-dataloader`: Neo4j (not Memgraph), hybrid Dev-local / Jenkins pipeline, Task issue type, `Relates` (not `Blocks`) to the paired IndexD task, four-section shape, four-row artifacts table mirroring CTDC-2093, ICDC-4176 canonical.
- **v1-DRAFT (2026-05-27)**: Initial port from CTDC.
