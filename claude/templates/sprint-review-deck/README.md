# Sprint Review & Retrospective deck generator

Config-driven `pptxgenjs` generator for the ICDC Sprint Review + Retro deck. Format baseline is the
CTDC Sprint 32 deck (Sept 2026); ICDC and CTDC decks are kept in lockstep, so a format change made
here should be mirrored in `ctdc-documentation`. Design rules and slide order: `claude/SKILL.md` §9.

## Files

| File | Purpose |
|---|---|
| `build-deck.js` | The generator. Do not put sprint-specific text in here. |
| `config.sprintNN.json` | All narrative for one sprint (goals, risks, shout-outs, retro prompts, board URL). Copy the previous sprint's file and edit. |
| `tickets.sprintNN.json` | Raw Jira pull for the sprint, flattened (schema below). Every number on the deck is computed from this file. |
| `tally.js` | Prints the verified counts, resolution-window split and Developer/Assignee tallies. Run it first (SKILL.md §7b). |
| `config.sprint50.json`, `tickets.sprint50.json` | Worked example: ICDC Sprint 50 (Jira 8838). |

## Run

```bash
node tally.js config.sprintNN.json          # verify counts before writing any narrative
node build-deck.js config.sprintNN.json      # writes ICDC_SprintNN_Review_Retro_<date>.pptx
# QA: soffice --headless --convert-to pdf <deck>.pptx && pdftoppm -jpeg -r 80 <deck>.pdf slide ; inspect every slide
```

## tickets.sprintNN.json schema

One object per ticket from `jira_search` with `jql = "sprint = <sprintId>"` and fields
`summary,status,issuetype,assignee,priority,labels,resolutiondate,customfield_23650,customfield_12350`:

```json
{ "key": "ICDC-4203", "summary": "...", "status": "Closed", "category": "Done", "type": "Task",
  "priority": "Major", "assignee": "Eric Miller", "dev": ["millerer"], "epic": "ICDC-35",
  "resolved": "2026-08-27T22:08:56-0400" }
```

`category` is Jira's status category (`To Do` / `In Progress` / `Done`). `dev` is the Developer field
(`customfield_23650`, array of Jira usernames), mapped to display names via `developerNames` in the config.

## Before you write the narrative (lessons from Sprint 50)

1. **Verify sprint identity** by `(id, date range)` on board 574. The sprint being reviewed is the closed
   one; the active sprint is the next one.
2. **Compute, do not count.** Run `tally.js`. Check how many "closed" tickets were resolved before the
   window opened or after it closed; say so on the Numbers slide.
3. **Confirm delivery status with Gina or Philip before scoring a study workstream.** Study release
   tickets (Data Loading, Data Indexing, Data Submission Review, resubmissions) routinely stay open in
   Ready for Review / Ready for QA after the study is already released, while Philip finalizes details.
   Open tickets are not evidence the study did not ship.
4. **Terminology:** studies are "loaded and released through the ICDC". Never "data pipeline".
5. **No Jira hygiene on the deck.** Missing sprint goal, missing epic links, resolution-date quirks and
   similar record-keeping observations do not go on slides, in the Slack post or in retro prompts. Keep
   them as analyst notes in the sprint summary only. When there is no Jira goal, score against the
   workstreams the sprint carried and say so neutrally ("Scored against the four workstreams the sprint
   carried"); do not print "(none recorded)".
6. **Risks slide:** four rows is the target. Every row needs a severity pill and a "Next step" that names
   a decision, an owner or a date. Order HIGH before MEDIUM.
7. **Two charts on Who Closed What:** Assignee at close (usually QA) and Developer field (credit).
8. **Demos and release slides only when real.** No demo slots unless the item is deployed to QA/Stage;
   no release overview unless a tagged release shipped in the sprint.
9. **Cross-check carry-over** against the next sprint's membership (`sprint = <nextId>`) so the "X of Y
   are in Sprint N+1" and "% inherited" numbers are true.
10. Slack announcement goes to `#icdc` as a draft (`slack_send_message_draft`), one draft per channel;
    re-issuing replaces it. Mention people by Slack user ID. Never use em dashes anywhere.
