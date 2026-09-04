# 📖 User Story Template — ICDC

> **Use this template for every ICDC software-development user story.** The canonical example is **ICDC-4244 (Surface matching C3DC human cancer data on the ICDC Human Relevance tab)** — drafted 2026-09-04 as the first application of this template, epic-linked to ICDC-3882 (ICDC Human Relevance) and paired with design task ICDC-4242. Data-submission user stories (the Data Concierge's parent ticket for a study submission) use `data-submission-user-story-template.md` instead.
>
> **Status:** v1 (2026-09-04) — ported from CTDC's §7a User Story Template and **slimmed from 7 to 5 sections**: the 🔗 Parent Epic & Context section was dropped (the Epic Link field is the canonical link; restating it in the body is noise) and the 📝 Notes section was dropped (predecessor tickets, design tasks, and decisions are carried by native Jira links and comments). CTDC's §7a was slimmed to the same 5-section shape on the same day so the two projects stay aligned.

## Why this template

User stories are smaller-scope deliverables than epics — they ship and close. The bare As-a/I-want/So-that line is a starting point, but it leaves the engineer without enough structure to know when a story is *done*. This template gives every story a one-sentence summary, the classic framing as flowing prose, an In/Out of Scope split that prevents adjacent-feature creep, Acceptance Criteria split into Functional and Performance & Quality, and a dedicated Testing Requirements section so unit/integration/manual coverage is named explicitly rather than buried in a P&Q bullet.

Testing Requirements is a first-class section because Valentina Epishina is QA-only (SDET, does not write feature code): every line of automated test that covers a story is written by the engineer, and the story should say so.

## Section order (5 sections, exactly this sequence)

Each section header is an `h3` Markdown heading using the emoji + bold title format shown. Do not omit, reorder, or merge sections. If a section genuinely has no content, state so explicitly ("None at this time") rather than dropping the header.

1. `### 🎯 **Story Summary**` — One sentence: what this story delivers, who consumes it, on which surface. Example: *"This story delivers a C3DC card on the Human Relevance tab of the Study Details page, letting visitors see which C3DC studies contain the same cancer type as the canine study they are viewing."*

2. `### 👤 **User Story**` — As-a / I-want / So-that as one flowing paragraph, not three bullet lines.

3. `### 🗺️ **Scope**` — Two sub-blocks, **In Scope** and **Out of Scope**, each a bullet list. Out of Scope items point to the sibling story, epic, or ticket that covers the excluded work when one exists.

4. `### ✅ **Acceptance Criteria**` — Two sub-blocks:
   - **Functional** — Numbered list. Each item is a single observable behavior QA can pass/fail in one check on a deployed environment. If an item has two clauses joined by "and," split it. `**Bold**` key UI labels and component names. Escape curly braces as `\{...\}`.
   - **Performance & Quality** — Numbered list. The ICDC quality bar:
     1. Section 508 / WCAG 2.1 AA accessibility on all new UI elements
     2. ICDC design system conformance (colors, typography, spacing)
     3. Performance baseline of the affected page maintained

5. `### 🧪 **Testing Requirements**` — Three sub-blocks, each a numbered list:
   - **Unit Tests** — isolated behaviors (parsers, URL builders, reducers, utilities)
   - **Integration Tests** — end-to-end flows across components (render paths, error paths, empty paths)
   - **Manual QA Scenarios** — things that are hard to automate: outbound-link destinations, keyboard and screen-reader passes, visual conformance against the linked Figma design

## Standing emoji set (5 entries)

| Section | Emoji |
|---|---|
| Story Summary | 🎯 |
| User Story | 👤 |
| Scope | 🗺️ |
| Acceptance Criteria | ✅ |
| Testing Requirements | 🧪 |

## Required content rules

- **Issue type is `User Story`** (confirmed on ICDC-4233, ICDC-4244). Not `Story`, not `Task`.
- **Story Summary names the surface** — the page or component the story touches.
- **Epic Link set on the ticket itself** via `customfield_12350` (SKILL.md Section 3). There is no Parent Epic line in the body.
- **Related tickets live in Jira links, not the body.** `Relates` to the design task and to any requirements task; no Notes section.
- **Acceptance Criteria are testable** — one observable behavior per item.
- **Testing Requirements is the developer's checklist before "Ready for QA."** Not optional, not a duplicate of P&Q.
- **Assignee at creation is the author (TPM)** until the story is pulled into a sprint; then the engineer. Populate the Developer field (`customfield_23650`) with the implementing engineer when known.
- **Markdown authoring**: `### {emoji} **Title**` headers, `-` bullets, `1.` numbered lists, `**bold**`; Jira-wiki tables (`||h||` / `|c|`) if a table is needed; curly braces escaped as `\{...\}`.

## Writing-and-publishing workflow

1. Pull the source requirements (a requirements task, a clone, a meeting note) via `jira_get_issue` — preserve the substance, restructure the form; tighten wording, drop nothing.
2. Create via `jira_create_issue` with `issue_type = "User Story"` and a placeholder description; then `jira_update_issue` with the full Markdown body and `{"customfield_12350": "ICDC-XXXX"}` in `additional_fields`.
3. Add `Relates` links to the design task and requirements task via `jira_create_issue_link`.
4. Verify the rendered description with a UI screenshot from the user.

## When to expand vs trim

- **Fewer than 5 functional ACs** → keep all 5 sections; the structure earns its keep by giving the engineer a checklist.
- **Documentation or copy change with no code path** → Unit and Integration sub-blocks say "None at this time"; Manual QA carries the check.
- **Spike or research task** → wrong shape; use a free-form Task with explicit deliverables.
