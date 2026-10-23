# 🚀 ICDC Software Release Playbook

> **Use this playbook for every ICDC software release, monthly or patch, from scope confirmation through Feature Freeze, Release Candidate (RC) build, promotion up the environment ladder, production ("Gamma") deployment, close-out, and retro.** It is the standing process document. The per-release *instrument* is the **Release Dashboard** (`ICDC Monthly Release <Month YYYY>.xlsx`), which also holds every deployment date. When the playbook and the dashboard disagree, the playbook governs the process and the dashboard governs the dates and versions.
>
> CTDC's equivalent, kept in lockstep, is `CBIIT/ctdc-documentation/claude/workflows/software-release-playbook.md`. The gates, branching, and close-out are the same; the differences are listed at the end of this file.

**Why this playbook**

The Release Dashboard is the *checklist* for one release and the release tickets are its *record*. Neither, alone, walks a release manager phase by phase from kickoff to close with the gates, RACI, and rollback spelled out. This playbook is that runbook, written down so the process is durable, diffable in git, and legible to a new team member on day one.

**Operating context.** Part of the ICDC operational skill (`CBIIT/icdc-documentation → claude/SKILL.md`). Jira project key **ICDC** on `tracker.nci.nih.gov`. The development team is the **Essential Software Inc (ESI)** subcontractor under FNL/BACS (NCI prime); **federal leadership sits in NCI/CBIIT**. Jira-driven steps (scope pull, Fix Version hygiene, the version merge) require the **Docker/Atlassian MCP container running**; if it is down, release data work stops until restored (SKILL.md §1).

**Software releases vs. data releases.** Strictly separate; never conflated. This playbook covers *software* (versioned application microservices). Study loads, OpenSearch index rebuilds, and data model versions (published on `CBIIT/icdc-model-tool`) are *data* releases with their own tasks and SOP (`data-operations-study-submission-sop.md`). Data work may run in parallel but does not gate a software release.

**Cadence.** **Monthly** (`<Month YYYY>` naming), so that fixes for the monthly NCI Invicti scan findings reach Production on a predictable schedule. Each Production deployment lands before the next monthly Invicti Production scan. A **patch release** is an out-of-band release with its own tickets when a security finding's SLA due date falls before the next scheduled release. Patch releases follow this same playbook on a compressed timeline.

---

## 🎫 Jira Mechanics of a Release

### Workflow states

| State | Category | Meaning |
|---|---|---|
| **Open** | To Do | Triaged, not started |
| **In Progress** | In Progress | Developer actively working |
| **Ready for Review** | In Progress | PR opened; **assigned to the Tech Lead** for code review |
| **Ready for QA Testing** | In Progress | Merged, built, and deployed to QA; **assigned to the QA Lead** |
| **Testing** | In Progress | QA actively testing on the QA environment |
| **Reopened** | In Progress | QA test failed; **reassigned to the original developer** to fix |
| **On Hold** | In Progress | Blocked or parked with a reason |
| **Closed** | Done | Passed QA; terminal state |

**One Jira ticket = one pull request** (`workflow.md`). A feature branches off `develop`, its PR moves the ticket to *Ready for Review*, and on merge and QA deploy it becomes *Ready for QA Testing*. Test pass: *Closed*. Test fail: *Reopened*, back to the developer.

### Internal releases, Fix Versions, and release notes

- **Every build is an internal release**: a beta Docker build handed to QA, named `major.minor.patch.jenkins-build-number`.
- Every Jira issue in a build is stamped with that build's **Fix Version**, per microservice, creating a durable map between completed issues and the build that carried them.
- When the release candidate is chosen, **all prior internal-release versions are merged in Jira** into the single final version for that release. The merged Fix Versions are the scope of the official release notes.

### Beta → Release Candidate → Gamma

Development never stops. Between production releases the team keeps building and pushing new builds to **Dev**, then to **QA**. **Every one of these builds is a beta release**: each increments the build number (the 4th digit), and betas never leave Dev and QA.

After Feature Freeze and Code Freeze, one beta build is identified as the **Release Candidate (RC)**. Only the RC is promoted to **Stage**, then **Prod**. Once it passes verification there, it is the **gamma release**: the final, public production build.

| Environment | Release maturity |
|---|---|
| **Dev** | Beta: newest builds land here first |
| **QA** | Beta: QA tests every beta build |
| **Stage** | **Release Candidate**: the chosen beta, promoted for pre-production validation |
| **Prod** | **Gamma**: the final released build |

A **release-blocker fix** bumps the RC's **patch** number (the 3rd digit), not the build number. Everything else in the cycle moves only the build number.

### Bugs Parking Lot and triage

- A bug found by QA or anyone else is **linked to its originating issue** when applicable and **announced in Slack**: `#icdc-test-questions` by default, or the release's coordination channel while a Release Candidate is being prepared.
- New bugs are **assigned to the TPM with no priority** and go to the **Bugs Parking Lot**.
- The TPM reviews, prioritizes, and decides whether to pull a bug into the active sprint. During Code Freeze, only **release-blocker** bugs may be pulled in.

### Semantic Versioning (`x.y.z`)

- **Major (`x`)**: incompatible or breaking change.
- **Minor (`y`)**: new, backward-compatible functionality.
- **Patch (`z`)**: backward-compatible bug fix. Release-blocker fixes bump the patch.

---

## 🎟️ Release Tickets (created from spec each release)

The TPM creates the release tickets from [`release-ticket-templates.md`](../templates/release-ticket-templates.md), which holds their fields, bodies, and creation steps. There are no Jira clone-source tickets.

| Purpose | Type | Summary pattern | Parent / Epic | Default assignee | Links |
|---|---|---|---|---|---|
| **Deployment Package** | Task | `Identify the <Month YYYY> monthly release Deployment Package` | Fiscal-year release epic (FY27: **ICDC-4290**) | Tech Lead (`ranaab`) | Blocks Stage and Prod deployment |
| **Stage deployment** | Task | `Deploy <Month YYYY> monthly release to ICDC Stage` | Fiscal-year release epic | DevOps (`nguca`) | Blocks Prod; relates to the Invicti scan epic(s) remediated |
| **Prod deployment** | Task | `Deploy <Month YYYY> monthly release to ICDC Production` | Fiscal-year release epic | DevOps (`nguca`) | Relates to the Invicti scan epic(s) remediated |

Canonical October 2026 examples: ICDC-4296 (Deployment Package), ICDC-4291 (Stage), ICDC-4292 (Prod). Patch releases use the same tickets with "patch release" in the summary.

---

## 📆 Milestones & Freeze Calendar

Four milestones per release. Dates are set on the Release Dashboard only; the Production date falls no later than the earliest SLA due date of any security finding the release remediates.

| Milestone | Definition | QA duration (minimum) |
|---|---|---|
| **Feature Freeze** | All user stories complete; **no new feature work**. Bugs may still be reported and triaged. Opens the bug-fix window. | Initial RC testing **≥ 5 business days** |
| **Code Freeze** | **Entire codebase frozen.** Clean RC build to QA; only release-blocker fixes allowed after. | Full regression on QA **≥ 3 to 5 business days** |
| **Stage Deployment** | RC promoted to Stage after QA regression passes. Final Design QA complete by now. | Full regression on Stage **≥ 2 business days** |
| **Release (Gamma)** | QA signs off; deploy to Production. Remaining low-priority bugs are acceptable. | |

> **The release date floats.** Any **release-blocker fix resets the QA clock**: another **3 to 5 business days** of full regression on the new build. Communicate slips in the release channel. A slip that would push Production past a security finding's SLA due date is escalated to the TPM the same day.

**Feature Freeze vs. Code Freeze, plainly:** Feature Freeze means "stop adding *features*" (scope locked, bugs still fixable). Code Freeze means "stop changing *anything*" (only regression and release-blocker fixes after).

---

## 🧩 Scope: What Ships in a Release

Not every microservice bumps every release; the Release Dashboard records the exact version of each, with the Deployment Package Number. ICDC has **no Auth service**.

| Component | Repo | Notes |
|---|---|---|
| **Frontend (FE)** | `CBIIT/bento-icdc-frontend` | React/Bento app; also hosts the GitHub releases shown on the ICDC **News** page |
| **Backend (BE)** | `CBIIT/bento-icdc-backend` | Spring Boot GraphQL API; reads OpenSearch indices |
| **File Service** | `CBIIT/bento-files` | File download service |
| **Interop** | `CBIIT/bento-icdc-interoperation` | Node.js service; outbound Cancer Genomics Cloud (CGC) export |
| **Data Retriever** | `CBIIT/crdc-icdc-data-retriever` | Python ETL on a Jenkins schedule; writes external-node data (IDC, TCIA) to OpenSearch |
| **Deployments** | `CBIIT/icdc-deployments` | Deployment configurations (not a versioned microservice) |
| **OpenSearch backup** | *(internal)* | Snapshot version when a restore is required; also the rollback point |

**Where release notes live:** GitHub releases on **`CBIIT/bento-icdc-frontend`**, written from the [Release Notes Template](../templates/release-notes-template.md). The ICDC **News** page loads them from GitHub, so publishing the release also publishes it on the site.

---

## 👥 Roles, Swimlanes & RACI

| Swimlane | Role | Current holder(s) | Owns |
|---|---|---|---|
| **Engineering** | Tech Lead + engineers | Ambar Rana (lead), Eric Miller (BE), Toyo Udosen (FE) | RC build, code review, blocker fixes, Deployment Package, tags, final merges |
| **QA** | QA Lead (SDET) | Valentina Epishina | Katalon and manual smoke/regression at each tier; promotion sign-off |
| **Management** | TPM | Gina Kuffel | Authorization gate, bug triage, release tickets, release notes, all announcements |
| **DevOps** | DevOps Lead | Charles Ngu | CloudOne/ServiceNow scheduling, Stage/Prod deploys, infrastructure and monitoring |
| **UI-UX** | Designers | Hannah Stogsdill, Peter Scrufari | Final Design QA (including 508), filing design bugs |
| **Data** | Data team lead | Philip Musk | Data work in parallel; **data releases tracked separately** |

**The promotion gate (repeats at every tier):**

> **QA verifies → TPM authorizes → DevOps deploys.**

The TPM is the single authorization pivot; no untested build skips a tier.

---

## 🗂️ Artifacts & Sources of Truth

| Artifact | Where | Role |
|---|---|---|
| **This playbook** | `claude/conventions/software-release-playbook.md` | The runbook (process) |
| **Release ticket templates** | `claude/templates/release-ticket-templates.md` | Spec for the recurring release tickets |
| **Release notes template** | `claude/templates/release-notes-template.md` | Scope derivation, structure, and style for the GitHub release notes |
| **Release Dashboard** | `ICDC Software Development / ICDC Software Releases / Release Dashboards`, one folder per calendar year, on the NCI-CBIIT-FNL-ICDC SharePoint site | The per-release **instrument**: versions, Deployment Package Number, dates |
| **Invicti scan epics** | Jira, one per monthly scan (`invicti-scan-epic-template.md`) | Security findings a release remediates; SLA due dates |
| **Release coordination channel** | `#icdc-<year>-q<N>-software-release` | RC coordination, build announcements, and bug triage while an RC is being prepared |
| **QA channel** | `#icdc-test-questions` | Default channel for bug reporting and QA coordination |
| **ICDC operational skill** | `claude/SKILL.md` | Umbrella SOP: JQL, Jira quirks, deck standards, roster |

---

## 🌐 Environments & Promotion Ladder

One linear ladder, no skips: **Dev → QA → Stage → Prod** (`workflow.md`). Stage (`caninecommons-stage.cancer.gov`) and Prod (`caninecommons.cancer.gov`) are both public-facing, so security fixes reach Stage before Prod. Each tier's deployed version is checked at `/version`.

| Env | Maturity | Role |
|---|---|---|
| **Dev** | Beta | Engineering integration; newest builds land first |
| **QA** | Beta | Katalon and manual regression on every beta; first sign-off |
| **Stage** | Release Candidate | Pre-production validation; go/no-go rehearsal |
| **Prod** | Gamma | Public release |

---

## 🌿 Versioning & Branching (Gitflow)

- **Feature work:** each ticket in its own branch off `develop`; its PR merges back, the ticket moves to *Ready for Review* (Tech Lead), and merges on approval.
- **Build:** the Tech Lead reviews all *Ready for Review* issues, stamps the Fix Version, builds `develop` into a Docker image, deploys to QA, and moves issues to *Ready for QA Testing* (QA Lead).
- **Release Candidate:** cut from `develop` after Feature Freeze; stabilized on the RC branch.
- **Blocker fixes:** a new branch from the most recent released-version branch, named `x.y.(z+1)`; PR, new build, QA. **Resets the QA clock.**
- **Close-out merge:** the RC is merged into **`main`** and tagged with the version, merged back into **`develop`**, and the release branch is deleted.
- **Build naming:** `major.minor.patch.jenkins-build-number`.

---

## 💬 Communication Channels

| Channel | Workspace | Purpose |
|---|---|---|
| `#icdc-<year>-q<N>-software-release` | ICDC Slack | Release coordination: build announcements, QA regression and promotion posts, slip notices, bug triage while an RC is being prepared |
| `#icdc-test-questions` (`CNPLNFR2R`) | ICDC Slack | Default channel for bug reporting and QA coordination |
| `#icdc-devops` (`CKENP6AH3`) | ICDC Slack | Deployment activity |
| `#icdc-security` (`C0AT3D3KJN6`) | ICDC Slack | Invicti findings and remediation status |
| `#icdc` (`CE0EA6W93`) | ICDC Slack | Primary announcement channel |
| `#tech_channel` | **NCI CRDC** workspace | **External** production release announcement |

---

## 🔁 The Release Lifecycle (Phases)

### Phase 0: Planning & Kickoff *(TPM)*
1. Clone the month's Release Dashboard into the calendar-year folder; set the four milestone dates, with Production before the next Invicti Production scan and no later than the earliest open finding's SLA due date.
2. Create the Deployment Package, Stage, and Production tasks from the release ticket spec, linked to the Invicti scan epic(s) the release remediates.
3. Confirm scope with the Fix Version query (`release-notes-template.md`, Deriving the scope). *(MCP required.)*

**Gate → Phase 1: FEATURE FREEZE.** All user stories complete; no new feature work.

### Phase 1: Stabilize the Release Candidate *(Engineering)*
1. Fork `develop` into the **RC branch**.
2. **Record the OpenSearch snapshot version** (the rollback point).
3. Work the bug-fix window: triaged bugs, reopened bugs, blockers. Each blocker build gets its own `z+1` patch.
4. Move the build's issues to *Ready for QA Testing* and assign the QA Lead.
5. Provide the RC to QA; **announce in the release channel**.
6. **Tech Lead:** complete the Deployment Package task (every microservice version and the Deployment Package Number on the Release Dashboard).

**Gate → Phase 2: CODE FREEZE.** Codebase frozen; clean RC to QA.

### Phase 2: QA on the QA Environment *(QA)*
1. Verify the build against the Release Dashboard versions.
2. Manual **smoke test**.
3. **Katalon** automated full regression; results to SharePoint.
4. Post to the release channel that **regression has started**.
5. Manual regression; report to SharePoint. Failures: issue to *Reopened*, back to the developer.
6. Confirm each Invicti finding fixed in the release no longer reproduces on QA.
7. Post that the RC can be promoted to Stage.

**Gate → Phase 4:** QA's written promote-to-Stage verification to the Tech Lead **and** TPM.

### Phase 3: Final Design QA *(UI-UX)*, parallel with Phase 2, complete before Stage
1. Conduct Final Design QA on the QA environment.
2. Check design fidelity **and Section 508 compliance** on every new feature and page.
3. File each discrepancy as a bug, grouped by page or feature; announce in the release channel.
4. Notify the TPM when complete.

**Gate → promotion:** any design or 508 **release blocker** returns to the Phase 1 blocker loop.

### Phase 4: Authorize & Deploy to Stage *(TPM → DevOps)*
1. **TPM:** review Final Design QA and the regression report; confirm no open blockers.
2. **TPM:** on QA's verification, **notify DevOps** to deploy to Stage.
3. **DevOps:** NCI ServiceNow ticket and Outlook invite for the **CloudOne** Stage window (Stage deployment task).
4. **DevOps:** deploy the Deployment Package to Stage; confirm `/version` matches the Release Dashboard; run the environment checks; notify the TPM.

### Phase 5: QA on Stage *(QA)*
1. Verify the build on Stage.
2. Manual smoke, **Katalon** regression, manual regression; all to SharePoint.

**Gate → Phase 6 (GO/NO-GO):** QA's written promote-to-Prod verification to the Tech Lead **and** TPM.

### Phase 6: Authorize & Deploy to Production (Gamma) *(TPM → DevOps)*
1. **TPM:** on QA's verification, **notify DevOps** to deploy to Production.
2. **DevOps:** NCI ServiceNow ticket and Outlook invite for the CloudOne Production window (Production deployment task).
3. **DevOps:** deploy the same Deployment Package verified in Stage; confirm `/version`; notify the TPM.

### Phase 7: QA on Production *(QA)*
1. Verify the deployment; manual smoke, **Katalon** regression, manual regression.
2. Post to the release channel that **production is stable**.

**Gate → Phase 8:** the QA Lead confirms Production is stable. *(If not: Rollback & Recovery.)*

### Phase 8: Close-Out *(Engineering + TPM)*, the Definition of Done
1. **Engineering:** create the **GitHub tag** for the release on `bento-icdc-frontend`.
2. **Engineering:** merge the RC into **`main`** (tagged) **and `develop`**; **delete the release branch**.
3. **Engineering:** OpenSearch restore **only if required**; verify data alignment.
4. **TPM:** **merge the internal-release Fix Versions in Jira** into the final release version; write and publish the **release notes** on `bento-icdc-frontend` from the [Release Notes Template](../templates/release-notes-template.md), then confirm they render on the ICDC **News** page.
5. **TPM:** run the release tagging hygiene check: every shipped ticket has a Fix Version, and every microservice version in the release notes has tagged tickets or is an infrastructure-only bump. **Verify before you count** (SKILL.md §7b).
6. **TPM:** update the remediated Invicti scan epic(s) with the release that carried each fix.
7. **TPM:** courtesy email to the leadership list: **FNL:** Todd Pihl, John Otridge, Mark Jensen; **CBIIT:** Erika Kim, Tanja Davidsen, Esmeralda Casas-Silva.
8. **TPM:** production announcement in the NCI CRDC `#tech_channel`.
9. **TPM:** engage the **CRDC communications team**.

**Definition of Done:** all user-story requirements implemented and tested; all Final Design QA findings addressed or moved to the backlog; RC tagged on `main`, deployed to Stage and Prod, merged back to `develop`, release branch deleted; release notes published and visible on the News page.

### Phase 9: Retrospective *(Whole team)*
1. Retro in **Liked · Lacked · Learned** on retrotool.io (10-minute silent brainstorm; SKILL.md §7d).
2. Resolve any tagging gaps from Phase 8 (back-fill or process fix; never paper over).
3. Capture a decision or convention update when the process changed.

---

## 🚦 Go/No-Go Criteria (Stage → Prod)

**Go** requires all of:
- ✅ Katalon and manual regression **passed on Stage** (results in SharePoint).
- ✅ **Zero open release-blocker bugs**, including Final Design QA and 508.
- ✅ `/version` on Stage **matches** the Release Dashboard.
- ✅ DevOps environment, logging, and alert checks **green** on Stage.
- ✅ QA's written promote-to-Prod verification to the Tech Lead **and** TPM.
- ✅ CloudOne production window scheduled (ServiceNow and Outlook), on or before the earliest security finding SLA due date.

**Decision owner:** TPM with the Tech Lead. Record the decision on the Release Dashboard and in the release channel. Unresolved blockers **move the date**; they are not waived.

---

## 🔥 Hot Fixes and Patch Releases

A hotfix patches **production** outside the monthly cycle; a security finding whose SLA due date falls before the next scheduled release is shipped this way as a **patch release**, with its own release tickets.

- The Tech Lead creates a **`hotfix_branch`** from **`main`** (not `develop`).
- On completion, merge into **both `main` and `develop`**; tag `main` with `x.y.(z+1)`.
- DevOps deploys up the ladder, fast-tracked, with QA smoke verification at each tier.
- A hotfix is **not** a rollback: it rolls the fix *forward*. Use Rollback & Recovery only when a bad deploy must be reverted.

---

## ↩️ Rollback & Recovery *(draft: needs team validation)*

> No rollback procedure is documented yet. This is a proposed default; **confirm every specific with Engineering and DevOps before relying on it.**

**Trigger:** Production smoke or regression failure, or a severity-1 defect after Gamma.
**Decision owner:** TPM with the Tech Lead; announced in the release channel.
**Mechanism (proposed):**
1. Microservices are versioned Docker containers deployed through CloudOne: **redeploy the previous known-good version** of the affected microservice.
2. **OpenSearch:** restore the snapshot recorded in Phase 1; verify data alignment.
3. Confirm containers, logging, and monitoring are green on the restored version.

**Comms:** the TPM posts cause and action to the release channel and notifies CBIIT leadership. A decision entry under `claude/decisions/` records what happened and what changes.

---

## 🩺 DevOps Environment Checklist (Stage + Prod)

**CloudOne:** NCI ServiceNow ticket and Outlook invite for the Stage window and the Prod window, filed from the deployment tasks.
**Environment:** FE, BE, File Service, and Interop containers running; OpenSearch connection strings set; `/version` returns the Release Dashboard version.
**Logging:** log collectors active for every container.
**Alerts:** production monitoring and alert policies active (alerts surface in `#icdc-monitoring`).

---

## 📖 Glossary

- **Beta release:** any internal build pushed to Dev and QA for testing; each increments the build number and never leaves Dev or QA.
- **Release Candidate (RC):** the single beta build designated for release after Feature and Code Freeze, promoted from QA to Stage to Prod.
- **Gamma release:** the RC after it passes all verification and reaches Prod.
- **Deployment Package:** the set of microservice versions shipping in a release, recorded with its Deployment Package Number on the Release Dashboard.
- **Feature Freeze:** all user stories complete; no new feature work; bugs still fixable.
- **Code Freeze:** entire codebase frozen; only release-blocker fixes after.
- **Patch release:** an out-of-band release driven by a security finding's SLA due date.
- **Release blocker:** a defect that stops promotion; resets the QA clock.
- **Bugs Parking Lot:** the unprioritized Jira holding area for new bugs, triaged by the TPM.
- **Katalon:** the automated regression test suite; results archived in SharePoint.
- **Invicti:** the monthly NCI security scan of Stage and Prod; its findings carry SLA due dates.
- **CloudOne:** the NCI deploy team engaged through a ServiceNow ticket and a scheduled window for Stage and Prod.
- **508 Compliance:** U.S. Section 508 federal accessibility law; checked in Final Design QA every release.

---

## 🔀 Differences from CTDC

* *Cadence*: monthly, timed to the Invicti scan cycle, with patch releases for SLA-driven fixes; CTDC releases quarterly.
* *Microservices*: Frontend, Backend, File Service, Interop, Data Retriever. **No Auth service and no NIH RAS.**
* *Version check*: `/version`; CTDC uses the `/#/sysinfo` page.
* *Release notes*: published on `CBIIT/bento-icdc-frontend` and rendered on the ICDC News page; CTDC publishes on `CBIIT/crdc-ctdc-starter-kit`.
* *Release tickets*: Deployment Package, Stage, and Production tasks link to the Invicti scan epic(s) they remediate. ICDC has no Final Design QA epic; design findings are filed as bugs and announced in the release channel.

---

## 🗒️ Changelog

| Version | Change | Author |
|---|---|---|
| v1 (2026-10-23) | Ported from the CTDC Software Release Playbook (v10). Same gates (Feature Freeze, Code Freeze, Katalon regression on QA and Stage, Final Design QA), Gitflow, go/no-go, and close-out, confirmed by the TPM. ICDC differences: monthly Invicti-driven cadence with patch releases, ICDC roster and repos, no Auth service, `/version` checks, release notes on `bento-icdc-frontend` rendered on the News page, release tickets linked to Invicti scan epics. | Gina Kuffel |
