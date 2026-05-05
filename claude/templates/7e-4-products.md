### 7e-4. 📦 Products (Drafted)

> **Use this template for every epic that scopes a standalone deliverable consumed by external systems or end users.** Canonical examples include the synthetic data generator (ICDC-4134), the ICDC Data Model itself as a versioned product, manifest format specifications, and any tool published publicly to GitHub or Hugging Face Spaces for use by data submitters or downstream commons.

**Why this template**

Products differ from Application Pages in three ways: they have **distribution channels** instead of live URLs (GitHub, Hugging Face Spaces, PyPI, npm), they have **release cadence** rather than continuous deployment, and their users are typically **outside the ICDC team** — data submitters, sister commons, or open-source contributors. The 15-section structure carries over from 7e-1, but specific sections re-tune to those differences.

**Section order:** identical to 7e-1 (15 sections, same emojis, same order). What changes is the **content rules** in specific sections — see the table below.

| Section | Application Pages (7e-1) rule | Products (7e-4) rule |
|---|---|---|
| 🎯 Epic Summary | Live URL named (production hash route) | **Distribution channels named** — public GitHub repo, package registry (PyPI/npm/Hugging Face Spaces), and any published documentation entry point |
| 🧬 Context & Background | Page purpose + which OpenSearch indices feed it | **Product purpose + relationship to the Data Model** (`icdc-model-tool` as authoritative schema source) + relationship to any predecessor product (e.g., the existing Bento Data Generator) |
| 🏁 Goal / Objectives | 3–5 page-functional objectives | 3–6 product-functional objectives, **at least one of which addresses contextual fidelity** (output that is scientifically meaningful, not random) |
| 🗺️ Scope | In/Out scope verifiable against the page | In/Out scope verifiable against **the public repo and published artifacts**. Out of Scope must call out adjacent products (e.g., the existing Bento Data Generator) and state why the new product doesn't replace them |
| 📖 Key Definitions | OpenSearch indices, DMN if relevant | **Both data sources** (`icdc-model-tool` repo files + ICDC's loaded data via OpenSearch — Pathway 1's output), **Bento Data Generator** if the product extends it, **caDSR** if CDE integration is in scope, **cold-start mode** and **zero-data mode** as named generation modes |
| ✅ Acceptance Criteria — Functional | Verifiable on Dev/QA/Stage/Prod | Verifiable against the **public repo + published distribution** — README completeness, reproducibility of generation, contextual fidelity tests, sample output validates against `icdc-model-tool` schema |
| ✅ Acceptance Criteria — Performance & Quality | WCAG 2.1 AA, design system, performance baselines, automated tests | **Reproducibility** (deterministic given a seed), **contextual fidelity** (intra-node and cross-node validation), **schema conformance** (output validates against `mdf-schema.yaml`), automated test coverage, **public README quality bar** (install → run → output documented end-to-end) |
| 🔗 Dependencies | OpenSearch + BE GraphQL resolvers + sibling pages | `icdc-model-tool` schema files, predecessor product (Bento Data Generator) if extending, `caDSR` if integrating CDEs, the **ICDC Neo4j-loaded data via OpenSearch** if real-data sampling is used, **deployment target** (Hugging Face Spaces, etc.) |
| 🚧 Constraints | Section 508, performance, ICDC open access | **Open-source license compliance**, **no PHI/PII in output** (synthetic data only), **public-distribution security** (no embedded credentials, secrets, or non-public data), Section 508 if there is a UI component |
| ⚠️ Risks & Mitigations | Three-column table, page-specific risks | Three-column table, **must include at least:** schema drift between `icdc-model-tool` releases and the product, contextual fidelity gaps for cold-start / zero-data scenarios, public-distribution security, downstream commons divergence (when reused by sister commons) |
| 🌟 User Impact | FAIR + COP framing | FAIR + COP framing + **explicit data-submitter framing** (concrete, validated examples reduce failed loads) + **CRDC ecosystem reuse** (configurable for sister commons per the multi-commons synchronization theme) |
| 🧩 Components Breakdown | UI / Backend-Data / Integration / Testing | **Generation Engine / Configuration & Inputs / Distribution & Documentation / Testing**. UI is optional; some products are CLI-only |
| 📋 Documentation & Compliance | User help content, data dictionary alignment, accessibility cadence | **Public README**, **CHANGELOG.md tied to releases**, **data dictionary alignment with `icdc-model-tool`**, **license file**, contributor guide if open to community contribution |
| 📝 Notes | Standing-epic statement + Application Pages cross-ref | Standing-epic statement + **predecessor / sibling product cross-ref** (e.g., Bento Data Generator) + **Microservices / Data epic cross-ref** when relevant + **explicit statement of which data pathway the product reads from or writes to** if it touches one |

**Required content rules (Products specific — universal rules in 7e-shared also apply)**

- **Distribution channels named in Epic Summary.** Public GitHub URL is mandatory; secondary channels (Hugging Face Spaces, PyPI, npm) named when applicable. If the product is forward-looking and not yet published, state that explicitly and name the planned channels.
- **Predecessor relationship explicit.** Many ICDC products extend prior CRDC tooling (the synthetic data generator extends Bento Data Generator). Always name the predecessor in Context & Background, state what the new product adds, and state in Out of Scope that the predecessor is not replaced.
- **Cold-start and zero-data modes considered.** For data-generation products, both modes (no real data available; only the model definition available) must appear somewhere in the epic — at minimum as Risks if not yet addressed in Scope.
- **Source of truth for the Data Model is `icdc-model-tool`.** Never reference the DMN as a Data Model source — the DMN renders the model, it does not author it. Per 7e-shared vocabulary discipline.
- **Open-source license stance explicit.** ICDC products are public open-source by default. State the license (typically MIT or Apache 2.0) in Documentation & Compliance.
- **No PHI/PII risk acknowledged.** Even though ICDC is canine data and the public site is open-access, public products that generate or distribute data must explicitly state in Constraints that synthetic outputs contain no real subject identifiers.
- **CRDC ecosystem reuse pattern named where applicable.** If the product is configurable for sister commons (CTDC, CDS, CCDI, etc.), state it explicitly and note in Notes that any cross-commons coordination happens outside this epic.
- **Curly braces escaped as `\{...\}`** anywhere they appear in description text, per 7e-shared.

**Verification workflow (Products-specific)**

1. **Verify the public repo state** with the GitHub MCP — README, license file, recent commits, package metadata. If the product has a published distribution (Hugging Face Space, PyPI, npm), web-search to confirm the live state.
2. **Verify the schema source** — confirm `icdc-model-tool` files referenced by the product are still on the documented branch and path (e.g., `master/model-desc/icdc-model.yml`).
3. **Verify predecessor product state** — read the predecessor README to ground the "what's added" framing accurately.
4. **Draft the description** in Markdown with all 15 sections per the universal structure, applying the content rules above. Apply universal Markdown conventions from 7e-shared, including curly-brace escaping.
5. **Push the description via the MCP** (`jira_update_issue` with the `description` field).
6. **Verify the rendered description with a UI screenshot** from the user. Wiki source is unreliable as render preview.
7. **If rendering is broken**, re-check Markdown source for unescaped `{...}` first; fall back to UI paste if source is clean.
