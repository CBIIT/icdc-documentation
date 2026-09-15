### 🛡️ Invicti Scan Remediation Epic Template (v1, 2026-09-15)

> **Use this template for the epic that represents one monthly Invicti scan cycle.** One epic per month, covering every environment scanned that month. The epic is the intake record; it owns only the finding tasks that were **first observed** in this cycle plus one verification task. Carryover findings stay on their original tasks and are linked, never cloned. The workflow that surrounds this template is `claude/sops/invicti-monthly-scan-sop.md`. Prior-shape references: ICDC-4120 (February 2026) and ICDC-4210 (August 2026).

**Issue type**: Epic. **Summary**: `ICDC Security Vulnerabilities - <Month YYYY> Invicti Scan Remediation`. **Assignee**: left Unassigned at creation; the ESI tech lead assigns during triage. **Labels**: `invicti-scan`, `security`, `vulnerability-remediation`, plus `prod-environment` and/or `stage-environment`. **Attachments**: the Invicti PDF for each environment scanned.

**Section order (8 sections, exactly this sequence)**

Each header is `### **Title**` with the emoji shown. Omit a section only when it has no content for the month (for example no Dispositions); keep the rest in order. Tables use Jira-wiki `||header||` syntax. Bullets use `* *Label*: content`. No em dashes. No Jira keys in the body except in the Carryover and Resolved tables, where the key is the data.

1. `### 🎯 **Overview**`

   Two or three sentences. Which environments were scanned, on which dates, by which scanner, and the overall risk level per environment. Then the headline: how many findings are new this month, how many carry over, how many were confirmed resolved. Example: *"Tracks remediation of findings from the Invicti Enterprise scans of caninecommons.cancer.gov (Prod, scanned 2026-09-01, risk level High) and caninecommons-stage.cancer.gov (Stage, scanned 2026-09-08, risk level High). One new High finding this cycle; nine findings carry over from August; both August Criticals are confirmed resolved."*

2. `### 📊 **Severity Breakdown**`

   One row per environment scanned.

   ```
   ||Environment||Scan date||Requests||Risk level||Critical||High||Medium||Low||Best practice||Identified||Confirmed||
   |Prod|2026-09-01|38,011|High|0|1|2|7|0|10|3|
   |Stage|2026-09-08|112,362|High|0|1|0|7|0|8|3|
   ```

3. `### ⏱️ **SLA Due Dates**`

   The dates the team is held to this month, computed from the report delivery date and the NCI table (Critical 15/30, High 30/60, Medium 60/90, Low 180/180 days, public/internal). Prod and Stage are both public-facing. One row per severity present.

   ```
   ||Severity||Environment||Clock start (report delivered)||Window||Due||
   |High|Prod, Stage (public)|2026-09-14|30 days|2026-10-14|
   |Medium|Prod (public)|2026-09-14|60 days|2026-11-13|
   |Low|Prod, Stage (public)|2026-09-14|180 days|2027-03-13|
   ```

4. `### 🆕 **New Findings**`

   Findings first observed this cycle. Each one has a task under this epic. Bulleted, one per finding, severity prefix first, then name, environments, endpoint, CVE if any, and the one-line remedy. Regressions (a finding whose earlier task was Closed) are listed here with the marker **Regression** and the reopened task is linked rather than a new one created.

   * *[SEC-HIGH]*: Out-of-date Apache Tomcat 10.1.57, CVE-2026-66299, Prod and Stage, fingerprinted on the `/version` error page. Remedy: upgrade to 10.1.59 and suppress the error-page version banner.

5. `### 🔁 **Carryover Findings**`

   Findings observed this cycle that already have an open task from an earlier cycle. The due date shown is the original one; it does not move. Link each task to this epic with `Relates`.

   ```
   ||Task||Finding||Severity||First observed||Due||Status||Tier reached||
   |ICDC-4213|GraphQL introspection, /api/interoperation/graphql|Medium|2026-08-14 (Stage)|2026-10-16|Ready for Review|Stage|
   ```

6. `### ✅ **Resolved Since Last Scan**`

   Findings from the prior cycle that are absent from this month's report. This is the evidence that closes the prior month's verification task.

   ```
   ||Task||Finding||Severity||Fix||Confirmed absent in||
   |ICDC-4211|Out-of-date Tomcat 10.1.52, CVE-2026-53434|Critical|Upgraded to 10.1.57|Prod 2026-09-01; Stage 2026-09-08|
   ```

7. `### 🚫 **Dispositions**`

   Findings submitted to NCI Security as false positive or accepted risk this cycle, with the one-line reason and the request status (Submitted / Accepted / Declined). Full justification lives on the task.

   * *Cookie not marked HttpOnly*: Adobe Analytics cookies are set client-side and cannot be HttpOnly. Submitted 2026-09-16.

8. `### 🚀 **Promotion Strategy**`

   Standing text, kept short: *"Fixes are developed and tested in DEV and QA, then promoted Stage → Prod through the standard ICDC pipeline and ServiceNow change requests. A finding is closed when QA confirms the fix on the tier where it was observed; the epic closes when the following month's report confirms every new finding is absent."*

**Required content rules**

* *One epic per month, all environments*: do not split Prod and Stage into separate epics. Environment is a table column and a label.
* *Tasks only for New findings*: never re-create a carryover finding. If the same finding is observed on a new environment, add the environment to the existing task and re-evaluate its due date against the more restrictive tier.
* *Every child task carries a due date*: the epic is not "built" until this is true.
* *Verification task is mandatory*: one per epic, assigned to the TPM, summary `Confirm <Month YYYY> findings absent from <next month> Invicti scan`.
* *Regressions are named as such*: a re-observed finding with a Closed task is a regression, listed in New Findings with the marker, and its task reopened with a comment.
* *No evidence in the epic*: request and response bodies, payloads, cookie values, and internal IPs belong on the finding task. The epic carries names, counts, dates, and keys.
* *Rendering-safe patterns*: `### **Title**` headers, `* *Label*: content` bullets, Jira-wiki tables, blank line after every heading and between sections, no in-cell line breaks.

**Writing-and-publishing workflow**

1. Finish intake and reconciliation per the SOP before drafting. The Carryover and Resolved tables need the prior epic's task list.
2. `jira_create_issue` with `issue_type = "Epic"`, the summary above, a placeholder description, and labels. Leave Unassigned.
3. `jira_update_issue` with the full body.
4. Attach the PDFs.
5. Create the finding tasks and the verification task (see the finding template), linking each with `{"customfield_12350": "<epic key>"}` in a separate update call.
6. `jira_create_issue_link` (`Relates`) from the epic to each Carryover task.
7. Post the Slack intake summary.

**Canonical example**

The September 2026 epic is the first built on this template. ICDC-4210 (August 2026) is the closest prior shape: it introduced the New-vs-carryover reasoning in prose, which this template turns into tables.
