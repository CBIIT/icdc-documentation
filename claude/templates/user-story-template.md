# 📖 User Story Template: ICDC

> **Use this template for every ICDC software-development user story.** The canonical example is **ICDC-4244 (Surface matching C3DC human cancer data on the ICDC Human Relevance tab)**: drafted 2026-09-04 as the first application of this template, epic-linked to ICDC-3882 (ICDC Human Relevance) and paired with design task ICDC-4242. Data-submission user stories (the Data Concierge's parent ticket for a study submission) use `data-submission-user-story-template.md` instead.
>
> **Status:** v3 (2026-10-13): Scope is replaced by 🚫 Out of Scope (In Scope only restated the Acceptance Criteria), placed directly after the Acceptance Criteria so each exclusion sits next to the behaviors it limits and QA reads it before writing test cases. Out of Scope stays because Acceptance Criteria can only say what must happen, not what is deliberately excluded; without it, engineers build adjacent features, QA fails stories for behavior nobody asked for, and settled questions get re-raised. Acceptance Criteria is one functional list; the Performance & Quality sub-block is removed (the quality bar is a team-wide standard QA checks, not restated per ticket). Testing Requirements is unit tests only. Integration and manual test scenarios belong to QA, who write their own test cases from the Acceptance Criteria; the story no longer prescribes them. CTDC's §7a changed the same day. v2 (2026-10-09): section headers and authoring moved to Jira wiki markup; the Performance & Quality bar is now identical in CTDC (CTDC dropped its cross-browser item). v1 (2026-09-04): ported from CTDC's §7a User Story Template and **slimmed from 7 to 5 sections**: the 🔗 Parent Epic & Context section was dropped (the Epic Link field is the canonical link; restating it in the body is noise) and the 📝 Notes section was dropped (predecessor tickets, design tasks, and decisions are carried by native Jira links and comments). CTDC's §7a was slimmed to the same 5-section shape on the same day so the two projects stay aligned.

## Why this template

User stories are smaller-scope deliverables than epics: they ship and close. The bare As-a/I-want/So-that line is a starting point, but it leaves the engineer without enough structure to know when a story is *done*. This template gives every story a one-sentence summary, the classic framing as flowing prose, an Out of Scope list that prevents adjacent-feature creep, testable Acceptance Criteria, and the unit tests the engineer writes.

Testing Requirements names the unit tests the engineer writes, because Valentina Epishina is QA-only (SDET, does not write feature code). Integration and manual test scenarios are QA's to design from the Acceptance Criteria, so the story does not prescribe them.

## Section order (5 sections, exactly this sequence)

Each section header is a Jira wiki `h3.` heading using the emoji + bold title format shown. Do not omit, reorder, or merge sections. If a section genuinely has no content, state so explicitly ("None at this time") rather than dropping the header.

1. `h3. 🎯 *Story Summary*`: One sentence: what this story delivers, who consumes it, on which surface. Example: *"This story delivers a C3DC card on the Human Relevance tab of the Study Details page, letting visitors see which C3DC studies contain the same cancer type as the canine study they are viewing."*

2. `h3. 👤 *User Story*`: As-a / I-want / So-that as one flowing paragraph, not three bullet lines.

3. `h3. ✅ *Acceptance Criteria*`: Numbered list. Each item is a single observable behavior QA can pass/fail in one check on a deployed environment. If an item has two clauses joined by "and," split it. `*Bold*` key UI labels and component names. Escape curly braces as `\{...\}`. No Performance & Quality sub-block: The quality bar (Section 508 and WCAG 2.1 AA accessibility, ICDC design system conformance, page performance) is a team-wide standard that QA checks on every story and release. It is not written into user stories, tasks, or epics (TPM decision, 2026-10-13).

4. `h3. 🚫 *Out of Scope*`: Bullet list of work this story deliberately does not do: adjacent features, behaviors someone might reasonably expect, and questions already settled. Describe each excluded item in words; do not cite the Jira key of the ticket that covers it (add a `Relates` link instead). If there are none, state "None at this time." There is no In Scope list: the Acceptance Criteria are the definition of what the story delivers, and an In Scope list only restates them less precisely.

5. `h3. 🧪 *Testing Requirements*`: One sub-block:
   - **Unit Tests**: isolated behaviors (parsers, URL builders, reducers, utilities)

## Standing emoji set (5 entries)

| Section | Emoji |
|---|---|
| Story Summary | 🎯 |
| User Story | 👤 |
| Acceptance Criteria | ✅ |
| Out of Scope | 🚫 |
| Testing Requirements | 🧪 |

## Required content rules

- **Issue type is `User Story`** (confirmed on ICDC-4233, ICDC-4244). Not `Story`, not `Task`.
- **Story Summary names the surface**: the page or component the story touches.
- **Epic Link set on the ticket itself** via `customfield_12350` (SKILL.md Section 3). There is no Parent Epic line in the body.
- **No Jira ticket keys anywhere in the body.** Related tickets (design task, requirements task, siblings, follow-ons) are `Relates` issue links; Jira's Links panel is the single source. No Notes section, no cross-reference lines.
- **Acceptance Criteria are testable**: one observable behavior per item.
- **Testing Requirements is the developer's unit test checklist before "Ready for QA."** Not optional. No Integration or Manual QA sub-blocks: QA writes those test cases from the Acceptance Criteria.
- **Assignee at creation is the author (TPM)** until the story is pulled into a sprint; then the engineer. Populate the Developer field (`customfield_23650`) with the implementing engineer when known.
- **Jira wiki authoring** (connector Markdown translation is off, so what is sent is stored exactly; see `claude/templates/README.md`, "Universal patterns"): `h3. {emoji} *Title*` headers; `* *Label*: content` labeled lines; `*` bullets and `#` numbered lists at column 0; `*bold*`; `{{monospace}}`; tables `||header||` / `|cell|`; links `[text|url]`; curly braces escaped as `\{...\}`. Blank line after every heading. After pushing, read the description back and confirm it starts with `h3.`, not `###`.

## Writing-and-publishing workflow

1. Pull the source requirements (a requirements task, a clone, a meeting note) via `jira_get_issue`: preserve the substance, restructure the form; tighten wording, drop nothing.
2. Create via `jira_create_issue` with `issue_type = "User Story"` and a placeholder description; then `jira_update_issue` with the full Jira wiki body and `{"customfield_12350": "ICDC-XXXX"}` in `additional_fields`.
3. Add `Relates` links to the design task and requirements task via `jira_create_issue_link`.
4. Verify the rendered description with a UI screenshot from the user.

## When to expand vs trim

- **Fewer than 5 Acceptance Criteria** → keep all 5 sections; the structure earns its keep by giving the engineer a checklist.
- **Documentation or copy change with no code path** → Unit Tests says "None at this time"; QA verifies against the Acceptance Criteria.
- **Spike or research task** → wrong shape; use a free-form Task with explicit deliverables.
