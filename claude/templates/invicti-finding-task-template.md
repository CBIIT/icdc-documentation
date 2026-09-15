### 🔒 Invicti Finding Task Template (v1, 2026-09-15)

> **Use this template for every finding that is first observed in a monthly Invicti scan.** One task per finding, where a finding is one vulnerability name on one endpoint (the same finding observed on Prod and Stage is one task listing both environments). The task carries the SLA due date and lives until QA confirms the fix on the tier where it was observed, or until NCI Security accepts a disposition. Surrounding workflow: `claude/sops/invicti-monthly-scan-sop.md`. Parent: the monthly epic from `invicti-scan-epic-template.md`.

**Issue type**: Task. **Summary**: `[SEC-<CRIT|HIGH|MED|LOW|BP>] <plain-language remedy>`; when the finding is a CVE, include the ID: `[SEC-HIGH] CVE-2026-66299: Upgrade Apache Tomcat from 10.1.57 to 10.1.59`. **Priority**: Critical or High severity → Jira Critical; Medium → Major; Low and Best Practice → Minor. **Due date**: mandatory, first-observed scan date plus the SLA window. **Assignee and Developer (`customfield_23650`)**: both set. **Labels**: `invicti-scan`, `security`, one of `critical-severity` / `high-severity` / `medium-severity` / `low-severity` / `best-practice`, plus a component label where useful (`tomcat`, `graphql`, `dependency-upgrade`, `nginx`, `cookies`, `cors`).

**Section order (5 sections, exactly this sequence)**

Each header is `### **Title**` with the emoji shown. All five are required. Bullets use `* *Label*: content`. No em dashes. No Jira keys in the body; the epic link and any `Relates` links live in Jira's Links panel.

1. `### 🎯 **Finding**`

   What Invicti reported, in the assignee's terms. Bullets:

   * *Vulnerability*: the Invicti finding name and severity
   * *Environments*: which targets it was observed on, with each scan date
   * *Endpoint*: method and URL, with the parameter if any
   * *Evidence*: the single line that proves it (for example the `<h3>Apache Tomcat/10.1.57</h3>` banner, or the `Access-Control-Allow-Origin: *` header). Not the full request or response.
   * *Reference*: CVE ID and affected version range, or the CWE, when present
   * *Certainty*: Confirmed or Identified, as Invicti marked it

2. `### 🧠 **Why It Matters**`

   Two to four sentences explaining the risk in plain language: what an attacker could do with it, and any context that changes the real exposure (for example a CVE scoped to a Tomcat examples webapp that embedded Tomcat never deploys). This is where a disposition candidate states the case that the finding is a false positive or an accepted risk.

3. `### 🔧 **Remedy**`

   The concrete change, which repo and layer, and the durable control if one exists. Bullets:

   * *Change*: the fix (for example bump `tomcat.version` to 10.1.59 in the backend `pom.xml`)
   * *Where*: repo and file or configuration location
   * *Durable control*: the change that stops this class of finding from recurring, when different from the fix (for example suppress the Tomcat error-page banner so version fingerprinting stops)
   * *Disposition* (only for false-positive or accepted-risk tasks): the request wording to send NCI Security and the ask (mark in Invicti)

4. `### ✅ **Acceptance Criteria**`

   Testable statements, one per bullet, that QA can verify on each tier:

   * The evidence line from Section 1 no longer appears when the same request is replayed
   * The fix is deployed on every environment listed in Section 1
   * Application behavior that depends on the changed component is unaffected (name the specific check, for example the GraphQL queries the frontend issues still succeed)
   * For a disposition task: NCI Security has confirmed the disposition in writing and the finding is marked in Invicti

5. `### ⏱️ **SLA**`

   The due date and how it was derived, so nobody has to recompute it:

   * *First observed*: environment and scan date
   * *Window*: severity, facing, and days (for example High, public-facing, 30 days)
   * *Due*: the date, and days remaining at ticket creation

**Required content rules**

* *One task per finding, all environments on it*: if the finding is later observed on an additional environment, add it to Section 1 and re-evaluate the due date against the more restrictive tier; do not create a second task.
* *Due date is mandatory at creation*: a finding task without a due date is incomplete.
* *Evidence is one line*: full request and response bodies, payloads, cookie values, and internal IPs stay in the attached PDF on the epic. The task quotes only the line that identifies the finding.
* *Disposition tasks close as Won't Fix*: with the label `false-positive` or `risk-accepted` and a comment containing the justification exactly as sent to NCI Security.
* *Regressions reopen, never clone*: if a Closed task's finding reappears, transition it back to Open, add a comment naming the report and environment that re-observed it, and keep the original due date unless NCI Security resets it.
* *One PR per task*: standard ICDC convention. The PR link goes in a comment, not the body.
* *Rendering-safe patterns*: `### **Title**` headers, `* *Label*: content` bullets, blank line after every heading, no in-cell line breaks. Comments are plain text with real line breaks; no Markdown.

**Writing-and-publishing workflow**

1. Triage per the SOP: severity, environments, root cause, remedy, disposition candidate, due date.
2. `jira_create_issue` with `issue_type = "Task"`, the summary above, a placeholder description, labels, priority, assignee.
3. `jira_update_issue` with the full body, `duedate`, and `customfield_23650`.
4. `jira_update_issue` with `{"customfield_12350": "<epic key>"}` to link the parent epic (separate call; the `epicKey` parameter does not work reliably on this instance).
5. Post the PR link as a plain-text comment when it opens; QA closes the task with resolution Fixed after confirming on the observed tier(s).

**Worked example (September 2026 High)**

Summary: `[SEC-HIGH] CVE-2026-66299: Upgrade Apache Tomcat from 10.1.57 to 10.1.59`. Finding: Out-of-date Version (Tomcat), High, Prod 2026-09-01 and Stage 2026-09-08, `GET /version` with an injected query string, evidence `<h3>Apache Tomcat/10.1.57</h3>` on the error page, affected range 10.1.24 to 10.1.57, Identified. Why it matters: the CVE is an uncontrolled resource consumption flaw in Tomcat's WebSocket chat example; Spring Boot embedded Tomcat does not deploy the examples webapp, so the exploit path is not present, but Invicti and NCI Security evaluate by version. Remedy: bump `tomcat.version` to 10.1.59; durable control: disable `showServerInfo` and `showReport` on the ErrorReportValve and set `server.error.include-stacktrace=never` so the banner no longer fingerprints the version. SLA: first observed Prod 2026-09-01, High, public-facing, 30 days, due 2026-10-01.
