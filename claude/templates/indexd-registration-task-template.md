### 🔖 IndexD Registration Task Template (v3, mirrors CTDC v7, filled with ICDC info)

> **Use this template for every ICDC data management task that registers a study's files in CRDC IndexD: minting GUIDs that the paired Data Loading Task will reference.** This ICDC template mirrors CTDC's IndexD Registration Task template (v7) exactly, filled with ICDC-specific values, because the IndexD registration task is identical across commons: it uses the shared CRDC / DCF IndexD service that serves the whole CRDC platform. The canonical example is **ICDC-4193** (Data Indexing: COTC021 v.3), the first real multi-submission IndexD registration drafted under the current template. This template covers the **upstream artifact creation** work pattern within the loading-data sub-function; it is the **parallel partner** of a Data Loading Task, not a substitute for one, and not a blocker of one. See "When NOT to use this template" at the end.

> **Changelog — 2026-07-30:** Folded in four IndexD-ticket refinements approved on the live tickets — (A) Submission & Artifacts kept to the CTDC v7 five-row shape (no Object Files Location / indexd.tsv manifest rows); (B) the pre-registration manifest `url` check softened to a format-only check; (C) completion tracked by monitoring the CRINTAKE intake ticket; (D) verification simplified to a single-GUID resolution pasted into a ticket comment — plus the rename of the UChicago indexing team to DCF. ICDC-4193 / ICDC-4194 (COTC021 / COTC022 multi-submission indexing) are the first real tickets drafted under this revision. Canonical example is now ICDC-4193 (COTC021 v.3).

> **Changelog, 2026-07-30 (revision 2):** Second same-day revision, folding in refinements applied live to ICDC-4193 and ICDC-4194 (COTC021 and COTC022 v.3). (E) The Registration Summary now carries a bold new-vs-existing study marker as its second sentence. (F) Submission & Artifacts field labels are pluralized to "CRDC Submission ID(s)" and "Release Package(s)", and the constant-bucket row is labeled "Release Package bucket". (G) Release Package directory names render as clickable S3-console links, listed in the same order as the submission IDs. (H) Non-vital scope detail (file counts, file-type breakdown, publication and study-content context) moves to a plain-text ticket comment rather than the description body. (I) No em dashes in ticket bodies or comments. (J) Expanded rendering-safe guidance for comments, in-cell line breaks, and blank-line spacing.

**Why this template**

The ICDC team has two primary functions (software development and data management), and data management has two sub-functions: loading data and modeling data. The Data Loading Task template covers the *promotion of a CRDC submission's contents* into ICDC's databases through Jenkins. But before that load can run, every file in the submission needs a globally unique identifier (GUID) registered in **CRDC IndexD**, and that registration is performed by an **external team, the DCF (the University of Chicago team that operates CRDC IndexD)**, not by the ICDC engineering team.

ICDC's role in IndexD registration is **coordination**, not engineering: validate the indexd.tsv manifest that ships inside the CRDC Submission Portal's Release Package, hand it off to the external DCF/DCFS team via the agreed channels, then verify the minted GUIDs resolve correctly. The registration runs **in parallel** with the paired Data Loading Task; metadata can load before GUIDs are minted, and file downloads for the study resolve once this registration's GUID spot-check passes.

**Tasks execute; user stories deliberate.** This is the core principle the template enforces. Tasks are operational work units the assignee executes; they should carry only what's needed to do the work. **Open questions, risks, and unresolved decisions belong on the parent user story**, where the team negotiates scope and tracks risk at the program level. By the time work is decomposed into Tasks, those questions should be resolved enough that the Task can be executed. If a Task accumulates open questions, that's a signal the parent user story isn't fully baked, and the questions should be raised there, not buried in a Task description where they don't influence sequencing decisions and are harder to find.

The template is **task-shaped: four sections totaling well under 700 words, with ownership, external-coordination, and deliberative content removed.** The assignee can read this template-shaped ticket and know exactly what to do without paging through narrative.

The five most common antipatterns this template prevents:

1. **Treating IndexD registration as internal pipeline work.** It is not. There is no Jenkins job, no Neo4j write, no environment promotion. IndexD is a single centralized service operated by DCF/DCFS that mints GUIDs for the entire CRDC platform. The bottleneck is an external team's queue, not our pipeline capacity.
2. **Treating the indexd.tsv as a manifest ICDC authors.** It is not. The indexd.tsv ships *inside* the validated Release Package the CRDC Submission Portal produces. ICDC's role is extraction and validation, not authoring. Earlier drafts of this pattern suggested otherwise.
3. **Duplicating Jira's native Links panel inside the description body.** A standalone "Linked Work" section in a Task description duplicates what the right-sidebar Links panel already shows: Epic Link, Relates links, Blocks links, remote links. The template omits this section entirely; set links via the Jira native mechanisms and trust the sidebar.
4. **Accumulating open questions on a Task that should be on the parent user story.** This is the v3 lesson. If the Release Package GUID isn't generated yet, if the bucket policy hasn't been refreshed, if model version backward compatibility is unconfirmed, those are *program-level* risks that the parent Data Submission user story (owned by Philip Musk, ICDC Data Concierge) carries on behalf of every Task it spawns. Restating them on each child Task creates noise and dilutes the user story's role as the deliberative anchor.
5. **No verification step recorded on the ticket.** When DCF/DCFS reports "registration complete," ICDC needs to verify by resolving a sample of GUIDs against the IndexD resolution endpoint. The Verification section codifies the spot-check method and acceptance criteria so the close trigger is reproducible.

**Service & handoff anatomy (read once before drafting)**

- **CRDC IndexD**: The actual service. Open source, maintained by the DCF, the University of Chicago team that operates CRDC IndexD (`github.com/uc-cdis/indexd`). Mints 128-bit GUIDs (`dg.4DFC/00006197-6407-5014-8175-c82efdf6cf0f`) that resolve to physical S3 locations and carry access-control metadata (`acl` / `authz` fields). One centralized instance serves the entire CRDC platform; there is no Dev/QA/Stage/Prod separation for registration the way there is for the ICDC application.
- **Source artifacts**: Release Package + Object Files live in CRDC-owned AWS S3 buckets. The Release Package (metadata) bucket for ICDC is `nci-cbiit-caninedatacommons-dev`. The Object Files bucket is `nci-crdc-data-bucket-prod`. The **indexd.tsv manifest is part of the Release Package**: do not regenerate it.
- **DCF Google Drive**: The drop-off point for the indexd.tsv copy extracted from the Release Package. DCF/DCFS monitors this folder for new manifests. Folder: `https://drive.google.com/drive/folders/1eYXAEOFab-lbLdpNT0sLhXsqfVehcTqW`.
- **CRINTAKE Jira board**: `tracker.nci.nih.gov/projects/CRINTAKE/`. The external team's intake queue. Filing a ticket here tells the DCF the manifest is ready and gives them a place to coordinate the work and report completion.
- **Resolution endpoint**: `https://nci-crdc.datacommons.io/index/<guid>`. Public endpoint for resolving a GUID to its IndexD record. Used for verification spot-checks.
- **Paired Data Loading Task**: The ICDC ticket that loads this study, linked via `Relates` and run **in parallel** with this registration. The two are not sequential: metadata can load before GUIDs are minted. File downloads for the loaded study resolve once this registration's GUID spot-check passes; the load ticket references the GUIDs in its metadata loading file's `file_uuid` column.

**Section order (4 sections, exactly this sequence)**

Each section header is an `h3` Markdown heading using the emoji + bold title format shown. If a section has no real content for a given registration, omit the header entirely rather than stub it with "None at this time." Keep the remaining sections in the order shown so a reader scanning multiple registration tickets sees the same visual flow.

1. `### 🎯 **Registration Summary**`: **Two sentences.** First, what's being indexed and the paired Data Loading Task this registration runs in parallel with. Second, a **bold new-vs-existing study marker**: state whether this is a new study's first registration or an existing study's data update, with the version. **Do not restate anything else** (dbGaP IDs, submission chronology, on-hold status): all of that lives on the parent submission user story (linked via the native Links panel) and is visible in Jira statuses. Existing-study example: *"Register the COTC021 object files in CRDC IndexD, minting the GUIDs that the paired Data Loading Task will reference. **COTC021 is an existing ICDC study; this is a data update (v.3), not a new study registration.**"* New-study example: *"Register the COTC0XX study files in CRDC IndexD, minting GUIDs for the object files that the paired Data Loading Task will reference. **COTC0XX is a new ICDC study; this is its first registration.**"*

2. `### 📦 **Submission & Artifacts**`: Required field. A five-row table holding the artifacts the external DCF team needs to do the work. Study identity (program, study name, submitter, chronology) lives on the parent submission user story linked via the native Links panel, not in this table. When a single registration spans multiple CRDC submissions, keep it to these same five rows and put the multiple values in one cell, semicolon-separated. Do not split one field's values across extra table rows and do not use in-cell line breaks; both corrupt the table on this Jira instance. The five rows:

   | Field | Value | Notes |
   |---|---|---|
   | CRDC Submission ID(s) | *(Submission Portal ID; semicolon-separate when more than one)* | Issued by the CRDC Submission Portal; one per submission. |
   | AWS Account ID | `152091478849` | Constant for ICDC, the ICDC data commons AWS account. |
   | Release Package bucket | `nci-cbiit-caninedatacommons-dev` | Constant for ICDC, the metadata bucket that holds every release package. |
   | Release Package(s) | *(directory name(s), rendered as clickable S3-console links; semicolon-separate when more than one)* | Directory names only, within the Release Package bucket above, in the same order as the Submission IDs. Each contains the indexd.tsv manifest the DCF team registers. Until the study is released from the CRDC Submission Portal the directory does not exist, so use PLACEHOLDER. |
   | Sample GUID | *(the first minted GUID, used as the spot-check anchor)* | The spot-check anchor used in the Verification section. Fill in once minted; the CRDC Submission Portal pipeline assigns the GUIDs ahead of registration. |

   **Clickable Release Package links**: once the directories exist, render each as a Markdown link whose text is the plain directory name (`<timestamp>-<submission-id>/`) and whose target is the S3 console, listed in the same order as the Submission IDs so the two rows line up positionally. URL format:

   ```
   https://us-east-1.console.aws.amazon.com/s3/buckets/nci-cbiit-caninedatacommons-dev?region=us-east-1&prefix=<URL-ENCODED-DIR>/&showversions=false
   ```

   The `prefix=` value is the same directory URL-encoded (colons as `%3A`).

   **Naming discipline**: the constant bucket address lives in its own **Release Package bucket** row, and **Release Package(s)** holds only the directory name(s) within it. (This diverges intentionally from the Data Loading Task's "AWS S3 Bucket" / "Release Package" labels, to match how ICDC-4193 / ICDC-4194 were built; revisit if the two tables should be reconciled.)

   **Rows omitted**: "GUID prefix" (always `dg.4DFC/` for CRDC, implicit; mention only if the study uses a non-standard prefix); "indexd.tsv manifest path" (it's part of the Release Package; saying so in the Release Package row's Notes is sufficient); "ICDC Data Model version" (belongs on the Data Loading Task, not the IndexD ticket; IndexD registration doesn't care about model versions). Also omitted: **"Object Files Location"** (the manifest's `url` column already points to the object files) and **"Consent group / ACL value"** (ICDC is open access, so the manifest's `acl` column carries the same uniform open-access value on every row); both are captured in the indexd.tsv manifest itself, so restating them in the table was redundant.

3. `### 🚦 **Registration Workflow**`: Numbered list grouped into two phases. Put a blank line after the section heading and after each bold phase label so the numbered lists render cleanly. Standard ICDC sequence:

   **Pre-registration**
   1. Extract the indexd.tsv manifest from the Release Package in the `nci-cbiit-caninedatacommons-dev` bucket. Validate that every row carries the uniform ICDC open-access `acl` value across all rows (ICDC files are open access; there are no controlled-access consent codes), the row count matches the file count for this study, every row's `url` is well-formed (a format check is sufficient, no need to confirm each one resolves), and the GUID placeholder format is consistent with the `dg.4DFC/` prefix.

   **External handoff**
   2. Upload the extracted indexd.tsv to the [DCF Google Drive folder](https://drive.google.com/drive/folders/1eYXAEOFab-lbLdpNT0sLhXsqfVehcTqW) for indexing. Filename convention is preserved from the Release Package; do not rename.
   3. File a CRINTAKE intake ticket on the [CRDC CRs_INTAKE Jira board](https://tracker.nci.nih.gov/projects/CRINTAKE/) describing the study, the name of the indexd.tsv uploaded to DCF Google Drive in step 2, and any requested due date if the registration is time-bound for a planned Data Loading Task.
   4. Link the CRINTAKE ticket back to this ICDC ticket as a Jira-to-Jira remote link.
   5. If a due date is communicated, notify both the NCI CRDC (Leidos) PM and the NCI DCFS PM as early as possible.

   **Step count: 5 (1 pre-registration, 4 external handoff).**

4. `### 🧪 **Verification**`: How ICDC confirms the registration worked, and the close trigger. Completion is tracked by **monitoring the CRINTAKE intake ticket**: its status is how ICDC knows when the DCF has finished indexing. Once the CRINTAKE ticket shows indexing is complete, spot-check a minted GUID; a successful spot-check is the trigger to close the ticket. Bullet list (italic-labelled, colon separators, the rendering-safe pattern):

   - *Timing*: the GUID spot-check resolves only after the submission is marked Complete in the CRDC Submission Portal, which is when the object files move to the production bucket. Registration can be handed off as soon as the Release Package exists, but the GUIDs will not resolve until the study is Complete, so run the spot-check after Complete.
   - *How to spot-check*: Resolve a single GUID (the Sample GUID from the Submission & Artifacts table) by hitting the IndexD resolution endpoint at `nci-crdc.datacommons.io/index/` with the GUID appended, and paste the returned IndexD record into a comment on this ticket. A pass returns a non-error response with the full IndexD record (`did`, `urls`, `hashes`, `size`, `acl`, `authz`, `rev`, `baseid`): `urls` points to the expected S3 object-file location, `acl` carries the uniform ICDC open-access value (non-empty; ICDC files are open access), and `size`/`hashes` are non-empty.
   - *If the check fails*: Do not close this ticket. Reopen the CRINTAKE ticket with the GUID and its resolution-endpoint response, coordinate the fix with the DCF, and surface the issue on the parent submission user story so it's tracked at the program level.

**Sections omitted compared to v1**

- ❌ **🔗 Linked Work**: Removed in v2. Jira's native Links panel (right sidebar) already shows Epic Link, Relates links, Blocks links, and remote links. Duplicating this content in the description body is noise.
- ❌ **🌐 External Handoff Coordination**: Removed in v2. The DCF, DCFS, DCF Google Drive folder, CRINTAKE board, and PM contacts are folded into the workflow steps where they're used. A standalone directory section was duplicative.
- ❌ **🤝 Collaboration & Handoffs**: Removed in v2. Ownership stays implicit via the Jira assignee field + comment audit trail. Standalone ownership directory was epic-shaped.
- ❌ **🔍 Open Questions / Risks**: Removed in v3. The principle is *tasks execute, user stories deliberate*. Program-level open questions and risks belong on the parent Data Submission user story (owned by Philip Musk, ICDC Data Concierge). The user story is where the team negotiates scope and tracks risk; Tasks should carry only what's needed to do the work. If a Task accumulates open questions, that's a signal the parent user story isn't fully baked.

**Standing emoji set (4 entries)**

| Section | Emoji |
|---|---|
| Registration Summary | 🎯 *(shared with Data Loading Task)* |
| Submission & Artifacts | 📦 *(shared with Data Loading Task)* |
| Registration Workflow | 🚦 *(shared with Data Loading Task)* |
| Verification | 🧪 *(shared with Data Loading Task; scoped to GUID resolution spot-check)* |

**Required content rules**

- **Scope is IndexD registration only.** Minting GUIDs for files via the external DCF/DCFS handoff. **Data loading** uses the Data Loading Task template. **Schema or model changes** use the Data Modeling for Study Submission template or the Data Model Update Task template. See "When NOT to use this template" below.
- **No em dashes anywhere in the ticket body or comments.** Use commas, colons, semicolons, or parentheses instead. This is a standing ICDC-team preference; the CTDC source template uses em dashes, so strip them when mirroring.
- **Registration Summary carries the new-vs-existing study marker.** Second sentence, bold, stating new study (first registration) versus existing study (data update, with version). See Section 1.
- **Non-vital scope detail goes in a ticket comment, not the description.** File counts, file-type breakdowns, publication counts, and other study-content context are useful background but are not indexing steps; post them as a plain-text comment on the registration ticket and keep the description limited to the four sections. Program-level open questions and risks still belong on the parent user story, not in the comment.
- **No Acceptance Criteria section.** IndexD registration is operational SOP work; the completion bar is the GUID spot-check passing (Section 4). AC belongs on user stories, not on Tasks.
- **No Open Questions / Risks section.** Open questions and risks live on the parent Data Submission user story (owned by Philip Musk, ICDC Data Concierge), not on this Task. If a question or risk surfaces during the registration work, raise it as a bullet under the parent user story's Open Questions / Risks section so it's tracked at the program level. The Task description carries only what the assignee needs to execute.
- **One Task per registration handoff**: one CRINTAKE intake ticket, one IndexD registration ticket on the ICDC side. If a single Data Loading Task depends on two separate registrations (e.g., one for the Release Package, one for the Object Files), file two registration tickets and have the load ticket linked from both via `Relates`.
- **Issue type is Task** on this tracker, matching the convention used on ICDC-4193. Do not use Story or Subtask.
- **Title convention:** `Data Indexing: <Study Name vN>` — reuse the exact `<Study Name vN>` token from the parent Data Submission user story title verbatim. The board title reads "Data Indexing"; the underlying activity is IndexD registration, called out in the task body.
- **Parent Epic field set via `customfield_12350`.** Default parent is ICDC-3342 (ICDC Data) unless a release-specific epic exists.
- **`Data-Concierge` label is mandatory on this registration (Index) task.** Indexing is performed by the Data Concierge, so the IndexD Registration task carries the `Data-Concierge` label, set at creation via the `labels` field. The paired Data Loading task carries **no** label; the load is performed by engineering.
- **Leave the ticket Unassigned at creation.** Per standing team convention, newly created tickets are left Unassigned unless an assignee is explicitly directed. Data management tasks (IndexD Registration, Data Loading) also do not require the Developer field. The Data Concierge (Philip Musk) coordinates the external CRINTAKE handoff, tracked through comments and the CRINTAKE remote link rather than the assignee field.
- **`Relates` link to the parent submission user story is mandatory.** Set via `jira_create_issue_link` after ticket creation. The parent user story is the canonical record of study identity AND the home for open questions / risks. The Task description does not duplicate that content.
- **`Relates` link to the paired Data Loading Task is mandatory** when that load ticket exists. The registration and the load run **in parallel**: IndexD registration does **not** block the load (metadata can load before GUIDs are minted; file downloads resolve once this registration's GUID spot-check passes). Do **not** use a `Blocks` link between them. Pass the registration ticket as the inward issue, the load ticket as the outward issue. If the load ticket has not been filed yet at registration ticket creation time, add the `Relates` link as soon as the load ticket exists.
- **Remote link to the CRINTAKE ticket is mandatory** once workflow step 4 is complete. Use `jira_create_remote_issue_link` with the CRINTAKE ticket URL. A free-text reference to the CRINTAKE ticket key is **not** sufficient; the remote link makes the cross-project dependency visible from both sides.
- **Submission & Artifacts table is mandatory and complete at ticket creation.** All five rows present. Use PLACEHOLDER explicitly when a value is pending upstream, never silently omit a row.
- **Spot-check method and acceptance criteria explicit in the Verification section.** Naming "spot-check the GUIDs" without a method or success criteria is a gap; the spot-check is the verified close trigger and needs to be reproducible by anyone reading the ticket.
- **Comment formatting**: the `jira_add_comment` / `jira_edit_comment` path does NOT convert Markdown and does NOT interpret backslash-n newline escapes. Author comments as plain text with real line breaks; a leading "- " renders as a bullet. Avoid `**bold**`, backticks, and `{{ }}` in comments (they show up literally). Verified on ICDC-4193 / ICDC-4194.
- **Rendering-safe authoring patterns**: section headers use `### **Title**` Markdown form (round-trips cleanly to `h3.` Jira-wiki); bullet lists with italic labels use `* *Label*: content` (italic label, colon separator), NOT `- **Label:** content` (bold-and-colon, which the converter collapses to broken `**...:*` mismatched-asterisk damage); tables use Jira-wiki `||header||` syntax, NOT GitHub-flavored Markdown `|h|h|`. Put a blank line after every heading, between a bold sub-label and its numbered list, and between sections, so numbered lists render cleanly (jammed single-line-break spacing throws the list numbering off). Never use an in-cell line break (the Jira double-backslash) or split one field's values across extra table rows: both corrupt the table (dropped rows, broken link pipes) on this instance; keep multiple values in one cell, semicolon-separated. Verified on ICDC-4193 and ICDC-4194.
- **All four sections are required.** There are no optional sections; every registration ticket carries Registration Summary, Submission & Artifacts, Registration Workflow, and Verification, in that order.

**Writing-and-publishing workflow**

1. Confirm the upstream artifacts exist before drafting the registration ticket. If the Release Package isn't generated yet in `nci-cbiit-caninedatacommons-dev`, or the Object Files aren't in `nci-crdc-data-bucket-prod`, the registration ticket is premature; those upstream items should land first. **Surface any open questions on the parent submission user story, not on the Task.**
2. Confirm this work is IndexD registration, not data loading or modeling. If the work is promoting an existing-and-registered submission through Jenkins, use the Data Loading Task template. If the schema is changing, use a modeling template (the Data Model Update Task template or the Data Modeling for Study Submission template).
3. **Identify the parent Data Submission user story.** Every ICDC data submission has a parent Data Submission user story (owned by Philip Musk, ICDC Data Concierge). It goes on the ticket via a `Relates` link after creation.
4. Confirm the paired Data Loading Task exists (or will exist). The two tickets are paired by design and run **in parallel**; a registration without a paired load is unusual and should be questioned.
5. Create the IndexD registration task via `jira_create_issue` with `issue_type = "Task"`, a short placeholder description, the parent epic linked via `customfield_12350` in `additional_fields` (default: ICDC-3342), and the `Data-Concierge` label via the `labels` field. **Leave the ticket Unassigned** per standing convention; the Data Concierge (Philip Musk) still coordinates the external CRINTAKE handoff, but that coordination is tracked through comments and the CRINTAKE remote link, not the assignee field.
6. Push the full description in a second call via `jira_update_issue` with the full Markdown body. Same two-step pattern as the Data Loading Task and Features templates.
7. Add a `Relates` link from the registration ticket to the parent Data Submission user story using `jira_create_issue_link`. Order: registration ticket as inward issue.
8. Add a `Relates` link from the registration ticket to the paired Data Loading Task using `jira_create_issue_link` (registration as inward issue, load as outward issue). Do **not** use `Blocks`; the two run in parallel.
9. Post the data-update context comment (file counts, file-type breakdown, publication and study-content context) as plain text via `jira_add_comment`, then verify the rendered description with a UI screenshot.
10. As the workflow progresses, add the CRINTAKE remote link via `jira_create_remote_issue_link` once step 3 of the workflow is complete.
11. After GUID spot-check passes (Verification section), transition the ticket to Closed with resolution `Fixed`. **GUID spot-check success is the close trigger.**

**When to expand vs trim**

- **Standard single-study registration** → use the template as written; expect 4 sections present.
- **Multi-submission registration** (one study, multiple submissions / manifest files) → keep the five-row Submission & Artifacts shape and semicolon-separate the Submission IDs and Release Package links within their single cells, in matching order; expand workflow step 2 to enumerate each manifest by filename. Keep one ticket; the CRINTAKE intake is one unit of work. ICDC-4193 / ICDC-4194 (three submissions each) are the reference.
- **Re-registration after a file correction** → use the template as written; explain the reason for re-registration in a Jira comment and reference IndexD's `baseid` / `rev` versioning model.

**When NOT to use this template**

The ICDC team has two primary functions: software development and data management. Data management has two sub-functions: loading data and modeling data. Within loading data, there are two work patterns: *promoting a CRDC submission's contents into ICDC's databases* (the Data Loading Task template) and *creating upstream artifacts that the load consumes* (this template). This template covers the IndexD registration work pattern only.

**Data loading**: does NOT use this template. Use the **Data Loading Task** template instead. That sibling template covers the actual end-to-end promotion of metadata through Dev → QA → Stage → Prod after IndexD has minted the GUIDs.

**Data modeling**: does NOT use this template. Use the **Data Modeling for Study Submission** template for study-driven model additions, or the **Data Model Update Task** template for infrastructure-level model changes.

**Other upstream artifact creation work**: standalone upstream artifact-creation work has no dedicated ICDC template yet. File it as a standalone Task under ICDC-3342 (ICDC Data) and link it from the Data Loading Task via native Jira links. If a recurring pattern emerges, draft a template using the closest sibling.

**CRDC platform changes**: Fence, IndexD, Submission Portal upgrades owned by CRDC platform teams. Out of ICDC scope entirely; ICDC files dependency tickets if affected, but does not own the work.

**Canonical examples**

**ICDC-4193** (*Data Indexing: COTC021 v.3*) and **ICDC-4194** (*Data Indexing: COTC022 v.3*) are the canonical examples: the first real multi-submission IndexD registrations drafted under this revision, for studies COTC021 (study record ICDC-3206) and COTC022 (study record ICDC-1993). They replaced the earlier placeholder canonical **ICDC-4175** (Index files for COTC030). The tickets carry:

- 4 sections in the standard order (Registration Summary, Submission & Artifacts, Registration Workflow, Verification), with the Registration Summary carrying the bold new-vs-existing study marker (both are existing studies receiving a v.3 data update)
- a Submission & Artifacts table spanning all **3 CRDC submissions** each, on the slim five-row shape (CRDC Submission ID(s), AWS Account ID, Release Package bucket, Release Package(s), Sample GUID), with the Release Package(s) rendered as clickable S3-console links listed in the same order as the submission IDs
- the workflow grouped Pre-registration / External handoff, using the monitor-the-CRINTAKE-ticket completion trigger and the single-GUID resolution verification
- file counts, file-type breakdown, and publication/study-content context posted as a plain-text comment rather than in the description body
- a `Relates` link to the parent Data Submission user story (owned by Philip Musk, ICDC Data Concierge), set via the Jira native Links panel, not duplicated in the description; each paired Data Loading Task and CRINTAKE intake ticket is linked once it exists
- Parent Epic ICDC-3342 (ICDC Data) set via `customfield_12350`
- the `Data-Concierge` label (indexing is Data Concierge work; the paired Data Loading Task carries no label)
- Open questions and risks for the broader submission live on the parent Data Submission user story's Open Questions / Risks section, not on these tickets
