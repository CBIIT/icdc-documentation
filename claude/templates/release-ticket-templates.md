# 🎟️ Release Ticket Templates

> **Use this component for the Jira artifacts that recur with every ICDC software release: the standing release epic (one per federal fiscal year) and the Stage and Production deployment tasks (one of each per release).** ICDC ships two kinds of release: a monthly release, so that fixes for the monthly NCI Invicti scan findings reach Production on a predictable schedule, and a feature release when one feature's scope ships on its own. This file is the canonical spec and the only template: tickets are created from the bodies below, and real tickets are cited as canonical examples. For DevOps work that is not a release promotion (upgrades, environment variables, infrastructure changes), use the DevOps Task template (`devops-task-template.md`).
>
> Canonical ICDC examples: **ICDC-4290** (standing epic, FY27), **ICDC-4291** (October 2026 monthly release, Stage), **ICDC-4292** (October 2026 monthly release, Production). Canonical feature-release example (CTDC, same body): **CTDC-2253** / **CTDC-2254**. CTDC's equivalent, kept in lockstep, is `CBIIT/ctdc-documentation/claude/templates/release-ticket-templates.md`.

**Why this component**

A release deployment is not a finding and not a DevOps change. One release can carry fixes from several monthly scan epics plus feature work, so it cannot live inside any one scan epic without tangling that epic's closure. It needs its own record that answers three questions an auditor or the TPM will ask: what shipped, when did it reach each tier, and under which ServiceNow change.

Stage and Production get separate tasks because they are separate events: each has its own ServiceNow ticket, its own scheduled date, and its own outcome. Separate tasks let Stage close when Stage is done, give each task a due date that matches its own deployment, and make a Production delay visible on its own ticket.

**Release kinds**

| Kind | What ships | Deployment task summary | "Related To" |
|---|---|---|---|
| **Monthly** | Invicti scan remediation plus whatever feature work is ready | `Deploy <Month YYYY> monthly release to ICDC <Stage \| Production>` | The scan epic(s) the release remediates |
| **Patch** | An out-of-band security fix whose SLA falls before the next monthly release | `Deploy <Month YYYY> patch release to ICDC <Stage \| Production>` | The scan epic(s) the release remediates |
| **Feature** | One feature's scope | `Deploy <YYYY> <Feature> release to ICDC <Stage \| Production>` | The feature epic |

**Who fills what**

The deployment tasks are created by the TPM with their structure and links in place. Each remaining piece has one owner, and the tickets do not duplicate data that lives elsewhere.

| Item | Owner | Where it lives |
|---|---|---|
| Ticket structure, Release Dashboard link, scan or feature epic link | TPM | Each deployment task (at creation) |
| Fix Versions | Developers | Their own story, bug, and finding tickets, never the deployment tasks |
| Service Now Cloud One Ticket Link | DevOps engineer | Each deployment task's Tracking table |
| Deployment Package Number | Tech lead | The Release Dashboard, never the tickets |
| Due dates | TPM | Each deployment task's Due Date field |

**Deployment Package Number**

The identifier of what is deployed. It is the `CBIIT/icdc-deployment` git tag created by the **ICDC Create Release** workflow (`<frontend version>.<build number>`), and it is the `release_number` input to the **ICDC Deploy Release** workflow. One tag pins every service image (frontend, backend, files, interoperation, data_retriever) and the tier configs as they were when the package was created, so deploying the same number to Stage and Production deploys the same code. A config change made after the package is created needs a new package. The deployment tasks' Definition of Done checks the deployed package against the number on the Release Dashboard.

**Where the Release Dashboards live**

One Excel Release Dashboard per monthly release, named `ICDC Monthly Release <Month YYYY>.xlsx`, in a folder per calendar year under `ICDC Software Development / ICDC Software Releases / Release Dashboards` on the NCI-CBIIT-FNL-ICDC SharePoint site. 2026: [ICDC 2026 Monthly Releases](https://nih.sharepoint.com/:f:/r/sites/NCI-CBIIT-FNL-ICDC/Shared%20Documents/ICDC%20Software%20Development/ICDC%20Software%20Releases/Release%20Dashboards/ICDC%202026%20Monthly%20Releases?d=wb9dd60b8b88746d384b6c3388dcdab9d&csf=1&web=1&e=oC8VBM). A feature release gets its own Release Dashboard in the same calendar-year folder.

---

## Standing release epic

One per federal fiscal year (October through September), so the epic stays small enough to scan and closes cleanly at year end. Monthly, patch, and feature release deployment tasks all live under it.

* *Summary*: `ICDC Monthly Releases - FY<YY>`
* *Type*: Epic
* *Assignee*: DevOps Lead or TPM, as the TPM directs
* *Labels*: `release`, `deployment`, `devops`

Body (Jira wiki markup). The Release Dashboards link points to the current calendar year's folder; update it in January.

```
h3. 🎯 *Purpose*
Tracks the monthly ICDC production release cycle for federal FY<YY> (October <YYYY> through September <YYYY+1>). The Stage and Production deployment tasks for each release live under this epic.

h3. 📅 *Cadence*
* *Scheduled release*: one per month, timed so the Prod deployment lands before the next monthly Invicti Prod scan.
* *Patch release*: an out-of-band release with its own deployment tasks when a security finding's SLA due date falls before the next scheduled release.

h3. 📦 *Release Scope*
Each release's contents are its Jira Fix Versions (BE, FE, Interop, Files as applicable), applied by developers on their own tickets. This epic holds only the deployment tasks.

h3. 🗂️ *Release Dashboards*
* *Location*: [ICDC <YYYY> Monthly Releases|<year folder URL>]

h3. ✅ *Closure*
Closes after the September <YYYY+1> release is deployed to Prod.
```

---

## Stage / Production deployment tasks

Two tasks per release, identical except the environment word (**Stage** / **Production**) and the Production-only wording marked below.

**Fields**

* *Summary*: per the Release kinds table.
* *Type*: Task
* *Epic Link*: the current fiscal year's standing epic, set with a follow-up `jira_update_issue` on `customfield_12350`.
* *Assignee*: DevOps Lead, Charles Ngu (`charles.ngu@nih.gov`).
* *Developer* (`customfield_23650`): `[{"name": "nguca"}]`. The field rejects a bare username string.
* *Labels*: `release`, `deployment`, `devops`
* *Fix Version*: leave empty. Fix Versions belong to the work being shipped, not to the tasks that ship it.
* *Due Date*: the scheduled deployment date for that tier. For a monthly or patch release, the Production date must fall no later than the earliest SLA due date of any security finding shipping in the release, and before the next scheduled Prod Invicti scan. If either condition cannot be met, raise it with the TPM before the date is set.
* *Issue links*: both tasks "relate to" the epic(s) in the Release kinds table, and the Stage task "blocks" the Production task. Never cite ticket keys in the body.

**Body**: four sections (🎯 Deployment Summary · 🚦 Workflow · 📋 Tracking · ✅ Definition of Done), Jira wiki markup. `<release name>` is `<Month YYYY> monthly release`, `<Month YYYY> patch release`, or `<YYYY> <Feature> release`.

```
h3. 🎯 *Deployment Summary*
File an NCI ServiceNow ticket so the CloudOne team reserves the date and time to deploy the <release name> to the ICDC <Stage | Production> environment.

* *Release Dashboard*: [<Release Dashboard name>|<Release Dashboard URL>]

h3. 🚦 *Workflow*
# File the NCI ServiceNow ticket at https://service.cancer.gov/ncisp and add the TPM ({{kuffelgr}}) as a watcher.
# Create an all-day Outlook calendar invite for the scheduled deployment day (exact time added later) and add the TPM, BE Lead, FE Lead, and CloudOne Engineer.
# Send the Outlook invite to the assigned CloudOne member and the TPM.
# Deploy the Deployment Package <to Stage | verified in Stage to Production> on the scheduled date, confirm {{/version}} returns the version recorded in the Release Dashboard, and notify the TPM.
# Fill in the Tracking table as information becomes available.

h3. 📋 *Tracking*
||Service Now Cloud One Ticket Link||Assignee||Notes about Deployment||
| |(CloudOne point of contact)|(nuances or issues encountered)|

h3. ✅ *Definition of Done*
* *ServiceNow*: the Service Now Cloud One ticket is linked in Tracking and closed by CloudOne as successful.
* *Deployment Package*: the package deployed matches the Deployment Package Number on the Release Dashboard<Production only: and is the same package verified in Stage>.
* *Deployment*: the Deployment Package is deployed to <Stage | Production> in the scheduled window.
* *Verification*: {{/version}} on <Stage | Production> returns the version recorded in the Release Dashboard, and the application loads and returns data.
* *Release Dashboard*: the <Stage | Production> deployment date is recorded.
* *Handoff*: TPM notified.
```

---

## House style

`h3.` section headers, emoji-prefixed, with bold titles; `#` numbered lists; italic-label `* *Label*: content` bullets; Jira wiki tables (`||header||` header row, `|cell|` body rows); `{{ }}` for monospace. Bodies are written directly in **Jira wiki markup**: `tracker.nci.nih.gov` is Jira Server/Data Center and the mcp-atlassian connector does not translate Markdown, so Markdown renders as literal `###`, `[text](url)`, and backticks. Push with the two-step create-then-update pattern, escape literal curly braces as `\{` and `\}`, then confirm the render in the Jira UI: the API echo is not a reliable preview. Colons, not em dashes.

---

## Creating each release's tasks

1. Create the Stage task with a placeholder body, then `jira_update_issue` with the body above, the Due Date, and labels. Repeat for the Production task.
2. Set the epic link (`customfield_12350`) and Developer (`customfield_23650`) on each and confirm both with `jira_get_issue`.
3. Fill `<release name>` and `<Stage | Production>` in the summary and body, and paste the release's Release Dashboard link. The Release Dashboard must always be linked; a deployment task without one is incomplete.
4. Link both tasks "Related To" the epic(s) in the Release kinds table, and link Stage "Blocks" Production.
5. Open both tickets in the Jira UI and confirm they render.

At the start of each fiscal year, create the new standing epic before the October tasks. In January, create the new calendar-year dashboards folder and update the epic's Release Dashboards link.

---

## Changelog

* *v1.3 (2026-10-20)*: Added the feature release kind (summary pattern, "Related To" the feature epic, own Release Dashboard) alongside monthly and patch releases, in a Release kinds table. Defined the Deployment Package Number (the `icdc-deployment` release tag; still owned by the tech lead and kept on the Release Dashboard). Workflow step 4 now deploys the Deployment Package (Production: the package verified in Stage), and the Definition of Done gains a *Deployment Package* check against the Release Dashboard. Stated that this spec is the only template (no Jira template tickets). Canonical ICDC-4291 / ICDC-4292 updated to match; matches CTDC v4.
* *v1.2 (2026-10-20)*: Added ✅ Definition of Done as the fourth deployment-task section (matching CTDC v3). Recorded where Release Dashboards live (one folder per calendar year). Epic assignee left to the TPM's direction.
* *v1.1 (2026-10-20)*: Split the single combined task into separate Stage and Production tasks to match CTDC; Stage blocks Production. Tracking table first column renamed to "Service Now Cloud One Ticket Link" (matching CTDC v3). Canonical ICDC-4291 (Stage) and ICDC-4292 (Production).
* *v1 (2026-10-20)*: Ported from CTDC's Release Ticket Templates (v2, 2026-10-07). ICDC differences: standing epic is per fiscal year rather than permanent; Release Dashboard link and scan epic link required; ownership table (developers own Fix Versions, DevOps owns ServiceNow links, tech lead owns the package number in the Release Dashboard); Due Date rule tied to the Invicti SLA; version check in the Workflow; no Final Design QA epic (ICDC has not adopted one). Canonical ICDC-4290.
