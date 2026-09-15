# 🛡️ SOP: Monthly Invicti Security Scan Remediation (v1, 2026-09-15)

> **Use this SOP every time NCI Security delivers an Invicti Enterprise Detailed Scan Report for an ICDC environment.** It covers intake, reconciliation against the prior month, triage, Jira ticketing, communications, tracking, and verification. The Jira mechanics (two-step create, epic link via `customfield_12350`, Developer field, rendering-safe Markdown) are the standard ICDC rules in `claude/SKILL.md` and are not repeated here except where the security workflow adds a rule on top.

> **Companion templates**: `claude/templates/invicti-scan-epic-template.md` (the monthly epic) and `claude/templates/invicti-finding-task-template.md` (one task per new finding). Canonical examples for the epic shape are ICDC-4120 (February 2026, DEV plus Stage) and ICDC-4210 (August 2026, Stage); the first epic built on this SOP is the September 2026 cycle.

---

## 1. Why this SOP exists

NCI Security scans ICDC monthly with Invicti Enterprise and expects every finding to be remediated inside a fixed window that depends on severity and on whether the target is public-facing. The window starts when the finding is observed, not when the team gets around to it. Before this SOP the team tracked scans as one-off epics (February, August); with a monthly cadence that pattern breaks in three ways this SOP is designed to prevent:

1. **Clock reset.** A finding that appears in two consecutive reports is the same finding. If a new epic re-creates it, the new task gets a new due date and the real SLA is silently lost.
2. **Epic sprawl.** Low findings have a 180-day window, so an epic that owns them cannot close for six months. ICDC-4120 grew to 27 child tasks across two scans and four months because there was nowhere else for later findings to go.
3. **Perpetual Lows.** Some findings cannot be fixed in code (client-side analytics cookies can never be HttpOnly; Lodash exposes its version by design; Invicti's IP heuristic matches SVG path data). Without a disposition path they reappear every month and make the remediation record look worse than it is.

The organizing principle: **the unit of tracking is the finding, not the scan.** The monthly epic is the intake event; the finding task carries the due date and lives until the finding is verified gone or formally dispositioned.

---

## 2. NCI remediation SLA

| Severity | Public-facing | Internally-facing |
|---|---|---|
| Critical | 15 days | 30 days |
| High | 30 days | 60 days |
| Medium | 60 days | 90 days |
| Low | 180 days | 180 days |

Rules the team applies:

* *Clock start*: the **report delivery date**, which is the report generation timestamp printed at the top of page 1 of the Invicti PDF (the date NCI Security produced and sent the report), not the Scan Time. Decided by the TPM 2026-09-15 pending written confirmation from NCI Security; if they specify a different convention, change this section and the project instructions together.
* *Facing*: `caninecommons.cancer.gov` (Prod) and `caninecommons-stage.cancer.gov` (Stage) are both treated as public-facing (TPM decision 2026-09-15: fixes must reach Stage before Prod anyway, so Stage carries the Prod window). DEV and QA are internal.
* *Multiple environments*: when the same finding is observed on more than one environment, the due date follows the most restrictive one (Prod).
* *No reset*: a finding first observed in an earlier scan keeps its original due date when it reappears.
* *Display*: every status view shows the due date and days remaining. Inside 14 days is **at risk**; past due is **breached**. Both are flagged without being asked.

Worked example (September 2026, both reports delivered 2026-09-14): High due 2026-10-14, Medium due 2026-11-13, Low due 2027-03-13. When the delivery date of an older report is not recorded, use the creation date of that cycle's epic as the proxy (August 2026: ICDC-4210 created 2026-08-17, so August Mediums are due 2026-10-16).

---

## 3. Roles

* *TPM (Gina Kuffel)*: owns intake, reconciliation, ticket creation, NCI Security communications, and the verification task. Assignee on the verification task.
* *ESI tech lead (Ambar Rana)*: triages root cause and assigns finding tasks to the engineer who owns the affected layer. Epics and tasks are created Unassigned; the tech lead assigns them during triage.
* *Engineers*: fix in DEV, open one PR per ticket, promote through QA, Stage, Prod via the standard ICDC pipeline and ServiceNow change requests.
* *QA (Valentina Epishina)*: verifies the fix on each tier and closes the finding task.
* *NCI Security / ISSO*: delivers the report, adjudicates false-positive and accepted-risk requests, marks dispositions in Invicti.

---

## 4. Monthly workflow

### Step 1: Intake

Read the report PDFs in this order: page 1 (summary card), page 2 (Vulnerability Summary table), then each numbered finding section. Record, per environment:

* Target URL, report delivery date (page 1 header timestamp), Scan Time, Scan Duration, Total Requests, Risk Level
* Counts: Identified, Confirmed, and per severity
* The **vulnerability database date** printed under each version-based finding (this explains why a version that was current last month is flagged this month)
* For each finding: name, severity, method and URL, parameter, CVE if any, identified version and latest version, the remedy text, and whether Invicti marked it Confirmed

Save the PDFs to the Claude project for the month so next month's diff has a source.

### Step 2: Reconcile against the prior month

Pull the prior month's epic and every task under it, plus any still-open `invicti-scan` tasks from older epics:

```
project = ICDC AND labels = invicti-scan AND statusCategory != Done ORDER BY duedate ASC
```

Classify every finding in the new report:

* *New*: not present in the prior report for this environment. Gets a task.
* *Carryover*: present in the prior report and still open in Jira. No new task. Listed by key in the epic's Carryover section and linked with `Relates`.
* *Regression*: present in the new report but its Jira task is Closed. Called out explicitly in the epic and in the Slack post; the closed task is reopened rather than cloned, and a comment records which scan re-observed it and on which environment.
* *Resolved*: present in the prior report, absent from this one. Listed in the epic's Resolved section; used as evidence to close the prior month's verification task.

A finding is "the same finding" when the vulnerability name, the environment, and the affected endpoint match. A new CVE against the same component (for example a Tomcat CVE published after last month's upgrade) is a **new** finding, because the remedy is different.

### Step 3: Triage each new finding

For each New finding decide:

* *Severity and environments affected*
* *Root cause*: which layer (nginx, Tomcat, Spring Boot config, React bundle, third-party script, AWS) and which repo
* *Remedy*: the concrete change, and whether a durable control exists that stops the finding class from recurring (see Section 7)
* *Disposition candidate*: whether this is a false positive or a risk to accept rather than a defect to fix. If so, it still gets a task; the task's work is the disposition request.
* *Due date*: delivery date of the report that first observed it, plus the SLA for severity and facing

### Step 4: Create the Jira records

In this order:

1. The **epic**, from `invicti-scan-epic-template.md`. Two-step create (placeholder, then full body). Labels `invicti-scan`, `security`, `vulnerability-remediation`, plus `prod-environment` and/or `stage-environment`. Left Unassigned at creation. Attach the report PDFs to the epic.
2. One **task per New finding**, from `invicti-finding-task-template.md`. Two-step create, then a third `jira_update_issue` with `{"customfield_12350": "<epic key>"}`. Set `duedate`, `priority` (Critical or High severity maps to Jira Critical; Medium to Major; Low to Minor), and labels. Leave Assignee and Developer empty at creation; the tech lead fills both during triage.
3. `Relates` links from the epic to every Carryover task.
4. One **verification task**: summary `Confirm <Month YYYY> findings absent from <next month> Invicti scan`, assigned to the TPM, due the expected delivery date of the next report, linked to the epic via `customfield_12350`.
5. Confirm every task under the epic has a due date before reporting the epic as built.

### Step 5: Communicate

* *Slack*: post the intake summary to `#icdc-security-vulnerabilities` (format in Section 6). Never to `#icdc`.
* *NCI Security*: acknowledge receipt, state the plan and target dates against the SLA dates, and submit any disposition requests. Outlook-compatible HTML tables. Status updates follow the same shape with PR links and tier promotion status.

### Step 6: Track

On request, or weekly during an open High or Critical, produce the status table: key, finding, severity, environment, due date, days remaining, status, tier reached (DEV / QA / Stage / Prod), PR. At-risk and breached rows first.

### Step 7: Verify and close

When the next month's report arrives, run Step 2. For each finding absent from the new report, close its task (if not already closed by QA) with a comment naming the report that confirmed it. Close the verification task with the same evidence. Close the epic when all of its New finding tasks are Closed and none are Regressions.

---

## 5. Dispositions: false positives and accepted risks

A finding that will not be fixed in code still needs a closed loop that an auditor can follow.

1. Create the finding task as normal so the finding has a home and a due date.
2. The task's work is the disposition request: write the evidence (what Invicti matched, why it is not exploitable or not fixable), the reasoning, and the ask (mark as False Positive or Accepted Risk in Invicti so it stops appearing).
3. Send the request to NCI Security as part of the acknowledgement or status email.
4. When NCI Security agrees, close the task with resolution **Won't Fix**, add the label `false-positive` or `risk-accepted`, and paste the justification exactly as sent into a comment. That comment is the audit trail.
5. Record the disposition in the epic's Dispositions section and in the project's standing register so the next intake does not re-triage it.

Standing disposition candidates as of September 2026:

* *Cookie not marked HttpOnly (`s_ac`, `s_fid`, `gpv_pn`, `s_ppv`, `s_tp`)*: Adobe Analytics cookies are set client-side by JavaScript and cannot carry the HttpOnly flag. The server-set cookie already carries `HttpOnly; Secure`.
* *Version disclosure (Lodash)*: `_.VERSION` is exposed in the DOM by design. The control is keeping Lodash current.
* *Possible internal IP address disclosure (`10.33.63.23` in the JS bundle)*: the match sits inside SVG path coordinate data in the compiled bundle. Verify the surrounding characters before submitting; the pattern has recurred on both Prod and Stage.
* *Misconfigured Access-Control-Allow-Origin on `/version`*: wildcard CORS on an unauthenticated public JSON version string. Accept, or scope the header to the ICDC origin if the endpoint is only consumed by the frontend.

---

## 6. Slack conventions for `#icdc-security-vulnerabilities`

* Intake post: scan date and target per environment, risk level, counts by severity, New / Carryover / Resolved / Regression lists by finding name, nearest due date with days remaining, epic key. Emoji headers, short lines.
* Status post: the at-risk and breached rows first, then everything else in due-date order.
* Never post exploit payloads, request or response bodies, cookie values, internal IP addresses, or file paths. The evidence lives on the Jira task.
* One draft per channel at a time; a new draft replaces the prior one.

---

## 7. Standing technical knowledge

* *Tomcat version fingerprint*: Invicti reads the version from the `<h3>Apache Tomcat/x.y.z</h3>` banner on Tomcat's default error page, reached by injecting into a query string on `/version`. Tomcat patch releases land roughly monthly and Invicti's CVE database refreshes before each scan, so a "current" version becomes an "out-of-date" finding within weeks. Two controls: bump `tomcat.version` to the latest in the 10.1.x branch every cycle, and suppress the fingerprint (`showServerInfo="false"` and `showReport="false"` on the ErrorReportValve; `server.error.include-stacktrace=never` and a custom error page in Spring Boot). Suppression removes the banner-based match and the version-disclosure Low but does not remove the obligation to patch.
* *Embedded Tomcat*: if the backend runs Spring Boot with embedded Tomcat, the examples webapp is not deployed, so CVEs scoped to the examples (for example CVE-2026-66299, WebSocket chat example) are not exploitable here. State this in the task as risk context; NCI Security still expects the version bump.
* *GraphQL introspection*: must be disabled by environment configuration on both `/api/interoperation/graphql` and `/v1/graphql/`, and confirmed on Prod rather than only on lower tiers. This finding has appeared on three consecutive scans (February DEV, August Stage, September Prod) and was closed once in between; treat any recurrence as a regression.
* *Stack trace and 500 on `/v1/graphql/`*: an XML body with an external entity declaration posted to the GraphQL endpoint returns a Spring Boot 500. The fix is input validation (reject non-JSON content types on the GraphQL endpoint) plus generic error handling.
* *Lodash and other npm dependencies*: a dependency that was a Low version-disclosure note can become Critical the month a new CVE is published against it (Lodash, August 2026). Check `npm audit` against the bundle before each intake so the team is not surprised by the report.

---

## 8. Change log

| Date | Change |
|---|---|
| 2026-09-15 | v1. Written after the September 2026 Prod and Stage reports, alongside the epic and finding templates and the ICDC Security Scans Claude project. |
| 2026-09-15 | v1.1. Clock start changed from Scan Time to report delivery date; Stage confirmed public-facing; tickets created Unassigned (TPM decisions). |
