### 🔖 IndexD Registration Task Template (v1-DRAFT — 2026-05-27)

> **Status:** **v1-DRAFT.** Ported from CTDC's `claude/templates/indexd-registration-task-template.md` (v3). Carries `[ICDC-VERIFY]` callouts at every spot where the CTDC pattern was adapted for ICDC but the ICDC-specific assumption needs Ambar Rana's review before the template becomes canonical. Once `[ICDC-VERIFY]` items are resolved, this template promotes to v1 canonical.

> **Use this template for every ICDC data management task that registers a study's files in CRDC IndexD — minting GUIDs that the downstream Data Loading Task will reference.** Canonical example: TBD (will be filled in when the first ICDC IndexD Registration ticket is drafted under this template). This template covers the **upstream artifact creation** work pattern within the loading-data sub-function — it is the prerequisite to a Data Loading Task, not a substitute for one. See "When NOT to use this template" at the end.

**Why this template**

The ICDC team has two primary functions — software development and data management — and data management has two sub-functions: loading data and modeling data. The Data Loading Task template covers the *promotion of a study's contents* into ICDC's databases through Jenkins. But before that load can run, every file in the submission needs a globally unique identifier (GUID) registered in **CRDC IndexD** — and that registration is performed by an **external team `[ICDC-VERIFY]`** (likely the University of Chicago Center for Translational Data Science, CTDS — same as CTDC's pattern — but ICDC's exact handoff process may differ; confirm with Ambar Rana).

ICDC's role in IndexD registration is **coordination**, not engineering: validate the indexd.tsv manifest, hand it off to the external indexing team via the agreed channels, then verify the minted GUIDs resolve correctly before the downstream Data Loading Task can proceed.

> **`[ICDC-VERIFY]` callout — fundamental scope question:** Does ICDC actually use CRDC IndexD the same way CTDC does, or does ICDC have a simpler workflow because all files are open access and there are no consent codes / `acl` fields? If ICDC has IndexD work but it's structurally simpler (no consent codes, no external CRINTAKE handoff), this template may be over-engineered and needs to be re-shaped to ICDC's actual workflow. Ambar Rana confirms.

**Tasks execute; user stories deliberate.** This is the core principle the template enforces. Tasks are operational work units the assignee executes — they should carry only what's needed to do the work. **Open questions, risks, and unresolved decisions belong on the parent user story**, where the team negotiates scope and tracks risk at the program level. By the time work is decomposed into Tasks, those questions should be resolved enough that the Task can be executed.

The template is **task-shaped: five sections totaling under 700 words, with ownership, external-coordination, and deliberative content removed.** The assignee can read this template-shaped ticket and know exactly what to do without paging through narrative.

The most common antipatterns this template prevents:

1. **Treating IndexD registration as internal pipeline work.** It is not. There is no Jenkins job, no Memgraph write, no environment promotion. IndexD is a centralized service that mints GUIDs for the entire CRDC platform. The bottleneck is an external team's queue, not ICDC's pipeline capacity.
2. **Treating the indexd.tsv as a manifest ICDC authors.** `[ICDC-VERIFY]` — In CTDC the indexd.tsv ships inside the validated Release Package the CRDC Submission Portal produces. ICDC's submission lineage may produce this artifact differently (COTC trials may have a different intake mechanism). Confirm with Ambar Rana.
3. **Duplicating Jira's native Links panel inside the description body.** A standalone "Linked Work" section in a Task description duplicates what the right-sidebar Links panel already shows. The template omits this section entirely.
4. **Accumulating open questions on a Task that should be on the parent user story.** Program-level risks belong on the parent submission user story (`[ICDC-VERIFY]` — does ICDC maintain submission-level user stories the way CTDC does? Confirm with Ambar Rana), not on each child Task.
5. **No verification step recorded on the ticket.** When the external indexing team reports "registration complete," ICDC needs to verify by resolving a sample of GUIDs against the IndexD resolution endpoint.

**Service & handoff anatomy (read once before drafting)**

- **CRDC IndexD** — The actual service. Open source, maintained by UChicago CTDS (`github.com/uc-cdis/indexd`). Mints 128-bit GUIDs that resolve to physical S3 locations and (in CTDC) carry access-control metadata. **`[ICDC-VERIFY]` — ICDC GUIDs likely do NOT carry `acl` / `authz` metadata since all ICDC files are open access. Confirm with Ambar Rana.**
- **Source artifacts** — Object Files live in `[ICDC-VERIFY]` AWS S3 buckets (ICDC bucket names TBD — `nci-icdc-data-bucket-prod` or similar; confirm with Charles Ngu / DevOps). Release Package + indexd.tsv manifest live in `[ICDC-VERIFY]` (CTDC uses `nci-cbiit-clinicaltrialdatacommons-metadata` — ICDC has a different equivalent; confirm).
- **DCF Google Drive** — `[ICDC-VERIFY]` — The drop-off point for the indexd.tsv copy. CTDC uses the folder at `https://drive.google.com/drive/u/2/folders/1ZVsv2vFEcTPBT2IYsaOb_XCjpWjjMGTb` — ICDC may share this folder or have its own. Confirm with Ambar Rana.
- **CRINTAKE Jira board** — `tracker.nci.nih.gov/projects/CRINTAKE/`. `[ICDC-VERIFY]` — In CTDC this is the external team's intake queue; ICDC may use the same board (since CTDS serves the whole CRDC platform) or a different one. Confirm with Ambar Rana.
- **Resolution endpoint** — `https://nci-crdc.datacommons.io/index/<guid>`. Public endpoint for resolving a GUID to its IndexD record. Used for verification spot-checks. This is universal across the CRDC platform.
- **Downstream Data Loading Task** — The ICDC ticket that this registration unblocks. Once the GUIDs are minted and verified, the load ticket can proceed with the metadata loading file referencing those GUIDs.

**Section order (5 sections, exactly this sequence)**

Each section header is an `h3` Markdown heading using the emoji + bold title format shown. If a section has no real content for a given registration, omit the header entirely rather than stub it with "None at this time."

1. `### 🎯 **Registration Summary**` — One paragraph. What's being indexed (file count + file type if known), which submission this registration belongs to (named by parent user story key — set via Jira `Relates` link, NOT restated in description), and the downstream Data Loading Task this registration unblocks. **Do not duplicate study identity from the parent submission user story** — chronology, submitter, study identifiers, POC team, and study description all live on the parent user story and the registration ticket references them by the native Links panel.

   **`[ICDC-VERIFY]` — Canonical example placeholder:** The first ICDC ticket drafted under this template will become the canonical example reference here. Until then, refer to CTDC-2060 (NCTN-NCORP TCIA Images-Only AHEP0731) in the CTDC repo as the closest sibling pattern.

2. `### 📦 **Submission & Artifacts**` — Required field. A table holding the artifacts the external indexing team needs to do the work. Study identity (program, study name, identifiers, submitter, chronology) lives on the parent submission user story linked via the native Links panel — not in this table.

   The CTDC v3 of this template uses five rows. **For ICDC, the consent group / ACL value row is REMOVED** because ICDC files are open access. The remaining four rows:

   | Field | Value | Notes |
   |---|---|---|
   | CRDC Submission ID | *(Submission Portal ID or ICDC equivalent — one per submission)* | `[ICDC-VERIFY]` — does ICDC use the CRDC Submission Portal the same way CTDC does, or do ICDC submissions originate elsewhere (e.g., direct COTC trial intake)? Confirm with Ambar Rana. |
   | Release Package Location | AWS Bucket: `[ICDC-VERIFY]` | The bucket holding the Release Package + indexd.tsv manifest. CTDC uses `nci-cbiit-clinicaltrialdatacommons-metadata` — ICDC equivalent TBD. |
   | Object Files Location | AWS Bucket: `[ICDC-VERIFY]` | The bucket holding the physical object files. CTDC uses `nci-crdc-data-bucket-prod` — ICDC equivalent TBD. GUIDs are listed per-file in the indexd.tsv manifest inside the Release Package, not enumerated here. |
   | Example GUID | *(the first minted GUID, used as the spot-check anchor)* | Used for spot-check anchor in the Verification section. Fill in once the Release Package is generated; the CRDC Submission Portal pipeline assigns the GUIDs ahead of registration. |

   **Naming discipline**: rows that point at *where artifacts live* end in "Location" (e.g., "Release Package Location", "Object Files Location"). This makes the row's purpose unambiguous — the row holds an address, not a content description.

   **Rows omitted compared to CTDC v3**: "Consent group / ACL value" (not applicable to ICDC — open access); "CRDC Submission ID" may also be omitted if `[ICDC-VERIFY]` confirms ICDC doesn't use Submission Portal IDs.

3. `### 🚦 **Registration Workflow**` — Numbered list grouped into three phases. **`[ICDC-VERIFY]` — The entire workflow below is CTDC's standard sequence. ICDC's actual sequence may differ in steps 2–5 (external handoff) depending on which external team handles ICDC indexing and via what mechanism.** Ambar Rana confirms.

   **Pre-registration**
   1. Extract the indexd.tsv manifest from the Release Package. Validate that the row count matches the file count for this study, every row's `url` resolves to a real location in the Object Files bucket, and the GUID placeholder format is consistent with the `dg.4DFC/` prefix (the standard CRDC prefix). **No `acl` field validation needed for ICDC — open access.**

   **External handoff** `[ICDC-VERIFY]` — sequence below is CTDC's; ICDC may differ
   2. Upload the extracted indexd.tsv to the DCF Google Drive folder `[ICDC-VERIFY]` for indexing. Filename convention is preserved from the Release Package; do not rename.
   3. File a CRINTAKE intake ticket `[ICDC-VERIFY]` on the CRDC CRs_INTAKE Jira board describing the study, the name of the indexd.tsv uploaded to DCF Google Drive in step 2, and any requested due date if the registration is time-bound for a planned Data Loading Task.
   4. Link the CRINTAKE ticket back to this ICDC ticket as a Jira-to-Jira remote link.
   5. If a due date is communicated, notify the relevant program management contacts `[ICDC-VERIFY]` — ICDC's PM notification chain may differ from CTDC's NCI CRDC + NCI DCFS pair; confirm with Ambar Rana.

   **Confirmation and verification**
   6. Confirm the indexing team has received the manifest and acknowledged the intake ticket.
   7. Once indexing is complete, spot-check minted GUIDs using the example GUID in the Submission & Artifacts section. GUID spot-check success is the trigger to transition the ticket to Closed and unblock the downstream Data Loading Task.

4. `### 🧪 **Verification**` — How ICDC confirms the registration actually worked. Bullet list (italic-labelled, em-dash separators — this is the rendering-safe pattern verified on CTDC; assumed to apply to ICDC's Jira tracker as well since both projects use the same `tracker.nci.nih.gov` instance):

   - *Spot-check method* — Resolve a sample of GUIDs by hitting the IndexD resolution endpoint at `nci-crdc.datacommons.io/index/` with the GUID appended. The endpoint returns the full IndexD record (`did`, `urls`, `hashes`, `size`, `rev`, `baseid`). **`[ICDC-VERIFY]` — `acl` and `authz` fields will likely be absent or empty for ICDC since files are open access. Confirm what the expected IndexD record shape is for ICDC files with Ambar Rana.**
   - *Successful spot-check criteria* — The endpoint returns a non-error response; the `urls` field contains the expected S3 location in the Object Files bucket; the `size` and `hashes` values are non-empty.
   - *How many GUIDs to spot-check* — At minimum, the first, middle, and last GUIDs in the manifest. If the study has more than 1,000 files, spot-check at least 5, including any GUIDs flagged by the indexing team as edge cases.
   - *If a spot-check fails* — Do not close this ticket. Reopen the intake ticket (CRINTAKE or ICDC equivalent) with the specific GUIDs and resolution-endpoint responses; coordinate the fix with the indexing team before unblocking the downstream load. **Open the issue on the parent submission user story's Open Questions / Risks section** so it's tracked at the program level.

5. `### 📝 **Notes**` — Bullet list. Optional content: terminology glossary, prior registration lessons learned, known constraints. If there's no meaningful note, omit this section entirely. Standard ICDC entries:

   - *Terminology* — GUID is the Globally Unique Identifier (128-bit, IndexD-minted). DCF is the Data Commons Framework. DCFS is the NCI Data Commons Framework Services. CTDS is the UChicago Center for Translational Data Science (operators of IndexD). CRDC is the Cancer Research Data Commons.
   - *Open access reminder* — All ICDC files are open access. IndexD records for ICDC files do not carry consent-code-based `acl` values the way CTDC controlled-access files do. If a future submission introduces controlled access, this template's `[ICDC-VERIFY]` removed-row (Consent group / ACL value) needs to be reinstated.
   - *Differences from CTDC's IndexD pattern* — `[ICDC-VERIFY]` — Whatever Ambar Rana clarifies about ICDC's specific workflow that differs from CTDC's should be captured here as terminology / pattern reference for future template users.

**Sections omitted compared to CTDC v1 of this template**

- ❌ **🔗 Linked Work** — Jira's native Links panel covers it.
- ❌ **🌐 External Handoff Coordination** — Folded into Workflow steps.
- ❌ **🤝 Collaboration & Handoffs** — Implicit via assignee + comments.
- ❌ **🔍 Open Questions / Risks** — Belongs on the parent submission user story, not the Task.

**Standing emoji set (5 entries)**

| Section | Emoji |
|---|---|
| Registration Summary | 🎯 *(shared with Data Loading Task)* |
| Submission & Artifacts | 📦 *(shared with Data Loading Task)* |
| Registration Workflow | 🚦 *(shared with Data Loading Task)* |
| Verification | 🧪 *(shared with Data Loading Task; scoped to GUID resolution spot-check)* |
| Notes | 📝 *(shared with Data Loading Task)* |

**Required content rules**

- **Scope is IndexD registration only.** Minting GUIDs for files. **Data loading** uses the Data Loading Task template. **Schema or model changes** use the Data Modeling for Study Submission template or the Data Model Update Task template. See "When NOT to use this template" below.
- **No Acceptance Criteria section.** IndexD registration is operational SOP work; the completion bar is the GUID spot-check passing. AC belongs on user stories, not on Tasks.
- **No Open Questions / Risks section.** Open questions and risks live on the parent submission user story, not on this Task. If a question or risk surfaces during the registration work, raise it as a bullet under the parent user story's Open Questions / Risks section so it's tracked at the program level.
- **One Task per registration handoff** — one intake ticket, one IndexD registration ticket on the ICDC side.
- **Issue type is Task** on this tracker. Do not use Story or Subtask.
- **Parent Epic field set via the standard custom field** `[ICDC-VERIFY]` — CTDC uses `customfield_12350`; ICDC may use the same or different. Confirm with Ambar Rana.
- **`Relates` link to the parent submission user story is mandatory** when one exists. `[ICDC-VERIFY]` — Confirm whether ICDC maintains program-level submission user stories the way CTDC maintains tickets like CTDC-1805.
- **Rendering-safe authoring patterns** — section headers use `### **Title**` Markdown form; bullet lists with italic labels use `* *Label* — content` (italic-and-em-dash), NOT `- **Label:** content`; tables use Jira-wiki `||header||` syntax, NOT GitHub-flavored Markdown `|h|h|`. Verified on CTDC's tracker; assumed to apply to ICDC since both use the same Jira instance.
- **Empty sections are omitted, not stubbed.** If a section has no real content for this registration, leave it out.

**Writing-and-publishing workflow**

1. Confirm the upstream artifacts exist before drafting the registration ticket. If the Release Package isn't generated yet, or the Object Files aren't in the bucket, the registration ticket is premature. **Surface any open questions on the parent submission user story, not on the Task.**
2. Confirm this work is IndexD registration, not data loading or modeling.
3. **Identify the parent submission user story** if one exists. `[ICDC-VERIFY]` — Confirm with Ambar Rana whether ICDC has program-level submission user stories.
4. Confirm the downstream Data Loading Task exists (or will exist before this registration completes). The two tickets are paired by design.
5. Create the IndexD registration task via `jira_create_issue` with `issue_type = "Task"`, a short placeholder description, and the parent epic linked via the standard custom field. Assign to the TPM `[ICDC-VERIFY] — confirm ICDC TPM ownership pattern with Ambar Rana` initially.
6. Push the full description in a second call via `jira_update_issue` with the full Markdown body.
7. Add `Relates` links from the registration ticket to the parent submission user story (if applicable) using `jira_create_issue_link`.
8. Add a `Blocks` link from the registration ticket to the downstream Data Loading Task using `jira_create_issue_link`.
9. Verify the rendered description with a UI screenshot.
10. As the workflow progresses, add the external intake ticket remote link via `jira_create_remote_issue_link` once step 3 of the workflow is complete.
11. After GUID spot-check passes, transition the ticket to Closed with the appropriate resolution. **GUID spot-check success is the close trigger.**

**When NOT to use this template**

**Data loading** — does NOT use this template. Use the **Data Loading Task** template instead. That sibling template covers the actual end-to-end promotion of metadata into ICDC's databases after IndexD has minted the GUIDs.

**Data modeling** — does NOT use this template. Use the **Data Modeling for Study Submission** template (when drafted) for study-driven model additions, or the **Data Model Update Task** template (when drafted) for infrastructure-level model changes.

**Software development work** — does NOT use this template. Use the appropriate template from the software development family (Application Pages epic, Features epic, Products epic, etc.).

**CRDC platform changes** — Fence, IndexD, Submission Portal upgrades owned by CRDC platform teams. Out of ICDC scope entirely; ICDC files dependency tickets if affected, but does not own the work.

**Canonical example**

**TBD.** The first ICDC IndexD Registration ticket drafted under this v1-DRAFT template will become the canonical example. Until then, refer to CTDC-2060 in the CTDC documentation repo (`CBIIT/ctdc-documentation` → `claude/templates/indexd-registration-task-template.md`, v3) as the closest sibling pattern.

When the canonical example is identified, this section should be updated with:
- The ICDC ticket key (e.g., ICDC-XXXX)
- Confirmation that the 5 sections are present in the v1-DRAFT order
- Resolution of all `[ICDC-VERIFY]` callouts that were exercised during the ticket's drafting
- Promotion from v1-DRAFT to v1 canonical

---

## Open `[ICDC-VERIFY]` items (for Ambar Rana's review)

This template carries the following assumptions that need ICDC-specific confirmation before promotion to canonical:

1. **Fundamental scope** — Does ICDC use CRDC IndexD the same way CTDC does? Or is ICDC's workflow simpler because all files are open access?
2. **Indexd.tsv source** — Does the indexd.tsv ship inside a CRDC Submission Portal Release Package the same way it does for CTDC, or does ICDC's submission lineage produce this artifact differently (e.g., direct COTC trial intake)?
3. **External team** — Is CTDS the indexing team for ICDC the same way they are for CTDC? Or does a different external team handle ICDC's indexing?
4. **Object Files bucket** — What's ICDC's equivalent of CTDC's `nci-crdc-data-bucket-prod`?
5. **Release Package bucket** — What's ICDC's equivalent of CTDC's `nci-cbiit-clinicaltrialdatacommons-metadata`?
6. **DCF Google Drive folder** — Does ICDC use the same DCF folder as CTDC, or a different one?
7. **CRINTAKE board** — Does ICDC file intake tickets on the same CRINTAKE Jira board as CTDC?
8. **PM notification chain** — When a due date matters, who gets notified for ICDC submissions? (CTDC notifies NCI CRDC PM and NCI DCFS PM.)
9. **IndexD record shape** — Are `acl` and `authz` fields present-but-empty or absent for ICDC records?
10. **Parent submission user story pattern** — Does ICDC maintain program-level submission user stories the way CTDC maintains tickets like CTDC-1805 (NCTN-NCORP TCIA Images-Only Data Submissions)?
11. **Jira custom field for Parent Epic** — Does ICDC use `customfield_12350` the same way CTDC does, or a different field?
12. **TPM ownership pattern** — Is the TPM the initial assignee for ICDC IndexD Registration Tasks, the same way CTDC assigns to the TPM initially?
