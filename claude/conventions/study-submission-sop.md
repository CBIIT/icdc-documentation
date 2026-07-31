# ICDC Study Submission SOP: Portal to Production

**Purpose.** The end-to-end path for taking one study's data from a CRDC Submission Portal submission to a live production release in ICDC (`caninecommons.cancer.gov`). Read this first; each stage links to its Jira task template for the detail, so this document stays short.

**Scope.** The full data-operations lane for one study version (`<Study Name vN>`): the parent submission user story, the optional modeling fork, pre-load review, IndexD registration, and the environment-by-environment load. Software-development work is out of scope.

**Two error checks and two Portal status gates shape the back half of the pipeline.** Keep them straight:

- **Two error checks:** the pre-load review (on the submitter-uploaded TSVs, stage 3) and the Dev load of the actual Release Package (stage 5b). Either can send the submission back for correction.
- **Release to DC:** the Portal programmatically writes the Release Package into the ICDC metadata bucket. The Release Package is **immutable** from this point; any change needs the submission reopened for a new one.
- **Complete:** the Data Concierge marks this **after the Dev load is clean**. It moves the object files into the CRDC production bucket (so the IndexD GUIDs resolve) and unlocks promotion to QA. Indexing can start earlier, but its GUIDs do not resolve until Complete.

## Pipeline at a glance

| # | Stage | Who | Jira artifact | Gate / result |
|---|---|---|---|---|
| 0 | Submission request + approval | Submitter; CRDC Submission Review Committee | (none on ICDC side yet) | Committee approves (about 4 to 6 weeks) |
| 1 | Parent user story opened | Data Concierge (Philip Musk) | Data Submission user story | Story open; SharePoint folder created |
| 2 | Data submission + validation (Portal) | Submitter; Data Concierge supports | (tracked on the user story) | All Portal validations pass |
| 2a | Modeling fork (only if new terms needed) | Data Concierge; Data Model Author (Mark Jensen) | Data Modeling for Study Submission | New model version live on both DMNs; DM Fed Lead review (Heather Creasy) |
| 3 | Pre-load review (submitter TSVs, before Release to DC) | Reviewer (triaged) | Data Submission Review Task | Clean review; study cleared to release |
| 4 | Release to DC (Portal) | Data Concierge | (tracked on the user story) | Immutable Release Package in metadata bucket |
| 5a | IndexD registration (parallel, from Release to DC) | Data Concierge; external DCF | IndexD Registration ("Data Indexing") task | Handoff filed; GUIDs resolve once Complete |
| 5b | Load Release Package to Dev + verify (parallel) | Loading engineer; TPM (Gina Kuffel) | Data Loading Task | Second error check; errors reopen the submission for a new package |
| 6 | Submission marked Complete (Portal) | Data Concierge (after Dev is clean) | (tracked on the user story) | Object files to production bucket; GUIDs resolve; unlocks QA |
| 7 | Promote QA to Stage to Prod | Loading engineer; QA (Valentina Epishina) | Data Loading Task | Prod load and signoff |
| 8 | Production release confirmed | Loading engineer; TPM (Gina Kuffel); Data Concierge | (closes the load task) | Study live and downloads resolve at caninecommons.cancer.gov |

Link every Jira task (2a, 3, 5a, and the Data Loading Task that spans 5b and 7) to the parent user story with `Relates`, never `Blocks`. IndexD registration (5a) and the Dev load (5b) both begin once the Release Package exists and run in parallel; the load then pauses at Complete (6) before promoting to QA (7).

## Stages

**0. Submission request and approval (CRDC Portal).** The submitter applies through the [CRDC Submission Portal](https://hub.datacommons.cancer.gov/) with a Submission Request Form (SRF) describing the study. The CRDC Submission Review Committee evaluates NCI/NIH funding, data completeness, dbGaP registration (for controlled-access data), and de-identification, and decides in about 4 to 6 weeks. SRF approval is what starts ICDC's work.

**1. Parent Data Submission user story.** On approval, the Data Concierge (Philip Musk) opens the **Data Submission user story** (`Data Submission: <Study Name vN>`), assigns himself, and creates the study's SharePoint folder. This story coordinates everything below and is the home for study identity, chronology, and any open questions or risks. Every task below `Relates` back to it. Template: `claude/templates/data-submission-user-story-template.md`.

**2. Data submission and validation (CRDC Portal).** The submitter uploads the metadata manifest and the data files; the Portal runs automated validation against the ICDC data model. The Data Concierge supports the submitter throughout. Nothing proceeds until every validation passes.

**2a. Modeling fork (only when the model lacks needed terms).** If the study needs CDEs or permissible values the ICDC model does not yet have, a **Data Modeling for Study Submission** task must land before the load. Flow: the Data Concierge records the requests in the study's CDE Request Workbook; file a caDSR II Help Desk request if new CDEs or PVs are required; the SI team curates them; the Data Model Author (Mark Jensen) updates `CBIIT/icdc-model-tool`; the change promotes from a feature branch to `develop` (Dev and QA) then `master` (Stage and Prod), gated by DM Federal Lead and SME review (Heather Creasy); confirm the new version on both Data Model Navigators (the Portal DMN for submitters and the ICDC DMN for researchers). A model bump does not load any study data; the load is still a separate task. Template: `data-modeling-for-study-submission-template.md`. (Model changes driven by the ICDC project rather than a study use `data-model-update-task-template.md` and sit outside this study path.)

**3. Pre-load review (submitter TSVs, before Release to DC).** While the submission is still open, a reviewer downloads the submitter-uploaded loading TSVs directly from the Portal (not from a Release Package, which does not exist yet) and loads them into a local Neo4j and OpenSearch, points the Dev frontend at them, and works the review checklist (spelling, stray or non-printing characters, unresolvable DOIs and URLs, counts, required IDs, permissible values, dates and numbers, orphan relationships, rendering). A clean review clears the study to be released; any issues go back to the submitter to correct in the still-open submission and re-review. This is the first of two error checks. Template: `data-submission-review-task-template.md`.

**4. Release to DC (Portal).** Once the review is clean and any required modeling is deployed, the submission is marked **Release to DC** in the Portal. On release, the Portal programmatically writes the **Release Package** into the metadata bucket `nci-cbiit-caninedatacommons-dev` (AWS account `152091478849`): a directory named `<timestamp>-<submission-id>` holding the metadata loading TSVs and the `indexd.tsv` manifest. The Release Package is **immutable** at this point and is the source of truth for the load and for indexing. If a change is needed after release, the submission must be reopened to generate a new Release Package.

**5a. IndexD registration (may begin once the Release Package exists; runs in parallel with the load).** Register every file's GUID in CRDC IndexD through the external DCF handoff: extract the `indexd.tsv` from the Release Package, drop it in the DCF Google Drive folder, file a CRINTAKE intake ticket, then verify by resolving a minted GUID. The `indexd.tsv` ships inside the Release Package, so registration can start as soon as the package exists (Release to DC) and runs alongside the load. The minted GUIDs do not resolve until the submission is Complete (stage 6), so the GUID spot-check passes only after Complete. Template: `indexd-registration-task-template.md`.

**5b. Load the Release Package to Dev and verify (second error check; runs in parallel with 5a).** The Data Loading Task begins in Dev: build a local Neo4j from a Dev dump, pull the model plus the loading files from the Release Package, configure `data-loader-config.yml`, run `loader.py` (dry-run, then load), trigger the OpenSearch ETL, verify the surfaces, and the TPM signs off Dev. This is the second error check: loading the actual Release Package can surface problems the submitter-TSV review did not catch. If errors are found, reopen the submission for a corrected Release Package (back to stage 4), since the current one is immutable. Pre-load gate: the Release Package is present in the metadata bucket, and the model version tied to the Submission ID is deployed in Dev. Template: `data-loading-task-template.md`.

**6. Submission marked Complete (Portal).** Once the Dev load is clean, the **Data Concierge marks the submission Complete** in the Portal. This moves the object files into the CRDC production bucket `nci-crdc-data-bucket-prod`, so the IndexD GUIDs resolve. Complete is the point of no return, done only after Dev verification passes, and it unlocks promotion to QA.

**7. Promote QA to Stage to Prod.** With the submission Complete, the same Data Loading Task promotes the study through the remaining environments:

- **QA (Jenkins lower-tier):** run the QA load and OpenSearch job; Valentina Epishina tests (rendering, file downloads, no regressions) and signs off.
- **Stage (Jenkins upper-tier):** run the Stage load and OpenSearch job; test with production-parity checks and sign off.
- **Prod (Jenkins upper-tier):** run the Prod load and OpenSearch job.
- Every environment requires both a Neo4j load and an OpenSearch reindex; a Neo4j write without a reindex leaves the frontend stale. File downloads resolve through the central CRDC IndexD, so download checks depend on the parallel IndexD registration (5a) being complete.

**8. Production release confirmed.** With the study loaded to Prod (visible at `caninecommons.cancer.gov`) and its files indexed and resolving, the data is fully released: it renders and file downloads work, with no login since ICDC is open access. The Prod row in the load task's Testing Signoff table closes the load; the IndexD GUID spot-check closes the registration task. The Data Concierge confirms the study looks correct in production, which completes the parent user story's lifecycle.

## Reference

**Roles.** Data Concierge = Philip Musk (owns the user story; coordinates submission, review, Release to DC and Complete in the Portal, and IndexD; marks Complete once Dev is clean). Loading engineer = whoever is named in the Developer field (`customfield_23650`). QA tester = Valentina Epishina. DM Federal Lead and SME review = Heather Creasy (gates the model `develop` to `master` promotion). Data Model Author = Mark Jensen. ICDC TPM = Gina Kuffel.

**Environments.** Data promotes Dev (local Neo4j and OpenSearch) to QA (Jenkins lower-tier) to Stage (Jenkins upper-tier) to Prod (Jenkins upper-tier). Model code promotes on its own track: feature branch to `develop` (Dev and QA) to `master` (Stage and Prod).

**Two error checks.** (1) Pre-load review on the submitter-uploaded TSVs, before Release to DC. (2) The Dev load of the actual Release Package. Either can reopen the submission; the second one is why QA promotion waits for Complete.

**Portal status gates.** Release to DC = the Release Package is written to the metadata bucket and frozen (reopen the submission for any change). Complete = the Data Concierge marks it after the Dev load is clean; object files move to the production bucket, the GUIDs resolve, and QA promotion is unlocked. Both are tracked on the parent user story. Indexing may begin at Release to DC, but its GUIDs resolve only at Complete.

**Key locations.** Metadata bucket (immutable Release Package, written at Release to DC): `nci-cbiit-caninedatacommons-dev`. Object-files / production bucket (populated at Complete, when GUIDs resolve): `nci-crdc-data-bucket-prod`. AWS account: `152091478849`. Model repo: `CBIIT/icdc-model-tool`. Loader: `CBIIT/icdc-dataloader` (`loader.py`). Live site: `caninecommons.cancer.gov`. Submission Portal: `hub.datacommons.cancer.gov`.

**Jira conventions.** Every data task is issue type Task except the parent, which is a User Story. Parent Epic is ICDC-3342 (ICDC Data), set via `customfield_12350`. Link related work with `Relates`, never `Blocks`. IndexD registration and the parent user story carry the `Data-Concierge` label; the load and modeling tasks do not (engineering). Each template carries its own full field rules.
