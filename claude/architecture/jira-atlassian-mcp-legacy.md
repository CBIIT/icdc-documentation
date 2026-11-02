# Jira via the Atlassian MCP (Legacy Reference)

> **Status: retired 2026-11-02, kept for reinstatement.** ICDC Jira work now runs through the Jira REST API v2 from a signed-in `tracker.nci.nih.gov` tab in Claude in Chrome. This page preserves how the Atlassian MCP connector was used, so it can be brought back if the Claude desktop app is able to link to claude.ai sessions again. It covers only what was specific to the MCP. Instance facts that hold for any client (custom field IDs, link type names, transition IDs, resolutions, wiki rendering rules) stay in `claude/SKILL.md` and the templates.

## Why it was retired

* *Connector*: the `mcp-atlassian` server, run in a Docker container and configured as a connector in the Claude desktop app on the TPM's work Mac. claude.ai sessions reached it through the desktop app's link to that computer.
* *What changed*: on 2026-10-27 the Claude desktop app on NCI-managed Macs moved to the organization's inference gateway and stopped signing in with the claude.ai account, which ended that link. Docker was retired on 2026-11-02 and both projects moved to Claude in Chrome.
* *What keeps working either way*: the REST calls in the templates work from any client with an authenticated session, so the templates do not need to change if the MCP returns. Only the "how to call Jira" layer changes.

## Connector configuration that mattered

* `DISABLE_JIRA_MARKUP_TRANSLATION=true` was set in the connector's environment (Sep 2026). With it on, descriptions and comments were stored exactly as sent, in Jira wiki markup. Before it was set, `jira_update_issue` converted Markdown to wiki markup on the way in, and that converter re-translated text that was already wiki markup (bold headings became italics, `#` lists became `h1.` headings, underscores gained backslashes). **If the MCP is reinstated, turn this setting on before the first write.**

## Crosswalk: MCP tool to REST call

MCP parameter names below are the ones recorded in this repo's templates and `SKILL.md` usage examples.

| MCP tool (parameters) | REST equivalent (from a signed-in tracker tab) |
|---|---|
| `jira_search` (`jql`) | `GET /rest/api/2/search?jql=...&fields=...&maxResults=...` (page with `startAt`) |
| `jira_get_issue` (`issue_key`, `fields`) | `GET /rest/api/2/issue/<KEY>?fields=...` |
| `jira_create_issue` (`project_key`, `summary`, `issue_type`, `assignee`, `description`, `additional_fields`) | `POST /rest/api/2/issue` with `{"fields": {"project": {"key": "ICDC"}, "summary": "...", "issuetype": {"name": "Task"}, "description": "...", ...}}` |
| `jira_update_issue` (`issue_key`, `fields`, `additional_fields`) | `PUT /rest/api/2/issue/<KEY>` with `{"fields": {...}}`; anything that went in `fields` or `additional_fields` goes in the one `fields` object |
| `jira_add_comment` | `POST /rest/api/2/issue/<KEY>/comment` with `{"body": "..."}` |
| `jira_transition_issue` (`issue_key`, `transition_id`, `fields`, `comment`) | `POST /rest/api/2/issue/<KEY>/transitions` with `{"transition": {"id": "..."}, "fields": {...}, "update": {"comment": [{"add": {"body": "..."}}]}}` |
| `jira_create_issue_link` (`link_type`, `inward_issue_key`, `outward_issue_key`) | `POST /rest/api/2/issueLink` with `{"type": {"name": "Blocks"}, "inwardIssue": {"key": "..."}, "outwardIssue": {"key": "..."}}` |
| `jira_get_sprints_from_board` (`board_id`, `state`) | `GET /rest/agile/1.0/board/574/sprint?state=active` |
| `jira_add_issues_to_sprint` | `POST /rest/agile/1.0/sprint/<sprintId>/issue` with `{"issues": ["ICDC-XXXX"]}` |
| `jira_batch_create_issues` | `POST /rest/api/2/issue/bulk` with `{"issueUpdates": [{"fields": {...}}]}`, or one create per ticket |
| `jira_link_to_epic` | None needed: it was a no-op on this instance (see below). Set `customfield_12350` instead. |

REST write requests also need the headers `X-Atlassian-Token: no-check` and `Content-Type: application/json`; the MCP handled these itself.

## MCP-only quirks

* **`jira_link_to_epic` reported success but never set the Epic Link** (`customfield_12350`) on this tracker. Always set the field with `jira_update_issue` and read it back.
* **The `epicKey` parameter on create was unreliable.** Create first, then set `customfield_12350` in a follow-up `jira_update_issue`.
* **`jira_batch_create_issues` did not apply the Epic Link at creation.** Every ticket in the batch needed its own follow-up update.
* **Two-step create.** `jira_create_issue` with a one-line placeholder description, then `jira_update_issue` with the full body. The tracker also rejects a missing description on epic creation, which holds for REST too.
* **The read tool's echo was not a render preview.** `jira_get_issue` returned wiki source that looked the same for working and broken tickets, and before translation was turned off its Markdown reconversion turned underscores into asterisks. Only a screenshot of the ticket in the Jira UI showed the real render.
* **Batch reads sometimes returned `null` for populated custom fields** (seen with the Developer field on a `jira_search`). Confirm with a single-ticket `jira_get_issue` before treating a field as empty.

## Old recovery message

The project instructions told Claude to stop and send this when the MCP tools were missing:

> "🐳 Docker doesn't appear to be running. The Jira/Atlassian MCP container needs to be active before I can pull any ticket data. Please start Docker and restore the container, then let me know when it's back up and I'll pick up right where we left off."

## Reinstatement checklist

1. Confirm the Claude desktop app on the work Mac can sign in with the claude.ai account and link to claude.ai sessions again (or that the organization's Claude platform supports connectors).
2. Restore the `mcp-atlassian` Docker connector in the desktop app with `DISABLE_JIRA_MARKUP_TRANSLATION=true`.
3. Smoke test before any real work: read one ticket, confirm `customfield_12350` and `customfield_23650` come back populated, and confirm a search returns the active sprint on board 574.
4. In every Claude Project that uses Jira (both Sprint Command Centers, Portfolio & Roadmap, QA & Testing), add the MCP back to *Connected Tools* and decide which recovery message applies. Keep Claude in Chrome as the fallback.
5. Leave the templates alone: their REST calls remain valid. Use the crosswalk above to translate when calling through the MCP.

## Where the pre-switch text lives

The last commit before the switch is `2ed3d08`. To read any file as it was, for example `claude/SKILL.md`:

```
git show 2ed3d08:claude/SKILL.md
```

CTDC's copy of this page carries the MCP-era authoring notes verbatim in an appendix (`CBIIT/ctdc-documentation → claude/architecture/jira-atlassian-mcp-legacy.md`); the ICDC text replaced on 2026-11-02 was one-line tool references covered by the crosswalk above.
