### 📚 Data Modeling for Study Submission Template (Drafted v11)

> _ICDC provenance: this template mirrors CTDC's Data Modeling for Study Submission template, filled with ICDC info. The split between the two ICDC modeling templates is by **driver** — study submission vs. internal ICDC project — **not** by size. Canonical example is TBD: the first ICDC ticket drafted under this template becomes canonical. The DM Federal Lead is Heather Creasy._

> **Use this template for every ICDC data modeling task driven by a study submission** — whether the study is brand-new to ICDC or an existing study requesting new properties, permissible values, or enums. Canonical example: **TBD** — the first ICDC ticket drafted under this template becomes the canonical example. This template covers the **modeling-data** sub-function of data management when the work is anchored on a study's **CDE Request Workbook**. It is **not** for infrastructure-level or internally-driven model changes — those use the Data Model Update Task template. It is **not** for loading the study's data after the model is in place — that's the Data Loading Task template. As of v11 this template carries a study-submission-specific **Data Concierge** section (6 sections) that the internally-driven Data Model Update Task template deliberately does not; apart from that section the two share the same shape and differ only in context (study workbook vs. internal workbook, study submission vs. internal driver).

**Why this template**

ICDC modeling work driven by study submissions is straightforward in shape: a study comes to us, we agree on terms via a CDE Request Workbook, we add them to `icdc-model-tool`, we tag and release `[ICDC-VERIFY — confirm ICDC model branch/promotion flow]`, the Submission Portal picks up the new model, the study can submit. The ticket exists to track *when* milestones land. The workbook exists to track *what* is being modeled.

The hard rule: **the workbook is the term-level source of truth, not the ticket.** Pasting term inventories, per-term status, per-term decisions, or term counts into the ticket creates a stale snapshot that the team has to maintain in two places. The sections below are enough — anything more drifts toward duplicating workbook content or reproducing context that already lives on the parent user story.

**Three commitments**

1. **One Task per study's modeling work.** Single source of truth for the modeling concern from initial workbook review through Submission Portal verification. One study, one ticket, one workbook. Future additions to the same study get their own ticket.
2. **Parent user story carries study identity.** Modeling ticket links to the parent Data Submission user story. Study identity, submission chronology, document references, and study description live on the user story; this ticket holds only the modeling concern.
3. **CDE Request Workbook is the term-level source of truth.** The ticket references it in a structurally explicit section; the workbook owns the inventory and status of every term. The ticket does not duplicate term inventories, per-term decisions, or counts.

**Section order (6 sections, exactly this sequence)**

Each section header is an `h3` Markdown heading using the emoji + **bold** title format shown. Don't omit, reorder, or merge sections. Don't add sections. If a section genuinely has no content, state so explicitly ("None at this time") rather than dropping the header.

1. `### 🎯 **Modeling Summary**` — Two to three sentences. Which study is driving this modeling work, whether it's a new study coming to ICDC or an addition to an existing study, and what the modeling work enables. Describe *what kind* of change it is, not *which terms* or *how many* (those live in the workbook). **Include a pointer to the parent Data Submission user story** for full study identity, chronology, and submission context. Example: *"Update the ICDC data model to support an incoming **\{Study Name vN\} Data Submission**. This is a new submission and study being onboarded to ICDC (full study identity, chronology, and submission context in the parent Data Submission user story)."*

2. `### 📚 **CDE Request Workbook**` — Required section. The CDE Request Workbook is the **system of record** for this modeling effort. The ticket tracks *when* milestones land; the workbook tracks *what* is being modeled. Per-term decisions, term status, and caDSR/SI coordination live in the workbook — not in this ticket.

   This section anchors the ticket to the workbook and declares the scope boundary between ticket and workbook. This is the **per-study** CDE Request Workbook (a SharePoint artifact), owned by the study's Data Concierge (Philip Musk). **Do not** include study identity here — that lives on the parent Data Submission user story.

   | Field | Value |
   |---|---|
   | Workbook | *(SharePoint URL)* |
   | Workbook Owner | *(@nih.gov email — the study's ICDC Data Concierge, e.g., philip.musk@nih.gov)* |
   | Source-of-Truth Scope | *(e.g., "Term inventory, per-term status, CDE bindings, nodes and properties touched, per-term decisions")* |

   The fields are intentionally lean. The Workbook URL points readers to the source of truth; the Workbook Owner names the responsible party; the Source-of-Truth Scope row is the boundary statement that keeps workbook content out of the ticket over time. Term counts, specific terms, and per-term decisions are not in this table — those belong in the workbook, the parent Data Submission user story, or (for milestone state) Sections 5–6 below.

3. `### ⭐ **Data Concierge**` — Names the responsible party for this study's modeling work. The assigned Data Concierge is the primary contact who obtains and records CDE/PV requests, manages the CDE Request Workbook, files and tracks the caDSR Help Desk tickets, and coordinates with the SI team, submission team, the TPM, and federal leadership — ensuring the modeling work is captured, implemented, and completed. One role sentence, then a **Name / Role** roster naming the Primary and any Backup(s).

   | Name | Role |
   |---|---|
   | Philip Musk | Data Concierge / Primary |
   | TBD | Data Concierge / Backup |

   This section is **unique to study-submission modeling** — the internally-driven Data Model Update Task template has no study Data Concierge and deliberately omits it.

4. `### 🔍 **DM Federal Lead & Subject Matter Expertise Review**` — Required on **every** model change, study-driven or internal. The **Communication Channel** (row 1) records the Microsoft Teams channel or chat where the Data Concierge coordinates the hand-off with the DH Lead. The **DHDM Jira Issue is filed first** (row 2) on the DHDM Jira board and tracks the review. The **Data Concierge files the caDSR II Help Desk Request Form** (row 3) in caDSR's Help Desk system (a ServiceNow-based ticketing system) when new or updated CDEs/PVs are needed, adding **the ICDC TPM (Gina Kuffel) and the DM Federal Lead (Heather Creasy)** to the caDSR ticket; its link goes in row 3 once it exists. **Heather is added as a watcher on the ICDC Jira ticket only when no caDSR ticket is required** — when a caDSR ticket is filed, she watches that instead, not the Jira ticket. Per-term decisions and caDSR coordination detail live in the caDSR Help Desk ticket and the workbook, not in this Jira ticket. This review gates promotion to `prod` `[ICDC-VERIFY — confirm ICDC model branch/promotion flow]`. For study-driven work, the study's **Data Submission user story is a native Jira "Relates" link on this ticket — not a row in the table below.** The DH DataModel Updates Kanban workflow that governs this review — for **every** model change — is the [05 SOP for DataModel Updates documentation in JIRA](https://nih.sharepoint.com/:w:/r/sites/NCI-CBIIT-CRDC-DataHubSubmissions/Shared%20Documents/Data%20Hub%20Submissions/06%20SOP%20Library%20For%20Data%20Submissions/05%20SOP%20for%20DataModel%20Updates%20documentation%20in%20JIRA%20012626.docx?d=wa0dfdc8bc4384e638d4b98eebc56c719&csf=1&web=1&e=HwRTEA), administered by the DM Fed Lead.

   | Coordination Item | Value | Owner |
   |---|---|---|
   | Communication Channel | *(link to the applicable `[ICDC-VERIFY — ICDC per-submission Teams channel]` for this submission)* | Data Concierge |
   | DHDM Jira Issue | *(link to the DHDM Jira Issue — filed first on the DHDM Jira board)* | DH Coordinator / DH Lead |
   | caDSR II Help Desk Request Form | *(link — added once the Data Concierge files it in caDSR's Help Desk)* | Data Concierge |

5. `### 🪜 **Steps to Completion**` — Numbered list, followed explicitly. The path **this ticket** follows from open to closed. The *how* of each model edit lives in the ICDC data-model contribution process `[ICDC-VERIFY — confirm ICDC's data-model contribution SOP/process]`; the DM Fed Lead review runs on the DH DataModel Updates Kanban under its own SOP (Section 4). This ticket tracks **our** work to done — not that board's lane movements, which are the DM Fed Lead's to manage. Keep the steps to the workflow spine; never enumerate the specific terms being modeled (those live in the workbook).

   1. The Data Concierge first uses the CDE Request Workbook to record all CDEs being requested, any needing validation, and any additional permissible values being requested from the SI team.
   2. Verify the recorded work in the CDE Request Workbook with the ICDC TPM (Gina Kuffel), requesting a review as needed, and confirm the timing and contents of the caDSR II Help Desk Request Form with the TPM.
   3. File a caDSR II Help Desk Request Form using [this link](https://service.cancer.gov/cadsr-curation?id=cadsr_helpdesk_request&sys_id=a03d31151b8d05106daea681f54bcbd0).
      - For a long-term effort supporting an incoming study submission, use discretion to file multiple caDSR tickets as needed (e.g., one per node in the ICDC data model); reuse the original Jira ticket title and append the node being worked on.
      - Add the ICDC TPM's (Gina Kuffel) email to the caDSR ticket, along with the Federal Lead, Heather Creasy.
      - **Do not** add Heather as a watcher on the corresponding ICDC Jira ticket **if** a caDSR ticket was filed. Only add Heather as a watcher on ICDC tickets that **do not require** a caDSR ticket.
      - In the **Short Description** box, match the corresponding Jira ticket title (e.g., "Data Modeling: \{Study Name vN\}") to ensure a 1:1 mapping.
      - In the **Details** box, include which Data Commons the request is from, the project/submission, a brief description of the requested work (do not list props or other details), and a link to the appropriate CDE workbook.
      - Paste the caDSR II Help Desk Request Form/ticket link in the Value column of the Section 4 table; if multiple tickets are filed, add them consecutively.
   4. Once approval is established from the caDSR II Help Desk Request Form/ticket, the Semantics Infrastructure (SI) team updates the respective columns (Resolution, Resolution Date, CDE Code, CDE Version, Notes) in the linked CDE Workbook. Use the designated Teams channel to coordinate with the SI team, and follow up until this is complete.
   5. Complete the data model updates in the [`icdc-model-tool`](https://github.com/CBIIT/icdc-model-tool) GitHub repository per the ICDC data-model contribution process `[ICDC-VERIFY — confirm ICDC's data-model contribution SOP/process]`.
   6. Paste links to all pull requests in the comments of this Jira ticket.
   7. Post any pull requests that need a formal review to the ICDC modeling Slack channel `[ICDC-VERIFY — ICDC modeling Slack channel]`.
   8. Verify the new model version is present on all Verification Surfaces (Section 6).
   9. Update the Status column in the CDE Workbook.
   10. Move this Jira ticket to Ready for QA testing; once the QA team has reviewed the applicable changes, send the ticket back to the Data Concierge.
   11. Do **not** close this ticket until the related submission is complete in the CRDC Submission Portal — a single study submission can require many data model changes over its course.

6. `### 🧪 **Verification Surfaces**` — Bullet list, stated as confirmation actions. The Data Model Navigator runs as two separate instances — one in the CRDC Submission Portal (submitters), one in ICDC (researchers) — both reading the same model. Both reflect a model version bump on the same trigger (the `prod` merge and release tag `[ICDC-VERIFY — confirm ICDC model branch/promotion flow]`); confirm the new version on both.

   - **CRDC Submission Portal DMN** — Confirm submitters can see the new version of the data model in the Data Model Navigator.
   - **ICDC DMN** — Confirm researchers can see the new version of the data model in the Data Model Navigator at `caninecommons.cancer.gov`.

**Standing emoji set (6 entries)** — the **⭐ Data Concierge** entry is unique to this template; the other five match the Data Model Update Task template.

| Section | Emoji |
|---|---|
| Modeling Summary | 🎯 |
| CDE Request Workbook | 📚 |
| Data Concierge | ⭐ |
| DM Federal Lead & Subject Matter Expertise Review | 🔍 *(the caDSR/PV governance review gate)* |
| Steps to Completion | 🪜 |
| Verification Surfaces | 🧪 |

**Required content rules**

- **Six sections, no further additions.** Open Questions & Risks, Linked Work, Term Status Summary, Notes, and Modeling & Promotion Workflow are deliberately *not* sections in this template. Open items and risks are not task-level — track them as Jira comments so the audit trail lives with the work. Linked Work belongs in Jira's native issue-link UI. Term Status Summary duplicates workbook content. Notes (operational context, cadence, sibling-ticket pointers) belongs in Jira comments or on the parent Data Submission user story, not on the task. Modeling & Promotion Workflow duplicates the contribution process.
- **Scope is study-driven model changes only.** A study submission's CDE Request Workbook drives the work. Infrastructure-level or internally-driven model changes use the Data Model Update Task template. Data loading uses the Data Loading Task template.
- **No specifics, ever.** No per-property, per-enum, per-permissible-value, per-relationship, or per-CDE-code listing in the ticket — and no counts. Describe the kind of change ("permissible-value and CDE-mapping changes"), never the specific terms or the tally. It all lives in the CDE Workbook.
- **Versioning and procedure live in the contribution process and GitHub, not the ticket.** How the model is edited, which SemVer level applies, and how it is tagged and released are governed by the ICDC data-model contribution process `[ICDC-VERIFY — confirm ICDC's data-model contribution SOP/process]` and recorded in GitHub (the YAML `Version:` field, the git tag, the GitHub Release). The ticket does not classify or track the version. Any downstream re-load of existing data that a breaking change may require is a **separate Data Loading Task (the Data Loading Task template)**, linked via native Jira issue links, never folded into the modeling ticket.
- **One Task per study's modeling work.** New study onboarding gets one ticket. Subsequent additions for the same study get their own ticket. Don't roll forward into a single open ticket.
- **A parent Data Submission user story is required.** Every modeling ticket carries a **required** `Relates` link to a parent Data Submission user story that carries study identity (the study identity anchor). If no parent user story exists, file it before this modeling ticket. Identity content lives on the user story — never duplicated on the modeling ticket.
- **The DM Federal Lead & Subject Matter Expertise Review is required on every model change.** The DHDM Jira Issue is filed first on the DHDM board and tracks the review (Section 4, row 2); the Data Concierge files the caDSR II Help Desk Request Form (caDSR's ServiceNow-based Help Desk) when new/updated CDEs or PVs are needed, adding the ICDC TPM (Gina Kuffel) and the DM Federal Lead to the caDSR ticket, and its link is added to row 3 once it exists. The DM Federal Lead is added as a watcher on the ICDC Jira ticket only when no caDSR ticket is required. This review gates `develop` → `prod` promotion `[ICDC-VERIFY — confirm ICDC model branch/promotion flow]`. The study's Data Submission user story is a native Jira "Relates" link, never a row in the Section 4 table.
- **Issue type is Task** on this tracker (confirmed working ICDC issue types are Epic and Task).
- **Title convention:** `Data Modeling: <Study Name vN>` — reuse the exact `<Study Name vN>` token from the parent Data Submission user story title verbatim; no acronym or version drift. Internal/non-study model updates instead use `Data Modeling: <change description>` (the Data Model Update Task template).
- **Parent Epic field set on the ticket itself** via `customfield_12350` when a study onboarding or release epic exists (default parent epic `ICDC-3342 (ICDC Data)`).
- **The CDE Request Workbook is the term-level source of truth, not this ticket.** Section 2 anchors the URL with an explicit Source-of-Truth Scope row. Do not replicate the workbook's term inventory or per-term status anywhere on the ticket.
- **Verification on both Data Model Navigator instances is the close trigger.** Not the `prod` merge, not the GitHub Release `[ICDC-VERIFY — confirm ICDC model branch/promotion flow]` — the actual confirmation that both the CRDC Submission Portal DMN and the ICDC DMN show the new model version is what closes the ticket.
- **Curly braces escaped as `\{...\}`** anywhere they appear in description text — same rule as every other Jira description on this tracker.

**Writing-and-publishing workflow**

1. Confirm the parent Data Submission user story exists. If it doesn't, file it first using the Data Submission user story template — the modeling ticket assumes it as the context anchor.
2. Confirm a CDE Request Workbook exists or is in active authoring. If it doesn't, the modeling ticket is premature — author the workbook first.
3. Confirm this work is study-driven (anchored on a CDE Request Workbook), not infrastructure-level or internally-driven (use the Data Model Update Task template) and not loading (use the Data Loading Task template).
4. The SemVer level, version bump, tag, and release are governed by the ICDC data-model contribution process `[ICDC-VERIFY — confirm ICDC's data-model contribution SOP/process]` and recorded in GitHub — not classified or tracked on this ticket.
5. Create the data modeling task via `jira_create_issue` with `issue_type = "Task"`, a short placeholder description, and the parent epic linked via `customfield_12350` in `additional_fields`. Assign per the working-meeting cadence.
6. Push the description in two steps: create with the placeholder, then `jira_update_issue` with the full Markdown body. Same two-step pattern as every other ICDC template. **Do not hand-edit the description in the Jira UI afterward** — the wiki editor mangles monospace tokens, URLs (eats underscores), and Markdown bullets; re-push through `jira_update_issue` instead.
7. Add native "Relates" issue links to the parent Data Submission user story (required), the DHDM Jira Issue, and any sibling modeling tickets for the same study or program.
8. Verify the rendered description with a UI screenshot — wiki source is unreliable as a render preview.
9. As work progresses, the data engineer adds GitHub PR links as Jira comments and advances the ticket through its Jira states — those states carry the branch/release progress a description table used to hold. Section 4 records the DHDM Jira Issue (row 2) first, then the caDSR II Help Desk Request Form (row 3) once it exists; operational context that develops along the way goes in Jira comments, not the ticket body.
10. **Verification on both Data Model Navigator instances plus tag-and-release together are the close trigger `[ICDC-VERIFY — confirm ICDC model branch/promotion flow]`.** Once both the CRDC Submission Portal DMN and the ICDC DMN show the new model version (Section 6, Verification Surfaces) and the workbook's Status column is fully reconciled, move the ticket to its Closed state.

**When to expand vs trim**

- **New study onboarding with a large workbook** → use the template as written. The sections handle any scale because counts and per-term state aren't on the ticket; the workbook absorbs scale.
- **Existing study, small addition** → use the template as written. Same shape.
- **Workbook still in early authoring** → file the ticket as a draft; Section 2 fields can be PLACEHOLDER until the workbook stabilizes.
- **No new or changed CDEs/PVs** (e.g., a pure mapping or structural tweak agreed with the study) → the DHDM review (Section 4, row 2) still happens; the caDSR II Help Desk Request Form row stays empty and the DM Federal Lead is added as a watcher on the ICDC Jira ticket instead.
- **A single property addition driven internally by the data team, not a study** → this template is the wrong fit. Use the Data Model Update Task template.

**When NOT to use this template**

- **Infrastructure-level or internally-driven model changes** (breaking, framework upgrades, multi-repo refactors, or roadmap-driven additions initiated by the ICDC project itself) → Data Model Update Task template.
- **Loading study data after the model lands** → Data Loading Task template. Different verification surface, different ladder. This is also where a breaking change's downstream re-load is tracked.
- **Software development that does not touch the schema** → software development template family.
- **CDE Workbook authoring as standalone work** — the workbook is a SharePoint artifact. Workbook authoring is data-adjacent operational work, not its own structured ticket.
- **Bento Core MDF framework changes** — upstream concern; file with the Bento team.

**Changelog**

- **v1 (2026-07-30) — ICDC port** — Structural mirror of the source template (v11); see the provenance note at the top of this file. Filled with ICDC info: model repo `icdc-model-tool`, graph store Neo4j, application `caninecommons.cancer.gov` (Cases / Studies / Samples), two DMN instances (CRDC Submission Portal DMN for submitters, ICDC DMN for researchers), DM Federal Lead Heather Creasy, Data Concierge Philip Musk (Primary; Backup TBD), ICDC TPM Gina Kuffel, Data Model Author Mark Jensen (NIH/NCI). The split between the two ICDC modeling templates is by **driver** (study submission vs. internal ICDC project), **not** size. Six-section shape retained, including the ⭐ Data Concierge section that the sibling Data Model Update Task template omits. Canonical example TBD — the first ICDC ticket drafted under this template becomes canonical. `[ICDC-VERIFY]` markers flag items awaiting confirmation (data-model contribution SOP/process, branch/promotion/tag-release flow, per-submission Teams channel, modeling Slack channel).
