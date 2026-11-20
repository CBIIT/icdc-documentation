# Sprint Review & Retrospective deck generator

Config-driven `pptxgenjs` generator for the ICDC Sprint Review + Retro deck. **The same `build-deck.js` and `tally.js` live in
`CBIIT/icdc-documentation` and `CBIIT/ctdc-documentation`.** Keep the two copies identical: when you change one, copy it to the
other in the same session. Slide order and content rules: `claude/SKILL.md` §9.

## Files

| File | Purpose |
|---|---|
| `build-deck.js` | The generator. Shared with CTDC; no sprint-specific or project-specific text in here. |
| `tally.js` | Prints verified counts, story points (by status and type), the resolution-window split and Developer/Assignee tallies. Run it first. |
| `config.sprintNN.json` | All narrative for one sprint (goals, announcements, data loading horizon, demos, shout-outs, retro prompts, board URL). Copy the previous sprint's file and edit. |
| `tickets.sprintNN.json` | Raw Jira pull for the sprint, flattened (schema below). Every number on the deck is computed from this file. |
| `config.sprint52.json`, `tickets.sprint52.json` (and Sprints 50 and 51) | Worked example. |

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

`status` and `category` are the ticket's status **as of the sprint close** (Jira sprint `completeDate`), read from the changelog (`expand=changelog`), not today's status; `resolved` is the last transition to a Done status before the close. Every number on the deck describes the sprint at close.

`points` is `customfield_10042` (Story Points, Fibonacci; `null` when unpointed). `category` is Jira's status category. `dev` is the
Developer field (`customfield_23650`), mapped to display names via `developerNames` in the config.

## Config switches that change the slides

- `excludeTypes`: issue types dropped before anything is counted. ICDC: `"excludeTypes": []` (ICDC counts every issue type today; an Epic in the sprint adds a ticket but no points).
- `sprint.goal`: the Jira sprint goal, verbatim. When set, the scorecard banner quotes it; when empty, the banner shows `scorecard.bannerText` (the workstreams).
- `goals[].status`: `delivered` (✓ green), `partial` (▲ amber) or `not_started` (✗ red). Up to five rows. The older boolean `delivered` still works.
- `announcements` (slide: Team Announcements): three to five `{ "label", "title", "detail", "nextStep" }` rows. `label` is a short topic tag (`"CMB V6"`, `"THERAPY UI"`, `"MEVAL"`, about 10 characters); `nextStep` prints after "What's next:". These are announcements, not a decision or risk list, so there are no severity colors. Older configs with `risks[].severity` still build.
- `horizon` (slide: Data Loading on the Horizon, after the announcements): `{ "title", "subtitle", "rows": [{ "stage": "NEXT UP" | "FURTHER OUT", "study", "coming", "status", "epic" }], "note" }`. Rows come from the open Data Submission epics and list only **new study data whose release packages we must load**; corrected or metadata-only resubmissions that just sync the Submission Portal, megazips of studies already loaded and on-hold studies stay off.
- `demos` (Presenter Intro slides): `[{ "title", "why", "minutes", "presenters": [{ "role", "name", "focus" }], "see": [..], "tickets", "notes" }]`. One slide per slot, **always the last slides before the retro**. A slot can be a walkthrough of approved designs.
- `velocity` (REQUIRED, ICDC and CTDC; the build fails without it): drives slide 4, Velocity Trend, and the scope creep card on slide 3. Pull `sprints` from Jira's Velocity Chart, `/rest/greenhopper/1.0/rapid/charts/velocity?rapidViewId=<board>` (`velocityStatEntries[id].estimated.value` = committed at sprint start, `.completed.value` = completed), oldest first, last 7 sprints. Pull `scopeCreep` from the Sprint Report, `/rest/greenhopper/1.0/rapid/charts/sprintreport?rapidViewId=<board>&sprintId=<id>`: `added` = pointed tickets in `issueKeysAddedDuringSprint` (`{ key, points }`), `reestimated` = tickets whose `estimateStatistic` differs from `currentEstimateStatistic` (`{ key, from, to }`), `unpointedAdded` = added tickets with no points, `removed` = pointed tickets in `puntedIssues` that were part of the start commitment (`{ key, points }`). Sub-tasks are not on the Sprint Report: add a pointed sub-task that joined mid-sprint to `added`. Optional `summary` overrides the Velocity card's one-line note. Scope creep is always named as such on the deck; start + added − removed must equal the at-close total (the build warns if not). Shape: `{ "board": 574, "pulled": "Nov 17, 2026", "sprints": [{ "name": "Sprint 47", "committed": 70, "completed": 24 }], "scopeCreep": { "added": [], "reestimated": [], "unpointedAdded": [], "removed": [] }, "points": [{ "title", "detail" }], "note" }`. Averages and the creep total are computed.
- `agenda`: meeting length is per project (ICDC 55 minutes, CTDC 60).

## What the generator does for you

- Charts on slides 5 and 7 are in **story points**; ticket counts ride in the legend or labels. Slide 3's wheel is **ticket status** (ticket counts, one slice per Jira status). Slide 3 builds four cards itself: Tickets in the sprint, Closed, Carry-over tickets and Scope creep (only when points were added after the start; red; same number as the Velocity slide). The breakdown is a Status · Tickets · Story points table whose rows are filled in exactly the wheel colors, with a Total row; the build warns if its points do not add up. Pointed coverage goes in the speaker notes. `numbers.carryNote` and `numbers.speakerNote` are the only `numbers` keys; `extraStats` and the per-status notes are retired.
- Each Jira status has one color across the deck (the `STATUS` map in `build-deck.js`); slide 7 bars take their status color. Slide 6 is an awards wall: `team.awards` = `[{ "dev": "jiraUsername", "emoji": "🚀", "award": "Jenkins Slayer", "reason": "..." }]` in display order; ticket and point stats are computed from the Developer field. An entry without `dev` (e.g. QA) supplies `name` and `stat`. `team.creditNote` goes in the speaker notes.
- Green means Closed and amber means Carried over (amber is never a status color). The "What the shape tells us" cards beside the work-type chart always use a neutral NIH Blue stripe.
- Bar-chart axes start at 0. The work-type chart has axis titles ("Story points" along the bottom, "Issue type (tickets closed of total)") and its value axis along the bottom.
- Slide order is fixed: Cover · Agenda · Numbers · Velocity · Goal Scorecard · Work Type · Who Did the Work · Carry-Over · Team Announcements · Data Loading on the Horizon (when `horizon` is set) · Presenter Intro per demo slot · Retro break · Retro board. Page numbers follow it.

## Before you write the narrative

1. **Verify sprint identity** by `(id, date range)` on board 574. The sprint being reviewed is the closed one; the active sprint is the next one.
2. **Compute, do not count.** Run `tally.js`. Numbers describe the sprint at close only: never mention tickets that closed after the sprint ended (not in cards, goal details, carry-over facts, award stats, announcements or retro prompts), and do not put a before / inside / after window split on the Numbers slide.
3. **Confirm delivery status with the TPM (and the Data Concierge for study work) before scoring a data workstream.** Open data tickets are not evidence the data did not ship.
4. **No Jira hygiene on the deck.** Missing sprint goal, missing epic links, resolution-date quirks and pointing gaps stay in the analyst notes, never on slides, in the Slack post or in retro prompts.
5. **Announcements:** every row needs a "What's next" that names an owner or the next step. When a feature ships as a first iteration ahead of its final design, announce both: what ships now and the final state that replaces it.
6. **Two charts on Who Closed What:** Assignee at close (usually QA) and Developer field (credit).
7. **Demos and release slides only when real**, and always last before the retro. Keep the agenda in the same order as the slides.
8. **Cross-check carry-over** against the next sprint's membership (`sprint = <nextId>`) so `nextSprint.inherited` and `% inherited` are true.
9. Slack announcement goes to `#icdc` (`CE0EA6W93`) as a draft (`slack_send_message_draft`). Mention people by Slack user ID. Never use em dashes anywhere.
