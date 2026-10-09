# Sprint Review & Retrospective deck generator

Config-driven `pptxgenjs` generator for the ICDC Sprint Review + Retro deck. **The same `build-deck.js` and `tally.js` live in
`CBIIT/icdc-documentation` and `CBIIT/ctdc-documentation`.** Keep the two copies identical: when you change one, copy it to the
other in the same session. Slide order and content rules: `claude/SKILL.md` §9.

## Files

| File | Purpose |
|---|---|
| `build-deck.js` | The generator. Shared with CTDC; no sprint-specific or project-specific text in here. |
| `tally.js` | Prints verified counts, story points (by status and type), the resolution-window split and Developer/Assignee tallies. Run it first. |
| `config.sprintNN.json` | All narrative for one sprint (goals, risks, shout-outs, retro prompts, board URL). Copy the previous sprint's file and edit. |
| `tickets.sprintNN.json` | Raw Jira pull for the sprint, flattened (schema below). Every number on the deck is computed from this file. |
| `config.sprint51.json`, `tickets.sprint51.json` (and Sprint 50) | Worked example. |

## Run

```bash
node tally.js config.sprintNN.json          # verify counts and points before writing any narrative
node build-deck.js config.sprintNN.json      # writes ICDC_SprintNN_Review_Retro_<date>.pptx
# QA: soffice --headless --convert-to pdf <deck>.pptx && pdftoppm -jpeg -r 80 <deck>.pdf slide ; inspect every slide
```

## tickets.sprintNN.json schema

One object per ticket from `jira_search` with `jql = "sprint = <sprintId>"` (board 574) and fields
`summary,status,issuetype,assignee,priority,labels,resolutiondate,customfield_23650,customfield_12350,customfield_10042`:

```json
{ "key": "ICDC-1234", "summary": "...", "status": "Closed", "category": "Done", "type": "Task",
  "priority": "Major", "assignee": "Eric Miller", "dev": ["millerer"], "epic": "ICDC-35",
  "resolved": "2026-08-27T22:08:56-0400", "points": 2 }
```

`points` is `customfield_10042` (Story Points, Fibonacci; `null` when unpointed). `category` is Jira's status category. `dev` is the
Developer field (`customfield_23650`), mapped to display names via `developerNames` in the config.

## Config switches that change the slides

- `excludeTypes`: issue types dropped before anything is counted. ICDC: `"excludeTypes": []` (ICDC counts every issue type today; an Epic in the sprint adds a ticket but no points).
- `sprint.goal`: the Jira sprint goal, verbatim. When set, the scorecard banner quotes it; when empty, the banner shows `scorecard.bannerText` (the workstreams).
- `goals[].status`: `delivered` (✓ green), `partial` (▲ amber) or `not_started` (✗ red). Up to five rows. The older boolean `delivered` still works.
- `risks[].severity`: `HIGH` or `MEDIUM` only; the build fails on anything else. Three to five rows; HIGH rows are sorted first.
- `agenda`: meeting length is per project (ICDC 55 minutes, CTDC 60).

## What the generator does for you

- Charts on slides 3, 5 and 7 are in **story points**; ticket counts ride in the legend or labels. Slide 3 prints pointed coverage.
- Green means Closed and amber means Carried over. The "What the shape tells us" cards beside the work-type chart always use a neutral NIH Blue stripe.
- Bar-chart axes start at 0.

## Before you write the narrative

1. **Verify sprint identity** by `(id, date range)` on board 574. The sprint being reviewed is the closed one; the active sprint is the next one.
2. **Compute, do not count.** Run `tally.js`. Check how many closed tickets were resolved before the window opened or after it closed and say so on the Numbers slide.
3. **Confirm delivery status with the TPM (and the Data Concierge for study work) before scoring a data workstream.** Open data tickets are not evidence the data did not ship.
4. **No Jira hygiene on the deck.** Missing sprint goal, missing epic links, resolution-date quirks and pointing gaps stay in the analyst notes, never on slides, in the Slack post or in retro prompts.
5. **Risks:** every row needs a "Next step" that names a decision, an owner or a date.
6. **Two charts on Who Closed What:** Assignee at close (usually QA) and Developer field (credit).
7. **Demos and release slides only when real.**
8. **Cross-check carry-over** against the next sprint's membership (`sprint = <nextId>`) so `nextSprint.inherited` and `% inherited` are true.
9. Slack announcement goes to `#icdc` (`CE0EA6W93`) as a draft (`slack_send_message_draft`). Mention people by Slack user ID. Never use em dashes anywhere.
