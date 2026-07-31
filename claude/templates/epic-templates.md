<!-- Extracted from claude/SKILL.md on 2026-07-31 to slim the skill file. This is the canonical home for this content. -->

## 7e. 🏛️ Epic Templates by Grouping

ICDC epics fall into seven groupings, each with its own template tuned to that grouping's actual concerns. Section **7e-shared** holds the universal rules that apply to **every** template. Section **7e-1** holds the fully-drafted Application Pages template. The other six groupings are named below for stakeholder navigation; their templates will be drafted in focused sessions when a real ICDC example epic is in hand.

**The seven groupings:**

1. **Application Pages** (7e-1) — User-facing pages and surfaces in the ICDC web application (Home, Explore Dashboard, Programs, Program Details, Studies, Study Details, Case Details, File-centric Cart).
2. **Microservices** — Backend services with their own API contract, deployment, and lifecycle (e.g., the Spring Boot backend, the Data Retriever Python ETL, the Interop Node.js service).
3. **Features** — Cross-cutting capabilities that span multiple pages or services (e.g., file download flows, CGC export via Interop, faceted search, Data Model Navigator).
4. **Products** — Standalone deliverables consumed by external systems or end users (e.g., the ICDC application as a whole, manifest format spec, the Data Model itself as a versioned product).
5. **Infrastructure** — Deployment, CI/CD, environments, cloud topology, observability (e.g., Jenkins migrations, environment provisioning, deployment topology changes).
6. **Security** — Authn / authz / audit / compliance / vulnerability response (e.g., ICDC-4120 Invicti security remediation, FedRAMP control implementations, Section 508 conformance).
7. **Data** — Data model, ingestion, releases, indexes (e.g., COTC021 v.2 study data promotions, OpenSearch index updates, Data Model schema evolution).

**When an epic could fit more than one grouping**, choose by **primary engineering ownership**:
- Backend Engineering → Microservices
- DevOps / Platform → Infrastructure
- Federal InfoSec / FedRAMP → Security
- Data Engineering / Stewards → Data
- Frontend Engineering → Application Pages or Features (Application Pages if it scopes a single page; Features if it spans many)

If the choice still isn't clear, default to the grouping whose template most closely matches the epic's actual content. The grouping label is a navigation aid for stakeholders, not a gatekeeping classification.

> **Status as of 2026-05-05:** Only Application Pages (7e-1) is fully drafted. The other six groupings are named here as the stakeholder-facing taxonomy; each will be drafted in a focused session against a real ICDC example epic. See Section 13 (Maintenance Notes) for the status tracker.

---

### 7e-shared. Universal Epic Conventions

These rules apply to **every** epic template, regardless of grouping. The per-grouping section (7e-1, plus 7e-2 through 7e-7 when drafted) inherits these without restating them.

**Authorship & affiliation**
- Preparer: Gina Kuffel, Senior Technical Project Manager
- Organization: Frederick National Laboratory for Cancer Research (FNL/BACS)
- Federal sponsor: NCI / Center for Biomedical Informatics and Technology (CBIIT)
- Program: Cancer Research Data Commons (CRDC)

**Domain content rules**
- **OpenSearch named explicitly** when the epic surfaces aggregations, counts, or facet-driven queries. ICDC's frontend reads OpenSearch (via the BE's GraphQL resolvers) for nearly every data-bearing surface — naming it in scope and dependencies makes the architecture legible to stakeholders.
- **Serving path vs. ingestion path — don't conflate them.** ICDC's *serving (runtime read) path* is OpenSearch: the frontend reads OpenSearch via the Spring Boot backend's GraphQL resolvers for nearly every data-bearing surface. ICDC's *ingestion path* loads study data into **Neo4j**, the graph metadata store the loader writes to via `bolt://…:7687` (`loader.py`, Pathway 1 in Section 2). Both are true at once — they describe different paths. Do **not** write "ICDC has no graph database" (wrong) or "ICDC serves queries from Neo4j" (also wrong). The Memgraph-as-primary-store framing belongs to CTDC, not ICDC.
- **FAIR mission stated.** Connect the epic back to making ICDC data Findable, Accessible, Interoperable, and Reusable somewhere in the description (typically in Context & Background and User Impact).
- **Comparative Oncology Program (COP) framing** appears in user-facing epics where scientific motivation matters. ICDC's mission is to advance human cancer research by studying spontaneous canine tumors — anchor user-facing epics in that purpose. See Section 2 for the full vocabulary.
- **CTDC ↔ ICDC translations.** When mirroring a CTDC pattern, translate node names and relationship names — `case`/`participant`, `sample`/`specimen`, `of_*`/`associated_with`, `file_uuid`/`data_file_uuid`, `clinical_study_designation`/`study_accession`. ICDC uses the per-destination naming convention (`of_case`, `of_study`, `of_sample`, `from_diagnosis`); CTDC uses a single `associated_with` relationship distinguished by `Src`/`Dst` types.

**Three data pathways (ICDC-specific)**

When an epic touches data movement, name the correct pathway from Section 2:
- **Pathway 1 — Study data ingestion via Jenkins `loader.py`** (inbound, batch). Cases, samples, diagnoses, files, clinical-trial metadata.
- **Pathway 2 — External-node data via Data Retriever Python ETL** (inbound, batch, Jenkins-scheduled). IDC + TCIA metadata into OpenSearch `external_data` index.
- **Pathway 3 — CGC export via Interop `storeManifest`** (outbound). Manifest → S3 → CloudFront signed URL → Seven Bridges.

Misframing pathways (e.g., calling the Data Retriever a "real-time microservice" or treating Interop's legacy proxy role as still active) is a significant factual error. See Section 2 for the full reference.

**Vocabulary discipline**
- **Data Model** (the YAML schema content) and **Data Model Navigator / DMN** (the React tool that renders it) are NOT the same thing. Versioning applies to the Data Model, not the DMN. See Section 2 for the full rule.
- Never write "DMN v2.0" or "Data Model Navigator v2.0" in any epic description.

**Epic posture defaults**
- **Priority:** Major (set via MCP, not the description). For application page epics that already exist as evergreen containers (ICDC-2036, etc.), preserve the existing priority unless it's actively wrong.
- **Status:** Open. These are evergreen containers, not work items.
- **Assignee:** Unassigned, unless directed otherwise. Individual child tickets carry the actual ownership.
- **Labels:** Preserve any existing labels. Do not add or remove labels in epic-normalization passes unless deliberately changing them.

**Cross-epic linkage**
- Out of Scope, Dependencies, and Notes sections must point readers to the epics that cover adjacent or excluded work.
- Application page epics cross-reference each other and (when relevant) the security epics, microservice epics, and feature epics that touch them.
- The current Application Pages epic set is: ICDC-2036 (Home), ICDC-2037 (Explore Dashboard), ICDC-2038 (Case Details), ICDC-2040 (Programs), ICDC-2041 (Program Details), ICDC-2061 (Study), ICDC-2063 (Study Details), ICDC-2064 (File-centric Cart).

**Quality bar**
- WCAG 2.1 AA accessibility, design system conformance, performance baselines under realistic data volumes, and automated test coverage appear as Performance & Quality acceptance criteria in every user-facing epic.
- For non-user-facing epics (microservices, infrastructure, security, data), the equivalent quality bar is named in that grouping's template when drafted.

**Verification & ground truth**
- **For Application Pages and Features:** verify the live UI with Playwright (`browser_navigate` + `browser_snapshot`) before drafting. Ground In Scope claims in what the page actually renders. ICDC's production URL is `https://caninecommons.cancer.gov` and routes are hash-based (`#/home`, `#/explore`, `#/studies`, etc.).
- **For Microservices, Infrastructure, Security, Data:** verify against the source repo, deployed config, or live system before drafting. Do not infer scope from imagination. See Section 2's "Verify Before You Write — Architecture Claims Discipline" rule.
- **For all groupings:** the rendered Jira UI is the only ground truth for description rendering. Wiki source returned by `jira_get_issue` does not reveal rendering state and looks identical for working and broken tickets — only a UI screenshot tells the truth.

**Markdown conventions**
- **The `description` field expects Markdown input, not Jira wiki markup.** The `jira_update_issue` MCP tool docs are explicit: "for 'description', provide text in Markdown format." Markdown is converted server-side into Jira-wiki for storage. **If you write Jira-wiki by mistake (`*bold*`, `h3.`, `#` for ordered lists), the tool interprets the asterisks as Markdown italic emphasis and converts them to underscores — so your bold headers render as italic.** Always author in Markdown:

  | Want | Write (Markdown) | Don't write (Jira-wiki) |
  |---|---|---|
  | h3 heading | `### **Title**` | `h3. *Title*` |
  | Bold | `**bold**` | `*bold*` |
  | Italic | `*italic*` | `_italic_` |
  | Bullet | `- item` | `* item` |
  | Numbered | `1. item` (auto-increments) | `# item` |
  | Table | Jira-wiki `||h||` and `|c|` (passes through unchanged — see "Risk format" below) | (same — tables are the exception) |

- Section headers: `### {emoji} **{Title}**` (h3, emoji + bold).
- Bullets are flush-left; no indented `-` bullets with bold labels.
- Use `**bold**` for emphasis (matched delimiters).
- Inline route templates: plain text without backticks, but **escape every curly brace as `\{` and `\}`** (e.g., `#/study/\{study_code\}`). See "MCP write notes" below for why this is required. Backticks are fine for single-token names like `externalDataOverview` or `customfield_12350`.
- **Curly-brace rule (universal).** Anywhere curly braces appear in description text — URLs with path parameters, scope items naming a variable, acceptance criteria, glossary entries, notes, anywhere — escape them with backslashes: `\{study_code\}`, not `{study_code}`. The only exception is text inside a fenced code block, where the renderer treats content as literal. The Markdown source you author with backslash-escapes will round-trip into Jira-wiki as `\{...\}` and render in the UI as literal `{...}` with no parser-state corruption.

**MCP write notes (description field caveat)**

The Jira-wiki renderer treats `{...}` as **macro syntax** — `{code}`, `{noformat}`, `{panel}`, `{color}`, etc. When the renderer encounters an unknown macro name like `{study_code}`, the parser does not gracefully fail back to literal text. Instead, parser state gets corrupted for the surrounding block, and the corruption propagates *forward* through the document. Symptoms include:

- Adjacent headers losing their `h3.` recognition and rendering as literal `h3.` text
- Bullets after the offending point losing their list context
- Some headers disappearing entirely (no `h3.` prefix, just bare bold text on a line)
- Paragraph layout fracturing right at the `{...}` occurrence

The fix is straightforward: **escape every curly brace in description text as `\{...\}`** per the Markdown conventions rule above.

**Workflow:**

1. Author Markdown with `\{...\}` escaping anywhere curly braces appear in body text.
2. Push the description via the MCP (`jira_update_issue` with the `description` field).
3. **Verify the render with a UI screenshot from the user**, not the wiki source. Wiki source returned by `jira_get_issue` is unreliable as a render preview.
4. **If rendering is broken**, the most likely cause is unescaped curly braces somewhere in the description. Re-check the source for any `{...}` not preceded by a backslash.
5. **Last-resort fallback:** if the source is clean and the render is still broken, ask the user to re-paste the description through the Jira web UI's Description field. The UI normalizes whatever transport-level state the MCP introduced. This is rarely needed once the curly-brace rule is followed.

**Other fields are safe via MCP.** Priority, summary, custom fields, status transitions, and labels write reliably through `jira_update_issue` because they don't go through the wiki-text renderer.

**Risk format**

Risks render as a three-column **table**, not a bullet list. The table format reads better than prose-style "Risk: / Mitigation:" bullets — it gives the eye a clean three-column scan and looks more polished in stakeholder-facing rendering. Per-grouping templates may define their own risk format if their content genuinely needs prose, but the default is the table.

**Format (Jira wiki table syntax — passes through Markdown unchanged):**

```
### ⚠️ **Risks & Mitigations**
||Risk||Impact||Mitigation||
|External-node API drift|External data displays go stale|Data Retriever ETL surfaces failures via SNS; TPM monitors and triages|
|Data Model schema changes break loaders|Study data fails to load|Coordinate with Data Engineering on schema review before merging model PRs|
```

**Why Jira-wiki tables in a Markdown document?** The MCP's Markdown→Jira-wiki conversion does not handle GitHub-flavored Markdown tables (`| h | h |` / `|---|---|`) reliably for this MCP server's converter. Jira-wiki table syntax (`||h||` for headers and `|c|` for cells) passes through the converter unchanged and lands as a native Jira table. This is the one intentional exception to the "always author in Markdown" rule above.

---

### 7e-1. 🏛️ Application Pages (Drafted)

> **Use this template for every epic that scopes an ICDC application page or major user-facing surface.** The canonical examples are Home (ICDC-2036), Explore Dashboard (ICDC-2037), Case Details (ICDC-2038), Programs (ICDC-2040), Program Details (ICDC-2041), Study (ICDC-2061), Study Details (ICDC-2063), and File-centric Cart (ICDC-2064).

**Why this template**

These are **ongoing, evergreen epics** that remain Open across the life of the project. They serve as containers for all enhancements, bug fixes, and data-integration updates to a given page or surface. The structure makes them readable to engineers, PMs, and federal stakeholders without a Jira learning curve, and the section emojis act as visual anchors when scanning a long description.

**Section order (15 sections, exactly this sequence)**

Each section header is an `h3` Markdown heading using the emoji + bold title format shown. Do not omit, reorder, or merge sections. If a section genuinely has no content, state so explicitly (e.g., "None at this time") rather than dropping the header — that absence is itself a signal.

1. `### 🎯 **Epic Summary**` — One paragraph: what the epic delivers, the live URL, who consumes it, and the explicit statement that it is an ongoing epic tracking initial implementation, enhancements, bug fixes, and data-integration updates across the life of the ICDC project.
2. `### 🧬 **Context & Background**` — Two paragraphs: (a) what ICDC is and its FAIR mission within CRDC, with COP framing where relevant, (b) what this specific page/surface does, what data it surfaces, and where the data comes from (which OpenSearch indices via which BE GraphQL resolvers).
3. `### 🏁 **Goal / Objectives**` — Bullet list of 3–5 concrete objectives the page must achieve.
4. `### 🗺️ **Scope**` — Two sub-blocks, **In Scope** and **Out of Scope**, each as a bullet list. In Scope items must be verifiable against the live page (use Playwright to ground claims). Out of Scope items should explicitly point to the epic that covers the excluded work (e.g., *"CGC export from the cart manifest (see ICDC-2064 and the Interop service epic)"*).
5. `### 👥 **Stakeholders**` — Bullet list of the standard stakeholder set: Product Owner, Senior TPM (FNL/BACS), NCI/CBIIT Federal Program Leadership, COP scientific community (where the page surfaces COP-relevant data), UX/UI Designer, Frontend Engineering Team (ESI), Backend/API Engineering Team (ESI), Data Engineering Team, Data Stewards, QA/Testers. Adjust only if a role is genuinely irrelevant.
6. `### 📖 **Key Definitions / Concepts**` — Glossary of terms specific to the page or surface. Always include **OpenSearch** and the relevant index names (`cases`, `samples`, `studies`, `external_data`, etc.) when the page reads ICDC data. Include **DMN** if the page integrates with the Data Model Navigator.
7. `### ✅ **Success Metrics / Acceptance Criteria**` — Two sub-blocks: **Functional** (numbered list) and **Performance & Quality** (numbered list). Functional criteria must be verifiable on Dev/QA/Stage/Prod. Performance & Quality must include WCAG 2.1 AA, design system conformance, performance baselines under realistic data volumes, and automated test coverage.
8. `### 🔗 **Dependencies**` — Bullet list of upstream systems, services, and sibling epics this page relies on. Always name OpenSearch and the relevant BE GraphQL resolver families. When the page surfaces external-node data (e.g., IDC/TCIA imaging), name the Data Retriever ETL pathway and the `external_data` index.
9. `### 💭 **Assumptions**` — Bullet list of working assumptions (data model evolves backward-compatibly, content ownership, throughput envelope, COP-data availability cadence, etc.).
10. `### 🚧 **Constraints**` — Bullet list of non-negotiables: security/privacy/Section 508, performance under growth, external link freshness if applicable, and ICDC's open-access stance (no authentication required for the public site).
11. `### ⚠️ **Risks & Mitigations**` — Three-column table per the universal "Risk format" convention in 7e-shared. Columns: Risk | Impact | Mitigation. Cover at least: data drift, performance regression, scope creep from data-model changes, and surface-specific risks (link rot, external-node API drift, data-load delay against release window, etc.).
12. `### 🌟 **User Impact**` — Single short paragraph (3–5 sentences) tying the page back to ICDC's FAIR mission and the researcher's actual experience. Where the page exists to advance the COP scientific community's needs, name that explicitly. This is the section that survives in stakeholder summaries.
13. `### 🧩 **Components / Features Breakdown**` — Four sub-blocks, each with a bold sub-heading and bullet list: **UI Components**, **Backend / Data**, **Integration**, **Testing**.
14. `### 📋 **Documentation & Compliance**` — Bullet list: user-facing help content, data dictionary alignment, accessibility conformance review cadence, and any cross-epic integration documentation requirements.
15. `### 📝 **Notes**` — Bullet list. Always include: (a) the standing-epic statement that this remains Open across the project life with child tickets attached for individual enhancements, (b) the cross-reference list to all related Application Pages epics (Home, Explore Dashboard, Case Details, Programs, Program Details, Study, Study Details, File-centric Cart), and (c) any stack-wide reference (e.g., the Interop CGC export pathway, the Data Retriever pathway) when relevant.

**Standing emoji set (use these, not substitutes)**

| Section | Emoji | Section | Emoji |
|---|---|---|---|
| Epic Summary | 🎯 | Dependencies | 🔗 |
| Context & Background | 🧬 | Assumptions | 💭 |
| Goal / Objectives | 🏁 | Constraints | 🚧 |
| Scope | 🗺️ | Risks & Mitigations | ⚠️ |
| Stakeholders | 👥 | User Impact | 🌟 |
| Key Definitions | 📖 | Components Breakdown | 🧩 |
| Acceptance Criteria | ✅ | Documentation & Compliance | 📋 |
| | | Notes | 📝 |

**Required content rules (Application Pages specific — universal rules in 7e-shared also apply)**

- **Live URL named in Epic Summary.** Use the production URL (e.g., `https://caninecommons.cancer.gov/#/studies`). For pages that don't yet exist in production, state explicitly that the page is forward-looking and note what entry point the page will have when delivered.
- **Live UI verified before drafting.** Use Playwright (`browser_navigate` + `browser_snapshot`) on the production URL. If the route 404s because the page is forward-looking, verify the *adjacent* page that will provide the entry point (e.g., the Explore Dashboard's facet panel for a future Case Details page) and explicitly note the future-state stance in the epic.
- **Cross-epic references threaded.** Out of Scope, Dependencies, and Notes must point to the related Application Pages epics and to the Interop / Data Retriever / Microservices epics when relevant.
- **WCAG 2.1 AA + design system + performance baselines + automated tests** appear in Performance & Quality, every time.
- **Curly braces escaped as `\{...\}`** anywhere they appear in description text. URLs with path parameters, scope items naming a variable, acceptance criteria — all of them. See 7e-shared "Markdown conventions" and "MCP write notes."
- **Open-access stance explicit.** Where authentication or controlled-access framing might creep in (e.g., from a CTDC pattern), explicitly call out that ICDC is open-access — the public application requires no login.

**Application Pages roster (current Open epics)**

When normalizing or drafting an Application Pages epic, cross-reference these:

| Epic | Page | Live URL |
|---|---|---|
| ICDC-2036 | Home | `https://caninecommons.cancer.gov/#/home` |
| ICDC-2037 | Explore Dashboard | `https://caninecommons.cancer.gov/#/explore` |
| ICDC-2038 | Case Details | `https://caninecommons.cancer.gov/#/case/\{case_id\}` |
| ICDC-2040 | Programs | `https://caninecommons.cancer.gov/#/programs` |
| ICDC-2041 | Program Details | `https://caninecommons.cancer.gov/#/program/\{program_short_name\}` |
| ICDC-2061 | Study | `https://caninecommons.cancer.gov/#/studies` |
| ICDC-2063 | Study Details | `https://caninecommons.cancer.gov/#/study/\{clinical_study_designation\}` |
| ICDC-2064 | File-centric Cart | `https://caninecommons.cancer.gov/#/fileCentricCart` |

> **ICDC-2037 history note:** This epic was originally titled "Tickets affiliated with the ICDC cases page" with route `#/cases`. The standalone Cases page no longer exists in production (`#/cases` returns 404); the case-browsing experience lives on the Explore Dashboard at `#/explore`. The epic was retitled "ICDC Explore Dashboard" on 2026-05-05. The description body still references the legacy cases page and should be normalized to match the new title in a future pass.

**Writing-and-publishing workflow**

1. **Verify the live page** with Playwright before drafting. Note the actual route, headers, tabs, widgets, table columns, and external links.
2. **Draft the description** in Markdown with all 15 sections in order, applying the section emojis and content rules above. Apply the universal Markdown conventions from 7e-shared, including the curly-brace escaping rule.
3. **Push the description via the MCP** (`jira_update_issue` with the `description` field).
4. **Set non-description fields via the MCP** in the same call: `priority` to Major if not already set, plus any other fields you intend to set. Never include `labels` unless deliberately changing them.
5. **Verify the rendered description with a UI screenshot** from the user. The wiki source is unreliable as a render preview.
6. **If rendering is broken**, first re-check the Markdown source for any unescaped `{...}` — that's the most likely cause. If the source is clean and the render is still broken, fall back to UI paste.
7. **Update the related-epics cross-reference list** in the Notes section of every other Application Pages epic when a new page epic is added or an existing one is retitled.

---

### 7e-4. 📦 Products (Drafted)

> **Use this template for every epic that scopes a standalone deliverable consumed by external systems or end users.** Anchor example: ICDC-4134 (synthetic data generator). Other examples include the ICDC Data Model itself as a versioned product, manifest format specifications, and any tool published publicly to GitHub or Hugging Face Spaces for use by data submitters or downstream commons.

**The full template lives at** `claude/templates/7e-4-products.md` in this repo.

**Why a separate file:** SKILL.md is already large; per-grouping templates are referenced rather than embedded so the operational sections (1–6, 8–14) stay scannable. The fragment file is the canonical source of truth for the Products template — fetch it on demand when drafting or normalizing a Products epic.

**Quick reference — what's in the fragment:**

- **Section order:** identical to 7e-1 (15 sections, same emojis, same order).
- **Content rules tuned for Products:** distribution channels (GitHub, Hugging Face Spaces, PyPI, npm) instead of live URLs; predecessor product cross-reference (e.g., the existing Bento Data Generator); cold-start and zero-data generation modes considered; reproducibility, contextual fidelity, and schema conformance as the Performance & Quality bar; open-source license stance and no-PHI/PII constraint stated explicitly.
- **Components Breakdown sub-blocks:** Generation Engine / Configuration & Inputs / Distribution & Documentation / Testing (UI optional).
- **Verification workflow:** verify the public repo state, the schema source on `icdc-model-tool`, and any predecessor product README before drafting.

**When to fetch the fragment:**

- Drafting a new Products epic — read `claude/templates/7e-4-products.md` first
- Normalizing or refreshing an existing Products epic
- Auditing whether a candidate epic belongs in Products vs. Microservices vs. Features (the fragment's "why this template" section is the deciding lens)

**When the fragment changes:**

- Update the fragment in `claude/templates/7e-4-products.md`
- Note the change here if it affects the Quick Reference summary above
- Consider a normalization pass across all existing Products epics so they stay consistent — see Section 13 (Maintenance Notes)

---

