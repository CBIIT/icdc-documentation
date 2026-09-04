# 🎨 Design Task Template: ICDC

> **Use this template for every ICDC design task.** The canonical example is **ICDC-4242 (Design: Develop prototype for interoperability between ICDC and C3DC)**: normalized 2026-09-04 as the first application of this template, epic-linked to ICDC-3882 (ICDC Human Relevance) and `Relates`-linked to user story ICDC-4244. Future design work should follow the same shape.
>
> **Status:** v1 (2026-09-04): ported from CTDC's Design Task template v2 (`CBIIT/ctdc-documentation → claude/templates/design-task-template.md`) and **slimmed from 7 to 6 sections** for ICDC: the CTDC 🧩 Design System & Standards section was dropped (Section 508 is a standing site-wide obligation tracked in its own tickets, e.g. ICDC-4225; it does not need restating on every design task). Deliverables and Definition of Done were trimmed to what a prototype-level task needs.

## Why this template

Design tasks sit in a different orbit than user stories and epics. The user story owns the *what* and the *why*; the epic owns the *strategic envelope*; the design task owns the *how it should look and behave visually*. Conflating these (copying the user story's acceptance criteria into the design task, or leaving the design task as a one-line "make it look good" stub) is the most common antipattern in design ticketing. Both errors cost time: the duplicated AC list rots out of sync the moment the user story changes, and the one-line stub forces the designer to context-switch out to other tickets to figure out what is actually being designed.

The template resolves this with three commitments:

1. **No Acceptance Criteria section.** AC belongs on the user story. The design task has a **Definition of Done** instead: the designer's checklist for marking the task complete, which is a different artifact from QA's pass/fail criteria.
2. **A short Design Summary** so the designer can read the ticket in five seconds and know what they are designing, without opening the parent user story.
3. **Concrete deliverables**, not implicit ones. The designer produces specific, named artifacts (mockups, prototype, redlines) that are checkable on the way to "done."

The emoji set borrows shared anchors from the user story template (🎯 🔗 ✅) so a reader scanning a design task next to its sibling user story sees consistent visual structure. The unique additions are 🎨 (Design Scope), 📐 (Design Deliverables), and 🖼️ (Figma File).

## Section order (6 sections, exactly this sequence)

Each section header is an `h3` Markdown heading using the emoji + bold title format shown. Do not omit, reorder, or merge sections. If a section genuinely has no content, state so explicitly ("None at this time") rather than dropping the header: same rule as every other ICDC template.

1. `### 🎯 **Design Summary**`: Two to three sentences. What is being designed, on which surface, for which user need, and the exemplar if one is used. Example: *"Design a prototype 'human relevance' card that surfaces matching human cancer data from C3DC alongside an ICDC canine cancer type, so a visitor to the Human Relevance tab on a Study Details page can see at a glance that the same cancer occurs in children. The exemplar is Osteosarcoma."*

2. `### 🔗 **Links**`: Bullet list of external reference materials only: implementations in other CRDC data commons (CTDC, CCDI/C3DC, GDC), the live ICDC surface being changed, design specs, and mockup or image links. **Never list other Jira tickets here** (the user story, a requirements task, sibling design tasks): Jira's native Links panel already carries them. Each bullet is a labeled link using the italic-colon pattern (`* *Label*: content`). Wrap URLs in backticks so underscores are not read as italics. **Never paste a signed or expiring URL** (CloudFront `Expires=` tokens, SharePoint share links with `e=` tokens): describe how to re-create the view instead. If there are none at ticket creation, state "None at this time."

3. `### 🎨 **Design Scope**`: Bullet list (italic-colon pattern) of the surface, the content the design must carry, the interactions, and the **states** the designer is responsible for. State coverage is where design tickets most often come back incomplete, so name it explicitly: populated / empty or no-data / loading / error or unavailable, plus hover / focus / disabled where the surface has controls. Where a state decision is deliberately left to the designer (e.g. "hide the card vs. show an empty state"), say so.

4. `### 📐 **Design Deliverables**`: Numbered list of concrete artifacts the designer will produce. The ICDC floor for a prototype-level task:
   1. High-fidelity Figma mockup of every surface in scope, shown in context
   2. Figma prototype showing the interactions and state transitions
   3. Redlines for engineering handoff (spacing, typography, color tokens, component variants)

   Add deliverables when the surface needs them (accessibility annotations for a keyboard-heavy control, responsive variants for a layout change); never drop one because the surface "feels small."

5. `### 🖼️ **Figma File**`: Required. The designer fills this in when work begins; leave blank at ticket creation. Format (italic-colon pattern):
   - `* *Figma Design*:`
   - `* *Figma Prototype*:`
   - `* *Date Design Started*:`
   - `* *Date Design Completed*:`

   The "Date Design Completed" line is the trigger for moving the ticket to Ready for Review.

6. `### ✅ **Definition of Done**`: Designer's completion checklist as `* [ ]` items. **Not** the user story's acceptance criteria. The ICDC standard set:
   - Figma mockup and prototype published in the shared ICDC Figma workspace
   - Prototype reviewed with the TPM and the feature's stakeholders
   - Redlines documented for engineering handoff
   - Figma URLs and completion date recorded in this ticket
   - Figma URL added to the linked user story

## Standing emoji set (6 entries)

| Section | Emoji |
|---|---|
| Design Summary | 🎯 |
| Links | 🔗 |
| Design Scope | 🎨 *(unique to design task)* |
| Design Deliverables | 📐 *(unique to design task)* |
| Figma File | 🖼️ *(unique to design task)* |
| Definition of Done | ✅ |

## Required content rules

- **No Acceptance Criteria section.** AC lives on the parent user story, reachable from the ticket's Jira links (Epic Link field plus the `Relates` link to the story).
- **One design task per user story.** Granularity matches the user story. If one story has several visual surfaces, they all live in one design task. If two stories share a surface, each gets its own design task and the two are cross-linked via `Relates`.
- **Issue type is Task.** Summary uses the `Design: …` prefix (e.g. `Design: Develop prototype for interoperability between ICDC and C3DC`). Do not use Story or Subtask.
- **Epic Link set on the ticket itself** via `customfield_12350` (SKILL.md Section 3), never only named in the description.
- **`Relates` link to the parent user story is mandatory** once the story exists, set as a Jira issue link. If the design task is created before the story (as ICDC-4242 was, cloned from requirements task ICDC-4241), `Relates` it to the requirements task and add the story link as soon as the story is created.
- **No Jira ticket keys in the body.** Not in Links, not in Scope, not anywhere. Jira's Links panel (Epic Link, `Relates`, Cloners) is the single place related tickets are recorded; repeating them in the description is redundant and goes stale.
- **Figma URL is required before the ticket can move to Ready for Review.** Empty Figma fields after work has visibly progressed mean either the design lives elsewhere (a process gap) or the work has not been done.
- **Designer is the assignee and the Developer.** Hannah Stogsdill (`stogsdillhh`, `hannah.stogsdill@nih.gov`) owns ICDC design work; Peter Scrufari (`scrufaripp`) is the UI/UX backup. Populate both Assignee and the Developer field (`customfield_23650: ["stogsdillhh"]`) on creation.
- **Italic-colon bullets** (`* *Label*: content`) for labeled lines (no em dashes anywhere); Jira-wiki tables (`||h||` / `|c|`) if a table is ever needed; curly braces escaped as `\{...\}`. See `claude/templates/README.md` "Universal patterns."

## Writing-and-publishing workflow

1. Confirm the user story exists (in the ICDC User Story template shape: `claude/templates/user-story-template.md`) before finalizing the design task. The design deliverables must enable the story's AC; if the AC is not stable, the design scope is not stable either.
2. Create via `jira_create_issue` with `issue_type = "Task"`, a placeholder description, and the designer assigned; then `jira_update_issue` with the full Markdown body and `{"customfield_12350": "ICDC-XXXX"}` in `additional_fields`. Two-step creation avoids long-Markdown conversion issues.
3. Add the `Relates` link to the user story (and to a requirements task if one exists) via `jira_create_issue_link`.
4. Verify the rendered description with a UI screenshot from the user: the wiki source returned by `jira_get_issue` is not a reliable render preview.

## When to expand vs trim

- **Single-surface prototype** → the 6 sections as written; ICDC-4242 is the reference.
- **Cross-feature design touching many surfaces** → expand Design Scope and Deliverables; consider splitting into one design task per major surface rather than one mega-task.
- **Design QA / final review of a built feature** → this template is overkill. Use a free-form Task with a checklist of QA points and a Figma comparison reference.
- **Pure copy / icon / typography change** → this template is overkill. A short Task with before/after content and the affected surface is enough.

## Differences from the CTDC template

| CTDC v2 (7 sections) | ICDC v1 (6 sections) |
|---|---|
| 🧩 Design System & Standards section (WCAG, responsive targets, cross-browser parity, Section 508) | Dropped: 508 is a standing obligation tracked in dedicated tickets |
| 5 standard deliverables incl. accessibility annotations and responsive variants | 3 standard deliverables; add the others when the surface needs them |
| 7-item Definition of Done | 5-item Definition of Done |
| `Design: …` summary style | `Design: …` summary prefix |
| Designer: Hannah Stogsdill | Same designer; Peter Scrufari as UI/UX backup |
