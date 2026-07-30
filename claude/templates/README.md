# ICDC Documentation — Templates

This directory holds reusable templates for ICDC Jira tickets and related artifacts. Templates encode the team's agreed work shapes so a reader of any single ticket can find what they need without asking, and so structurally similar tickets across the project look structurally similar.

Templates are organized by **work lane** — the team has two primary functions (software development and data management), and each function has its own set of templates.

---

## Inventory

| Template | Lane | Status | Canonical Example | Notes |
|---|---|---|---|---|
| `7e-4-products.md` | Software development (Products epic) | Drafted | TBD | Pre-existing. Covers standalone deliverables consumed by external systems (manifest format spec, the ICDC application as a whole, the Data Model itself as a versioned product). |
| `indexd-registration-task-template.md` | Data management — loading data | **v1-DRAFT (rev. 2026-05-28)** | ICDC-4175 | Ported from CTDC v3. Open-access only (no `acl`). Revised against ICDC-4175 / CRINTAKE-478: `Relates` (not `Blocks`), Release Package row, AWS Account ID row, most `[ICDC-VERIFY]` items resolved. A few open items remain for Ambar Rana. |
| `data-loading-task-template.md` | Data management — loading data | **v1-DRAFT (rev. 2026-07-30)** | ICDC-4176 | Ported from CTDC v5. Cases / Studies / Samples. Revised against ICDC-4176 + `icdc-dataloader`: **Neo4j** (not Memgraph), hybrid Dev-local / Jenkins pipeline, **User Story** issue type, `Relates` (not `Blocks`), five-row artifacts table. **2026-07-30 rev:** slimmed to the 4-section shape (Load Summary · Submission & Artifacts · Loading Workflow · Testing Signoff); corrected loader script name to `loader.py` (`DataLoader` is the class inside `data_loader.py`, not a script); added the runnable Dev-local `loader.py` command block (dry-run then load, `--dataset`); named ICDC-4176 canonical. A few open items remain for Ambar Rana. |
| `data-modeling-for-study-submission-template.md` | Data management — modeling data | Planned (next session) | TBD | Will be ported from CTDC v3 with ICDC adaptations — repo is `icdc-model-tool`, not `ctdc-model`. |
| `data-model-update-task-template.md` | Data management — modeling data | Planned (next session) | TBD | Will be ported from CTDC v2 with ICDC adaptations. |

---

## Why two lanes

The ICDC team's work splits cleanly along two operational lanes:

- **Software development** — designing, coding, testing, releasing the React frontend (Bento framework) and supporting services. Verified against application *behavior*. Tracked with epic templates by grouping (see ICDC SKILL.md Section 7e — Pages / Microservices / Features / Products / Infrastructure / Sandbox / Data).
- **Data management** — managing study data submissions (COTC trials and others), modeling the shape of ICDC's data in `icdc-model-tool`, and loading data into ICDC's **Neo4j + OpenSearch** stack (Dev runs locally; QA / Stage / Prod via Jenkins). Verified against application *contents* and schema state.

Data management has two sub-functions:

- **Loading data** — taking a study's contents (metadata, files, IndexD entries) and getting them into ICDC's databases. Tracked with the **Data Loading Task** template (and its upstream sibling, the **IndexD Registration Task** template).
- **Modeling data** — changing the *shape* of what ICDC's databases can hold. Tracked with the **Data Modeling for Study Submission** template (for the common study-driven case) and the **Data Model Update Task** template (for infrastructure-level model changes).

This README's purpose is to make the data management lane's templates discoverable; the software development lane has its templates inline in SKILL.md Section 7e for now.

---

## Important: differences from CTDC

These templates were ported from the CTDC documentation repo (`CBIIT/ctdc-documentation`) — a sister project under the same Cancer Research Data Commons (CRDC) umbrella that uses many of the same patterns. But CTDC and ICDC are **structurally different** in ways that matter for data management:

| Concept | CTDC | ICDC |
|---|---|---|
| File access control | Open + controlled (two tiers) | **Open access only** |
| Consent codes / `acl` field | Required for controlled studies (e.g., `phs004135.c1`) | **Not applicable** |
| Login required for file downloads | Yes — NIH eRA Commons via CRDC Fence | **No — all files downloadable without login** |
| External handoff for IndexD | Yes — CTDS via CRINTAKE | **Same — CTDS via CRINTAKE + DCF Google Drive (CRINTAKE-478); no `acl`** |
| Data Model repo | `CBIIT/ctdc-model` | `CBIIT/icdc-model-tool` |
| Graph metadata store | Memgraph | **Neo4j** (loader connects via `bolt://…:7687`) |
| Loader repo & script | `CBIIT/crdc-ctdc-dataloader`, Jenkins-run | `CBIIT/icdc-dataloader`, `loader.py` run locally for Dev (`DataLoader` is a class inside `data_loader.py`, not a script) |
| Loading pipeline | All four tiers via Jenkins | **Hybrid — Dev local (`loader.py`), QA/Stage/Prod via Jenkins** |
| Application surface terminology | Participants, Studies, Specimens | **Cases, Studies, Samples** |
| Submission ingestion source | CRDC Submission Portal | **CRDC Submission Portal (COP / COTC trials enter via the Portal)** |
| Submission user story pattern | Program-level (e.g., CTDC-1805) | **Data epic + load Story; `[ICDC-VERIFY]` whether a separate submission Story exists** |

The templates here have been adapted for these differences where the adaptation is obvious. Where it isn't, **`[ICDC-VERIFY]` callouts** flag the assumptions that need Ambar Rana's review before the templates become canonical.

---

## Universal patterns (these DO carry over from CTDC)

The following shape principles apply to all four data management templates and are NOT marked `[ICDC-VERIFY]` — they're agreed conventions:

- **Tasks execute; user stories deliberate.** A Task description carries only what the assignee needs to execute. Open questions, risks, ownership directories, and link inventories belong on the parent user story, not on the Task.
- **No Linked Work section.** Jira's native Links panel (right sidebar) shows Epic Link, Relates links, Blocks links, and remote links. Duplicating this in the description body is noise.
- **No Collaboration & Handoffs section.** Ownership is implicit in the Jira assignee field + comment audit trail.
- **No Open Questions / Risks section on Tasks.** Open questions live on the parent submission user story.
- **Address-row naming discipline.** Submission & Artifacts rows that point at *where things live* hold an address, not a content description (e.g., "Object Files Location" names a bucket; "Release Package" names the source-of-truth S3 path).
- **Italic-em-dash bullet pattern.** `* *Label* — content` for rendering safety on this Jira tracker. NOT `- **Label:** content` (which the MCP converter mangles).
- **Jira-wiki tables** (`||header||` / `|cell|` syntax) — NOT GitHub-flavored Markdown `|h|h|` (which doesn't render reliably on this tracker).
- **Two-step ticket creation.** `jira_create_issue` with a placeholder description, then `jira_update_issue` with the full Markdown body. This avoids long-Markdown rendering issues at create time.
- **`Relates` link to the parent submission user story** is mandatory when one exists. Set via `jira_create_issue_link` after ticket creation.
- **`Relates` link between the paired IndexD Registration Task and the Data Loading ticket** is mandatory when both exist. Registration is paired with, but does not technically block, the load — use `Relates`, not `Blocks`.

---

## Lessons learned

Lessons-learned and revision history for these templates live in **`claude/decisions/`** (ICDC's ADR directory) rather than a `lessons-learned/` subfolder. This matches ICDC's existing ADR pattern.

Look for files prefixed with the template name and dated, e.g., `claude/decisions/2026-05-27-indexd-registration-template-v1-draft.md` (when that decision document is filed).

---

## Chronology

| Date | Event |
|---|---|
| 2026-05-27 | Initial port from CTDC: README, IndexD Registration Task v1-DRAFT, Data Loading Task v1-DRAFT committed |
| 2026-05-28 | Templates revised against first real ICDC tickets (ICDC-4175 / ICDC-4176) + `icdc-dataloader`: Neo4j confirmed (not Memgraph), hybrid Dev-local / Jenkins pipeline, User Story load type, `Relates` (not `Blocks`), reduced five-row artifacts table, most `[ICDC-VERIFY]` items resolved |
| 2026-07-30 | Data Loading Task revised (PR against `main`): slimmed to 4-section shape, corrected loader script name `DataLoader.py` → `loader.py`, added the Dev-local `loader.py` command block (`--dataset`, dry-run then load), named ICDC-4176 canonical. Same fixes applied to the live tickets ICDC-4174 / ICDC-4176. |
| Pending | Data Modeling for Study Submission v1-DRAFT, Data Model Update Task v1-DRAFT, ICDC SKILL.md Section 7 update with decision tree |
| Pending | Ambar Rana review of all four data templates; `[ICDC-VERIFY]` callouts resolved; templates promoted from v1-DRAFT to v1 canonical |

---

## Cross-project note

CTDC and ICDC maintain **separate** template repositories deliberately. Although both projects share patterns (Bento framework, CRDC ecosystem, NCI/CBIIT sponsorship), shared templates would create drift hazards — changes in one project's workflow would silently affect the other.

If a template pattern proves genuinely useful in one project, it can be ported to the other (as this set was ported from CTDC to ICDC), but each project owns its own templates and is responsible for maintaining them against its own workflows.

Reference repo: `CBIIT/ctdc-documentation` → `claude/templates/` for the CTDC versions of these templates.
