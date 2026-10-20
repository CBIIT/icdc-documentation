### 🛠️ DevOps Task Template (v1.1, mirrors CTDC 7l v1, filled with ICDC info)

> **Use this template for every ICDC DevOps task**: infrastructure changes, engine or platform upgrades, environment variable changes, bucket or access setup, Prefect worker and pipeline infrastructure, and security remediation on infrastructure. The canonical example is **ICDC-4274 (DevOps: Set up and test the upper-tier Prefect workers for ICDC)**, the first ICDC ticket built on this template, under the Jenkins to Prefect migration epic. CTDC's canonical is CTDC-2261 (an Aurora RDS engine upgrade).
>
> **Not for release deployments.** Promoting a software release to Stage or Production uses the monthly deployment task in the Release Ticket Templates (`release-ticket-templates.md`), not this template. This template covers everything else DevOps does.

**Why this template**

DevOps work has two traits no other ICDC template captures:

1. **It touches tiers unevenly.** A change may land in DEV and QA this sprint and in STAGE and PROD next month, or only in the upper tiers (a compliance upgrade). The ticket has to show, at a glance, which tiers are in scope and how far each one has gotten.
2. **The upper tiers are not ours to touch.** The team works directly in DEV and QA, but STAGE and PROD are operated by the CBIIT CloudOne team. Every upper-tier change goes through an NCI ServiceNow request (https://service.cancer.gov/ncisp). A DevOps ticket without a record of those requests leaves the TPM unable to answer "where is this stuck?"

Environment variables get their own section because they are the most common thing to drift between tiers: set in QA, forgotten in PROD, and the app breaks only after release.

**Summary format**

`DevOps: <imperative description>`, for example `DevOps: Set up and test the upper-tier Prefect workers for ICDC`. Same prefix pattern as `Design: ...` tasks.

**Section order (7 sections, exactly this sequence)**

Each header is a Jira wiki `h3.` heading using the emoji + bold title format shown. Don't omit, reorder, or merge sections. If a section has no content, say "None at this time" rather than dropping the header.

1. `h3. 🎯 *Task Summary*`: Two to three sentences: what is changing, on which system, and why. Follow with labeled bullets for the facts that drive scheduling:
   * `* *System*:` the resource(s) affected (instance, bucket, service, pipeline, AWS account)
   * `* *Deadline*:` a hard date if one exists (compliance, vendor end of support); otherwise omit the bullet

2. `h3. 🧭 *Scope*`: Two labeled bullets: `* *In scope*:` and `* *Out of scope*:`. Out of scope matters most for upgrades, where "while we're in there" changes creep in.

3. `h3. 🌐 *Environments*`: One row per tier, always all four, so a skipped tier is a visible decision and not an oversight.

   ```
   ||Tier||In Scope||Access Path||Status||
   |DEV| | Direct (DevOps) | |
   |QA| | Direct (DevOps) | |
   |STAGE| | ServiceNow to CloudOne | |
   |PROD| | ServiceNow to CloudOne | |
   ```

   * *In Scope*: Yes or No.
   * *Status*: Not started, In progress, Done, or N/A.

4. `h3. 🔑 *Environment Variables*`: One row per variable created, changed, or removed. The tier columns record **state**, never values.

   ```
   ||Variable||Service||Change||Secret||Value Source||DEV||QA||STAGE||PROD||
   |{{VARIABLE_NAME}}| backend | Add | Yes | Secrets Manager: <path> | | | | |
   ```

   * *Variable*: wrap the name in `{{ }}` monospace so underscores don't open italics.
   * *Change*: Add, Update, or Remove.
   * *Secret*: Yes if the value is a password, token, key, or connection string with credentials.
   * *Value Source*: where the value lives (AWS Secrets Manager path, SSM Parameter Store path, or "Plain config" for non-secrets).
   * *Tier cells*: Set, Pending, or N/A.

   If the task changes no variables, state "None at this time".

5. `h3. 🎫 *ServiceNow Requests*`: One row per upper-tier request filed with CloudOne. The only field is the ticket URL: the assignee, schedule, and history live in ServiceNow itself, one click away, so engineers don't copy them into Jira.

   ```
   ||Tier||ServiceNow Ticket URL||
   |STAGE| |
   |PROD| |
   ```

   If no upper tier is in scope, state "None at this time".

6. `h3. 🚦 *Workflow*`: Numbered steps in tier order. The standard spine (adapt the middle steps to the task):
   1. Make and verify the change in each in-scope lower tier (DEV, then QA).
   2. File the NCI ServiceNow request for STAGE at https://service.cancer.gov/ncisp, add the TPM (`kuffelgr`) as a watcher, and record it in ServiceNow Requests.
   3. CloudOne applies the change to STAGE in the scheduled window; verify and update Environments.
   4. Repeat for PROD only after STAGE is verified.
   5. Update the tables as each step completes and notify the TPM.

7. `h3. ✅ *Definition of Done*`: Labeled bullets, the standard set:
   * `* *Tiers*:` every in-scope tier marked Done in Environments
   * `* *Variables*:` every variable shows Set (or N/A) in every in-scope tier
   * `* *ServiceNow*:` every request closed by CloudOne
   * `* *Verification*:` the application or pipeline is confirmed working in each changed tier
   * `* *Documentation*:` any runbook, README, or deployment config reflecting the change is updated
   * `* *Handoff*:` TPM notified

**Standing emoji set (7 entries)**

| Section | Emoji |
|---|---|
| Task Summary | 🎯 |
| Scope | 🧭 |
| Environments | 🌐 *(unique to DevOps task)* |
| Environment Variables | 🔑 *(unique to DevOps task)* |
| ServiceNow Requests | 🎫 *(unique to DevOps task)* |
| Workflow | 🚦 |
| Definition of Done | ✅ |

**Required content rules (DevOps Task specific: the universal patterns in `README.md` also apply)**

* *Never put a secret value in Jira*: not in the description, comments, or attachments. Jira is readable by far more people than the secret should be, and its history keeps every old version forever. Record the variable name and where the value lives; hand the value to CloudOne through the ServiceNow request or the secret store itself. Role ARNs and account IDs are identifiers, not secrets, and may appear.
* *All four tiers in Environments*: even when only one is in scope.
* *Upper tiers go through ServiceNow*: no STAGE or PROD row moves to Done without a matching ServiceNow Requests row.
* *Issue type is Task*: not Story or Subtask.
* *Body is Jira wiki markup*: the connector stores exactly what it is sent. Use `h3.`, `||header||` tables, and `* *Label*: content` bullets; escape literal curly braces as `\{` and `\}`.
* *No Jira ticket keys in the body*: related work (including the matching CTDC ticket) goes in Jira's issue links.
* *Colons, not em dashes*.
* *Left unassigned on creation*: unless the TPM directs otherwise. ICDC DevOps engineers are Charles Ngu (`nguca`, DevOps Lead) and Michael Fleming (`flemingme`); Eric Miller (`millerer`) owns the Prefect flow code.
* *Lower tiers first*: when a change can be made in DEV and QA, make it there before filing the STAGE request, so STAGE is never the first place a change has run.

**ICDC specifics**

* *Prefect workers*: the shared work pool runs in the central nonprod Prefect account; security forbids it from reading prod buckets, so nonprod flows read `icdc-nonprod-metadata`, which syncs one way to `nci-cbiit-caninedatacommons-dev`. Upper-tier workers are a separate set; say which set a ticket touches in the System bullet.
* *Graph store is Neo4j*, not Memgraph: where CTDC tickets say Memgraph, ICDC's equivalent is Neo4j.
* *Jenkins is retired* (CBIIT, end of August 2026): new pipeline work is Prefect, and build and deploy run in GitHub Actions.

**When to trim**

* *Lower-tier only work* (a DEV worker, a QA bucket): ServiceNow Requests says "None at this time"; keep the header.
* *No variable changes* (an engine upgrade): Environment Variables says "None at this time"; keep the header.
* *Release promotions*: don't use this template; use the monthly deployment task in `release-ticket-templates.md`.

**Changelog**

* *v1.1 (2026-10-20)*: Release deployments now point to the new ICDC Release Ticket Templates (`release-ticket-templates.md`). No change to the 7 sections.
* *v1 (2026-10-13)*: Ported from CTDC's DevOps Task Template (7l v1, 2026-10-07), same 7 sections. ICDC differences: one TPM watcher (`kuffelgr`); ICDC specifics section (Prefect worker sets and the nonprod bucket boundary, Neo4j, Jenkins retired); no link to CTDC's release templates (ICDC has none yet). Canonical ICDC-4274.
