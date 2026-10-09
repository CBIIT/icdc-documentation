### 🔖 IndexD Registration Task Template (v5, aligned with CTDC v8, filled with ICDC info)

> **Use this template for every ICDC data management task that registers a study's files in CRDC IndexD: minting GUIDs that the paired Data Loading Task will reference.** This ICDC template was derived from CTDC's IndexD Registration Task template (v7), filled with ICDC-specific values, because the IndexD registration task is identical across commons: it uses the shared CRDC / DCF IndexD service that serves the whole CRDC platform. As of v4 the Submission & Artifacts table and authoring format diverge from CTDC v7 (see the 2026-10-08 changelog). The canonical examples are **ICDC-4193** (Data Indexing: COTC021 v.3) and **ICDC-4194** (Data Indexing: COTC022 v.3). This template covers the **upstream artifact creation** work pattern within the loading-data sub-function; it is the **parallel partner** of a Data Loading Task, not a substitute for one, and not a blocker of one. See "When NOT to use this template" at the end.

> **Changelog, 2026-07-30:** Folded in four IndexD-ticket refinements approved on the live tickets: (A) Submission & Artifacts kept to the CTDC v7 five-row shape (no Object Files Location / indexd.tsv manifest rows); (B) the pre-registration manifest `url` check softened to a format-only check; (C) completion tracked by monitoring the CRINTAKE intake ticket; (D) verification simplified to a single-GUID resolution pasted into a ticket comment; plus the rename of the UChicago indexing team to DCF. ICDC-4193 / ICDC-4194 (COTC021 / COTC022 multi-submission indexing) are the first real tickets drafted under this revision.

> **Changelog, 2026-07-30 (revision 2):** Second same-day revision, folding in refinements applied live to ICDC-4193 and ICDC-4194 (COTC021 and COTC022 v.3). (E) The Registration Summary now carries a bold new-vs-existing study marker as its second sentence. (F) Submission & Artifacts field labels are pluralized to "CRDC Submission ID(s)" and "Release Package(s)", and the constant-bucket row is labeled "Release Package bucket". (G) Release Package directory names render as clickable S3-console links, listed in the same order as the submission IDs. (H) Non-vital scope detail (file counts, file-type breakdown, publication and study-content context) moves to a plain-text ticket comment rather than the description body. (I) No em dashes in ticket bodies or comments. (J) Expanded rendering-safe guidance for comments, in-cell line breaks, and blank-line spacing.

> **Changelog, 2026-10-09 (v5):** Aligned with CTDC IndexD v8, which adopted this template's one-row-per-submission table the same day. Dropped the 📝 Notes terminology section (5 → 4 sections, matching CTDC): the terms are defined in the Service & handoff anatomy below, and the assignee does not need a glossary on the ticket. Section headers take a bold title (`h3. 🎯 *Registration Summary*`) and labeled lines use `* *Label*: content`, the shared convention in both projects.

> **Changelog, 2026-10-08 (v4):** Restructured after ICDC-4193 outgrew the five-row field/value table (a fourth submission, Deep WGS, arrived after the first intake ticket and could not be represented cleanly; positional matching across semicolon-separated cells drifted). Applied live to ICDC-4193 and ICDC-4194 and slimmed by Gina. (K) Submission & Artifacts is now **one row per submission** with columns Submission, CRDC Submission ID, Release Package, Index?, Sample GUID, Intake batch; replaces the semicolon-in-one-cell pattern (F, G). (L) The two ICDC constants (AWS Account ID, Release Package bucket) move above the table as bare-value bullets with no explanatory text. No intro sentence above the table. (M) Metadata-only submissions get a row marked Index = No. (N) One CRINTAKE intake ticket per handoff batch, not per registration ticket; a late-arriving submission goes on a new intake ticket and a new batch number. (O) Verification is one spot-check per indexed submission, since each submission has its own manifest; the close trigger lives in workflow step 7, not repeated in Verification. (P) Descriptions are authored directly in **Jira wiki markup**: the update path stores Markdown literally on this instance (confirmed on ICDC-4193). (Q) Workflow adds a Confirmation & verification phase; CRINTAKE tickets are linked with a native Jira issue link. (R) A Notes section with the standard terminology line is carried as the fifth section.

**Why this template**

The ICDC team has two primary functions (software development and data management), and data management has two sub-functions: loading data and modeling data. The Data Loading Task template covers the *promotion of a CRDC submission's contents* into ICDC's databases through Jenkins. But before that load can run, every file in the submission needs a globally unique identifier (GUID) registered in **CRDC IndexD**, and that registration is performed by an **external team, the DCF (the University of Chicago team that operates CRDC IndexD)**, not by the ICDC engineering team.

ICDC's role in IndexD registration is **coordination**, not engineering: validate the indexd.tsv manifest that ships inside the CRDC Submission Portal's Release Package, hand it off to the external DCF/DCFS team via the agreed channels, then verify the minted GUIDs resolve correctly. The registration runs **in parallel** with the paired Data Loading Task; metadata can load before GUIDs are minted, and file downloads for the study resolve once this registration's GUID spot-checks pass.

**Tasks execute; user stories deliberate.** This is the core principle the template enforces. Tasks are operational work units the assignee executes; they should carry only what's needed to do the work. **Open questions, risks, and unresolved decisions belong on the parent user story**, where the team negotiates scope and tracks risk at the program level. By the time work is decomposed into Tasks, those questions should be resolved enough that the Task can be executed. If a Task accumulates open questions, that's a signal the parent user story isn't fully baked, and the questions should be raised there, not buried in a Task description where they don't influence sequencing decisions and are harder to find.

The template is **task-shaped: four short sections totaling well under 700 words, with ownership, external-coordination, and deliberative content removed.** The assignee can read this template-shaped ticket and know exactly what to do without paging through narrative.

The five most common antipatterns this template prevents:

1. **Treating IndexD registration as internal pipeline work.** It is not. There is no Jenkins job, no Neo4j write, no environment promotion. IndexD is a single centralized service operated by DCF/DCFS that mints GUIDs for the entire CRDC platform. The bottleneck is an external team's queue, not our pipeline capacity.
2. **Treating the indexd.tsv as a manifest ICDC authors.** It is not. The indexd.tsv ships *inside* the validated Release Package the CRDC Submission Portal produces. ICDC's role is extraction and validation, not authoring. Earlier drafts of this pattern suggested otherwise.
3. **Duplicating Jira's native Links panel inside the description body.** A standalone "Linked Work" section in a Task description duplicates what the right-sidebar Links panel already shows: Epic Link, Relates links, Blocks links, remote links. The template omits this section entirely, and the body never names other ticket keys (study record, CRINTAKE, paired load); set links via the Jira native mechanisms and trust the sidebar.
4. **Accumulating open questions on a Task that should be on the parent user story.** This is the v3 lesson. If the Release Package GUID isn't generated yet, if the bucket policy hasn't been refreshed, if model version backward compatibility is unconfirmed, those are *program-level* risks that the parent Data Submission user story (owned by Philip Musk, ICDC Data Concierge) carries on behalf of every Task it spawns. Restating them on each child Task creates noise and dilutes the user story's role as the deliberative anchor.
5. **No verification step recorded on the ticket.** When DCF/DCFS reports "registration complete," ICDC needs to verify by resolving a sample GUID per indexed submission against the IndexD resolution endpoint. The Verification section codifies the spot-check method and acceptance criteria so the close trigger is reproducible.

**Service & handoff anatomy (read once before drafting)**

- **CRDC IndexD**: The actual service. Open source, maintained by the DCF, the University of Chicago team that operates CRDC IndexD (`github.com/uc-cdis/indexd`). Mints 128-bit GUIDs (`dg.4DFC/00006197-6407-5014-8175-c82efdf6cf0f`) that resolve to physical S3 locations and carry access-control metadata (`acl` / `authz` fields). One centralized instance serves the entire CRDC platform; there is no Dev/QA/Stage/Prod separation for registration the way there is for the ICDC application.
- **Source artifacts**: Release Package + Object Files live in CRDC-owned AWS S3 buckets. The Release Package (metadata) bucket for ICDC is `nci-cbiit-caninedatacommons-dev`. The Object Files bucket is `nci-crdc-data-bucket-prod`. The **indexd.tsv manifest is part of the Release Package**: do not regenerate it. Each CRDC submission produces its own Release Package and its own manifest.
- **DCF Google Drive**: The drop-off point for the indexd.tsv copies extracted from the Release Packages. DCF/DCFS monitors this folder for new manifests. Folder: `https://drive.google.com/drive/folders/1eYXAEOFab-lbLdpNT0sLhXsqfVehcTqW`.
- **CRINTAKE Jira board**: `tracker.nci.nih.gov/projects/CRINTAKE/`. The external team's intake queue. Filing a ticket here tells the DCF the manifests are ready and gives them a place to coordinate the work and report completion.
- **Resolution endpoint**: `https://nci-crdc.datacommons.io/index/<guid>`. Public endpoint for resolving a GUID to its IndexD record. Used for verification spot-checks.
- **Paired Data Loading Task**: The ICDC ticket that loads this study, linked via `Relates` and run **in parallel** with this registration. The two are not sequential: metadata can load before GUIDs are minted. File downloads for the loaded study resolve once this registration's GUID spot-checks pass; the load ticket references the GUIDs in its metadata loading file's `file_uuid` column.

**Section order (4 sections, exactly this sequence)**

Each section header is a Jira wiki `h3.` heading with the emoji and a bold title, for example `h3. 🎯 *Registration Summary*`. Keep the sections in the order shown so a reader scanning multiple registration tickets sees the same visual flow. All examples below are shown in Jira wiki markup, which is what gets pushed.

1. `h3. 🎯 *Registration Summary*`: **Two sentences.** First, what's being indexed and the paired Data Loading Task this registration runs in parallel with. Second, a **bold new-vs-existing study marker**: state whether this is a new study's first registration or an existing study's data update, with the version. **Do not restate anything else** (dbGaP IDs, submission chronology, submission count, on-hold status): all of that lives on the parent submission user story (linked via the native Links panel) and is visible in Jira statuses. Existing-study example: *"Register the COTC021 v.3 object files in CRDC IndexD, minting the GUIDs that the paired Data Loading Task will reference. **COTC021 is an existing ICDC study; this is a data update (v.3), not a new study registration.**"* New-study example: *"Register the COTC0XX study files in CRDC IndexD, minting GUIDs for the object files that the paired Data Loading Task will reference. **COTC0XX is a new ICDC study; this is its first registration.**"*

2. `h3. 📦 *Submission & Artifacts*`: Required. Two bare-value constant bullets, then a table with **one row per CRDC submission** in the data update. No intro sentence, no explanatory text on the constants. Study identity (program, study name, submitter, chronology) lives on the parent submission user story linked via the native Links panel, not here.

   ```
   * *AWS Account ID*: {{152091478849}}
   * *Release Package bucket*: {{nci-cbiit-caninedatacommons-dev}}

   ||Submission||CRDC Submission ID||Release Package||Index?||Sample GUID||Intake batch||
   |COTC021 Methylation|<submission-id>|[<timestamp>-<submission-id>/|<S3 console URL>]|Yes|dg.4DFC/<guid>|Batch 1|
   |COTC021 Deep WGS|<submission-id>|[<timestamp>-<submission-id>/|<S3 console URL>]|Yes|dg.4DFC/<guid>|Batch 2|
   |Publication corrections|<submission-id>|[<timestamp>-<submission-id>/|<S3 console URL>]|No, no indexing required|N/A|N/A|
   ```

   **Columns:**
   - *Submission*: the submission's name in the CRDC Submission Portal (for example "COTC021 Methylation"). This is the human handle everyone uses; it is the first column on purpose. If the Portal name is unknown, use a descriptive label and confirm it with the Data Concierge.
   - *CRDC Submission ID*: issued by the CRDC Submission Portal. Plain text, no `{{ }}`.
   - *Release Package*: the directory name within the Release Package bucket, rendered as a clickable S3-console link (see below). The directory contains that submission's indexd.tsv manifest. Until the study is released from the CRDC Submission Portal the directory does not exist, so use PLACEHOLDER.
   - *Index?*: `Yes` when the submission carries object files to register; `No, no indexing required` for metadata-only submissions (publication corrections, study-detail refreshes). Metadata-only submissions still get a row so the table accounts for every submission in the update; the paired Data Loading Task still loads them.
   - *Sample GUID*: the spot-check anchor for that submission's manifest, used in Verification. Fill in once minted (the CRDC Submission Portal pipeline assigns GUIDs ahead of registration); PLACEHOLDER until then; `N/A` for Index = No.
   - *Intake batch*: which CRINTAKE handoff covered this submission (`Batch 1`, `Batch 2`, ...). Use batch numbers, not CRINTAKE keys; the CRINTAKE tickets are carried by the native Links panel. `N/A` for Index = No.

   **Clickable Release Package links**: once the directories exist, render each as a Jira wiki link `[<timestamp>-<submission-id>/|<url>]`. A wiki link inside a table cell renders correctly on this instance. URL format:

   ```
   https://us-east-1.console.aws.amazon.com/s3/buckets/nci-cbiit-caninedatacommons-dev?region=us-east-1&prefix=<URL-ENCODED-DIR>/&showversions=false
   ```

   The `prefix=` value is the same directory URL-encoded (colons as `%3A`).

   **Why one row per submission** (the v4 change): the v3 five-row field/value table put every submission's values in one cell, semicolon-separated, and relied on matching positions across rows ("the second ID goes with the second link"). On ICDC-4193 that broke: a late-arriving submission was added as narrative instead of into the lists, hardcoded counts ("3 submissions") went stale in three places, and metadata-only submissions had nowhere to live. A row per submission makes each submission self-contained and makes a late arrival a single new row.

   **Not in the table**: "GUID prefix" (always `dg.4DFC/` for CRDC, implicit; mention only if the study uses a non-standard prefix); "indexd.tsv manifest path" (it's part of the Release Package); "ICDC Data Model version" (belongs on the Data Loading Task; IndexD registration doesn't care about model versions); "Object Files Location" (the manifest's `url` column already points to the object files); "Consent group / ACL value" (ICDC is open access, so the manifest's `acl` column carries the same uniform open-access value on every row).

3. `h3. 🚦 *Registration Workflow*`: Numbered `#` list grouped into three phases, each introduced by a bold label (`*Pre-registration*`). Put a blank line after the section heading and after each bold phase label so the numbered lists render cleanly. Never hardcode a submission or manifest count; refer to "each submission marked Index = Yes" so the table stays the single source of truth. Standard ICDC sequence:

   **Pre-registration**
   1. For each submission marked Index = Yes, extract the indexd.tsv manifest from its Release Package in `nci-cbiit-caninedatacommons-dev`. Validate that every row carries the uniform ICDC open-access `acl` value (ICDC files are open access; there are no controlled-access consent codes), the row count matches the file count, every row's `url` is well-formed (a format check is sufficient, no need to confirm each one resolves), and the GUID placeholder format uses the `dg.4DFC/` prefix.

   **External handoff**
   2. Upload each manifest to the DCF Google Drive folder for indexing; preserve the Release Package filenames, do not rename.
   3. File a CRINTAKE intake ticket on the CRDC CRs_INTAKE board describing the data release, naming every manifest in the batch, and any requested due date. A submission that arrives after an intake ticket is filed goes on a new intake ticket; record the batch in the Intake batch column.
   4. Link each CRINTAKE ticket back to this ticket as a Jira link.
   5. If a due date is communicated, notify both the NCI CRDC (Leidos) PM and the NCI DCFS PM as early as possible.

   **Confirmation & verification**
   6. Monitor each CRINTAKE intake ticket to track progress; its status is how we know when the DCF has completed indexing that batch.
   7. Once every batch is complete, run the GUID spot-checks (see Verification). Passing spot-checks are the trigger to close this ticket and clear the paired Data Loading Task.

   **Step count: 7 (1 pre-registration, 4 external handoff, 2 confirmation & verification).** This is the only place the close trigger is stated.

4. `h3. 🧪 *Verification*`: How ICDC confirms the registration worked. Bullet list of labeled lines (`* *Label*: content`):

   - *Spot-check method*: for every row marked Index = Yes, resolve its Sample GUID at `https://nci-crdc.datacommons.io/index/<guid>` and paste the returned IndexD record into a comment on this ticket, labeled with the submission name. A pass returns the record with `urls` pointing to the expected object-files location and non-empty `size` and `hashes`.
   - *Why one per submission*: each submission has its own manifest, so a pass on one manifest says nothing about the others.
   - *If a check fails*: do not close. Reopen the relevant CRINTAKE ticket with the GUID and the resolution-endpoint response and coordinate the fix with the DCF.

   **Timing note (for the assignee, not the ticket body):** a GUID spot-check resolves only after the submission is marked Complete in the CRDC Submission Portal, which is when the object files move to the production bucket. Registration can be handed off as soon as the Release Package exists, but run the spot-checks after Complete.

**Sections omitted compared to v1**

- ❌ **🔗 Linked Work**: Removed in v2. Jira's native Links panel (right sidebar) already shows Epic Link, Relates links, Blocks links, and remote links. Duplicating this content in the description body is noise.
- ❌ **🌐 External Handoff Coordination**: Removed in v2. The DCF, DCFS, DCF Google Drive folder, CRINTAKE board, and PM contacts are folded into the workflow steps where they're used. A standalone directory section was duplicative.
- ❌ **🤝 Collaboration & Handoffs**: Removed in v2. Ownership stays implicit via the Jira assignee field + comment audit trail. Standalone ownership directory was epic-shaped.
- ❌ **🔍 Open Questions / Risks**: Removed in v3. The principle is *tasks execute, user stories deliberate*. Program-level open questions and risks belong on the parent Data Submission user story (owned by Philip Musk, ICDC Data Concierge).

**Standing emoji set (4 entries)**

| Section | Emoji |
|---|---|
| Registration Summary | 🎯 *(shared with Data Loading Task)* |
| Submission & Artifacts | 📦 *(shared with Data Loading Task)* |
| Registration Workflow | 🚦 *(shared with Data Loading Task)* |
| Verification | 🧪 *(shared with Data Loading Task; scoped to GUID resolution spot-checks)* |

**Required content rules**

- **Scope is IndexD registration only.** Minting GUIDs for files via the external DCF/DCFS handoff. **Data loading** uses the Data Loading Task template. **Schema or model changes** use the Data Modeling for Study Submission template or the Data Model Update Task template. See "When NOT to use this template" below.
- **No em dashes anywhere in the ticket body or comments.** Use commas, colons, semicolons, or parentheses instead. This is a standing ICDC-team preference; the CTDC source template uses em dashes, so strip them when mirroring.
- **No other ticket keys in the body.** Study record, CRINTAKE intake tickets, paired load, and parent user story are all carried by the native Links panel. If a reference only exists as text in the body today, add it as a native link instead.
- **Registration Summary carries the new-vs-existing study marker.** Second sentence, bold, stating new study (first registration) versus existing study (data update, with version). See Section 1.
- **Non-vital scope detail goes in a ticket comment, not the description.** File counts, file-type breakdowns, publication counts, and other study-content context are useful background but are not indexing steps; post them as a plain-text comment on the registration ticket. If a submission is added later, update that comment's counts too.
- **No Acceptance Criteria section.** IndexD registration is operational SOP work; the completion bar is the GUID spot-checks passing. AC belongs on user stories, not on Tasks.
- **No Open Questions / Risks section.** Open questions and risks live on the parent Data Submission user story (owned by Philip Musk, ICDC Data Concierge), not on this Task.
- **One Task per study data update.** All submissions for one study version go on one registration ticket, one table row each. CRINTAKE intake tickets are one per handoff batch; a single registration ticket can carry several (ICDC-4193 has two). If a single Data Loading Task depends on registrations for two different studies, file two registration tickets and link the load ticket from both via `Relates`.
- **Issue type is Task** on this tracker. Do not use Story or Subtask.
- **Title convention:** `Data Indexing: <Study Name vN>`. Reuse the exact `<Study Name vN>` token from the parent Data Submission user story title verbatim. The board title reads "Data Indexing"; the underlying activity is IndexD registration, called out in the task body.
- **Parent Epic field set via `customfield_12350`.** Default parent is ICDC-3342 (ICDC Data) unless a release-specific epic exists.
- **`Data-Concierge` label is mandatory on this registration (Index) task.** Indexing is performed by the Data Concierge, so the IndexD Registration task carries the `Data-Concierge` label, set at creation via the `labels` field. The paired Data Loading task carries **no** label; the load is performed by engineering.
- **Leave the ticket Unassigned at creation.** Per standing team convention, newly created tickets are left Unassigned unless an assignee is explicitly directed. Data management tasks (IndexD Registration, Data Loading) also do not require the Developer field.
- **`Relates` link to the parent submission user story is mandatory.** Set via `jira_create_issue_link` after ticket creation.
- **`Relates` link to the study record is mandatory** (for example ICDC-3206 for COTC021, ICDC-1993 for COTC022), since the body no longer names it.
- **`Relates` link to the paired Data Loading Task is mandatory** when that load ticket exists. The registration and the load run **in parallel**: IndexD registration does **not** block the load. Do **not** use a `Blocks` link between them. Pass the registration ticket as the inward issue, the load ticket as the outward issue.
- **Native Jira link to each CRINTAKE ticket is mandatory** once workflow step 4 is complete. CRINTAKE is on the same Jira instance, so use `jira_create_issue_link` (both canonical tickets use the "Related To" type). A free-text reference to the CRINTAKE key is **not** sufficient.
- **Submission & Artifacts table is mandatory and complete at ticket creation.** One row per submission in the update, every column populated. Use PLACEHOLDER explicitly when a value is pending upstream, never leave a cell blank.
- **Spot-check method and acceptance criteria explicit in the Verification section.** The spot-checks are the verified close trigger and need to be reproducible by anyone reading the ticket.
- **Description format is Jira wiki markup, authored directly.** The `jira_update_issue` path on this instance stores Markdown literally (raw `###`, `**`, backticks and `[text](url)` appear on the page; confirmed on ICDC-4193, 2026-10-08). Do not rely on Markdown conversion. Patterns: headings `h3. 🎯 *Title*`; bold `*text*`; labeled lines `* *Label*: content`; inline code `{{value}}`; numbered lists `#`; bullets `*`; links `[text|url]`; tables `||header||` and `|cell|`. Put a blank line after every heading, between a bold phase label and its numbered list, and between sections. Never use an in-cell line break (the Jira double-backslash) inside a table. After pushing, read the description back and confirm it starts with `h3.`, not `###`.
- **Comment formatting**: the `jira_add_comment` / `jira_edit_comment` path does NOT convert Markdown and does NOT interpret backslash-n newline escapes. Author comments as plain text with real line breaks; a leading "- " renders as a bullet. Avoid `**bold**`, backticks, and `{{ }}` in comments (they show up literally).
- **All four sections are required**, in order: Registration Summary, Submission & Artifacts, Registration Workflow, Verification.

**Writing-and-publishing workflow**

1. Confirm the upstream artifacts exist before drafting the registration ticket. If the Release Packages aren't generated yet in `nci-cbiit-caninedatacommons-dev`, or the Object Files aren't in `nci-crdc-data-bucket-prod`, the registration ticket is premature. **Surface any open questions on the parent submission user story, not on the Task.**
2. Confirm this work is IndexD registration, not data loading or modeling.
3. **Identify the parent Data Submission user story** (owned by Philip Musk, ICDC Data Concierge) and the study record.
4. Confirm the paired Data Loading Task exists (or will exist). The two tickets are paired by design and run **in parallel**.
5. Create the IndexD registration task via `jira_create_issue` with `issue_type = "Task"`, a short placeholder description, the parent epic linked via `customfield_12350` in `additional_fields` (default: ICDC-3342), and the `Data-Concierge` label via the `labels` field. **Leave the ticket Unassigned.**
6. Push the full description in a second call via `jira_update_issue`, authored in **Jira wiki markup**. Read the description back to confirm it was stored as wiki markup.
7. Add `Relates` links from the registration ticket to the parent Data Submission user story, the study record, and the paired Data Loading Task using `jira_create_issue_link` (registration ticket as inward issue). Do **not** use `Blocks`.
8. Post the data-update context comment (file counts, file-type breakdown, publication and study-content context) as plain text via `jira_add_comment`, then verify the rendered description with a UI screenshot.
9. As the workflow progresses, link each CRINTAKE ticket via `jira_create_issue_link` once it is filed, and add a table row (with the next batch number) for any late-arriving submission.
10. After every indexed submission's spot-check passes, transition the ticket to Closed with resolution `Fixed`.

**When to expand vs trim**

- **Standard single-submission registration** → the table has one row; everything else as written.
- **Multi-submission registration** (one study version, several submissions / manifests) → one row per submission, including metadata-only submissions marked Index = No. Keep one ticket. ICDC-4193 (four submissions, two intake batches) and ICDC-4194 (three submissions, one batch) are the reference.
- **Late-arriving submission** (after an intake ticket is filed) → add a row with the next batch number, file a new CRINTAKE ticket for it, link it, and update the context comment's counts. Do not open a second registration ticket.
- **Re-registration after a file correction** → use the template as written; explain the reason for re-registration in a Jira comment and reference IndexD's `baseid` / `rev` versioning model.

**When NOT to use this template**

The ICDC team has two primary functions: software development and data management. Data management has two sub-functions: loading data and modeling data. Within loading data, there are two work patterns: *promoting a CRDC submission's contents into ICDC's databases* (the Data Loading Task template) and *creating upstream artifacts that the load consumes* (this template). This template covers the IndexD registration work pattern only.

**Data loading**: does NOT use this template. Use the **Data Loading Task** template instead.

**Data modeling**: does NOT use this template. Use the **Data Modeling for Study Submission** template for study-driven model additions, or the **Data Model Update Task** template for infrastructure-level model changes.

**Other upstream artifact creation work**: standalone upstream artifact-creation work has no dedicated ICDC template yet. File it as a standalone Task under ICDC-3342 (ICDC Data) and link it from the Data Loading Task via native Jira links.

**CRDC platform changes**: Fence, IndexD, Submission Portal upgrades owned by CRDC platform teams. Out of ICDC scope entirely; ICDC files dependency tickets if affected, but does not own the work.

**Canonical examples**

**ICDC-4193** (*Data Indexing: COTC021 v.3*) and **ICDC-4194** (*Data Indexing: COTC022 v.3*), restructured to v4 on 2026-10-08. ICDC-4194 carries Gina's slimming edits and is the closest reference for wording. The tickets carry:

- 4 sections in the standard order (the 📝 Notes terminology line both tickets still carry was dropped in v5), authored in Jira wiki markup, with the Registration Summary carrying the bold new-vs-existing study marker (both are existing studies receiving a v.3 data update)
- two bare-value constant bullets, then a one-row-per-submission table: ICDC-4193 has four rows (Methylation, Low Pass WGS, Deep WGS in Batch 2, and a metadata-only Publication corrections row); ICDC-4194 has three (Methylation, Low Pass WGS, and a metadata-only Study metadata update row)
- the workflow grouped Pre-registration / External handoff / Confirmation & verification, with one CRINTAKE intake ticket per batch
- one spot-check comment per indexed submission, labeled with the submission name
- file counts, file-type breakdown, and publication/study-content context posted as a plain-text comment rather than in the description body
- native `Relates` links to the study record (ICDC-3206, ICDC-1993), the parent Data Submission user story, and the paired Data Loading Task; native links to each CRINTAKE ticket
- Parent Epic ICDC-3342 (ICDC Data) set via `customfield_12350`
- the `Data-Concierge` label
