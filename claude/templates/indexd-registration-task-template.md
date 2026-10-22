### 🔖 IndexD Registration Task Template (v7)

> **Use this template for every ICDC data management task that registers a study's files in CRDC IndexD, minting the GUIDs that the paired Data Loading Task will reference.** Canonical examples: **ICDC-4193** (Data Indexing: COP COTC021 v.3; three indexed submissions across two CRINTAKE handoffs) and **ICDC-4194** (Data Indexing: COP COTC022 v.3; two indexed submissions, one handoff; the wording reference). This template covers the **upstream artifact creation** work pattern within the loading-data sub-function; it is the **parallel partner** of a Data Loading Task, not a substitute for one, and not a blocker of one. Kept in lockstep with CTDC's IndexD Registration Task template (DO-INDEX v10); the differences are the platform specifics noted below. See "When NOT to use this template" at the end.

**Why this template**

The ICDC team has two primary functions (software development and data management), and data management has two sub-functions: loading data and modeling data. The Data Loading Task template covers the *promotion of a CRDC submission's contents* into ICDC's databases through the Prefect data loading pipeline. Every file in the submission also needs a globally unique identifier (GUID) registered in **CRDC IndexD**, and that registration is performed by an **external team, the DCF** (the University of Chicago team that operates CRDC IndexD), not by the ICDC engineering team.

ICDC's role in IndexD registration is **coordination**, not engineering: validate the indexd.tsv manifest that ships inside each Release Package, hand it off to the DCF through the agreed channels, then verify the minted GUIDs resolve. The registration runs **in parallel** with the paired Data Loading Task: metadata can load before GUIDs are minted, and file downloads for the study resolve once this registration's GUID spot-checks pass.

**Tasks execute; the submission epic deliberates.** A Task carries only what the assignee needs to execute the registration. Open questions, risks, and unresolved decisions belong on the Data Submission Epic (owned by Philip Musk, ICDC Data Concierge), where the team negotiates scope and tracks risk at the program level. If a Task accumulates open questions, the epic isn't fully baked; raise them there.

The five antipatterns this template prevents:

1. **Treating IndexD registration as internal pipeline work.** There is no ICDC pipeline step, no Neo4j write, no environment promotion. IndexD is one centralized service operated by the DCF that mints GUIDs for the entire CRDC; the bottleneck is an external team's queue.
2. **Treating the indexd.tsv as a manifest ICDC authors.** It ships *inside* the Release Package the CRDC Submission Portal produces. ICDC extracts and validates it; ICDC does not author or regenerate it.
3. **Duplicating Jira's native Links panel in the description.** The epic, study record, DHDM trackers, CRINTAKE tickets, and paired load are carried by native links; the body never names other ticket keys.
4. **Accumulating open questions on the Task.** Program-level questions and risks live on the Data Submission Epic, not on each child Task.
5. **No verification recorded on the ticket.** "Registration complete" from the DCF is not the close trigger; a passing GUID spot-check per indexed submission, pasted into a comment, is.

**Service & handoff anatomy (read once before drafting)**

- **CRDC IndexD**: the service (`github.com/uc-cdis/indexd`), operated by the DCF. Mints 128-bit GUIDs (`dg.4DFC/00006197-6407-5014-8175-c82efdf6cf0f`) that resolve to physical S3 locations and carry access-control metadata (`acl` / `authz`). One centralized instance serves the whole CRDC; there is no Dev/QA/Stage/Prod separation for registration.
- **Source artifacts**: each CRDC submission produces its own Release Package (metadata) in `nci-cbiit-caninedatacommons-dev`, and each Release Package carries its own indexd.tsv manifest. Object files live in the shared CRDC bucket `nci-crdc-data-bucket-prod`.
- **DCF Google Drive**: the drop-off for the extracted manifests; the DCF monitors it. ICDC folder: `https://drive.google.com/drive/folders/1eYXAEOFab-lbLdpNT0sLhXsqfVehcTqW`.
- **CRINTAKE Jira board**: `tracker.nci.nih.gov/projects/CRINTAKE/`, the DCF's intake queue. A CRINTAKE ticket tells the DCF the manifests are ready and is where they report completion.
- **Resolution endpoint**: `https://nci-crdc.datacommons.io/index/<guid>`, used for the verification spot-checks.
- **Paired Data Loading Task**: linked via `Relates` and run **in parallel**; the load's metadata references these GUIDs in its `file_uuid` column.
- **ICDC specifics vs CTDC**: ICDC is open access, so every manifest row carries the same open-access `acl`; CTDC is controlled access and reconciles its `acl` against dbGaP first (DO-DBGAP). ICDC also links the study record when one exists.

**Section order (4 sections, exactly this sequence)**

Each section header is a Jira wiki `h3.` heading with the emoji and a bold title, for example `h3. 🎯 *Registration Summary*`. Keep the sections in this order so every registration ticket reads the same way. All examples are in Jira wiki markup, which is what gets pushed.

1. `h3. 🎯 *Registration Summary*`: **Two sentences.** First, what's being indexed and that the paired Data Loading Task will reference the GUIDs. Second, a **bold new-vs-existing study marker**: a new study's first registration, or a study update to an existing study with its version. Do **not** restate anything else (submission count, chronology, file counts, on-hold status): that lives on the Data Submission Epic or in Jira statuses. Study-update example: *"Register the COTC021 v.3 object files in CRDC IndexD, minting the GUIDs that the paired Data Loading Task will reference. **COTC021 is an existing ICDC study; this is a study update (v.3), not a new study registration.**"* New-study example: *"Register the COTC0XX study files in CRDC IndexD, minting GUIDs for the object files that the paired Data Loading Task will reference. **COTC0XX is a new ICDC study; this is its first registration.**"*

2. `h3. 📦 *Submission & Artifacts*`: Required. Two bare-value constant bullets, then a table with **one row per CRDC submission being indexed** (every submission that carries object files). No intro sentence, no explanatory text on the constants.

   ```
   * *AWS Account ID*: {{152091478849}}
   * *Release Package bucket*: {{nci-cbiit-caninedatacommons-dev}}

   ||Submission||Release Package||Sample GUID||
   |COTC021 Methylation|[<timestamp>-<submission-id>/|<S3 console URL>]|dg.4DFC/<guid>|
   |COTC021 Low Pass WGS|[<timestamp>-<submission-id>/|<S3 console URL>]|dg.4DFC/<guid>|
   |COTC021 Deep WGS|[<timestamp>-<submission-id>/|<S3 console URL>]|dg.4DFC/<guid>|
   ```

   **Columns:**
   - *Submission*: the submission's name in the CRDC Submission Portal (for example "COTC021 Methylation"), first on purpose because it is the handle everyone uses. Use the same name as the paired Data Loading Task's table so the two tickets line up. If the Portal name is unknown, use a descriptive label and confirm it with the Data Concierge.
   - *Release Package*: the directory name within the Release Package bucket, rendered as a clickable S3-console link. It holds that submission's indexd.tsv manifest. PLACEHOLDER until the study is released from the Portal.
   - *Sample GUID*: the spot-check anchor for that submission's manifest. PLACEHOLDER until minted.

   **Clickable Release Package links**: `[<timestamp>-<submission-id>/|<url>]`, which renders correctly inside a table cell. The `prefix=` value is the directory URL-encoded (colons as `%3A`):

   ```
   https://us-east-1.console.aws.amazon.com/s3/buckets/nci-cbiit-caninedatacommons-dev?region=us-east-1&prefix=<URL-ENCODED-DIR>/&showversions=false
   ```

   **Why one row per submission**: one study update can span several CRDC submissions, each with its own Release Package and manifest. A field/value table with semicolon-separated cells relied on matching positions across rows; on ICDC-4193 a late-arriving submission had nowhere to go and hardcoded counts went stale. A row per submission makes each submission self-contained and a late arrival a single new row.

   **Only submissions being indexed get a row.** Every row is implicitly indexed, so there is no Index? column. Metadata-only submissions (publication corrections, study-detail refreshes) have nothing to register and are left out; they appear on the paired Data Loading Task, which lists every submission.

   **Not in the table**: CRDC Submission ID (it is embedded in the Release Package directory name, and the Data Loading Task carries it); intake batch (the CRINTAKE links in the Links panel show which handoff covered what); GUID prefix (always `dg.4DFC/`); manifest path (it's in the Release Package); data model version (belongs on the Data Loading Task); object files location (the manifest's `url` column has it); ACL value (the manifest's `acl` column has it).

3. `h3. 🚦 *Registration Workflow*`: Numbered `#` list in three phases, each introduced by a bold label. Put a blank line after the heading and after each bold phase label so the lists render cleanly. Never hardcode a submission or manifest count; refer to "each submission in the table" so the table stays the single source of truth.

   **Pre-registration**
   1. For each submission in the table, extract the indexd.tsv manifest from its Release Package in `nci-cbiit-caninedatacommons-dev`. Validate that every row carries a non-empty `acl` and that it is the same open-access value on every row, the row count matches the file count, every row's `url` is well-formed (a format check is enough), and the GUIDs use the `dg.4DFC/` prefix.

   **External handoff**
   2. Upload each manifest to the DCF Google Drive folder for indexing; keep the Release Package filenames.
   3. File a CRINTAKE intake ticket describing this study update, naming every manifest in this handoff and any requested due date. A submission that arrives after an intake ticket is filed goes on a new intake ticket.
   4. Link each CRINTAKE ticket to this ticket with a native Jira link.
   5. If a due date is communicated, notify the NCI CRDC (Leidos) PM and the NCI DCFS PM as early as possible.

   **Confirmation & verification**
   6. Monitor each CRINTAKE ticket; its status shows when the DCF has finished indexing its manifests.
   7. Once every CRINTAKE ticket is complete, run the GUID spot-checks (see Verification). Passing spot-checks are the trigger to close this ticket.

   **Step count: 7 (1 pre-registration, 4 external handoff, 2 confirmation & verification).** Step 7 is the only place the close trigger is stated.

4. `h3. 🧪 *Verification*`: How ICDC confirms the registration worked. Labeled bullets (`* *Label*: content`):

   - *Spot-check method*: for every row in the table, resolve its Sample GUID at `https://nci-crdc.datacommons.io/index/<guid>` and paste the returned IndexD record into a comment on this ticket, labeled with the submission name. A pass returns the record with `urls` pointing to the expected object-files location, a non-empty `acl`, and non-empty `size` and `hashes`.
   - *Why one per submission*: each submission has its own manifest, so a pass on one says nothing about the others.
   - *If a check fails*: do not close. Reopen the relevant CRINTAKE ticket with the GUID and the resolution-endpoint response, coordinate the fix with the DCF, and surface the issue on the Data Submission Epic.

   **Timing note (for the assignee, not the ticket body):** a GUID resolves only after the submission is marked Complete in the CRDC Submission Portal, when the object files move to the production bucket. Hand off as soon as the Release Package exists; run the spot-checks after Complete.

**Sections omitted**

- ❌ **🔗 Linked Work**: the native Links panel carries every relationship.
- ❌ **🌐 External Handoff Coordination**: the DCF, Drive folder, CRINTAKE board, and PM contacts are folded into the workflow steps where they are used.
- ❌ **🤝 Collaboration & Handoffs**: ownership is the assignee field plus the comment trail.
- ❌ **🔍 Open Questions / Risks**: these live on the Data Submission Epic.
- ❌ **📝 Notes**: terminology is defined in the anatomy above; the assignee doesn't need a glossary on the ticket.

**Standing emoji set (4 entries)**

| Section | Emoji |
|---|---|
| Registration Summary | 🎯 *(shared with Data Loading Task)* |
| Submission & Artifacts | 📦 *(shared with Data Loading Task)* |
| Registration Workflow | 🚦 *(shared with Data Loading Task)* |
| Verification | 🧪 *(scoped to GUID resolution spot-checks)* |

**Required content rules**

- **Scope is IndexD registration only.** Data loading uses the Data Loading Task template; schema or model changes use the Data Modeling for Study Submission or Data Model Update Task template. See "When NOT to use this template."
- **All four sections are required**, in order: Registration Summary, Submission & Artifacts, Registration Workflow, Verification.
- **No Acceptance Criteria or Open Questions / Risks sections.** The completion bar is the GUID spot-checks; risks belong on the Data Submission Epic.
- **Registration Summary carries the new-vs-existing study marker** as its bold second sentence: a new study's first registration, or a study update with its version.
- **One Task per study update.** All submissions for one study version go on one registration ticket, one row each. CRINTAKE tickets are one per handoff, so one registration ticket can carry several.
- **Submission & Artifacts table is mandatory and complete at creation.** One row per submission being indexed (metadata-only submissions are left out), every column populated; PLACEHOLDER when a value is pending, never a blank cell.
- **Non-vital scope detail goes in a comment, not the description.** File counts, file-type breakdowns, and study-content context go in a plain-text study-update context comment.
- **Spot-check method and pass criteria are explicit in Verification**, so the close trigger is reproducible by anyone reading the ticket.
- **Issue type is Task.** Do not use Story or Subtask.
- **Title convention:** `Data Indexing: <Program Short Name> <Study Short Name> <version>`: reuse the exact token from the Data Submission Epic title, for example `Data Indexing: COP COTC021 v.3`.
- **Parent Epic field set via `customfield_12350`** to the study's Data Submission Epic.
- **`Data-Concierge` label is mandatory** on this task, set at creation via `labels`. The paired Data Loading Task carries no label.
- **Leave the ticket Unassigned at creation.** The Developer field is not required: indexing is Data Concierge coordination, not engineering.
- **Sprint: always add the ticket to the standing `ICDC Data Related` sprint at creation** (board 574, sprint id 6645). Never leave it in the backlog or place it in a numbered development sprint; pass the new key to `jira_add_issues_to_sprint` right after creation.
- **`Relates` link to each submission's Data Hub tracking ticket (DHDM-XXX).** DHDM tracks per submission, so a multi-submission registration links several DHDM tickets.
- **`Relates` link to the paired Data Loading Task** when it exists (registration as inward issue, load as outward). Never `Blocks`: the two run in parallel.
- **`Relates` link to the study record when one exists** (for example ICDC-3206 for COTC021). ICDC-only; the Study tickets are a deprecated onboarding system and new studies may not have one.
- **Native "Related To" link to each CRINTAKE ticket** once it is filed (`jira_create_issue_link`, registration as inward issue). A free-text CRINTAKE key is not sufficient, and a remote link is reserved for targets outside this Jira.
- **No other ticket keys in the body.** The epic, study record, DHDM trackers, CRINTAKE tickets, and paired load are all carried by the Epic Link and native links.
- **No em dashes** in the ticket body or comments; use colons, semicolons, commas, or parentheses.
- **Description format is Jira wiki markup, authored directly** (the update path stores Markdown literally on this instance). Headings `h3. 🎯 *Title*`; labeled lines `* *Label*: content`; inline code `{{value}}`; numbered lists `#`; bullets `*`; links `[text|url]`; tables `||header||` and `|cell|`. Blank line after every heading, between a bold phase label and its list, and between sections. No in-cell line breaks. After pushing, read the description back and confirm it starts with `h3.`, not `###`.
- **Comment formatting**: comments are plain text with real line breaks; a leading `* ` renders as a bullet. Avoid Markdown bold, backticks, and `{{ }}` in comments.

**Writing-and-publishing workflow**

1. Confirm each Release Package exists in `nci-cbiit-caninedatacommons-dev`. If they don't yet, the ticket can still be created with PLACEHOLDER cells. Surface open questions on the Data Submission Epic, not the Task.
2. Confirm this is IndexD registration, not data loading or modeling.
3. Identify the Data Submission Epic, each submission's DHDM tracker, the paired Data Loading Task, and the study record if one exists.
4. Create via `jira_create_issue` with `issue_type = "Task"`, the title from the convention above, a short placeholder description, the parent epic via `customfield_12350`, and the `Data-Concierge` label. Leave it Unassigned.
5. Push the full description via `jira_update_issue` in Jira wiki markup; read it back to confirm it stored as wiki markup.
6. Add the ticket to the `ICDC Data Related` sprint (id 6645) via `jira_add_issues_to_sprint`.
7. Add the `Relates` links: each submission's DHDM tracker, the paired Data Loading Task, and the study record if one exists.
8. Post the study-update context comment (file counts, file-type breakdown) as plain text, then verify the rendered description with a UI screenshot.
9. As the work progresses, add a "Related To" link to each CRINTAKE ticket once filed, and add a row for any late-arriving submission.
10. After every indexed submission's spot-check passes, transition the ticket to Closed with resolution `Fixed`.

**When to expand vs trim**

- **Single-submission registration** → one table row; everything else as written.
- **Multi-submission registration** → one row per submission being indexed; metadata-only submissions are left out. One ticket.
- **Late-arriving submission** → add a row, file and link a new CRINTAKE ticket, link its DHDM tracker, and update the context comment's counts. Do not open a second registration ticket.
- **Re-registration after a file correction** → use the template as written; explain the reason in a comment and reference IndexD's `baseid` / `rev` versioning.

**When NOT to use this template**

- **Data loading** → Data Loading Task template, the parallel sibling.
- **Data modeling** → Data Modeling for Study Submission (study-driven) or Data Model Update Task (internally-driven).
- **Software development** → software development template family.
- **Other upstream artifact creation** (for example a standalone metadata loading file) → no dedicated ICDC template yet; file a standalone Task under the Data Submission Epic and link it natively.
- **CRDC platform changes** (Fence, IndexD, Submission Portal upgrades) → owned by CRDC platform teams; out of ICDC scope.

**Canonical examples**

**ICDC-4193** (*Data Indexing: COP COTC021 v.3*) and **ICDC-4194** (*Data Indexing: COP COTC022 v.3*). ICDC-4194 carries Gina's slimming edits and is the wording reference. Both have the one-row-per-submission table (ICDC-4193: Methylation, Low Pass WGS, Deep WGS; ICDC-4194: Methylation, Low Pass WGS), the three-phase workflow, one spot-check comment per indexed submission, a plain-text study-update context comment, and native links to the study record, the paired load, and each CRINTAKE ticket.

**Changelog**

- **v7 (2026-10-22)**: Table slimmed to three columns: **Submission, Release Package, Sample GUID**. Dropped CRDC Submission ID (embedded in the Release Package directory name and carried by the Data Loading Task), Index? (every row is implicitly indexed, so metadata-only submissions no longer get a row), and Intake batch (the CRINTAKE links carry it). Lockstep with CTDC DO-INDEX v10.
- **v6 (2026-10-22)**: Realigned with CTDC DO-INDEX v9 (same layout and rules; platform specifics differ). The indexing team is the **DCF** throughout. Added the standing `ICDC Data Related` sprint rule (id 6645), `Relates` links to **each submission's DHDM tracker**, and an explicit no-ticket-keys rule. Close trigger no longer "clears the paired Data Loading Task" (the two run in parallel). Spot-check pass now also requires a non-empty `acl`, and a failure is surfaced on the Data Submission Epic. Study record link is "when one exists". Loading is described as Prefect, not Jenkins. "Study update" replaces "data update". History moved to this changelog.
- **v5 (2026-10-09)**: Aligned with CTDC IndexD v8. Dropped the 📝 Notes section (4 sections); headers take a bold title and labeled lines use `* *Label*: content`.
- **v4 (2026-10-08)**: One row per submission (Submission, CRDC Submission ID, Release Package, Index?, Sample GUID, Intake batch) after ICDC-4193 outgrew the five-row field/value table; constants as bare-value bullets; metadata-only rows marked Index = No; one CRINTAKE ticket per handoff batch; one spot-check per indexed submission; descriptions authored in Jira wiki markup; Confirmation & verification phase added.
- **v3 (2026-07-30)**: Bold new-vs-existing study marker; clickable Release Package links; non-vital scope detail moved to a comment; no em dashes; verification simplified to a single-GUID resolution pasted into a comment; completion tracked through the CRINTAKE ticket; UChicago indexing team renamed DCF.
- **v1 and v2 (2026-05)**: Ported from CTDC v7; Linked Work, External Handoff Coordination, Collaboration & Handoffs, and Open Questions / Risks removed.
