# ICDC Team Workflow Conventions

This file documents team conventions that are not captured in Jira or code. Claude should apply these automatically in all ICDC sprint and ticket work.

---

## Ticket-to-PR Mapping

**One Jira ticket = one pull request. Always.**

This is a firm team convention for traceability. Do not suggest batching multiple tickets into a single PR. Tickets may be grouped into logical waves of work (to be developed in parallel), but each ticket produces its own PR and its own code review.

When helping plan work, frame it as:
- "PR Group" or "wave of work" — not "batch PR" or "combined PR"
- "Tickets in this group can be worked in parallel" — not "combine into one PR"

## Software Development Lifecycle (SDL)

All ICDC changes follow this promotion path without exception:

```
DEV → QA → Stage → Prod
```

- Fixes are always developed and initially tested in DEV
- QA is handled by the QA engineer (Valentina Epishina) — she is an SDET, not a software developer
- No ticket moves to Stage until QA signs off
- No production deployment without Stage validation

## Roles

| Person | Role | Notes |
|---|---|---|
| Gina Kuffel | Senior Technical Project Manager | Primary contact for ICDC and CTDC. Reporter on most epics. |
| Ambar Rana | Lead Developer / Epic Owner | Assigned to most ICDC epics |
| Valentina Epishina | QA Engineer / SDET | Software Developer in Test — handles QA validation, not feature development |

## Jira Quirks — ICDC Instance

The ICDC Jira instance (`tracker.nci.nih.gov`) uses non-standard epic linking:

- **Epic linking requires a follow-up `jira_update_issue` call** with `{"customfield_12350": "ICDC-XXXX"}` — the standard `epicKey` parameter does not work reliably
- **Batch-created issues** need this custom field update applied individually to every ticket
- **Confirmed working issue types:** Epic, Task
- **Assignee format:** full email address (e.g., `ambar.rana@nih.gov`)
- After any session gap, re-initialize the Atlassian MCP connection before the first tool call

## Project Keys

| Project | Jira Key | Description |
|---|---|---|
| Integrated Canine Data Commons | `ICDC` | Comparative oncology data platform. Rooted in NCI's Comparative Oncology Program (COP) — studies naturally occurring cancers in dogs to advance human cancer research. |
| Clinical and Translational Data Commons | `CTDC` | Separate project within the same CRDC ecosystem. Do not apply ICDC-specific context (e.g., comparative oncology) to CTDC work. |

## Contacts

| Name | Email | Role |
|---|---|---|
| Gina Kuffel | gina.kuffel@nih.gov | Senior TPM — primary contact for both ICDC and CTDC |
| Ambar Rana | ambar.rana@nih.gov | ICDC Lead Developer / Epic Owner |
| Valentina Epishina | valentina.epishina@nih.gov | QA Engineer / SDET |

## Document Storage

- **Leadership-facing documents** (`.docx`): Stored in ICDC SharePoint
- **Claude knowledge base** (`.md` briefings, decisions, conventions): Stored in `CBIIT/icdc-documentation` under `claude/`
- Both stores are maintained in parallel — SharePoint for stakeholder access, GitHub for Claude context

## Folder Structure (`claude/`)

```
claude/
  SKILL.md              ← SOPs, JQL recipes, Jira quirks, doc standards
  epics/
    ICDC-XXXX.md        ← one file per epic; Claude-optimized briefing
  decisions/
    *.md                ← rationale for scope, architecture, and process decisions
  conventions/
    workflow.md         ← this file; team conventions Claude applies automatically
```

---
*Last updated: March 2026*
