<!-- Extracted from claude/SKILL.md on 2026-07-31 to slim the skill file. This is the canonical home for this content. Rewritten to the lean shape on 2026-10-13. -->

## 7e. 🏛️ Epic Template (Lean v2.1)

> **Use this template for every ICDC epic**, whatever it covers (a page feature, a microservice, a product, infrastructure, security), except the standing data epic (7e-D) and the monthly Invicti scan epics, which keep their own template (`invicti-scan-epic-template.md`). It mirrors CTDC's Lean v2.1 epic template (`CBIIT/ctdc-documentation → claude/SKILL.md`, Section 7b) section for section; the two are kept in lockstep. Canonical ICDC example: **ICDC-4264 (ICDC Announcements and News Page Updates)**, drafted 2026-10-13.
>
> **v2.1 (2026-10-13): replaces the v1 per-grouping templates.** The v1 Application Pages template (15 sections) and Products template (15 sections, `7e-4-products.md`, now retired) produced long epic bodies that nobody read, and the Application Pages template assumed one standing epic per page. Per Gina's direction (2026-10-09) ICDC no longer keeps page-level or functional-area standing epics: page work goes into **feature epics** that close when the feature ships, or a yearly **"<Area> Improvements YYYY"** epic for small items, which closes on December 31 with leftovers moved to the next year's epic. The fourth section is the **Definition of Done**, not Acceptance Criteria (2026-10-13): Acceptance Criteria are testable conditions on a user story, and an epic is not tested; it closes when its children are done.

**Why this template**

An epic is a container over its child stories, not a design document. The body does four things: states the goal, objectives, and why; describes the mechanism in one breath; draws the scope line; and states what must be true to close it. Anything longer duplicates the children or goes stale. The target is **under 600 words**; content that does not fit belongs in a child story, a comment, or a stakeholder document.

**Naming**

* *Feature epic* (the default): named for what it delivers, for example `ICDC Announcements and News Page Updates` or `Study Details: Human Relevance Tab`. Closes when the feature ships.
* *Yearly improvement epic*: `<Area> Improvements YYYY`, for example `Home Page Improvements 2026`, only for small items that do not merit a feature epic. Closes on December 31; open children move to the next year's epic.
* The Epic Name field (`customfield_12351`) is set to the same string as the summary.

**Card line + section order (card line, then 5 sections, exactly this sequence)**

Each section header is a Jira wiki `h3.` heading using the emoji + bold title format shown (`h3. 🎯 *Epic Statement*`; see "Authoring format" below). Do not omit, reorder, or merge sections. If a section genuinely has no content, state "None at this time" rather than dropping the header.

0. **Card line**: the first line of the description, with no header. One plain sentence, 140 characters or fewer, saying what the epic delivers in terms Federal Leadership would use. No markup, emoji, ticket keys, or heading; follow it with one blank line, then the 🎯 heading. It is what the Federal Leadership epic Kanban board shows on each card. Example (ICDC-4264): *"Keeps the ICDC News page current with the latest data model releases, software releases, and study publications."*
1. `h3. 🎯 *Epic Statement*`: One paragraph stating the **goal**, the **objectives**, and **why** the work is being done. Not a user story: the As a / I want / So that form belongs to the child stories. Name the two to four objectives that define the outcome and the value that justifies it; FAIR and, for user-facing work, the comparative oncology purpose are stated here where they fall naturally.
2. `h3. 🧬 *Description*`: Two short paragraphs. (a) How it works: the surface(s) it lives on with the route, the services and data stores involved, and the data pathway when data moves (see "Domain content rules"). (b) What this epic's phase delivers (design, frontend, backend, DevOps, defect fixes) and the release it shipped in or targets. Ground (a) in the canonical repo and the live UI, not in ticket titles.
3. `h3. 🗺️ *Scope*`: Two sub-blocks, *In Scope* and *Out of Scope*, about five bullets each. Out of Scope names adjacent or excluded work in prose (never by ticket key) and ends with the bullet that future enhancements will be scoped as a new epic.
4. `h3. ✅ *Definition of Done*`: A numbered list of three to five closure conditions: what must be true for this epic to close. Write them as outcomes, not test steps. The epic itself is not tested: verification happens in its child stories and tasks, whose Acceptance Criteria carry the testable detail. No quality-bar item: The quality bar (Section 508 and WCAG 2.1 AA accessibility, ICDC design system conformance, page performance) is a team-wide standard that QA checks on every story and release. It is not written into user stories, tasks, or epics (TPM decision, 2026-10-13).
5. `h3. 📝 *Notes*`: Two or three bullets at most: the phase statement (complete and the release it shipped in, or what closes it), and the canonical repos with branch. Nothing else.

**Standing emoji set (5 entries)**

| Section | Emoji |
|---|---|
| Epic Statement | 🎯 |
| Description | 🧬 |
| Scope | 🗺️ |
| Definition of Done | ✅ |
| Notes | 📝 |

**Required content rules**

- **Card line first.** Line 1 is the card line, exactly one sentence of 140 characters or fewer, then a blank line.
- **Under 600 words** for the five sections (the card line is not counted). Count before pushing.
- **No ticket keys in the body.** Related work is named in prose; the Epic Link field and Jira's Links panel carry the relationships.
- **Grounded before drafting.** Verify the live UI with Playwright for anything user-facing, and read the canonical repo for the mechanism in the Description. Child ticket summaries are not a substitute.
- **Open access stated where it matters.** ICDC is open access: the public application requires no login. Say so wherever a CTDC pattern might import controlled-access framing.
- **Underscored identifiers in `{{...}}` monospace** and **curly braces escaped as `\{...\}`** (see "Authoring format").
- **Not evergreen.** Feature and yearly improvement epics close; only the standing data epic in 7e-D stays Open.

**Writing-and-publishing workflow**

1. **Verify** the hosting surface (Playwright on `https://caninecommons.cancer.gov`, hash routes such as `#/explore`) and the canonical repo before drafting.
2. **Draft** the card line and all 5 sections in Jira wiki markup. Check the word count.
3. **Push**: for a new epic, `jira_create_issue` (`issue_type = "Epic"`, a one-line placeholder description, `customfield_12351` set to the summary, priority Major), then `jira_update_issue` with the description in `additional_fields` as `{"description": "..."}`. Never touch `labels` unless deliberately changing them.
4. **Move children** by setting `{"customfield_12350": "ICDC-XXXX"}` on each child, then confirm with `"Epic Link" = ICDC-XXXX`.
5. **Verify the render with a UI screenshot** from the user; wiki source is not a render preview.
6. **Close the epic** (transition `Closed`, no resolution) with a short comment naming the release, once every child ticket is Closed.

---

### 7e-D. Data Epic Variant (Lean v2.1-D)

> **Use this variant only for a standing data epic**, such as ICDC Internal Data Modeling (ICDC-4266, canonical example, 2026-10-13). Study submissions do not use this variant: each submission is its own closing epic built from `data-submission-epic-template.md` (ported from CTDC DO-EPIC, 2026-10-13). Everything in 7e applies except where this subsection says otherwise.

A feature epic delivers something and closes. A standing data epic is a pipeline: model changes, submissions, and loads keep arriving, and each is a child ticket that opens and closes on its own. The body describes how work flows through the epic, not what one phase delivers.

**Card line + section order (card line, then 7 sections, exactly this sequence)**

0. **Card line**: same rule as 7e item 0.
1. `h3. 🎯 *Epic Statement*`: same as 7e.
2. `h3. 🧬 *Description*`: Two short paragraphs. (a) How the work runs: the repo, files, and branches the work changes. For a data modeling epic that is the model itself (`CBIIT/icdc-model-tool`, `icdc-model.yml` and `icdc-model-props.yml`, `develop` to `master`, the version history the Data Model Navigator displays); the act of loading study data (running the loader, promoting a study through the tiers) is data management and does not belong in a modeling epic; the stores and services built on the model schema still appear as downstream consumers. (b) How child work is tracked: the child naming pattern and the event that closes each child. No list of active studies or releases in the body.
3. `h3. 🗺️ *Scope*`: *In Scope* and *Out of Scope*, about five bullets each. Out of Scope names the sister data epics in prose. Omit 7e's closing "new epic" bullet.
4. `h3. 🔗 *Upstream & Downstream*`: Two labeled sub-lists, *Upstream* (what must be true before this work starts) and *Downstream* (who consumes what it produces), two to four bullets each, named in prose.
5. `h3. ✅ *Definition of Done*`: Three to five **standing** conditions, each phrased "Every <child, release, or load> ...": the bar each child must meet to close, since the standing epic itself does not close. A data promotion constraint (for example, no direct loads to Prod) is one item here.
6. `h3. ⚠️ *Risks & Mitigations*`: Required. A Jira wiki table `||Risk||Impact||Mitigation||` with three to six rows of standing risks only; a risk tied to one study or release goes on that child ticket.
7. `h3. 📝 *Notes*`: Two or three bullets: the Standing line ("Standing: stays Open for the life of the ICDC project; each child closes when <event>.") and the canonical repos with branch.

**Content rules that differ from 7e**: under 800 words including the Risks table; standing, not closed; the word "evergreen" is not used. **The model, not the data loading:** a modeling epic covers the shape of the model, not the act of loading study data. Upstream & Downstream names everything built on the model schema: Neo4j, OpenSearch, and the backend (a breaking change can require updated backend queries and index mappings), plus the Data Model Navigator, schema conversion tooling, synthetic data generation, and submission validation. The downstream impact list in the Definition of Done covers those same consumers. The Definition of Done holds no data-loading condition: running the loader and promoting a study's data through the tiers is verified on the data management tasks.

---

### 7e-shared. Universal Epic Conventions

These rules apply to every ICDC epic, including 7e-D.

**Authorship & affiliation**
- Preparer: Gina Kuffel, Senior Technical Project Manager
- Organization: Frederick National Laboratory for Cancer Research (FNL/BACS)
- Federal sponsor: NCI / Center for Biomedical Informatics and Technology (CBIIT)
- Program: Cancer Research Data Commons (CRDC)

**Domain content rules**
- **OpenSearch named explicitly** when the epic surfaces aggregations, counts, or facet-driven queries. ICDC's frontend reads OpenSearch (via the backend's GraphQL resolvers) for nearly every data-bearing surface.
- **Serving path vs. ingestion path: don't conflate them.** ICDC's *serving (runtime read) path* is OpenSearch via the Spring Boot backend's GraphQL resolvers. ICDC's *ingestion path* loads study data into **Neo4j**, the graph metadata store the loader writes to via `bolt://…:7687` (`loader.py`, Pathway 1 in Section 2). Do **not** write "ICDC has no graph database" (wrong) or "ICDC serves queries from Neo4j" (also wrong). The Memgraph-as-primary-store framing belongs to CTDC, not ICDC.
- **FAIR mission stated** where it falls naturally, usually in the Epic Statement's "why".
- **Comparative Oncology Program (COP) framing** appears in user-facing epics where scientific motivation matters: ICDC advances human cancer research by studying spontaneous canine tumors. See Section 2 for the full vocabulary.
- **CTDC ↔ ICDC translations.** When mirroring a CTDC pattern, translate node and relationship names: `case`/`participant`, `sample`/`specimen`, `of_*`/`associated_with`, `file_uuid`/`data_file_uuid`, `clinical_study_designation`/`study_accession`.

**Three data pathways (ICDC-specific)**

When an epic touches data movement, name the correct pathway from Section 2:
- **Pathway 1: Study data ingestion via `loader.py`** (inbound, batch; Dev local, QA/Stage/Prod through Jenkins). Cases, samples, diagnoses, files, clinical-trial metadata.
- **Pathway 2: External-node data via the Data Retriever Python ETL** (inbound, batch, scheduled). IDC and TCIA metadata into the OpenSearch `external_data` index.
- **Pathway 3: CGC export via Interop `storeManifest`** (outbound). Manifest to S3 to CloudFront signed URL to Seven Bridges.

**Vocabulary discipline**
- **Data Model** (the YAML schema content) and **Data Model Navigator / DMN** (the React tool that renders it) are not the same thing. Versioning applies to the Data Model, not the DMN. Never write "DMN v2.0".

**Epic posture defaults**
- **Priority:** Major (set via MCP, not the description).
- **Status and lifecycle:** Open while child work is in flight; **Closed** when the epic is delivered or retired. Epics are not evergreen containers (TPM decision, 2026-10-09: page-level and functional-area standing epics are retired in favor of feature epics and yearly area improvement epics). Close via the `Closed` transition (id 31 on the epic workflow both projects share since 2026-10-01); **no resolution is set or required on epics**. An epic is either Open or Closed: the children's resolutions record how the work ended, and the closing comment states whether the epic was **delivered** (name the release) or **retired** (why). To find open epics, query `statusCategory != Done`, never `resolution = Unresolved` (closed epics carry no resolution, so resolution-based filters would count them as open). TPM decision, 2026-10-13.
- **Assignee:** Unassigned, unless directed otherwise. Child tickets carry the actual ownership.
- **Labels:** Preserve any existing labels. Do not add or remove labels in epic passes unless deliberately changing them.

**Quality bar**
- The quality bar (Section 508 and WCAG 2.1 AA accessibility, ICDC design system conformance, page performance) is a team-wide standard that QA checks on every story and release. It is not written into user stories, tasks, or epics (TPM decision, 2026-10-13).

**Verification & ground truth**
- **User-facing work:** verify the live UI with Playwright (`browser_navigate` + `browser_snapshot`) before drafting. Production is `https://caninecommons.cancer.gov` and routes are hash-based (`#/home`, `#/explore`, `#/studies`, `#/study/\{clinical_study_designation\}`, `#/fileCentricCart`).
- **Services, infrastructure, security, data:** verify against the source repo, deployed config, or live system before drafting. See Section 2's "Verify Before You Write: Architecture Claims Discipline" rule.
- **Rendering:** the rendered Jira UI is the only ground truth; wiki source from `jira_get_issue` looks identical for working and broken tickets.

**Authoring format (Jira wiki, since 2026-10-09)**
- **The `description` field takes Jira wiki markup, stored exactly as sent.** The shared Jira connector runs with `DISABLE_JIRA_MARKUP_TRANSLATION=true`, so nothing converts Markdown (raw `###` and `**` appear on the page if sent). See `claude/templates/README.md`, "Universal patterns", for the full list.

  | Want | Write (Jira wiki) |
  |---|---|
  | h3 heading | `h3. 🎯 *Title*` |
  | Bold | `*bold*` |
  | Italic | `_italic_` |
  | Bullet | `* item` |
  | Numbered | `# item` |
  | Table | `||h||` header row, `|c|` data rows |

- Bullets and numbered items are flush-left at column 0.
- **Curly-brace rule (universal).** Anywhere curly braces appear in description text, escape them: `\{study_code\}`, not `{study_code}`. The only exception is the `{{monospace}}` and `[text|url]` wiki syntax itself.

**MCP write notes (why the curly-brace rule exists)**

The Jira wiki renderer treats `{...}` as **macro syntax** (`{code}`, `{noformat}`, `{panel}`, `{color}`). An unknown macro name like `{study_code}` corrupts the parser state for the surrounding block, and the damage propagates forward: headers render as literal `h3.` text, bullets lose their list context, and paragraphs fracture at the `{...}`. If a render breaks, re-check the source for any unescaped `{...}` first; as a last resort, re-paste the description through the Jira web UI. Priority, summary, custom fields, status transitions, and labels write reliably through `jira_update_issue` because they do not pass through the wiki renderer.

**Risk format (7e-D and any epic that needs one)**

```
h3. ⚠️ *Risks & Mitigations*
||Risk||Impact||Mitigation||
|External-node API drift|External data displays go stale|Data Retriever ETL surfaces failures via SNS; TPM monitors and triages|
|Data Model schema changes break loaders|Study data fails to load|Coordinate with Data Engineering on schema review before merging model PRs|
```
