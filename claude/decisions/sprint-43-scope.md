# Decision: Sprint 43 Security Remediation Scope

## Decision Date
March 2026

## Decision Maker
Gina Kuffel, Senior Technical Project Manager

## Context

Following the Invicti security scan of `caninecommons-dev.cancer.gov` (March 17, 2026), 13 remediation tickets were created under epic ICDC-4120. The team needed to determine how to schedule this work across sprints without disrupting ongoing feature development.

## Decision

**Sprint 43 is designated as a dedicated security vulnerability remediation sprint.** Feature development work will not be pulled into this sprint.

## Scope Included in Sprint 43

All tickets ICDC-4121 through ICDC-4132, with the following notes:
- ICDC-4121 (axios) and ICDC-4123 (Lodash) were completed pre-sprint and enter Sprint 43 already in QA
- Remaining 9 tickets are active Sprint 43 work

## Scope Deferred to Post-Sprint 43

| Ticket | Reason for Deferral |
|---|---|
| ICDC-4130 (CSP) | Requires full audit of all external resource origins loaded by the app (Adobe DTM, Google Fonts, YouTube). Multi-sprint effort. Cannot enforce CSP without risk of breaking legitimate resources. Recommend starting in report-only mode to observe violations before enforcing. |
| ICDC-4133 (SRI) | The Adobe DTM launch script auto-updates, which breaks static SRI hashes. Requires coordination with the Adobe analytics team to pin the script to a specific version before SRI can be implemented. Timeline dependent on vendor response. |

## Rationale for a Dedicated Sprint

- Security findings are time-sensitive; distributing them across feature sprints risks indefinite deprioritization
- A focused sprint creates a clean, auditable record that all Invicti findings were addressed in a defined window
- Most findings are low-to-minimal effort; a dedicated sprint is achievable without overloading the team
- Produces a clear before/after state for any follow-up NCI/CBIIT security review

## Impact on Roadmap

Feature work deferred one sprint. Stakeholders were informed via leadership summary document distributed in March 2026.

---
*Last updated: March 2026*
