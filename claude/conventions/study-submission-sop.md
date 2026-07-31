# ICDC Study Submission SOP: Portal to Production

**Purpose.** The end-to-end path for taking one study's data from a CRDC Submission Portal submission to a live production release in ICDC (`caninecommons.cancer.gov`). Read this first; each stage links to its Jira task template for the detail, so this document stays short.

**Scope.** The full data-operations lane for one study version (`<Study Name vN>`): the parent submission user story, the optional modeling fork, pre-load review, IndexD registration, and the environment-by-environment load. Software-development work is out of scope.

## Pipeline at a glance

| # | Stage | Who | Jira artifact | Exit gate |
|---|---|---|---|---|
| 0 | Submission request + approval | Submitter; CRDC Submission Review Committee | (none on the ICDC side yet) | Committee approves (about 4 to 6 weeks) |
| 1 | Parent user story opened | Data Concierge (Philip Musk) | Data Submission user story | Story open; SharePoint folder created |
| 2 | Data submission + validation | Submitter; Data Concierge supports | (tracked on the user story) | All Portal validations pass |
| 2a | Modeling fork (only if new terms needed) | Data Concierge; Data Model Author (Mark Jensen) | Data Modeling for Study Submission | New model version live on both DMNs; DM Fed Lead review (Heather Creasy) |
| 3 | Release from Portal | Data Concierge | (tracked on the user story) | Release Package lands in S3 |
| 4 | Pre-load review | Reviewer (triaged) | Data Submission Review Task | Clean review clears the load |
| 5a | IndexD registration (parallel) | Data Concierge; external DCF | IndexD Registration ("Data Indexing") task | GUID spot-check resolves |
| 5b | Data load Dev to Prod (parallel) | Loading engineer; QA (Valentina Epishina) | Data Loading Task | Prod signoff |
| 6 | Production release | Loading engineer; TPM (Gina Kuffel) | (closes the load task) | Data live and downloads resolve |

Link every task (2a, 4, 5a, 5b) to the parent user story with `Relates`, never `Blocks`. Stages 5a and 5b are paired and run in parallel.

## Stages

**0. Submission request and approval (CRDC Portal).** The submitter applies through the [CRDC Submission Portal](https://hub.datacommons.cancer.gov/) with a Submission Request Form (SRF) describing the study. The CRDC Submission Review Committee evaluates NCI/NIH funding, data completeness, dbGaP registration (for controlled-access data), and de-identification, and decides in about 4 to 6 weeks. SRF approval is what starts ICDC's work.

**1. Parent Data Submission user story.** On approval, the Data Concierge (Philip Musk) opens the **Data Submission user story** (`Data Submission: <Study Name vN>`), assigns himself, and creates the study's SharePoint folder. This story coordinates everything below and is the home for study identity, chronology, and any open questions or risks. Every task below `Relates` back to it. Template: `claude/templates/data-submission-user-story-template.md`.

**2. Data submission and validation (CRDC Portal).** The submitter uploads the metadata manifest and the data files; the Portal runs automated validation against the ICDC data model. The Data Concierge supports the submitter throughout. Nothing proceeds until every validation passes.

**2a. Modeling fork (only when the model lacks needed terms).** If the study needs CDEs or permissible values the ICDC model does not yet have, a **Data Modeling for Study Submission** task must land before the load. Flow: the Data Concierge records the requests in the study's CDE Request Workbook; file a caDSR II Help Desk request if new CDEs or PVs are required; the SI team curates them; the Data Model Author (Mark Jensen) updates `CBIIT/icdc-model-tool`; the change promotes from a feature branch to `develop` (Dev and QA) then `master` (Stage and Prod), gated by DM Federal Lead and SME review (Heather Creasy); confirm the new version on both Data Model Navigators (the Portal DMN for submitters and the ICDC DMN for researchers). A model bump does not load any study data; the load is still a separate task. Template: `data-modeling-for-study-submission-template.md`. (Model changes driven by the ICDC project rather than a study use `data-model-update-task-template.md` and sit outside this study path.)

**3. Release from the Portal.** Once validation passes and any required modeling is deployed, the Data Concierge releases the submission in the Portal. On release, the Portal programmatically drops the **Release Package** into the metadata bucket `nci-cbiit-caninedatacommons-dev` (AWS account `152091478849`): a directory named `<timestamp>-<submission-id>` holding the metadata loading TSVs and the `indexd.tsv` manifest. The object files themselves land in the shared CRDC object bucket `nci-crdc-data-bucket-prod`. The Release Package is the source of truth for everything downstream.

**4. Pre-load review.** Before the real load, a reviewer loads the Portal's TSVs into a local Neo4j and OpenSearch, points the Dev frontend at them, and works the review checklist (spelling, stray or non-printing characters, unresolvable DOIs and URLs, counts, required IDs, permissible values, dates and numbers, orphan relationships, rendering). A clean review clears the paired load; any issues go back to the submitter to correct and resubmit through the Portal, then re-review. Template: `data-submission-review-task-template.md`.

**5a. IndexD registration (runs parallel to the load).** Register every file's GUID in CRDC IndexD through the external DCF handoff: extract the `indexd.tsv` from the Release Package, drop it in the DCF Google Drive folder, file a CRINTAKE intake ticket, then verify by resolving a minted GUID. A passing spot-check is the close trigger. Template: `indexd-registration-task-template.md`. The load can run at the same time but cannot clear its pre-load gate until these GUIDs resolve.

**5b. Data load, Dev to Prod (runs parallel to registration).** One Data Loading Task promotes the study through all four environments. Template: `data-loading-task-template.md`.

- **Pre-load gate:** Release Package and loading files present in S3; the IndexD GUID spot-check resolves; the model version tied to the Submission ID is the version deployed in each target environment.
- **Dev (local):** build a local Neo4j from a Dev dump, pull the model plus the loading files, configure `data-loader-config.yml`, run `loader.py` (dry-run, then load), trigger the OpenSearch ETL, verify the surfaces, then the TPM signs off Dev.
- **QA (Jenkins lower-tier):** run the QA load and OpenSearch job; Valentina Epishina tests (rendering, file downloads, no regressions) and signs off.
- **Stage (Jenkins upper-tier):** run the Stage load and OpenSearch job; test with production-parity checks and sign off.
- **Prod (Jenkins upper-tier):** run the Prod load and OpenSearch job.
- Every environment requires both a Neo4j load and an OpenSearch reindex; a Neo4j write without a reindex leaves the frontend stale.

**6. Production release.** The Prod load writes the study's nodes and relationships to Prod Neo4j and reindexes Prod OpenSearch. The data is then live at `caninecommons.cancer.gov`, and file downloads resolve because each file's IndexD GUID (from stage 5a) points to the object in the object bucket; ICDC is open access, so downloads need no login. The Prod row in the load task's Testing Signoff table is the close trigger. The Data Concierge then confirms the study renders correctly in production and files download, which completes the parent user story's lifecycle.

## Reference

**Roles.** Data Concierge = Philip Musk (owns the user story; coordinates submission, review, and IndexD). Loading engineer = whoever is named in the Developer field (`customfield_23650`). QA tester = Valentina Epishina. DM Federal Lead and SME review = Heather Creasy (gates the model `develop` to `master` promotion). Data Model Author = Mark Jensen. ICDC TPM = Gina Kuffel.

**Environments.** Data promotes Dev (local Neo4j and OpenSearch) to QA (Jenkins lower-tier) to Stage (Jenkins upper-tier) to Prod (Jenkins upper-tier). Model code promotes on its own track: feature branch to `develop` (Dev and QA) to `master` (Stage and Prod).

**Key locations.** Release Package / metadata bucket: `nci-cbiit-caninedatacommons-dev`. Object files: `nci-crdc-data-bucket-prod`. AWS account: `152091478849`. Model repo: `CBIIT/icdc-model-tool`. Loader: `CBIIT/icdc-dataloader` (`loader.py`). Live site: `caninecommons.cancer.gov`. Submission Portal: `hub.datacommons.cancer.gov`.

**Jira conventions.** Every data task is issue type Task except the parent, which is a User Story. Parent Epic is ICDC-3342 (ICDC Data), set via `customfield_12350`. Link related work with `Relates`, never `Blocks`. IndexD registration and the parent user story carry the `Data-Concierge` label; the load and modeling tasks do not (engineering). Each template carries its own full field rules.
