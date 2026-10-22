### 🔒 Invicti Finding Task Template (v1.2, 2026-10-22)

> **Use this template for every finding that is first observed in a monthly Invicti scan.** One task per finding, where a finding is one vulnerability name on one endpoint (the same finding observed on Prod and Stage is one task listing both environments). The task carries the SLA due date and lives until QA confirms the fix on the tier where it was observed, or until NCI Security accepts a disposition. Surrounding workflow: `claude/sops/invicti-monthly-scan-sop.md`. Parent: the monthly epic from `invicti-scan-epic-template.md`.
>
> **Status:** v1.2 (2026-10-22): summary format changed from `[SEC-<sev>] <remedy>` to `Invicti Security Vulnerability (<Severity>): <remedy>` so the title reads clearly outside the security workstream and matches the epic naming. v1.1 (2026-10-22): companion deployment-config task exception added. v1 (2026-09-15). Mirrors CTDC's Invicti Finding Task template (`CBIIT/ctdc-documentation → claude/templates/invicti-finding-task-template.md`); the two are kept in lockstep.

**Issue type**: Task. **Summary**: `Invicti Security Vulnerability (<Severity>): <plain-language remedy>`, where Severity is one of `Critical`, `High`, `Medium`, `Low`, `Best Practice`. When the finding is a CVE, lead the remedy with the ID and a comma: `Invicti Security Vulnerability (High): CVE-2026-66299, upgrade Apache Tomcat to 10.1.59`. One colon per summary. The prefix is long and board cards truncate, so keep the remedy short and verb-first. **Priority**: Critical or High severity → Jira Critical; Medium → Major; Low and Best Practice → Minor. **Due date**: mandatory, delivery date of the report that first observed the finding plus the SLA window. The `duedate` field is not on the ICDC Task screen, so carry it as the label `sla-due-YYYY-MM-DD` and in the SLA section until the screen scheme is changed. **Assignee and Developer (`customfield_23650`)**: left empty at creation; the ESI tech lead sets both during triage. **Labels**: `invicti-scan`, `security`, one of `critical-severity` / `high-severity` / `medium-severity` / `low-severity` / `best-practice`, plus a component label where useful (`tomcat`, `graphql`, `dependency-upgrade`, `nginx`, `cookies`, `cors`).

**Section order (5 sections, exactly this sequence)**

Each header is `h3. {emoji} *Title*` with the emoji shown. All five are required. Bullets use `* *Label*: content`. No em dashes. No Jira keys in the body; the epic link and any `Relates` links live in Jira's Links panel.

1. `h3. 🎯 *Finding*`

   What Invicti reported, in the assignee's terms. Bullets:

   * *Vulnerability*: the Invicti finding name and severity
   * *Environments*: which targets it was observed on, with each scan date
   * *Endpoint*: method and URL, with the parameter if any
   * *Evidence*: the single line that proves it (for example the `<h3>Apache Tomcat/10.1.57</h3>` banner, or the `Access-Control-Allow-Origin: *` header). Not the full request or response.
   * *Reference*: CVE ID and affected version range, or the CWE, when present
   * *Certainty*: Confirmed or Identified, as Invicti marked it

2. `h3. 🧠 *Why It Matters*`

   Two to four sentences explaining the risk in plain language: what an attacker could do with it, and any context that changes the real exposure (for example a CVE scoped to a Tomcat examples webapp that embedded Tomcat never deploys). This is where a disposition candidate states the case that the finding is a false positive or an accepted risk.

3. `h3. 🔧 *Remedy*`

   The concrete change, which repo and layer, and the durable control if one exists. Bullets:

   * *Change*: the fix (for example bump `tomcat.version` to 10.1.59 in the backend `pom.xml`)
   * *Where*: repo and file or configuration location
   * *Durable control*: the change that stops this class of finding from recurring, when different from the fix (for example suppress the Tomcat error-page banner so version fingerprinting stops)
   * *Disposition* (only for false-positive or accepted-risk tasks): the request wording to send NCI Security and the ask (mark in Invicti)

4. `h3. ✅ *Acceptance Criteria*`

   Testable statements, one per bullet, that QA can verify on each tier:

   * The evidence line from Section 1 no longer appears when the same request is replayed
   * The fix is deployed on every environment listed in Section 1
   * Application behavior that depends on the changed component is unaffected (name the specific check, for example the GraphQL queries the frontend issues still succeed)
   * For a disposition task: NCI Security has confirmed the disposition in writing and the finding is marked in Invicti

5. `h3. ⏱️ *SLA*`

   The due date and how it was derived, so nobody has to recompute it:

   * *First observed*: environment, scan date, and report delivery date (the clock start)
   * *Window*: severity, facing, and days (for example High, public-facing, 30 days)
   * *Due*: the date, and days remaining at ticket creation

**Required content rules**

* *One task per finding, all environments on it*: if the finding is later observed on an additional environment, add it to Section 1 and re-evaluate the due date against the more restrictive tier; do not create a second task.
* *Companion deployment-config task (the one exception)*: when the fix needs both a code change and a deployment-configuration change (for example a new environment variable the code reads at startup), a second task may carry the configuration work. Rules: both summaries use the same `Invicti Security Vulnerability (<Severity>):` prefix; the finding task's remedy names the code change (`Invicti Security Vulnerability (Medium): Disable GraphQL introspection in interop service code`) and the companion's names the configuration change (`Invicti Security Vulnerability (Medium): Set GRAPHQL_INTROSPECTION_ENABLED in deployment config`); both tasks carry the same five sections, the same Finding and Why It Matters content, and the same `sla-due-YYYY-MM-DD` label; the companion's Acceptance Criteria cover only the configuration being present and deploys succeeding, while the finding task keeps the end-to-end criteria (evidence gone on every tier); link them with `Blocks` so the companion blocks the finding task, never `Cloners`; the finding task closes last, after the companion is done and QA confirms the evidence is gone.
* *Due date is mandatory at creation*: a finding task without a due date is incomplete.
* *Evidence is one line*: full request and response bodies, payloads, cookie values, and internal IPs stay in the attached PDF on the epic. The task quotes only the line that identifies the finding.
* *Disposition tasks close as Won't Fix*: with the label `false-positive` or `risk-accepted` and a comment containing the justification exactly as sent to NCI Security.
* *Regressions reopen, never clone*: if a Closed task's finding reappears, transition it back to Open, add a comment naming the report and environment that re-observed it, and keep the original due date unless NCI Security resets it.
* *One PR per task*: standard ICDC convention. The PR link goes in a comment, not the body.
* *Jira wiki authoring* (connector Markdown translation is off, so what is sent is stored exactly; see `claude/templates/README.md`, "Universal patterns"): `h3. {emoji} *Title*` headers; `* *Label*: content` labeled lines; `*` bullets and `#` numbered lists at column 0; `*bold*`; `{{monospace}}`; tables `||header||` / `|cell|`; links `[text|url]`; curly braces escaped as `\{...\}`. Blank line after every heading. After pushing, read the description back and confirm it starts with `h3.`, not `###`.

**Writing-and-publishing workflow**

1. Triage per the SOP: severity, environments, root cause, remedy, disposition candidate, due date.
2. `jira_create_issue` with `issue_type = "Task"`, the summary above, a placeholder description, labels, priority. Leave Unassigned.
3. `jira_update_issue` with the full body and the `sla-due-YYYY-MM-DD` label (`duedate` is rejected on this screen scheme).
4. `jira_update_issue` with `{"customfield_12350": "<epic key>"}` to link the parent epic (separate call; the `epicKey` parameter does not work reliably on this instance).
5. If a companion deployment-config task is needed, create it the same way, then `jira_create_issue_link` with `link_type = "Blocks"`, `inward_issue_key = <companion>`, `outward_issue_key = <finding task>` (verified: this renders as the finding task "is blocked by" the companion).
6. Post the PR link as a plain-text comment when it opens; QA closes the task with resolution Fixed after confirming on the observed tier(s).

**Worked example (September 2026 High)**

Summary: `Invicti Security Vulnerability (High): CVE-2026-66299, upgrade Apache Tomcat to 10.1.59`. Finding: Out-of-date Version (Tomcat), High, Prod 2026-09-01 and Stage 2026-09-08, `GET /version` with an injected query string, evidence `<h3>Apache Tomcat/10.1.57</h3>` on the error page, affected range 10.1.24 to 10.1.57, Identified. Why it matters: the CVE is an uncontrolled resource consumption flaw in Tomcat's WebSocket chat example; Spring Boot embedded Tomcat does not deploy the examples webapp, so the exploit path is not present, but Invicti and NCI Security evaluate by version. Remedy: bump `tomcat.version` to 10.1.59; durable control: disable `showServerInfo` and `showReport` on the ErrorReportValve and set `server.error.include-stacktrace=never` so the banner no longer fingerprints the version. SLA: first observed Prod 2026-09-01 and Stage 2026-09-08, reports delivered 2026-09-14, High, public-facing, 30 days, due 2026-10-14.
