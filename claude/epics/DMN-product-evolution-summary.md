# Data Model Explorer & Data Model Navigator — Product Evolution Summary

**Prepared by:** Gina Kuffel, Senior TPM, BACS/FNL  
**Date:** March 30, 2026 (v8 — Toyo Udosen and Ambar Rana as primary developers fully characterized)  
**Project:** Integrated Canine Data Commons (ICDC) | Cancer Research Data Commons (CRDC)  
**Governing Epics:** ICDC-2142 (MVP), ICDC-2504 (MLP), ICDC-2690 (DMN / ongoing)  
**Source:** tracker.nci.nih.gov | Projects: ICDC, CTDC, BENTO, CRDCDH, PORTAL, C3DC, CDS  

**JQL for complete ticket retrieval (all five terms required):**
```
project = ICDC AND (
  text ~ "Data Model Explorer" OR
  text ~ "Data Model Navigator" OR
  text ~ "data dictionary" OR
  text ~ "dictionary viewer" OR
  text ~ "model viewer"
) ORDER BY created ASC
```

---

## 1. Executive Summary

The ICDC Data Model Explorer and its successor, the Data Model Navigator (DMN), represent one of the CRDC platform ecosystem's most significant shared engineering contributions. What began as a Gen3-derived dictionary viewer in 2019 has evolved across four years, four major technical pivots, and more than 250 Jira tickets into a purpose-built, Reactflow-powered interactive tool that now serves multiple independent deployments across the Cancer Research Data Commons.

**Philip Musk** (NIH/NCI BA) is the primary requirements author — 147 confirmed Jira tickets across the product's lifetime. **Toyoabasi (Toyo) Udosen** (FNL, Frontend Engineer) and **Ambar Rana** (FNL, Tech Lead) are the primary developers who built what Philip specified. Philip wrote the requirements. The data model provided the structure. Toyo and Ambar built the machine.

**Critical theme:** The data model itself — housed in the CBIIT/icdc-model GitHub repository and governed by Mark Jensen's icdc-model-tool — is not merely the subject of the Data Model Navigator. It is its co-driver. Every feature the Navigator exposes to users (node descriptions, Required/Preferred/Optional, controlled vocabularies, template download availability, node category groupings, the Key property flag) had to be deliberately and intentionally built into the YAML source files before the Navigator could surface it. The Navigator reads what the model tells it. Without the model evolving in deliberate parallel, the Navigator would have nothing meaningful to display.

---

## 2. Technology Lineage

| Step | Event | Key Tickets |
|---|---|---|
| 1 | GDC Graph Viewer — UChicago builds original graph-based model viewer | — |
| 2 | Gen3 Dictionary integrated into Windmill frontend | ICDC-50, ICDC-57 |
| 3 | Cytoscape.js evaluated as Gen3 alternative — Todd Pihl email to Matt Beyers and **Mark Jensen** | ICDC-83 (Jan 30, 2019) |
| 4 | ICDC research and integration decision — Gen3 DataDictionary selected | ICDC-2131 (Sep 2021) |
| 4a | Data model co-evolution begins — Mark Jensen's icdc-model-tool; constraint system; node-level attribute overrides | ICDC-60, ICDC-61, ICDC-272, ICDC-150 |
| 5 | MVP built on Gen3; naming vocabulary gap — Philip Musk writes requirements using "data dictionary" / "dictionary viewer" / "model viewer" before ICDC-2342 standardizes to "Data Model Explorer" | ICDC-2142, ICDC-2093, ICDC-2299, ICDC-2300, ICDC-2302 |
| 6 | Full Gen3 refactoring — MLP; inline styling; architecturally independent | ICDC-2504, ICDC-2582–2588 |
| 7 | Reactflow migration — replaces deprecated Gen3 graph library; circular relationships; node traceback | ICDC-2864, ICDC-2866, ICDC-2897, ICDC-3503 |
| 8 | CRDC DataHub and ecosystem adoption | CRDCDH-18, CRDCDH-523, CRDCDH-550, CTDC-919, C3DC-1411 |
| 9 | Bento Core extraction — Ambar Rana leads DMN into portable bento-core component | BENTO-2639, BENTO-2655 (2025–present) |

---

## 3. Key Contributors

### Philip Musk — Primary Requirements Author (147 tickets)

Philip is the product's voice of the user across its entire lifetime. His contributions fall into five categories:

1. **Foundational User Stories** — ICDC-2202 (faceted search), ICDC-2222 (non-functional button suppression), ICDC-2232 (node PDF download), ICDC-2299 (full dictionary PDF), ICDC-2300 (TSV template downloads), ICDC-2302 (node descriptions + Assignment/Class tags). Written October–December 2021. The DNA of the product.

2. **Model-Side Companion Tasks** — Philip wrote ICDC-2315 (add Template tag to YAML) the same day as ICDC-2300 (the download story). He wrote ICDC-2316 (add node descriptions to YAML) the same day as ICDC-2302. He understood before anyone that the feature could not exist until the model contained the signal the Navigator needed to read.

3. **Bug Discovery** — 40+ bugs against the Navigator across ICDC 3.8.7 and 3.21.3, many Blocker/Critical. His reports specify the exact YAML attribute being misrendered (e.g., ICDC-2285: "Properties for which the value of Req: is Preferred are still being shown as Required = No").

4. **Phase 2 Feature Expansion** — Entire ICDC-2690 epic feature set: ICDC-2431 (relationship filtering — still Reopened), ICDC-2545–2548 (facet UX), ICDC-2551–2553 (bulk download hub), ICDC-2598 (full dictionary PDF v2), ICDC-2600/2601 (Read Me modal), ICDC-2608 (Show More/Less toggle), ICDC-2695/2696 (TSV vocabulary downloads), ICDC-2692 (environment-specific model branching — foreshadowed ICDC-4007).

5. **Cross-Project Reach** — CTDC-1343 (Jan 2024): Philip wrote CTDC's visual data model user story explicitly citing caninecommons.cancer.gov as the reference. BENTO-2244: Bentofication evaluation that formally established DMN as ICDC-specific.

### Toyoabasi (Toyo) Udosen — Frontend Implementation Lead (14 confirmed tickets)

Toyo's consistent pattern is **infrastructure ownership** — the work that keeps the Navigator connected to its data sources across environments and over time.

- **ICDC-2093** — MVP assignee. First wired ICDC model YAML data into a React interface.
- **ICDC-2284** — Environment variable setup pointing each tier at the correct model source.
- **ICDC-2297** — Reported the need to sync the Bento-tools npm package, advancing portability.
- **ICDC-2855** — `REACT_APP_DMN_README` across all four tiers (Dev/QA/Stage/Prod), making the Read Me modal deliver environment-appropriate content.
- **ICDC-4040** (Oct 2025, On Hold) — Deprecating `icdc-readMe-content` and `icdc-data-loading-example-sets` repos in favor of consolidating all DMN inputs into `icdc-model-tool`.
- **ICDC-4075** (Jan 2026, On Hold) — FE companion: updating `REACT_APP_DMN_README` and `REACT_APP_DMN_EXAMPLE_LOADING_FILES` to unified location.
- **CRDCDH-1799** (Oct 2024) — Cross-project: CDE improvements to DataHub DMN PDF exports, keeping ICDC and DataHub Navigator instances in alignment.

### Ambar Rana — Tech Lead and Architecture Owner (18 confirmed tickets)

Ambar owns every architecture-level decision — the moments where the approach had to fundamentally change.

- **ICDC-2588** — Most complex task in Gen3 refactoring: rebuilt entire Graph View interactivity without Gen3's global CSS, using purely inline styling.
- **ICDC-2693** (Jul 2022) — Critical data integrity bug: Stage and Production were reading the Develop branch of the model, causing unvalidated controlled vocabulary values to appear live. Fixed branch-per-environment pointing.
- **ICDC-2897** — Reactflow migration ownership. Selected from six-candidate evaluation. Resolved circular relationship handling that crashed the Gen3 renderer. Unlocked node traceback (ICDC-3503).
- **BENTO-2632/2633/2635/2636/2639** (Jan 2025) — bento-core Navigator extraction: new Navigator package, replaced global Redux with local useReducer, restored all styles/filters/search using MUI v6+ emotion.
- **BENTO-2655** (Apr 2025, In Progress) — DataHub configuration: CDE values, JSON/TSV exports, release notes display, `Template: No` tag support, model version display. Fulfills portability goal from ICDC-2093 (2021), four years later.
- **ICDC-4025** (Oct 2025, In Progress) — Automated example file sync investigation: Bento MDF Python Library, config-based microservice, real ICDC values (not Lorem Ipsum), triggered by `icdc-model-tool` master branch releases.
- **ICDC-4031 / ICDC-4099** (Oct 2025 / Feb 2026, Open) — User stories for always-in-sync example files.
- **ICDC-4134** (Mar 20, 2026, Open) — Synthetic Data Generation for ICDC Submission Example Files epic. Most recent major DMN-related work item in the record. Includes AI/LLM-assisted relationship inference as a future enhancement.

---

## 4. The Data Model as Co-Driver

The DMN is only as useful as the data model it reads. Every Navigator feature requires a corresponding YAML update:

| YAML Tag | What the Navigator does with it | Key tickets |
|---|---|---|
| `Req: Yes / Preferred / No` | Displays Required/Preferred/Optional in Table View and Graph View properties dialogue | ICDC-272 (constraint system), ICDC-150 (node-level overrides), ICDC-2247, ICDC-2309 |
| `Template: Yes / No` | Exposes or suppresses TSV template download button per node | ICDC-2315 (tag added to YAML), ICDC-2300, ICDC-2553 |
| `Assignment / Class` (Core/Extended, Primary/Secondary) | Powers the faceted filter sidebar groupings | ICDC-2302 (user story), ICDC-2316 (descriptions added) |
| `Key` flag | Identifies key properties prominently in Table View and PDFs | ICDC-2386, ICDC-2427 |
| Enum values / controlled vocabularies | Renders expandable modal popups; powers JSON/TSV downloads | ICDC-2426, ICDC-2551–2553 |
| Node descriptions | Displayed in Table View header and PDF exports | ICDC-2316 (added to YAML), ICDC-2302 (user story), ICDC-2582 |

The model is authored in `icdc-model.yml` and `icdc-model-props.yml`, processed by `icdc-model-tool` (Mark Jensen), served via GraphQL, and consumed by the Navigator at runtime. No code deployment is required when the model changes — the Navigator reflects it automatically.

---

## 5. JQL Gap Explanation (Why Five Search Terms Are Required)

Philip Musk authored MVP-era requirements (Sep–Dec 2021) using pre-standardization vocabulary. ICDC-2342 standardized to "Data Model Explorer" in April 2022 but could not retroactively re-index earlier tickets.

| Term | Era | Key tickets only visible with this term |
|---|---|---|
| `"Data Model Explorer"` | Apr 2022 → present | Most post-standardization tickets |
| `"Data Model Navigator"` | Jul 2022 → present | Phase 2 and ecosystem tickets |
| `"data dictionary"` | Sep 2021 → present | ICDC-2299, ICDC-2302, ICDC-2315, ICDC-2316 and ~40 others |
| `"dictionary viewer"` | Oct 2021 → present | ICDC-2222, ICDC-2224, ICDC-2302 |
| `"model viewer"` | Oct 2021 → present | ICDC-2219, ICDC-2220, ICDC-2221, ICDC-2247 |

---

## 6. Cross-Project Ecosystem Adoption

| Ticket | Project | Date | Significance |
|---|---|---|---|
| BENTO-2244 | BENTO | Jan 2023 | DMN formally excluded from Bento standard framework (Gina Kuffel / Karan Sheth) |
| CRDCDH-18 | CRDCDH | Apr 2023 | DataHub formally adopts ICDC DMN as blueprint (Todd Pihl) |
| CRDCDH-523/550 | CRDCDH | Oct–Nov 2023 | Multi-model support; ICDC model hosted in DataHub DMN |
| CRDCDH-559 | CRDCDH | Nov 2023 | DataHub uses ICDC README GitHub URL as direct template |
| CRDCDH-680 | CRDCDH | Dec 2023 | ICDC temporarily removed from Submission Portal; later re-added |
| PORTAL-915 | PORTAL | Nov 2023 | ICDC DMN called "K9 Model Viewer" |
| CTDC-919 | CTDC | Jul 2023 | CTDC forks DataHub codebase for DMN (Yizhen Chen) |
| CTDC-1343 | CTDC | Jan 2024 | Philip Musk writes CTDC data model user story citing ICDC as reference |
| CTDC-1581 | CTDC | Nov 2024 | Yizhen Chen creates formal 3-part DMN evaluation (assigned to Gina Kuffel) |
| CTDC-1616 | CTDC | Jan 2025 | Dynamic config ingestion follow-on (Yizhen Chen, Closed Mar 2025) |
| CRDCDH-1527 | CRDCDH | Aug 2024 | DataHub reviews Mark Jensen's standalone DMN at github.com/majensen/model-navigator-standalone |
| CRDCDH-1799 | CRDCDH | Oct 2024 | Toyo Udosen implements CDE improvements in DataHub DMN PDF exports |
| C3DC-1411 | C3DC | Feb 2025 | C3DC delivers full DMN (Release 1.6.0, May 2025) — fulfills 2023 aspiration |

---

## 7. Open Items (as of March 31, 2026)

- **ICDC-2353** — Custodian configuration file for node icons, colors, background (backlog)
- **ICDC-2431** — Relationship-based filtering by multiplicity type (Reopened — Philip Musk)
- **ICDC-2993** — Downloads button dropdown detaches from button after zoom change (Toyo Udosen, Open Feb 2023)
- **ICDC-4040 / ICDC-4075** — DMN repository consolidation into `icdc-model-tool` (Toyo Udosen, On Hold)
- **ICDC-4025 / ICDC-4031 / ICDC-4099 / ICDC-4134** — Automated example file sync and synthetic data generation (Ambar Rana, active as of March 2026)
- **BENTO-2632 through BENTO-2655** — bento-core Navigator integration and DataHub configuration (Ambar Rana, Ready for Review / In Progress)
- **ICDC-2207 / ICDC-2624** — Active QA test sets for ICDC DMN regression (Valentina Epishina)
- **CRDCDH-198** — Active QA test set for DataHub DMN regression
- **CTDC-766** — Active CTDC DMN test set (Valentina Epishina)

---

## 8. Ticket Inventory Metrics

| Category | Count |
|---|---|
| JQL term 1: "Data Model Explorer" (ICDC project) | 164 results |
| JQL term 2: "Data Model Navigator" (ICDC project) | 219 results |
| JQL term 3: "data dictionary" (ICDC project) | 96 results (new in v5) |
| Cross-project Jira (all non-ICDC): "Data Model Navigator" | 420+ results |
| Projects with DMN-related tickets | ICDC, CTDC, BENTO, CRDCDH, PORTAL, C3DC, CDS |
| ICDC epics governing this feature | 3 (ICDC-2142, ICDC-2504, ICDC-2690) |
| Phase 1 ticket inventory (complete — all five JQL terms) | 110 curated |
| Phase 2 ticket inventory | 58 curated |
| Technology Lineage table | 30 curated |
| Cross-project key tickets | 28 curated |
| Philip Musk DMN-related tickets (all five JQL terms) | 147 confirmed |
| Toyoabasi Udosen DMN-related tickets | 14 confirmed |
| Ambar Rana DMN-related tickets | 18 confirmed |
| Blocker-priority ICDC bugs resolved | 14+ |
| Live DMN production deployments | 3 (ICDC, CRDC Submission Portal, C3DC) |
| Releases spanning ICDC DMN work | ICDC 1.0 → 4.2.0.475+ |

---

## 9. Appendix — Epic Summary

**ICDC-2142** — An interactive tool for exploring the data model & data dictionary (MVP — Gen3-based)  
Status: Closed. Delivery: ICDC 3.8.7.

**ICDC-2504** — Iterating on the DME MVP to achieve a Minimum Loveable Product (MLP — Gen3 fully refactored)  
Status: Closed. Delivery: ICDC 3.29.4.

**ICDC-2690** — Product: Data Model Navigator (DMN — Reactflow migration + CRDC ecosystem adoption)  
Status: Open (backlog). Created: July 2022.

---

*Full detail including complete ticket tables, data model tag documentation, contributor portraits, and cross-project narrative is in the SharePoint Word document: ICDC Software Development > ICDC Planning > ICDC Features-Specs-and-Reqs > Data Model Explorer > ICDC_DataModelExplorer_Navigator_ProductEvolutionSummary_v8.docx*
