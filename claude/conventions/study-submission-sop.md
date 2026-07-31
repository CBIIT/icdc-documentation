# ICDC Study Submission SOP: Portal to Production

**Purpose.** The end-to-end path for taking one study's data from a CRDC Submission Portal submission to a live production release in ICDC (`caninecommons.cancer.gov`). Read this first; each stage links to its Jira task template for the detail, so this document stays short.

**Scope.** The full data-operations lane for one study version (`<Study Name vN>`): the parent submission user story, the optional modeling fork, pre-load review, IndexD registration, and the environment-by-environment load. Software-development work is out of scope.

**Two Portal status gates drive the back half of the pipeline.** Watch for these:

- **Release to DC:** the Portal programmatically writes the Release Package into the ICDC metadata bucket. The Release Package is **immutable** from this point; any change needs the submission reopened to produce a new one.
- **Complete:** the Portal moves the object files into the CRDC production bucket. Only now do the IndexD GUIDs resolve and file downloads work. Indexing can be registered earlier, but the GUIDs will not resolve until Complete.

## Pipeline at a glance

| # | Stage | Who | Jira artifact | Exit gate |
|---|---|---|---|---|
| 0 | Submission request + approval | Submitter; CRDC Submission Review Committee | (none on ICDC side yet) | Committee approves (about 4 to 6 weeks) |
| 1 | Parent user story opened | Data Concierge (Philip Musk) | Data Submission user story | Story open; SharePoint folder created |
| 2 | Data submission + validation (Portal) | Submitter; Data Concierge supports | (tracked on the user story) | All Portal validations pass |
| 2a | Modeling fork (only if new terms needed) | Data Concierge; Data Model Author (Mark Jensen) | Data Modeling for Study Submission | New model version live on both DMNs; DM Fed Lead review (Heather Creasy) |
| 3 | Pre-load review (before Release to DC) | Reviewer (triaged) | Data Submission Review Task | Clean review of the submitter-uploaded TSVs |
| 4 | Release to DC (Portal) | Data Concierge | (tracked on the user story) | Release Package written to metadata bucket; now immutable |
| 5a | IndexD registration (parallel) | Data Concierge; external DCF | IndexD Registration ("Data Indexing") task | Handoff filed; GUIDs mint (they resolve only after Complete) |
| 5b | Data load Dev to Prod (parallel) | Loading engineer; QA (Valentina Epishina) | Data Loading Task | Prod load and signoff |
| 6 | Mark submission Complete (Portal) | Data Concierge | (tracked on the user story) | Object files moved to production bucket; GUIDs resolve |
| 7 | Production release confirmed | Loading engineer; TPM (Gina Kuffel); Data Concierge | (closes the load task) | Study live and downloads resolve at caninecommons.cancer.gov |

Link every Jira task (2a, 3, 5a, 5b) to the parent user story with `Relates`, never `Blocks`. Release to DC and Complete are Portal actions tracked on the user story, not separate tasks. Stages 5a and 5b are paired and run in parallel.

## Stages

**0. Submission request and approval (CRDC Portal).** The submitter applies through the [CRDC Submission Portal](https://hub.datacommons.cancer.gov/) with a Submission Request Form (SRF) describing the study. The CRDC Submission Review Committee evaluates NCI/NIH funding, data completeness, dbGaP registration (for controlled-access data), and de-identification, and decides in about 4 to 6 weeks. SRF approval is what starts ICDC's work.

**1. Parent Data Submission user story.** On approval, the Data Concierge (Philip Musk) opens the **Data Submission user story** (`Data Submission: <Study Name vN>`), assigns himself, and creates the study's SharePoint folder. This story coordinates everything below and is the home for study identity, chronology, and any open questions or risks. Every task below `Relates` back to it. Template: `claude/templates/data-submission-user-story-template.md`.

**2. Data submission and validation (CRDC Portal).** The submitter uploads the metadata manifest and the data files; the Portal runs automated validation against the ICDC data model. The Data Concierge supports the submitter throughout. Nothing proceeds until every validation passes.

**2a. Modeling fork (only when the model lacks needed terms).** If the study needs CDEs or permissible values the ICDC model does not yet have, a **Data Modeling for Study Submission** task must land before the load. Flow: the Data Concierge records the requests in the study's CDE Request Workbook; file a caDSR II Help Desk request if new CDEs or PVs are required; the SI team curates them; the Data Model Author (Mark Jensen) updates `CBIIT/icdc-model-tool`; the change promotes from a feature branch to `develop` (Dev and QA) then `master` (Stage and Prod), gated by DM Federal Lead and SME review (Heather Creasy); confirm the new version on both Data Model Navigators (the Portal DMN for submitters and the ICDC DMN for researchers). A model bump does not load any study data; the load is still a separate task. Template: `data-modeling-for-study-submission-template.md`. (Model changes driven by the ICDC project rather than a study use `data-model-update-task-template.md` and sit outside this study path.)

**3. Pre-load review (before Release to DC).** While the submission is still open, a reviewer downloads the submitter-uploaded loading TSVs directly from the Portal (not from a Release Package, which does not exist yet) and loads them into a local Neo4j and OpenSearch, points the Dev frontend at them, and works the review checklist (spelling, stray or non-printing characters, unresolvable DOIs and URLs, counts, required IDs, permissible values, dates and numbers, orphan relationships, rendering). A clean review clears the study to be released; any issues go back to the submitter to correct in the still-open submission and re-review. Doing this before release matters: once the submission is released the Release Package is immutable, so catching errors now avoids a reopen. Template: `data-submission-review-task-template.md`.

**4. Release to DC (Portal).** Once the review is clean and any required modeling is deployed, the Data Concierge marks the submission **Release to DC** in the Portal. On release, the Portal programmatically writes the **Release Package** into the metadata bucket `nci-cbiit-caninedatacommons-dev` (AWS account `152091478849`): a directory named `<timestamp>-<submission-id>` holding the metadata loading TSVs and the `indexd.tsv` manifest. The Release Package is **immutable** at this point and is the source of truth for both the load and indexing. If a change is needed after release, the submission must be reopened to generate a new Release Package.

**5a. IndexD registration (runs parallel to the load).** Register every file's GUID in CRDC IndexD through the external DCF handoff: extract the `indexd.tsv` from the Release Package, drop it in the DCF Google Drive folder, file a CRINTAKE intake ticket, then verify by resolving a minted GUID. The handoff and minting can happen now, but **the GUIDs do not resolve until the submission is marked Complete** (stage 6), because that is when the object files land in the production bucket. The registration's GUID spot-check therefore only passes after Complete. Template: `indexd-registration-task-template.md`.

**5b. Data load, Dev to Prod (runs parallel to registration).** One Data Loading Task promotes the study through all four environments, using the loading TSVs from the Release Package. Template: `data-loading-task-template.md`.

- **Pre-load gate:** the Release Package is present in the metadata bucket, and the model version tied to the Submission ID is the version deployed in each target environment. (The IndexD GUID spot-check is a close condition that only passes after Complete, so schedule the final download verification for after the submission is Complete.)
- **Dev (local):** build a local Neo4j from a Dev dump, pull the model plus the loading files, configure `data-loader-config.yml`, run `loader.py` (dry-run, then load), trigger the OpenSearch ETL, verify the surfaces, then the TPM signs off Dev.
- **QA (Jenkins lower-tier):** run the QA load and OpenSearch job; Valentina Epishina tests (rendering, file downloads, no regressions) and signs off.
- **Stage (Jenkins upper-tier):** run the Stage load and OpenSearch job; test with production-parity checks and sign off.
- **Prod (Jenkins upper-tier):** run the Prod load and OpenSearch job.
- Every environment requires both a Neo4j load and an OpenSearch reindex; a Neo4j write without a reindex leaves the frontend stale.

**6. Mark submission Complete (Portal).** The Data Concierge marks the submission **Complete** in the Portal. This moves the object files into the CRDC production bucket `nci-crdc-data-bucket-prod`, which is what makes the IndexD GUIDs resolve. Until Complete, files may be indexed but downloads will not work.

**7. Production release confirmed.** With the study loaded to Prod (visible at `caninecommons.cancer.gov`) and the submission Complete (object files in the production bucket, GUIDs resolving), the data is fully released: it renders and file downloads work, with no login since ICDC is open access. The Prod row in the load task's Testing Signoff table closes the load; the IndexD GUID spot-check now passes and closes the registration task. The Data Concierge confirms the study looks correct in production, which completes the parent user story's lifecycle.

## Reference

**Roles.** Data Concierge = Philip Musk (owns the user story; coordinates submission, review, release/complete in the Portal, and IndexD). Loading engineer = whoever is named in the Developer field (`customfield_23650`). QA tester = Valentina Epishina. DM Federal Lead and SME review = Heather Creasy (gates the model `develop` to `master` promotion). Data Model Author = Mark Jensen. ICDC TPM = Gina Kuffel.

**Environments.** Data promotes Dev (local Neo4j and OpenSearch) to QA (Jenkins lower-tier) to Stage (Jenkins upper-tier) to Prod (Jenkins upper-tier). Model code promotes on its own track: feature branch to `develop` (Dev and QA) to `master` (Stage and Prod).

**Key locations.** Metadata bucket (immutable Release Package, written at Release to DC): `nci-cbiit-caninedatacommons-dev`. Object-files / production bucket (populated at Complete, when GUIDs resolve): `nci-crdc-data-bucket-prod`. AWS account: `152091478849`. Model repo: `CBIIT/icdc-model-tool`. Loader: `CBIIT/icdc-dataloader` (`loader.py`). Live site: `caninecommons.cancer.gov`. Submission Portal: `hub.datacommons.cancer.gov`.

**Portal status gates.** Release to DC = Release Package written to the metadata bucket and frozen (reopen the submission for any change). Complete = object files moved to the production bucket, GUIDs resolve, downloads work. Both are Portal actions performed by the Data Concierge and tracked on the parent user story.

**Jira conventions.** Every data task is issue type Task except the parent, which is a User Story. Parent Epic is ICDC-3342 (ICDC Data), set via `customfield_12350`. Link related work with `Relates`, never `Blocks`. IndexD registration and the parent user story carry the `Data-Concierge` label; the load and modeling tasks do not (engineering). Each template carries its own full field rules.
