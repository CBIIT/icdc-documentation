# 🎟️ Release Ticket Templates

> **Use this component for the two Jira artifacts that recur with every ICDC software release: the standing release epic (one per federal fiscal year) and the monthly deployment task (one per release).** ICDC releases monthly so that fixes for the monthly NCI Invicti scan findings reach Production on a predictable schedule. This file is the canonical spec. For DevOps work that is not a release promotion (upgrades, environment variables, infrastructure changes), use the DevOps Task template (`devops-task-template.md`).
>
> Canonical ICDC examples: **ICDC-4290** (standing epic, FY27) and **ICDC-4291** (October 2026 deployment task). CTDC's equivalent is `CBIIT/ctdc-documentation/claude/templates/release-ticket-templates.md`.

**Why this component**

A release deployment is not a finding and not a DevOps change. One release can carry fixes from several monthly scan epics plus feature work, so it cannot live inside any one scan epic without tangling that epic's closure. It needs its own record that answers three questions an auditor or the TPM will ask: what shipped, when did it reach each tier, and under which ServiceNow change. Pinning one shape for that record keeps every month identical, so status emails and audits can rely on the structure.

**Who fills what**

The deployment task is created by the TPM with its structure and links in place. Each remaining piece has one owner, and the ticket does not duplicate data that lives elsewhere.

| Item | Owner | Where it lives |
|---|---|---|
| Ticket structure, Release Dashboard link, scan epic link | TPM | The deployment task (at creation) |
| Fix Versions | Developers | Their own story, bug, and finding tickets, never the deployment task |
| Stage and Production ServiceNow ticket URLs | DevOps engineer | The deployment task's Tracking table |
| Deployment package number | Tech lead | The Release Dashboard, never the ticket |
| Due date | TPM | The deployment task's Due Date field |

---

## Standing release epic

One per federal fiscal year (October through September), so the epic stays small enough to scan and closes cleanly at year end.

* *Summary*: `ICDC Monthly Releases - FY<YY>`
* *Type*: Epic
* *Assignee*: TPM (`gina.kuffel@nih.gov`)
* *Labels*: `release`, `deployment`, `devops`

Body (Jira wiki markup):

```
h3. 🎯 *Purpose*
Tracks the monthly ICDC production release cycle for federal FY<YY> (October <YYYY> through September <YYYY+1>). One DevOps deployment task per release lives under this epic.

h3. 📅 *Cadence*
* *Scheduled release*: one per month, timed so the Prod deployment lands before the next monthly Invicti Prod scan.
* *Patch release*: an out-of-band release with its own deployment task when a security finding's SLA due date falls before the next scheduled release.

h3. 📦 *Release Scope*
Each release's contents are its Jira Fix Versions (BE, FE, Interop, Files as applicable), applied by developers on their own tickets. This epic holds only the deployment tasks.

h3. 🗂️ *Release Dashboards*
* *Location*: [ICDC Release Dashboards|https://nih.sharepoint.com/sites/NCI-CBIIT-FNL-ICDC/Shared%20Documents/ICDC%20Software%20Development/ICDC%20Software%20Releases/Release%20Dashboards]

h3. ✅ *Closure*
Closes after the September <YYYY+1> release is deployed to Prod.
```

---

## Monthly deployment task

One task per release covers both Stage and Production. (CTDC uses separate Stage and Prod tasks per quarterly release; ICDC combines them because a monthly release is promoted to both tiers inside the same short window, and one record per release is what the security status reporting needs.)

**Fields**

* *Summary*: `Deploy <Month YYYY> monthly release to ICDC Stage and Production`. Patch release: `Deploy <Month YYYY> patch release to ICDC Stage and Production`.
* *Type*: Task
* *Epic Link*: the current fiscal year's standing epic, set with a follow-up `jira_update_issue` on `customfield_12350`.
* *Assignee*: DevOps Lead, Charles Ngu (`charles.ngu@nih.gov`).
* *Developer* (`customfield_23650`): `[{"name": "nguca"}]`. The field rejects a bare username string.
* *Labels*: `release`, `deployment`, `devops`
* *Fix Version*: leave empty. Fix Versions belong to the work being shipped, not to the task that ships it.
* *Due Date*: the scheduled Production deployment date. It must fall no later than the earliest SLA due date of any security finding shipping in the release, and before the next scheduled Prod Invicti scan. If either condition cannot be met, raise it with the TPM before the date is set.
* *Issue links*: "relates to" the Invicti scan epic(s) whose findings this release remediates. Never cite the epic key in the body.

**Body**: three sections (🎯 Deployment Summary · 🚦 Workflow · 📋 Tracking), Jira wiki markup:

```
h3. 🎯 *Deployment Summary*
File NCI ServiceNow tickets so the CloudOne team reserves the date and time to deploy the <Month YYYY> ICDC release to the Stage environment, then to Production.

* *Release Dashboard*: [ICDC Monthly Release <Month YYYY>|<Release Dashboard URL>]

h3. 🚦 *Workflow*
# File the NCI ServiceNow ticket for Stage at https://service.cancer.gov/ncisp, add the TPM ({{kuffelgr}}) as a watcher, and paste its URL in the Tracking table.
# Create an all-day Outlook calendar invite for the scheduled Stage deployment day (exact time added later) and add the TPM, BE Lead, FE Lead, and CloudOne Engineer.
# Deploy to Stage on the scheduled date, confirm {{/version}} returns the version recorded in the Release Dashboard, and notify the TPM.
# Repeat steps 1 through 3 for Production only after Stage is verified.
# Fill in the Tracking table as information becomes available.

h3. 📋 *Tracking*
||Tier||NCI ServiceNow Ticket URL||Assignee||Notes about Deployment||
|Stage| |(CloudOne point of contact)|(nuances or issues encountered)|
|Production| |(CloudOne point of contact)|(nuances or issues encountered)|
```

---

## House style

`h3.` section headers, emoji-prefixed, with bold titles; `#` numbered lists; italic-label `* *Label*: content` bullets; Jira wiki tables (`||header||` header row, `|cell|` body rows); `{{ }}` for monospace. Bodies are written directly in **Jira wiki markup**: `tracker.nci.nih.gov` is Jira Server/Data Center and the mcp-atlassian connector does not translate Markdown, so Markdown renders as literal `###`, `[text](url)`, and backticks. Push with the two-step create-then-update pattern, escape literal curly braces as `\{` and `\}`, then confirm the render in the Jira UI: the API echo is not a reliable preview. Colons, not em dashes.

---

## Creating each month's task

1. Create the task with a placeholder body, then `jira_update_issue` with the body above, the Due Date, and labels.
2. Set the epic link (`customfield_12350`) and Developer (`customfield_23650`) in a second update and confirm both with `jira_get_issue`.
3. Swap `<Month YYYY>` in the summary and body, and paste the month's Release Dashboard link. The Release Dashboard must always be linked; a deployment task without one is incomplete.
4. Add a "relates to" link to each Invicti scan epic the release remediates.
5. Open the ticket in the Jira UI and confirm it renders.

At the start of each fiscal year, create the new standing epic before the October task.

---

## Changelog

* *v1 (2026-10-20)*: Ported from CTDC's Release Ticket Templates (v2, 2026-10-07). ICDC differences: standing epic is per fiscal year rather than permanent; one combined Stage and Production task per monthly release instead of two per quarterly release; Release Dashboard link and scan epic link required; ownership table (developers own Fix Versions, DevOps owns ServiceNow URLs, tech lead owns the package number in the Release Dashboard); Due Date rule tied to the Invicti SLA; no Final Design QA epic (ICDC has not adopted one). Canonical ICDC-4290 and ICDC-4291.
