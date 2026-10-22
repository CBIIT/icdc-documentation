# 🎟️ Release Ticket Templates

> **Use this component for the Jira artifacts that recur with every ICDC software release: the standing release epic (one per federal fiscal year), and the Deployment Package task and Stage and Production deployment tasks (one of each per release).** ICDC releases monthly so that fixes for the monthly NCI Invicti scan findings reach Production on a predictable schedule. This file is the canonical spec. The TPM creates each release's tickets from it; there are no Jira clone-source tickets. For DevOps work that is not a release promotion (upgrades, environment variables, infrastructure changes), use the DevOps Task template (`devops-task-template.md`).
>
> Canonical ICDC examples: **ICDC-4290** (standing epic, FY27), **ICDC-4296** (October 2026 Deployment Package), **ICDC-4291** (October 2026 Stage deployment), **ICDC-4292** (October 2026 Production deployment). CTDC's equivalent, kept in lockstep, is `CBIIT/ctdc-documentation/claude/templates/release-ticket-templates.md`.

**Why this component**

A release deployment is not a finding and not a DevOps change. One release can carry fixes from several monthly scan epics plus feature work, so it cannot live inside any one scan epic without tangling that epic's closure. It needs its own record that answers three questions an auditor or the TPM will ask: what shipped, when did it reach each tier, and under which ServiceNow change.

The Deployment Package task answers "what shipped" before anything moves. It pins the exact version of every microservice in the release, so DevOps deploys a known package to Stage and the same package to Production. It blocks both deployment tasks: a deployment cannot start until the package it deploys is defined.

Stage and Production get separate tasks because they are separate events: each has its own ServiceNow ticket, its own scheduled date, and its own outcome. Separate tasks let Stage close when Stage is done, give each task a due date that matches its own deployment, and make a Production delay visible on its own ticket.

**Who fills what**

The release tickets are created by the TPM with their structure and links in place. Each remaining piece has one owner, and the tickets do not duplicate data that lives elsewhere.

| Item | Owner | Where it lives |
|---|---|---|
| Ticket structure, Release Dashboard link, issue links | TPM | Each release ticket (at creation) |
| Fix Versions | Developers | Their own story, bug, and finding tickets, never the release tickets |
| Microservice versions and Deployment Package Number | Tech lead, through the Deployment Package task | The Release Dashboard, never the tickets |
| Service Now Cloud One Ticket Link | DevOps engineer | Each deployment task's Tracking table |
| Due dates | TPM | Each Deployment Package and deployment task's Due Date field |

**Where the Release Dashboards live**

One Excel Release Dashboard per monthly release, named `ICDC Monthly Release <Month YYYY>.xlsx`, in a folder per calendar year under `ICDC Software Development / ICDC Software Releases / Release Dashboards` on the NCI-CBIIT-FNL-ICDC SharePoint site. 2026: [ICDC 2026 Monthly Releases](https://nih.sharepoint.com/:f:/r/sites/NCI-CBIIT-FNL-ICDC/Shared%20Documents/ICDC%20Software%20Development/ICDC%20Software%20Releases/Release%20Dashboards/ICDC%202026%20Monthly%20Releases?d=wb9dd60b8b88746d384b6c3388dcdab9d&csf=1&web=1&e=oC8VBM).

---

## Standing release epic

One per federal fiscal year (October through September), so the epic stays small enough to scan and closes cleanly at year end.

* *Summary*: `ICDC Monthly Releases - FY<YY>`
* *Type*: Epic
* *Assignee*: DevOps Lead or TPM, as the TPM directs
* *Labels*: `release`, `deployment`, `devops`

Body (Jira wiki markup). The Release Dashboards link points to the current calendar year's folder; update it in January.

```
h3. 🎯 *Purpose*
Tracks the monthly ICDC production release cycle for federal FY<YY> (October <YYYY> through September <YYYY+1>). The Deployment Package, Stage, and Production tasks for each release live under this epic.

h3. 📅 *Cadence*
* *Scheduled release*: one per month, timed so the Prod deployment lands before the next monthly Invicti Prod scan.
* *Patch release*: an out-of-band release with its own deployment tasks when a security finding's SLA due date falls before the next scheduled release.

h3. 📦 *Release Scope*
Each release's contents are its Jira Fix Versions (BE, FE, Interop, Files as applicable), applied by developers on their own tickets. This epic holds only the release tasks.

h3. 🗂️ *Release Dashboards*
* *Location*: [ICDC <YYYY> Monthly Releases|<year folder URL>]

h3. ✅ *Closure*
Closes after the September <YYYY+1> release is deployed to Prod.
```

---

## Deployment Package task

One per release, created first; it blocks both deployment tasks.

**Fields**

* *Summary*: `Identify the <Month YYYY> monthly release Deployment Package`. Patch release: `Identify the <Month YYYY> patch release Deployment Package`.
* *Type*: Task
* *Epic Link*: the current fiscal year's standing epic, set with a follow-up `jira_update_issue` on `customfield_12350`.
* *Assignee*: Tech Lead, Ambar Rana (`ambar.rana@nih.gov`).
* *Developer* (`customfield_23650`): `[{"name": "ranaab"}]`.
* *Labels*: `release`, `deployment`
* *Fix Version*: leave empty.
* *Due Date*: before the Stage deployment task's Due Date, leaving time to file the Stage ServiceNow request.
* *Issue links*: "blocks" the Stage task and "blocks" the Production task.

**Body**: three sections (🎯 Task Summary · 🚦 Workflow · ✅ Definition of Done), Jira wiki markup:

```
h3. 🎯 *Task Summary*
Identify the version of every microservice shipping in the <Month YYYY> monthly release and record them, with the Deployment Package Number, on the Release Dashboard, so DevOps deploys one known package to Stage and the same package to Production.

* *Release Dashboard*: [ICDC Monthly Release <Month YYYY>|<Release Dashboard URL>]

h3. 🚦 *Workflow*
# Confirm the release's Fix Versions are complete for every microservice in the release.
# Record the version of every microservice in the release (Frontend, Backend, File Service, Interop, Data Retriever) on the Release Dashboard.
# Record the Deployment Package Number on the Release Dashboard.

h3. ✅ *Definition of Done*
* *Versions*: the version of every microservice in the release is recorded on the Release Dashboard.
* *Fix Versions*: each recorded version matches that microservice's Fix Version for the release.
* *Deployment Package*: the Deployment Package Number is recorded on the Release Dashboard.
```

Keep the microservice list in Workflow step 2 current: add or remove a service here when the release's Fix Version set changes.

---

## Stage / Production deployment tasks

Two tasks per release, identical except the environment word (**Stage** / **Production**) and two Production-only phrases that pin Production to the package already verified in Stage (marked below).

**Fields**

* *Summary*: `Deploy <Month YYYY> monthly release to ICDC <Stage | Production>`. Patch release: `Deploy <Month YYYY> patch release to ICDC <Stage | Production>`.
* *Type*: Task
* *Epic Link*: the current fiscal year's standing epic, set with a follow-up `jira_update_issue` on `customfield_12350`.
* *Assignee*: DevOps Lead, Charles Ngu (`charles.ngu@nih.gov`).
* *Developer* (`customfield_23650`): `[{"name": "nguca"}]`. The field rejects a bare username string.
* *Labels*: `release`, `deployment`, `devops`
* *Fix Version*: leave empty. Fix Versions belong to the work being shipped, not to the tasks that ship it.
* *Due Date*: the scheduled deployment date for that tier. The Production date must fall no later than the earliest SLA due date of any security finding shipping in the release, and before the next scheduled Prod Invicti scan. If either condition cannot be met, raise it with the TPM before the date is set.
* *Issue links*: both tasks are "blocked by" the Deployment Package task and "relate to" the Invicti scan epic(s) whose findings the release remediates, and the Stage task "blocks" the Production task. Never cite ticket keys in the body.

**Body**: four sections (🎯 Deployment Summary · 🚦 Workflow · 📋 Tracking · ✅ Definition of Done), Jira wiki markup. There is no handoff step or Handoff bullet: the handoff is the ticket's status change in Jira.

```
h3. 🎯 *Deployment Summary*
File an NCI ServiceNow ticket so the CloudOne team reserves the date and time to deploy the <Month YYYY> monthly release to the ICDC <Stage | Production> environment.

* *Release Dashboard*: [ICDC Monthly Release <Month YYYY>|<Release Dashboard URL>]

h3. 🚦 *Workflow*
# File the NCI ServiceNow ticket at https://service.cancer.gov/ncisp and add the TPM ({{kuffelgr}}) as a watcher.
# Create an all-day Outlook calendar invite for the scheduled deployment day (exact time added later) and add the TPM, BE Lead, FE Lead, and CloudOne Engineer.
# Send the Outlook invite to the assigned CloudOne member and the TPM.
# Deploy the Deployment Package [Production only: verified in Stage] to <Stage | Production> on the scheduled date and confirm {{/version}} returns the version recorded in the Release Dashboard.
# Fill in the Tracking table as information becomes available.

h3. 📋 *Tracking*
||Service Now Cloud One Ticket Link||Assignee||Notes about Deployment||
| |(CloudOne point of contact)|(nuances or issues encountered)|

h3. ✅ *Definition of Done*
* *ServiceNow*: the Service Now Cloud One ticket is linked in Tracking and closed by CloudOne as successful.
* *Deployment Package*: the package deployed matches the Deployment Package Number on the Release Dashboard [Production only: and is the same package verified in Stage].
* *Deployment*: the Deployment Package is deployed to <Stage | Production> in the scheduled window.
* *Verification*: {{/version}} on <Stage | Production> returns the version recorded in the Release Dashboard, and the application loads and returns data.
* *Release Dashboard*: the <Stage | Production> deployment date is recorded.
```

---

## House style

`h3.` section headers, emoji-prefixed, with bold titles; `#` numbered lists; italic-label `* *Label*: content` bullets; Jira wiki tables (`||header||` header row, `|cell|` body rows); `{{ }}` for monospace. Bodies are written directly in **Jira wiki markup**: `tracker.nci.nih.gov` is Jira Server/Data Center and the mcp-atlassian connector does not translate Markdown, so Markdown renders as literal `###`, `[text](url)`, and backticks. Push with the two-step create-then-update pattern, escape literal curly braces as `\{` and `\}`, then confirm the render in the Jira UI: the API echo is not a reliable preview. Colons, not em dashes.

---

## Creating each month's tasks

1. Create the Deployment Package task, then the Stage and Production tasks, each with a placeholder body; then `jira_update_issue` each with the body above, the Due Date, and labels.
2. Set the epic link (`customfield_12350`) and Developer (`customfield_23650`) on each and confirm both with `jira_get_issue`.
3. Swap `<Month YYYY>` and `<Stage | Production>` in the summary and body, resolve the two `[Production only: ...]` phrases (keep the words on Production, delete them on Stage), and paste the month's Release Dashboard link. The Release Dashboard must always be linked; a release task without one is incomplete.
4. Link the Deployment Package task "Blocks" the Stage task and "Blocks" the Production task; link both deployment tasks to each Invicti scan epic the release remediates ("Related To"); and link Stage "Blocks" Production.
5. Open all three tickets in the Jira UI and confirm they render.

At the start of each fiscal year, create the new standing epic before the October tasks. In January, create the new calendar-year dashboards folder and update the epic's Release Dashboards link.

---

## Changelog

* *v1.4 (2026-10-22)*: Added the **Deployment Package task**: the Tech Lead identifies every microservice version and records the Deployment Package Number on the Release Dashboard; it blocks both deployment tasks. Canonical ICDC-4296 (October 2026). Ownership table and creation steps updated to match. Stated that tickets are created from this spec, not cloned. CTDC changed in lockstep (v6), and also dropped its Jira clone-source tickets so both projects use the same create-from-spec model.
* *v1.3 (2026-10-22)*: Adopted the wording already in use on ICDC-4291 and ICDC-4292: "monthly release" in the Deployment Summary; "Deployment Package" replaces "the build" in Workflow step 4 and the Definition of Done; new *Deployment Package* Definition of Done bullet tying the deployed package to the Deployment Package Number on the Release Dashboard, with Production also requiring the same package verified in Stage. Removed the *Handoff* Definition of Done bullet and the "notify the TPM" clause from Workflow step 4: the handoff is the ticket's status change in Jira. CTDC updated in lockstep (v4).
* *v1.2 (2026-10-20)*: Added ✅ Definition of Done as the fourth deployment-task section (matching CTDC v3). Recorded where Release Dashboards live (one folder per calendar year). Epic assignee left to the TPM's direction.
* *v1.1 (2026-10-20)*: Split the single combined task into separate Stage and Production tasks to match CTDC; Stage blocks Production. Tracking table first column renamed to "Service Now Cloud One Ticket Link" (matching CTDC v3). Canonical ICDC-4291 (Stage) and ICDC-4292 (Production).
* *v1 (2026-10-20)*: Ported from CTDC's Release Ticket Templates (v2, 2026-10-07). ICDC differences: standing epic is per fiscal year rather than permanent; Release Dashboard link and scan epic link required; ownership table (developers own Fix Versions, DevOps owns ServiceNow links, tech lead owns the package number in the Release Dashboard); Due Date rule tied to the Invicti SLA; version check in the Workflow; no Final Design QA epic (ICDC has not adopted one). Canonical ICDC-4290.
