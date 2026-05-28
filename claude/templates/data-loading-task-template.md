### 📦 Data Loading Task Template (v1-DRAFT — 2026-05-27)

> **Status:** **v1-DRAFT (rev. 2026-05-28).** Ported from CTDC's `claude/templates/data-loading-task-template.md` (v5), then revised against the first real ICDC tickets (ICDC-4175 / ICDC-4176) and the `icdc-dataloader` repo. This revision confirms **Neo4j** (not Memgraph) as the graph store, a **hybrid Dev-local / Jenkins** pipeline, **User Story** as the issue type for the load, **`Relates`** (not `Blocks`) to the paired IndexD task, and a **five-row** Submission & Artifacts table. Remaining open items are listed at the end; once Ambar Rana confirms them this promotes to v1 canonical.

> **Use this template for every ICDC data management task that loads a study submission into ICDC — either a brand-new study or new data added to an existing study — and promotes it through Dev → QA → Stage → Prod.** Canonical example: TBD (will be filled in when the first ICDC Data Loading ticket is drafted under this template). This template covers the **loading-data** sub-function of the team's data management work. It is **not** for changes to the data model itself, and **not** for the upstream IndexD registration that mints the file GUIDs this load consumes (use the IndexD Registration Task template). See "When NOT to use this template" at the end.

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

- **Source artifacts** — Release Package + IndexD manifest live in the **AWS S3 Release Package bucket** `nci-cbiit-caninedatacommons-dev` (confirmed from ICDC-4175 / ICDC-4176). Object files live in the **AWS S3 object files bucket** `nci-crdc-data-bucket-prod` `[ICDC-VERIFY — confirm with Ambar / Charles]`. The data-loading TSVs the pipeline consumes all live inside the Release Package (multiple files, not a single named file).
- **Loader repo** — `CBIIT/icdc-dataloader` (confirmed). Home of `DataLoader.py` and `config/data-loader-config.example.yml`.
- **Loading pipeline** — **Hybrid** (confirmed from ICDC-4176; differs from CTDC, where all four tiers use Jenkins): **Dev runs locally** (local Neo4j instance + `DataLoader.py`), and **QA / Stage / Prod run through Jenkins** with a two-tier split — *lower tier* targets QA, *upper tier* targets Stage and Prod.
- **Graph database** — **Neo4j**. ICDC's canonical metadata store — the `icdc-dataloader` config connects to it via `bolt://…:7687` (CTDC uses Memgraph in this slot; ICDC does not). The loading pipeline writes nodes and relationships here. **The model is assumed stable for a data load — if the model is changing, that's a modeling Task and uses a modeling template.**
- **Search index** — **OpenSearch**. The frontend's Explore Dashboard, autocomplete, and filters read from OpenSearch, not from Neo4j directly. After every metadata load, OpenSearch must be reindexed from Neo4j before the frontend reflects the change.
- **Application surfaces** — Cases page, Studies page, Samples page, Explore Dashboard, Files surface (confirmed from ICDC-4176). These are the pages a tester loads in their browser to verify the data actually shows up correctly.

The template walks all of this in order: payload → pipeline run per environment → verification per environment → signoff per environment.

**Section order (7 sections, exactly this sequence)**

Each section header is an `h3` Markdown heading using the emoji + bold title format shown. Don't omit, reorder, or merge sections. If a section genuinely has no content, state so explicitly ("None at this time") rather than dropping the header.

1. `### 🎯 **Load Summary**` — Two to three sentences. What's being loaded, which study or release it belongs to, whether this is a new study or an addition to an existing study, and what application surfaces it lights up.

   `[ICDC-VERIFY]` — Canonical example placeholder: The first ICDC ticket drafted under this template will become the canonical example reference here. Until then, refer to the CTDC v5 Load Summary example as the closest sibling pattern.

2. `### 📦 **Submission & Artifacts**` — Required field. A five-row table holding the artifacts the load consumes. Study identity (program, study name, submitter, chronology) lives on the parent data epic / submission Story linked via the native Links panel — not in this table. The five rows:

   | Field | Value | Notes |
   |---|---|---|
   | CRDC Submission ID | *(CRDC Submission Portal ID — one per submission)* | ICDC submissions originate from the CRDC Submission Portal. The deployed data model version for the load is derivable from this Submission ID, so model version is **not** carried as a separate row. |
   | AWS Account ID | *(12-digit ICDC data commons AWS account)* | Standard ICDC data commons AWS account. Use one consistent format across the paired IndexD Registration ticket. |
   | Release Package | AWS S3: `s3://nci-cbiit-caninedatacommons-dev/<timestamp>-<submission-id>` | Source of truth. Contains the validated data-loading TSVs and the IndexD manifest. There are multiple loading files and they all live here, so no separate per-file row is carried. SharePoint copies are convenience only. |
   | Object Files Location | AWS S3 Bucket: `nci-crdc-data-bucket-prod` `[ICDC-VERIFY — confirm with Ambar / Charles]` | The bucket holding the physical object files. Each manifest row's `url` resolves here. |
   | Study (acronym + version) | *(e.g., `COTC030 v.1`)* | New study vs. addition to an existing study. Drives the Study Details page verification in Section 4. |

   **Naming discipline**: rows that point at *where artifacts live* carry an address, not a content description — e.g., "Object Files Location" names a bucket, and "Release Package" names the source-of-truth S3 path. Keep the value an address.

3. `### 🚦 **Loading Workflow**` — Numbered list of the end-to-end promotion steps. ICDC uses a **hybrid pipeline**: **Dev runs locally** (local Neo4j instance + `DataLoader.py`), and **QA / Stage / Prod run through Jenkins** with a two-tier split — *lower tier* targets QA, *upper tier* targets Stage and Prod. (This differs from CTDC, where all four environments use Jenkins.)

   **Pre-load**
   1. Confirm the Release Package exists in S3 and the loading files inside it are the expected ones. Confirm the IndexD manifest inside the Release Package matches the paired IndexD Registration Task's spot-check verification (GUIDs minted and resolving correctly). If IndexD registration is incomplete, do not proceed.
   2. If the load includes new object files, confirm those files exist in the Object Files bucket and that each manifest entry resolves to a real bucket location.
   3. Confirm the data model version associated with the Submission ID is the version currently deployed in each environment. If a model update is required first, that work belongs in a modeling Task which must land before this load proceeds.

   **Dev — local execution**
   4. Create a local Neo4j instance from a dump of the Dev Neo4j server. Pull the latest data model from `CBIIT/icdc-model-tool` and the loading files from the Release Package in S3. Create a `data-loader-config.yml` from `CBIIT/icdc-dataloader/config/data-loader-config.example.yml`.
   5. Run `DataLoader.py` locally against the local Neo4j instance; validate node and relationship counts with the Data Team. Once local validation passes, load to the Dev Neo4j environment and trigger the OpenSearch ETL for Dev.
   6. Verify in Dev: Neo4j node counts updated, OpenSearch reindex completed, application surfaces render the new data, no errors in application metrics or page loads. Record results in Section 5 (Per-Environment Verification), then reassign to the TPM for Dev signoff.

   **QA — lower-tier Jenkins**
   7. Run the Jenkins **lower-tier** data loading pipeline targeting QA, then the OpenSearch Loader Jenkins job for QA.
   8. Assign for QA testing (**Valentina Epishina**, `epishinavv`). Tester verifies: data renders on expected pages, file download links (if applicable) initiate a successful download of the correct file, no regressions on existing studies. Tester initials Section 6 (Testing Signoff) on completion.

   **Stage — upper-tier Jenkins**
   9. Run the Jenkins **upper-tier** data loading pipeline targeting Stage, then the upper-tier OpenSearch Loader for Stage.
   10. Assign for Stage testing and signoff (`epishinavv`). Same verification points as QA, plus production-parity sanity checks. Tester initials Section 6 on completion.

   **Prod — upper-tier Jenkins**
   11. Run the Jenkins **upper-tier** data loading pipeline targeting Prod, then the upper-tier OpenSearch Loader for Prod.
   12. Assign for Prod verification and signoff. Verify in production at the live application URL (`caninecommons.cancer.gov`). Tester initials Section 6 on completion. **This is the trigger to close the ticket.**

4. `### 🧪 **Verification Surfaces**` — Bullet list naming every application surface that must be checked after each environment load (italic-labelled, em-dash separators — the rendering-safe pattern). ICDC's surfaces are Cases / Studies / Samples (vs CTDC's Participants / Studies / Specimens).

   - *Neo4j node counts* — confirm expected node and relationship counts post-load (drives the integrity check)
   - *OpenSearch reindex* — confirm reindex completed without error and counts match Neo4j
   - *Cases page* — for the affected study, confirm new case records render correctly
   - *Studies page* — confirm new study (or updated study) appears in the global study list
   - *Samples page* — confirm new sample records render and link correctly to their parent cases / studies
   - *Files surface* — confirm new file records render and any file download links initiate the right file
   - *Explore Dashboard* — confirm case, study, sample, and file counts reflect the load
   - *Application error metrics* — confirm no spike in 4xx / 5xx after load
   - *Logs (CloudWatch or equivalent)* — confirm no exceptions during reindex
   - *Data Model Navigator (DMN)* — if this load came with a coordinated model update introducing new node types or properties, confirm the DMN renders them post-load (the DMN renders the model live, so this is typically automatic)

5. `### 📊 **Per-Environment Verification**` — Table to record observed Neo4j counts, OpenSearch counts, and any anomalies, per environment.

   | Environment | Neo4j node count (post-load) | OpenSearch doc count (post-reindex) | Application surfaces verified | Anomalies / notes |
   |---|---|---|---|---|
   | Dev | | | | |
   | QA | | | | |
   | Stage | | | | |
   | Prod | | | | |

6. `### ✅ **Testing Signoff**` — The completion record. Tester fills in date and initials per environment as work progresses. **Prod signoff is the trigger to transition the ticket to Closed.**

   | Environment | Testing Completion Date | Tester Initials |
   |---|---|---|
   | Dev | | |
   | QA | | |
   | Stage | | |
   | Prod | | |

7. `### 📝 **Notes**` — Bullet list. Optional content: prior load lessons learned, links to retrospective notes if a prior load surfaced an issue worth remembering, terminology translations (Bento "Case" → ICDC "Case", note any other Bento-to-ICDC mappings), known constraints. If there's no meaningful note, write "None at this time."

**Sections omitted compared to CTDC v4 of this template**

- ❌ **🔗 Linked Work** — Jira's native Links panel covers it.
- ❌ **🤝 Collaboration & Handoffs** — Implicit via assignee + comments.
- ❌ **🔍 Open Questions / Risks** — Belongs on the parent submission user story, not the Task.

**Standing emoji set (7 entries)**

| Section | Emoji |
|---|---|
| Load Summary | 🎯 *(shared with IndexD Registration Task)* |
| Submission & Artifacts | 📦 *(shared with IndexD Registration Task)* |
| Loading Workflow | 🚦 *(shared with IndexD Registration Task)* |
| Verification Surfaces | 🧪 *(shared with IndexD Registration Task)* |
| Per-Environment Verification | 📊 *(unique to data loading task — environment-level table)* |
| Testing Signoff | ✅ *(unique to data loading task — the per-environment audit record)* |
| Notes | 📝 *(shared with IndexD Registration Task)* |

**Required content rules**

- **Scope is loading-data work only.** Loading a study submission into ICDC — either a new study or new data added to an existing study. **Schema or model changes** do not use this template — those use a modeling template. **IndexD registration** does not use this template — that uses the IndexD Registration Task template. **Software development work** does not use this template.
- **No Acceptance Criteria section.** Data loading is operational SOP work; the completion bar is the Testing Signoff table plus the Verification Surfaces checklist.
- **No Open Questions / Risks section.** Open questions and risks live on the parent submission user story, not on this Task. If a question or risk surfaces during the load, raise it as a bullet under the parent user story's Open Questions / Risks section so it's tracked at the program level.
- **One Task per end-to-end load** — Dev through Prod, not one ticket per environment. The Testing Signoff table is the single source of truth for where the load is in the pipeline.
- **Issue type is User Story** for the ICDC data load (intentional ICDC choice; the paired IndexD Registration ticket remains a Task). Do not use Subtask. **The Developer value goes in `customfield_23650`** — the canonical Developer field for all issue types, including Story — and names the engineer who runs the load. `customfield_18250` ("Developer Legacy") is deprecated and stays empty. See SKILL.md §3.
- **No `Data-Concierge` label.** Data loading is engineering work, not part of the Data Concierge service (which covers the IndexD registration/indexing handoff). Do not apply the `Data-Concierge` label to load tickets — it belongs only on the paired IndexD Registration Task. See SKILL.md §3.
- **Parent Epic set via `customfield_12350`** (confirmed — e.g., ICDC-4176 → epic ICDC-3342 "ICDC Data").
- **`Relates` link to related tickets.** Parent epic via Epic Link (`customfield_12350`); the paired IndexD Registration Task via `Relates`. `[ICDC-VERIFY]` — ICDC does not appear to keep a separate program-level submission user story (the data epic + this load Story serve that role); confirm with Ambar Rana.
- **`Relates` link to the paired IndexD Registration Task.** Registration and the load are paired, but registration does **not** technically block the load, so use `Relates`, not `Blocks`.
- **Hybrid pipeline must be explicit** in the Loading Workflow: Dev local (Neo4j + `DataLoader.py`), QA lower-tier Jenkins, Stage / Prod upper-tier Jenkins.
- **Neo4j and OpenSearch both named in Verification Surfaces.** A successful Neo4j write without an OpenSearch reindex means the frontend won't show the new data; a successful reindex against an incomplete Neo4j write means stale or partial results. Both surfaces are required checks.
- **Submission & Artifacts table is mandatory and complete.** All five rows present. Use an explicit placeholder when a value is pending upstream — never silently omit a row.
- **Rendering-safe authoring patterns** — section headers use `### **Title**` Markdown form; bullet lists with italic labels use `* *Label* — content` (italic-and-em-dash); tables use Jira-wiki `||header||` syntax, NOT GitHub-flavored Markdown `|h|h|`. Verified on CTDC's tracker; assumed to apply to ICDC since both use the same Jira instance.

**Writing-and-publishing workflow**

1. Confirm the upstream artifacts exist before drafting the load ticket. If the Release Package isn't generated yet, or the IndexD entries aren't registered, the load ticket is premature. **Surface any open questions on the parent submission user story, not on the Task.**
2. Confirm this work is a data load, not a model update or software development. If the schema is changing, use a modeling template. If code is changing in the frontend, backend, or microservices without a schema change, use the software development ticket family.
3. Confirm the data model version associated with the Submission ID matches what's deployed in each environment. If the load needs a newer model version, file a modeling Task first.
4. **Identify the parent data epic and the paired IndexD Registration Task.** Link via Jira native links after creation: Epic Link (`customfield_12350`) for the epic, and `Relates` for the paired IndexD ticket (registration does not technically block the load).
5. Create the data loading ticket via `jira_create_issue` with `issue_type = "User Story"`, a short placeholder description, and the parent epic linked via `customfield_12350`. Assign to the executing data engineer (e.g., Ambar Rana) or the TPM per the team's ownership pattern.
6. Push the description in two steps: create with the placeholder, then `jira_update_issue` with the full Markdown body.
7. Add `Relates` links from the load ticket to the parent submission user story.
8. Verify the rendered description with a UI screenshot — wiki source is unreliable as a render preview.
9. As each environment completes, the assigned tester adds their initials and date to Section 6 (Testing Signoff) and notes counts in Section 5 (Per-Environment Verification).
10. **Prod signoff is the close trigger.** Once Section 6's Prod row is filled in, transition the ticket to Closed.

**When NOT to use this template**

**IndexD registration (minting GUIDs)** — does NOT use this template. Use the **IndexD Registration Task** template instead. That sibling template covers the upstream external handoff that produces the registered GUIDs this load consumes.

**Data modeling** — does NOT use this template. Use the **Data Modeling for Study Submission** template (when drafted) for study-driven model additions, or the **Data Model Update Task** template (when drafted) for infrastructure-level model changes.

**Software development work** — does NOT use this template. Use the appropriate template from the software development family.

**Other work that is none of the above:**

- **CRDC platform changes** — Fence, IndexD, Submission Portal upgrades owned by CRDC platform teams. Out of ICDC scope entirely.
- **Pure file-creation tickets** — making a metadata loading file or upstream artifact prep. These are *upstream artifact creation* tickets that feed *this* template, not the load itself.

If a study submission requires schema changes before it can be loaded, that's two pieces of data management work in two sub-functions: the schema change is a modeling Task, and the load is a Data Loading Task that uses this template. They depend on each other but are tracked separately, with the load blocked until the model update has landed and stabilized in each environment. If a study submission requires IndexD registration before it can be loaded, that's the upstream IndexD Registration Task, and the load is blocked until the registration's GUID spot-check passes.

**Canonical example**

**TBD.** The first ICDC Data Loading ticket drafted under this v1-DRAFT template will become the canonical example. Until then, refer to the CTDC v5 template in the CTDC documentation repo (`CBIIT/ctdc-documentation` → `claude/templates/data-loading-task-template.md`) as the closest sibling pattern.

---

## `[ICDC-VERIFY]` items — status

Resolved from ICDC-4175 / ICDC-4176 and the `icdc-dataloader` repo (v1-DRAFT → on track for canonical once the remaining items below are confirmed):

- ✅ **Application surfaces** — Cases / Studies / Samples / Explore Dashboard / Files.
- ✅ **Submission origin** — CRDC Submission Portal (COP / COTC trials enter via the Portal).
- ✅ **Release Package bucket** — `nci-cbiit-caninedatacommons-dev`.
- ✅ **Loader repo** — `CBIIT/icdc-dataloader` (`DataLoader.py` + `config/data-loader-config.example.yml`).
- ✅ **Graph store** — **Neo4j** (loader config connects via `bolt://…:7687`), not Memgraph.
- ✅ **Pipeline organization** — hybrid: Dev local, QA lower-tier Jenkins, Stage / Prod upper-tier Jenkins.
- ✅ **Model version** — derivable from the Submission ID; no separate table row needed.
- ✅ **Study identifier pattern** — e.g., `COTC030 v.1`.
- ✅ **Parent Epic custom field** — `customfield_12350` (e.g., epic ICDC-3342 "ICDC Data").
- ✅ **QA tester** — Valentina Epishina (`epishinavv`).
- ✅ **Production URL** — `caninecommons.cancer.gov`.
- ✅ **Issue type** — User Story (intentional ICDC choice).

Still open for Ambar Rana:

1. **Object Files bucket** — confirm `nci-crdc-data-bucket-prod` is correct for ICDC (assumed; flagged in ICDC-4175).
2. **Parent submission user story** — ICDC appears to use a data epic + load Story rather than a CTDC-style program-level submission user story; confirm the intended pattern.
3. **Developer-field placement on the load Story** — ✅ **RESOLVED (2026-05-28):** the Developer field is `customfield_23650` for *all* issue types including Story (confirmed on ICDC-4176; the Jira UI "Developer" field reads from it). `customfield_18250` is deprecated/unused. SKILL.md §3 and this template updated to match.
4. **Initial ownership** — confirm whether the load Story is assigned to the data engineer or the TPM at creation.
