### 📦 Data Loading Task Template (v1-DRAFT — 2026-05-27)

> **Status:** **v1-DRAFT.** Ported from CTDC's `claude/templates/data-loading-task-template.md` (v5). Carries `[ICDC-VERIFY]` callouts at every spot where the CTDC pattern was adapted for ICDC but the ICDC-specific assumption needs Ambar Rana's review before the template becomes canonical. Once `[ICDC-VERIFY]` items are resolved, this template promotes to v1 canonical.

> **Use this template for every ICDC data management task that loads a study submission into ICDC — either a brand-new study or new data added to an existing study — and promotes it through Dev → QA → Stage → Prod.** Canonical example: TBD (will be filled in when the first ICDC Data Loading ticket is drafted under this template). This template covers the **loading-data** sub-function of the team's data management work. It is **not** for changes to the data model itself, and **not** for the upstream IndexD registration that mints the file GUIDs this load consumes (use the IndexD Registration Task template). See "When NOT to use this template" at the end.

**Why this template**

The ICDC team has two primary functions:

- **Software development** — designing, coding, testing, releasing the React frontend (Bento framework) and supporting services. Verified against application *behavior*.
- **Data management** — managing study data submissions (COTC trials and others), modeling the shape of ICDC's data, and loading data into ICDC's databases. Verified against application *contents* (row counts, page renders, downloadable artifacts) and against schema state.

Data management has two sub-functions:

- **Loading data** — taking a study's *contents* (metadata, files, IndexD entries) and getting them into ICDC's databases. Tracked with **this** template and its upstream sibling, the IndexD Registration Task template.
- **Modeling data** — changing the *shape* of what ICDC's databases can hold. Tracked with the Data Modeling for Study Submission template (when drafted) for the common case, or the Data Model Update Task template (when drafted) for infrastructure-level model changes.

Application pages get updated when new data is loaded — the **Cases**, **Studies**, **Samples** pages, the Explore Dashboard, the Files surface. `[ICDC-VERIFY]` — Confirm with Ambar Rana the exact application page list affected by data loads, since these differ from CTDC's Participants / Studies / Specimens. That is not a sign that the load involves software work or a model change. It's the application working as designed: rendering the new data with unchanged behavior and unchanged schema.

This template owns only the loading-data sub-function. The verification points, signoff cadence, and pipeline choices below are tuned for loading data into a stable schema with unchanged application code.

**Tasks execute; user stories deliberate.** The same principle the IndexD Registration Task template adopted applies here: **Open questions, risks, ownership directories, and link inventories belong on the parent user story, not on the Task.** A Task is what the assignee executes — it carries only what's needed to do the work. The template removes Linked Work, Collaboration & Handoffs, and Open Questions / Risks sections accordingly.

The most common antipatterns this template prevents:

1. **One ticket per environment.** Splits the audit trail across four tickets and forces a manual reconstruction of "where is this release in the pipeline?" at every standup. A data load is a single end-to-end promotion, not four independent jobs.
2. **No per-environment signoff record.** When QA, Stage, and Prod testers initial their work in Slack threads or comments, there's no consolidated record for compliance review or for the post-load retrospective if something goes wrong in Prod.
3. **Mixed metaphor with software development tickets or model update tickets.** Writing the description as if it's a code deployment ("merge to main, tag the release") or a frontend change ("update the component to render the new field") obscures that this is a *data* promotion — a different operational pathway with different verification points.
4. **Ambiguous data payload.** "Load the new metadata" without naming the Submission ID, the bucket location, and the metadata loading file leaves the data engineer guessing — and a guess on which `file.tsv` to load is exactly the kind of mistake that goes undetected until Prod verification. The Submission & Artifacts table in Section 2 exists specifically to eliminate this ambiguity.

**Pipeline & store anatomy (read once before drafting)**

A CTDC data load touches multiple systems in sequence. ICDC's anatomy is structurally similar but with ICDC-specific repos and bucket names:

- **Source artifacts** — Release Package + indexd.tsv manifest live in the **AWS S3 metadata bucket** `[ICDC-VERIFY]` (CTDC uses `nci-cbiit-clinicaltrialdatacommons-metadata` — ICDC equivalent TBD). Object files live in the **AWS S3 object files bucket** `[ICDC-VERIFY]` (CTDC uses `nci-crdc-data-bucket-prod` — ICDC equivalent TBD). The metadata loading file the Jenkins pipeline consumes lives in the Release Package.
- **Loader repo** — `[ICDC-VERIFY]` — CTDC uses `CBIIT/crdc-ctdc-dataloader`; ICDC equivalent TBD. Likely `CBIIT/icdc-dataloader` or similar — confirm with Ambar Rana.
- **Loading pipeline** — **Jenkins**. `[ICDC-VERIFY]` — CTDC has two pipelines: *lower tiers* (targets Dev and QA) and *upper tiers* (targets Stage and Prod). ICDC may have the same two-tier split or a different organization. Confirm with Charles Ngu / DevOps.
- **Graph database** — **Memgraph**. This is ICDC's canonical metadata store (same as CTDC). The loading pipeline writes nodes and relationships here. **The model is assumed stable for a data load — if the model is changing, that's a modeling Task and uses a modeling template.**
- **Search index** — **OpenSearch**. The frontend's Explore Dashboard, autocomplete, and filters read from OpenSearch, not from Memgraph directly. After every metadata load, OpenSearch must be reindexed from Memgraph before the frontend reflects the change.
- **Application surfaces** — Cases page, Studies page, Samples page, Explore Dashboard, Files surface, etc. `[ICDC-VERIFY]` — Confirm full list with Ambar Rana. These are the pages a tester loads in their browser to verify the data actually shows up correctly.

The template walks all of this in order: payload → pipeline run per environment → verification per environment → signoff per environment.

**Section order (7 sections, exactly this sequence)**

Each section header is an `h3` Markdown heading using the emoji + bold title format shown. Don't omit, reorder, or merge sections. If a section genuinely has no content, state so explicitly ("None at this time") rather than dropping the header.

1. `### 🎯 **Load Summary**` — Two to three sentences. What's being loaded, which study or release it belongs to, whether this is a new study or an addition to an existing study, and what application surfaces it lights up.

   `[ICDC-VERIFY]` — Canonical example placeholder: The first ICDC ticket drafted under this template will become the canonical example reference here. Until then, refer to the CTDC v5 Load Summary example as the closest sibling pattern.

2. `### 📦 **Submission & Artifacts**` — Required field. A six-row table holding the artifacts the load consumes. Study identity (program, study name, dbGaP, submitter, chronology) lives on the parent submission user story linked via the native Links panel — not in this table. The six rows:

   | Field | Value | Notes |
   |---|---|---|
   | CRDC Submission ID | *(Submission Portal ID or ICDC equivalent — one per submission)* | `[ICDC-VERIFY]` — does ICDC use the CRDC Submission Portal the same way CTDC does, or do ICDC submissions originate via direct COTC trial intake? Confirm with Ambar Rana. |
   | Release Package Location | AWS Bucket: `[ICDC-VERIFY]` | The bucket holding the Release Package (metadata TSVs + indexd.tsv manifest). CTDC uses `nci-cbiit-clinicaltrialdatacommons-metadata` — ICDC equivalent TBD. |
   | Object Files Location | AWS Bucket: `[ICDC-VERIFY]` | Where the object files live. CTDC uses `nci-crdc-data-bucket-prod` — ICDC equivalent TBD. Include the bucket path prefix if files are scoped to a sub-folder. |
   | Metadata loading file | *(filename, e.g., `file.tsv`)* | The TSV the Jenkins pipeline consumes from the Release Package. This is the artifact that drives the load. |
   | Study (acronym + version) | *(e.g., COTC021 v2; confirm ICDC's typical study identifier pattern with Ambar Rana)* | Drives the Study Details page verification in Section 4. |
   | Target model version | *(e.g., `2.0`)* | The ICDC model version that this load runs against. `[ICDC-VERIFY]` — confirm the file path and branch in `icdc-model-tool` to check the live version. CTDC uses `model-desc/ctdc_model_file.yaml` on the `prod` branch of `CBIIT/ctdc-model`; ICDC's path will be in `icdc-model-tool` but the exact file is TBD. If the load requires a *newer* model version, that's a modeling Task that must land first. |

   **Naming discipline**: rows that point at *where artifacts live* end in "Location" (e.g., "Release Package Location", "Object Files Location"). This makes the row's purpose unambiguous — the row holds an address, not a content description.

3. `### 🚦 **Loading Workflow**` — Numbered list of the end-to-end promotion steps. **Two-tier pipeline grouping** is enforced in CTDC: Dev + QA on lower tiers, Stage + Prod on upper tiers. `[ICDC-VERIFY]` — Confirm ICDC's actual Jenkins pipeline organization with Charles Ngu / DevOps before relying on this exact two-tier split.

   **Pre-load**
   1. Confirm the Release Package exists in the metadata bucket and the metadata loading file inside it is the expected one. Confirm the IndexD manifest inside the Release Package matches the upstream IndexD Registration Task's spot-check verification (i.e., GUIDs are minted and resolve correctly). If IndexD registration is incomplete, this load is blocked.
   2. If the load includes new object files, confirm those files exist in the Object Files bucket and that each indexd.tsv entry resolves to a real bucket location.
   3. Confirm the target model version named in Section 2 is the version currently deployed in each environment. If a model update is required first, that work belongs in a modeling Task which must land before this load proceeds.

   **Lower tiers — Dev** `[ICDC-VERIFY] — confirm ICDC's pipeline targeting`
   4. Run the Jenkins **lower-tiers** data loading pipeline targeting Dev with the confirmed metadata loading file.
   5. After pipeline completion, verify in Dev: Memgraph node counts updated, OpenSearch reindex completed, application surfaces render the new data, no errors in application metrics or page loads. Record results in Section 5 (Per-Environment Verification).

   **Lower tiers — QA**
   6. Run the Jenkins **lower-tiers** data loading pipeline targeting QA with the same metadata loading file.
   7. Assign for QA testing. Tester verifies: data renders on expected pages, file download links (if applicable) initiate a successful download of the correct file, no regressions on existing studies. Tester (likely **Valentina Epishina** based on shared QA convention) initials Section 6 (Testing Signoff) on completion.

   **Upper tiers — Stage**
   8. Run the Jenkins **upper-tiers** data loading pipeline targeting Stage with the same metadata loading file.
   9. Assign for Stage testing and signoff. Same verification points as QA, plus production-parity sanity checks. Tester initials Section 6 on completion.

   **Upper tiers — Prod**
   10. Run the Jenkins **upper-tiers** data loading pipeline targeting Prod with the same metadata loading file.
   11. Assign for Prod verification and signoff. Verify in production with the live application URL (`caninecommons.cancer.gov`). Tester initials Section 6 on completion. **This is the trigger to close the ticket.**

4. `### 🧪 **Verification Surfaces**` — Bullet list naming every application surface that must be checked after each environment load. Bullet list (italic-labelled, em-dash separators — the rendering-safe pattern). **`[ICDC-VERIFY]` — The list below adapts CTDC's surface list to ICDC's terminology (Cases / Studies / Samples instead of Participants / Studies / Specimens). Confirm the exhaustive list with Ambar Rana.**

   - *Memgraph node counts* — confirm expected node and relationship counts post-load (drives the integrity check)
   - *OpenSearch reindex* — confirm reindex completed without error and counts match Memgraph
   - *Cases page* — for the affected study, confirm new case records render correctly
   - *Studies page* — confirm new study (or updated study) appears in the global study list
   - *Samples page* — confirm new sample records render and link correctly to their parent cases / studies
   - *Files surface* — confirm new file records render and any file download links initiate the right file
   - *Explore Dashboard* — confirm case, study, sample, and file counts reflect the load
   - *Application error metrics* — confirm no spike in 4xx / 5xx after load
   - *Logs (CloudWatch or equivalent)* — confirm no exceptions during reindex
   - *Data Model Navigator (DMN) integration* — `[ICDC-VERIFY]` — if this load introduced new node types or properties as part of a coordinated model update, confirm the DMN renders them correctly post-load

5. `### 📊 **Per-Environment Verification**` — Table to record observed Memgraph counts, OpenSearch counts, and any anomalies, per environment.

   | Environment | Memgraph node count (post-load) | OpenSearch doc count (post-reindex) | Application surfaces verified | Anomalies / notes |
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
- **Issue type is Task** on this tracker. Do not use Story or Subtask.
- **Parent Epic field set via the standard custom field** `[ICDC-VERIFY]` — CTDC uses `customfield_12350`; ICDC may use the same or different. Confirm with Ambar Rana.
- **`Relates` link to the parent submission user story is mandatory** when one exists. `[ICDC-VERIFY]` — Confirm whether ICDC maintains program-level submission user stories.
- **`Blocks` link upstream from the IndexD Registration Task** when one exists. The IndexD Registration Task blocks the Data Loading Task — pass the IndexD ticket as the inward issue, the load ticket as the outward issue.
- **Two-tier Jenkins pipeline distinction must be explicit** in the Loading Workflow section if ICDC uses that split. `[ICDC-VERIFY]` — confirm with Charles Ngu / DevOps.
- **Memgraph and OpenSearch both named in Verification Surfaces.** A successful Memgraph write without an OpenSearch reindex means the frontend won't show the new data; a successful reindex against an incomplete Memgraph write means stale or partial results. Both surfaces are required checks.
- **Submission & Artifacts table is mandatory and complete.** All six rows present. Use PLACEHOLDER explicitly when a value is pending upstream — never silently omit a row.
- **Rendering-safe authoring patterns** — section headers use `### **Title**` Markdown form; bullet lists with italic labels use `* *Label* — content` (italic-and-em-dash); tables use Jira-wiki `||header||` syntax, NOT GitHub-flavored Markdown `|h|h|`. Verified on CTDC's tracker; assumed to apply to ICDC since both use the same Jira instance.

**Writing-and-publishing workflow**

1. Confirm the upstream artifacts exist before drafting the load ticket. If the Release Package isn't generated yet, or the IndexD entries aren't registered, the load ticket is premature. **Surface any open questions on the parent submission user story, not on the Task.**
2. Confirm this work is a data load, not a model update or software development. If the schema is changing, use a modeling template. If code is changing in the frontend, backend, or microservices without a schema change, use the software development ticket family.
3. Confirm the target model version (Section 2) matches what's deployed in each environment. If the load needs a newer model version, file a modeling Task first.
4. **Identify the parent submission user story and the upstream IndexD Registration Task.** Both go on the ticket via Jira native links after creation: `Relates` for the user story, inbound `Blocks` from the IndexD ticket.
5. Create the data loading task via `jira_create_issue` with `issue_type = "Task"`, a short placeholder description, and the parent epic linked via the standard custom field. Assign to the TPM initially — `[ICDC-VERIFY]` confirm ICDC TPM ownership pattern.
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

## Open `[ICDC-VERIFY]` items (for Ambar Rana's review)

This template carries the following assumptions that need ICDC-specific confirmation before promotion to canonical:

1. **Application surface terminology** — Cases / Studies / Samples confirmed as the ICDC equivalent of CTDC's Participants / Studies / Specimens? Are there other application surfaces I haven't named (e.g., Programs page, Cohort builder)?
2. **Submission origin** — Do ICDC submissions originate via the CRDC Submission Portal (like CTDC), via direct COTC trial intake, or via another mechanism?
3. **Object Files bucket** — What's ICDC's equivalent of CTDC's `nci-crdc-data-bucket-prod`?
4. **Release Package bucket** — What's ICDC's equivalent of CTDC's `nci-cbiit-clinicaltrialdatacommons-metadata`?
5. **Loader repo** — Is it `CBIIT/icdc-dataloader`? Some other name? Confirm.
6. **Jenkins pipeline organization** — Does ICDC have a two-tier split (lower tiers for Dev + QA, upper tiers for Stage + Prod) like CTDC? Or a different organization?
7. **Model version file path** — Where in `icdc-model-tool` is the live model version recorded? CTDC uses `model-desc/ctdc_model_file.yaml` on the `prod` branch.
8. **DMN integration** — When a load introduces new node types or properties as part of a coordinated model update, what's the DMN verification step? (The DMN renders the model live in ICDC, so this may be automatic — confirm.)
9. **Study identifier pattern** — Confirm "COTC021 v2" or similar is the standard ICDC study identifier shape.
10. **Parent submission user story pattern** — Does ICDC maintain program-level submission user stories?
11. **Jira custom field for Parent Epic** — Same `customfield_12350` as CTDC?
12. **TPM ownership pattern** — Is the TPM the initial assignee for ICDC Data Loading Tasks?
13. **QA tester convention** — Is Valentina Epishina the QA tester for both ICDC and CTDC, or does ICDC have a different QA assignment pattern?
14. **Production verification URL** — Is `caninecommons.cancer.gov` the correct production URL for Prod-environment verification? (Confirmed in the memory note but worth double-checking against current deployment.)
