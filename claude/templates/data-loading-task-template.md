### 📦 Data Loading Task Template (v1 — canonical 2026-07-30)

> **Status:** **v1 (canonical, 2026-07-30).** Ported from CTDC's `claude/templates/data-loading-task-template.md` (v5), then revised against the first real ICDC tickets (ICDC-4175 / ICDC-4176) and the `icdc-dataloader` repo. **This revision streamlines the task body to a four-section structure — Load Summary, Submission & Artifacts, Loading Workflow, Testing Signoff — dropping the standalone Verification Surfaces, Per-Environment Verification, and Notes sections (verification is now folded into the Loading Workflow per-environment steps and the Testing Signoff record). It also corrects the loader entry-point script name from `DataLoader.py` to `loader.py` to match the `icdc-dataloader` repo — the runnable script is `loader.py`; `DataLoader` is the class defined inside `data_loader.py`. This revision also adds the runnable Dev-local loader.py command block to the Loading Workflow and names ICDC-4176 (the COTC030 load) as the canonical example.** An earlier revision confirmed **Neo4j** (not Memgraph) as the graph store, a **hybrid Dev-local / Jenkins** pipeline, **User Story** as the issue type for the load, **`Relates`** (not `Blocks`) to the paired IndexD task, and a five-row Submission & Artifacts table (revised to four rows on 2026-07-30 to mirror CTDC-2093; see the Table revision note below). All `[ICDC-VERIFY]` items were resolved by the TPM on 2026-07-30 (see the end of this file); the template was promoted from draft to **v1 canonical** on 2026-07-30. **Table revision (2026-07-30):** the Submission & Artifacts table was revised to a four-row structure mirroring CTDC's canonical load ticket ([CTDC-2093](https://tracker.nci.nih.gov/browse/CTDC-2093)) — *CRDC Submission ID, AWS Account ID, AWS S3 Bucket, Release Package* — dropping the standalone *Object Files Location* and *Study* rows. The object-files bucket (`nci-crdc-data-bucket-prod`) is still documented in the Pipeline & store anatomy and confirmed in the Loading Workflow Pre-load step; study identity lives on the study record and the parent Data Submission user story.

> **Use this template for every ICDC data management task that loads a study submission into ICDC — either a brand-new study or new data added to an existing study — and promotes it through Dev → QA → Stage → Prod.** Canonical example: the COTC030 load (ICDC-4176). This template covers the **loading-data** sub-function of the team's data management work. It is **not** for changes to the data model itself, and **not** for the upstream IndexD registration that mints the file GUIDs this load consumes (use the IndexD Registration Task template). See "When NOT to use this template" at the end.

**Why this template**

The ICDC team has two primary functions:

- **Software development** — designing, coding, testing, releasing the React frontend (Bento framework) and supporting services. Verified against application *behavior*.
- **Data management** — managing study data submissions (COTC trials and others), modeling the shape of ICDC's data, and loading data into ICDC's databases. Verified against application *contents* (row counts, page renders, downloadable artifacts) and against schema state.

Data management has two sub-functions:

- **Loading data** — taking a study's *contents* (metadata, files, IndexD entries) and getting them into ICDC's databases. Tracked with **this** template and its upstream sibling, the IndexD Registration Task template.
- **Modeling data** — changing the *shape* of what ICDC's databases can hold. Tracked with the Data Modeling for Study Submission template (when drafted) for the common case, or the Data Model Update Task template (when drafted) for infrastructure-level model changes.

Application pages get updated when new data is loaded — the **Cases**, **Studies**, **Samples** pages, the Explore Dashboard, the Files surface (Cases / Studies / Samples confirmed for ICDC, vs CTDC's Participants / Studies / Specimens). That is not a sign that the load involves software work or a model change. It's the application working as designed: rendering the new data with unchanged behavior and unchanged schema.

This template owns only the loading-data sub-function. The verification points, signoff cadence, and pipeline choices below are tuned for loading data into a stable schema with unchanged application code.

**Tasks execute; user stories deliberate.** The same principle the IndexD Registration Task template adopted applies here: **Open questions, risks, ownership directories, and link inventories belong on the parent user story, not on the Task.** A Task is what the assignee executes — it carries only what's needed to do the work. The template removes Linked Work, Collaboration & Handoffs, and Open Questions / Risks sections accordingly.

The most common antipatterns this template prevents:

1. **One ticket per environment.** Splits the audit trail across four tickets and forces a manual reconstruction of "where is this release in the pipeline?" at every standup. A data load is a single end-to-end promotion, not four independent jobs.
2. **No per-environment signoff record.** When QA, Stage, and Prod testers initial their work in Slack threads or comments, there's no consolidated record for compliance review or for the post-load retrospective if something goes wrong in Prod.
3. **Mixed metaphor with software development tickets or model update tickets.** Writing the description as if it's a code deployment ("merge to main, tag the release") or a frontend change ("update the component to render the new field") obscures that this is a *data* promotion — a different operational pathway with different verification points.
4. **Ambiguous data payload.** "Load the new metadata" without naming the Submission ID and the Release Package location leaves the data engineer guessing. The Submission & Artifacts table in Section 2 exists specifically to eliminate this ambiguity — the Submission ID plus the Release Package S3 path together identify exactly what to load (the loading files all live in the Release Package, so there is no single file to name).

**Pipeline & store anatomy (read once before drafting)**

A CTDC data load touches multiple systems in sequence. ICDC's anatomy is structurally similar but with ICDC-specific repos and bucket names:

- **Source artifacts** — Release Package + IndexD manifest live in the **AWS S3 Release Package bucket** `nci-cbiit-caninedatacommons-dev` (confirmed from ICDC-4175 / ICDC-4176). Object files live in the **ICDC object-files bucket** `nci-crdc-data-bucket-prod` (a shared CRDC bucket; confirmed by TPM 2026-07-30). The data-loading TSVs the pipeline consumes all live inside the Release Package (multiple files, not a single named file).
- **Loader repo** — `CBIIT/icdc-dataloader` (confirmed). Home of `loader.py` (the runnable entry-point script) and `config/data-loader-config.example.yml`.
- **Loading pipeline** — **Hybrid** (confirmed from ICDC-4176; differs from CTDC, where all four tiers use Jenkins): **Dev runs locally** (local Neo4j instance + `loader.py`), and **QA / Stage / Prod run through Jenkins** with a two-tier split — *lower tier* targets QA, *upper tier* targets Stage and Prod.
- **Graph database** — **Neo4j**. ICDC's canonical metadata store — the `icdc-dataloader` config connects to it via `bolt://…:7687` (CTDC uses Memgraph in this slot; ICDC does not). The loading pipeline writes nodes and relationships here. **The model is assumed stable for a data load — if the model is changing, that's a modeling Task and uses a modeling template.**
- **Search index** — **OpenSearch**. The frontend's Explore Dashboard, autocomplete, and filters read from OpenSearch, not from Neo4j directly. After every metadata load, OpenSearch must be reindexed from Neo4j before the frontend reflects the change.
- **Application surfaces** — Cases page, Studies page, Samples page, Explore Dashboard, Files surface (confirmed from ICDC-4176). These are the pages a tester loads in their browser to verify the data actually shows up correctly.

The template walks all of this in order: payload → pipeline run per environment → verification per environment → signoff per environment.

**Section order (4 sections, exactly this sequence)**

Each section header is an `h3` Markdown heading using the emoji + bold title format shown. Don't omit, reorder, or merge sections. If a section genuinely has no content, state so explicitly ("None at this time") rather than dropping the header. Per-environment verification is carried out within the Loading Workflow steps and recorded in the Testing Signoff table — there is no separate verification section.

1. `### 🎯 **Load Summary**` — Two to three sentences. What's being loaded, which study or release it belongs to, whether this is a new study or an addition to an existing study, and what application surfaces it lights up.

   **Canonical example:** the COTC030 load (**ICDC-4176**) — the first ICDC ticket built to this template; use it as the house-style reference for the Load Summary and the sections below.

2. `### 📦 **Submission & Artifacts**` — Required field. A four-row table holding the artifacts the load consumes, mirroring CTDC's canonical load ticket (CTDC-2093). Study identity (program, study name, submitter, chronology) lives on the parent data epic / submission Story and the study record linked via the native Links panel — not in this table. The four rows:

   | Field | Value | Notes |
   |---|---|---|
   | CRDC Submission ID | *(CRDC Submission Portal ID — one per submission; list all when a load spans several)* | Issued by the CRDC Submission Portal; one per submission. The deployed data model version for the load is derivable from this Submission ID. |
   | AWS Account ID | *(12-digit ICDC data commons AWS account)* | Constant for ICDC — the ICDC data commons AWS account. Use one consistent format across the paired IndexD Registration ticket. |
   | AWS S3 Bucket | `nci-cbiit-caninedatacommons-dev` | Constant for ICDC — the metadata bucket that holds every release package. |
   | Release Package | *(directory name(s) only, e.g. `<timestamp>-<submission-id>`)* | Directory name(s) only, within the AWS S3 Bucket above. Contains the metadata loading TSVs and the indexd.tsv manifest. Source of truth for the load. |

   **Naming discipline**: rows that point at *where artifacts live* carry an address, not a content description — the "AWS S3 Bucket" row names the bucket and the "Release Package" row names the directory within it. Keep the value an address.

3. `### 🚦 **Loading Workflow**` — Numbered list of the end-to-end promotion steps. ICDC uses a **hybrid pipeline**: **Dev runs locally** (local Neo4j instance + `loader.py`), and **QA / Stage / Prod run through Jenkins** with a two-tier split — *lower tier* targets QA, *upper tier* targets Stage and Prod. (This differs from CTDC, where all four environments use Jenkins.) Per-environment verification is part of these steps; record the outcome in the Testing Signoff table (Section 4).

   **Pre-load**
   1. Confirm the Release Package exists in S3 and the loading files inside it are the expected ones. Confirm the IndexD manifest inside the Release Package matches the paired IndexD Registration Task's spot-check verification (GUIDs minted and resolving correctly). If IndexD registration is incomplete, do not proceed.
   2. If the load includes new object files, confirm those files exist in the Object Files bucket and that each manifest entry resolves to a real bucket location.
   3. Confirm the data model version associated with the Submission ID is the version currently deployed in each environment. If a model update is required first, that work belongs in a modeling Task which must land before this load proceeds.

   **Dev — local execution**
   4. Create a local Neo4j instance from a dump of the Dev Neo4j server. Pull the latest data model from `CBIIT/icdc-model-tool` and the loading files from the Release Package in S3. Create a `data-loader-config.yml` from `CBIIT/icdc-dataloader/config/data-loader-config.example.yml`.
   5. Run `loader.py` locally against the local Neo4j instance; validate node and relationship counts with the Data Team. Once local validation passes, load to the Dev Neo4j environment and trigger the OpenSearch ETL for Dev. From the `icdc-dataloader` repo root — dry-run to validate node/relationship counts, then load:
   ```
   python3 loader.py config/data-loader-config.yml --dataset <path-to-release-package-loading-files> --dry-run
   python3 loader.py config/data-loader-config.yml --dataset <path-to-release-package-loading-files>
   ```
   6. Verify in Dev: Neo4j node counts updated, OpenSearch reindex completed, application surfaces render the new data, no errors in application metrics or page loads. Record the Dev outcome in the Testing Signoff table (Section 4), then reassign to the TPM for Dev signoff.

   **QA — lower-tier Jenkins**
   7. Run the Jenkins **lower-tier** data loading pipeline targeting QA, then the OpenSearch Loader Jenkins job for QA.
   8. Assign for QA testing (**Valentina Epishina**, `epishinavv`). Tester verifies: data renders on expected pages, file download links (if applicable) initiate a successful download of the correct file, no regressions on existing studies. Tester initials the Testing Signoff table (Section 4) on completion.

   **Stage — upper-tier Jenkins**
   9. Run the Jenkins **upper-tier** data loading pipeline targeting Stage, then the upper-tier OpenSearch Loader for Stage.
   10. Assign for Stage testing and signoff (`epishinavv`). Same verification points as QA, plus production-parity sanity checks. Tester initials the Testing Signoff table (Section 4) on completion.

   **Prod — upper-tier Jenkins**
   11. Run the Jenkins **upper-tier** data loading pipeline targeting Prod, then the upper-tier OpenSearch Loader for Prod.
   12. Assign for Prod verification and signoff. Verify in production at the live application URL (`caninecommons.cancer.gov`). Tester initials the Testing Signoff table (Section 4) on completion. **This is the trigger to close the ticket.**

   **Verification checklist per environment** (Neo4j and OpenSearch are both required checks — a Neo4j write without an OpenSearch reindex leaves the frontend stale): Neo4j node and relationship counts post-load; OpenSearch reindex completed and doc counts align with Neo4j; Cases / Studies / Samples pages render the new records; Files surface renders new file records and download links resolve; Explore Dashboard counts reflect the load; no spike in 4xx / 5xx application errors; no exceptions in the logs (CloudWatch or equivalent).

4. `### ✅ **Testing Signoff**` — The completion record. Tester fills in date and initials per environment as work progresses. **Prod signoff is the trigger to transition the ticket to Closed.**

   | Environment | Testing Completion Date | Tester Initials |
   |---|---|---|
   | Dev | | |
   | QA | | |
   | Stage | | |
   | Prod | | |

**Sections omitted**

Omitted compared to CTDC v4 of this template:

- ❌ **🔗 Linked Work** — Jira's native Links panel covers it.
- ❌ **🤝 Collaboration & Handoffs** — Implicit via assignee + comments.
- ❌ **🔍 Open Questions / Risks** — Belongs on the parent submission user story, not the Task.

Additionally removed in the 2026-07-28 revision (were Sections 4, 5, and 7 in the earlier 7-section structure):

- ❌ **🧪 Verification Surfaces** — Folded into the Loading Workflow per-environment verification steps (Section 3).
- ❌ **📊 Per-Environment Verification** — Redundant with the Testing Signoff record; the per-environment counts are validated in the workflow steps.
- ❌ **📝 Notes** — Load-specific notes, lessons learned, and terminology mappings belong on the parent submission user story / data epic, not the Task.

**Standing emoji set (4 entries)**

| Section | Emoji |
|---|---|
| Load Summary | 🎯 *(shared with IndexD Registration Task)* |
| Submission & Artifacts | 📦 *(shared with IndexD Registration Task)* |
| Loading Workflow | 🚦 *(shared with IndexD Registration Task)* |
| Testing Signoff | ✅ *(unique to data loading task — the per-environment audit record)* |

**Required content rules**

- **Scope is loading-data work only.** Loading a study submission into ICDC — either a new study or new data added to an existing study. **Schema or model changes** do not use this template — those use a modeling template. **IndexD registration** does not use this template — that uses the IndexD Registration Task template. **Software development work** does not use this template.
- **No Acceptance Criteria section.** Data loading is operational SOP work; the completion bar is the Testing Signoff table plus the per-environment verification checklist embedded in the Loading Workflow.
- **No Open Questions / Risks section.** Open questions and risks live on the parent submission user story, not on this Task. If a question or risk surfaces during the load, raise it as a bullet under the parent user story's Open Questions / Risks section so it's tracked at the program level.
- **One Task per end-to-end load** — Dev through Prod, not one ticket per environment. The Testing Signoff table is the single source of truth for where the load is in the pipeline.
- **Issue type is User Story** for the ICDC data load (intentional ICDC choice; the paired IndexD Registration ticket remains a Task). Do not use Subtask. **The Developer value goes in `customfield_23650`** — the canonical Developer field for all issue types, including Story — and names the engineer who runs the load. `customfield_18250` ("Developer Legacy") is deprecated and stays empty. See SKILL.md §3.
- **No `Data-Concierge` label.** Data loading is engineering work, not part of the Data Concierge service (which covers the IndexD registration/indexing handoff). Do not apply the `Data-Concierge` label to load tickets — it belongs only on the paired IndexD Registration Task. See SKILL.md §3.
- **Parent Epic set via `customfield_12350`** (confirmed — e.g., ICDC-4176 → epic ICDC-3342 "ICDC Data").
- **`Relates` link to related tickets.** Parent epic via Epic Link (`customfield_12350`); the paired IndexD Registration Task via `Relates`; the parent **Data Submission user story** via `Relates`. Every data submission has a parent Data Submission user story (same pattern as CTDC), and all submission-related data tickets — this load Story, the paired IndexD Registration Task, and any modeling Task — link to it via `Relates` (confirmed by TPM 2026-07-30).
- **`Relates` link to the paired IndexD Registration Task.** Registration and the load are paired, but registration does **not** technically block the load, so use `Relates`, not `Blocks`.
- **Initial ownership.** The parent Data Submission user story is owned by **Philip Musk** (ICDC Data Concierge) at creation; the load Story rolls up to it. The load Story's Developer field (`customfield_23650`) names the engineer who actually runs the load, distinct from the coordinating owner (confirmed by TPM 2026-07-30).
- **Hybrid pipeline must be explicit** in the Loading Workflow: Dev local (Neo4j + `loader.py`), QA lower-tier Jenkins, Stage / Prod upper-tier Jenkins.
- **Dev-local command block included.** The Loading Workflow Dev step carries the runnable `loader.py` invocation (dry-run to validate, then load) so every downstream load ticket shows the exact local command. Replace the `<path-to-release-package-loading-files>` placeholder with the study's data path. The flag is `--dataset` (not `--data`); the dataset may alternatively be set in the config file's `dataset:` key.
- **Neo4j write and OpenSearch reindex are both verified.** A successful Neo4j write without an OpenSearch reindex means the frontend won't show the new data; a successful reindex against an incomplete Neo4j write means stale or partial results. Both checks are called out in the Loading Workflow per-environment verification steps.
- **Submission & Artifacts table is mandatory and complete.** All four rows present. Use an explicit placeholder when a value is pending upstream — never silently omit a row.
- **Rendering-safe authoring patterns** — section headers use `### **Title**` Markdown form; tables use Jira-wiki `||header||` syntax, NOT GitHub-flavored Markdown `|h|h|`. Verified on CTDC's tracker; assumed to apply to ICDC since both use the same Jira instance.

**Writing-and-publishing workflow**

1. Confirm the upstream artifacts exist before drafting the load ticket. If the Release Package isn't generated yet, or the IndexD entries aren't registered, the load ticket is premature. **Surface any open questions on the parent submission user story, not on the Task.**
2. Confirm this work is a data load, not a model update or software development. If the schema is changing, use a modeling template. If code is changing in the frontend, backend, or microservices without a schema change, use the software development ticket family.
3. Confirm the data model version associated with the Submission ID matches what's deployed in each environment. If the load needs a newer model version, file a modeling Task first.
4. **Identify the parent data epic and the paired IndexD Registration Task.** Link via Jira native links after creation: Epic Link (`customfield_12350`) for the epic, and `Relates` for the paired IndexD ticket (registration does not technically block the load).
5. Create the data loading ticket via `jira_create_issue` with `issue_type = "User Story"`, a short placeholder description, and the parent epic linked via `customfield_12350`. Assign to the executing data engineer (e.g., Ambar Rana) or the TPM per the team's ownership pattern.
6. Push the description in two steps: create with the placeholder, then `jira_update_issue` with the full Markdown body.
7. Add `Relates` links from the load ticket to the parent submission user story.
8. Verify the rendered description with a UI screenshot — wiki source is unreliable as a render preview.
9. As each environment completes, the assigned tester adds their initials and date to the Testing Signoff table (Section 4).
10. **Prod signoff is the close trigger.** Once the Testing Signoff table's Prod row is filled in, transition the ticket to Closed.

**When NOT to use this template**

**IndexD registration (minting GUIDs)** — does NOT use this template. Use the **IndexD Registration Task** template instead. That sibling template covers the upstream external handoff that produces the registered GUIDs this load consumes.

**Data modeling** — does NOT use this template. Use the **Data Modeling for Study Submission** template (when drafted) for study-driven model additions, or the **Data Model Update Task** template (when drafted) for infrastructure-level model changes.

**Software development work** — does NOT use this template. Use the appropriate template from the software development family.

**Other work that is none of the above:**

- **CRDC platform changes** — Fence, IndexD, Submission Portal upgrades owned by CRDC platform teams. Out of ICDC scope entirely.
- **Pure file-creation tickets** — making a metadata loading file or upstream artifact prep. These are *upstream artifact creation* tickets that feed *this* template, not the load itself.

If a study submission requires schema changes before it can be loaded, that's two pieces of data management work in two sub-functions: the schema change is a modeling Task, and the load is a Data Loading Task that uses this template. They depend on each other but are tracked separately, with the load blocked until the model update has landed and stabilized in each environment. If a study submission requires IndexD registration before it can be loaded, that's the upstream IndexD Registration Task, and the load is blocked until the registration's GUID spot-check passes.

**Canonical example**

**ICDC-4176 — Load the COTC030 study.** The first ICDC load ticket built to this template; use it as the house-style reference. Its upstream sibling (the paired IndexD Registration Task) is ICDC-4175. For the closest cross-commons sibling pattern, see the CTDC v8 template in `CBIIT/ctdc-documentation` → `claude/templates/data-loading-task-template.md` (canonical CTDC example: the AHEP0731 load, CTDC-2063).

---

## `[ICDC-VERIFY]` items — status

Resolved from ICDC-4175 / ICDC-4176 and the `icdc-dataloader` repo (now **v1 canonical**, 2026-07-30):

- ✅ **Application surfaces** — Cases / Studies / Samples / Explore Dashboard / Files.
- ✅ **Submission origin** — CRDC Submission Portal (COP / COTC trials enter via the Portal).
- ✅ **Release Package bucket** — `nci-cbiit-caninedatacommons-dev`.
- ✅ **Loader repo** — `CBIIT/icdc-dataloader` (`loader.py` entry-point script + `config/data-loader-config.example.yml`). Note: `loader.py` is the runnable script; `DataLoader` is the class inside `data_loader.py` — do not refer to the script as `DataLoader.py`.
- ✅ **Graph store** — **Neo4j** (loader config connects via `bolt://…:7687`), not Memgraph.
- ✅ **Pipeline organization** — hybrid: Dev local, QA lower-tier Jenkins, Stage / Prod upper-tier Jenkins.
- ✅ **Model version** — derivable from the Submission ID; no separate table row needed.
- ✅ **Study identifier pattern** — e.g., `COTC030 v.1`.
- ✅ **Parent Epic custom field** — `customfield_12350` (e.g., epic ICDC-3342 "ICDC Data").
- ✅ **QA tester** — Valentina Epishina (`epishinavv`).
- ✅ **Production URL** — `caninecommons.cancer.gov`.
- ✅ **Issue type** — User Story (intentional ICDC choice).
- ✅ **Canonical example** — ICDC-4176 (Load the COTC030 study); upstream sibling ICDC-4175 (IndexD registration).

Resolved by the TPM (2026-07-30) — all items now confirmed:

1. ✅ **Object Files bucket** — `nci-crdc-data-bucket-prod`, the shared CRDC object-files bucket (the same bucket CTDC uses).
2. ✅ **Parent submission user story** — ICDC keeps a parent Data Submission user story (same pattern as CTDC); every submission-related data ticket links to it via `Relates`.
3. ✅ **Developer-field placement on the load Story** — `customfield_23650` for *all* issue types including Story (confirmed on ICDC-4176; the Jira UI "Developer" field reads from it). `customfield_18250` is deprecated/unused. SKILL.md §3 and this template updated to match.
4. ✅ **Initial ownership** — the parent Data Submission user story is owned by Philip Musk (ICDC Data Concierge) at creation.

With these confirmed, the template was promoted from draft status to **v1 canonical** on 2026-07-30.
