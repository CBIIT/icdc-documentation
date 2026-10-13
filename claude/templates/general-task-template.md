### 🧰 General Task Template (ICDC, v1)

> **Use this template for any ICDC task that no other template covers**: backend or API work with no user-facing story of its own, research and spikes, audits and surveys, documentation, and coordination tasks. The canonical example is **ICDC-4284 (JBrowse: Survey every viewable case file in Production)**.
>
> **Status:** v1 (2026-10-13). Created after several tasks were written in this shape before it was documented. It is the ICDC DevOps task template with the infrastructure-only sections removed, so a reader moving between the two sees the same sections in the same order. CTDC adopted the identical template the same day (`CBIIT/ctdc-documentation → claude/templates/general-task-template.md`); the two are kept in lockstep.

**Which template to use**

Check the specific templates first. A user-facing change is a **user story**; Figma work is a **design task**; infrastructure, environment variables, buckets, or upper-tier changes are a **DevOps task**; study data, IndexD, and data model work use the **data management templates**; scan findings use the **Invicti templates**; release promotions use the **release templates**. This template is for everything else, and only for that.

**Section order (4 sections, exactly this sequence)**

Each header is a Jira wiki `h3.` heading using the emoji + bold title format shown. Don't omit, reorder, or merge sections. If a section has no content, say "None at this time" rather than dropping the header.

1. `h3. 🎯 *Task Summary*`: Two to three sentences: what the task produces, why, and who uses the result. Follow with labeled bullets:
   * `* *System*:` the repository, service, or tool the work happens in
   * `* *Deadline*:` a hard date if one exists; otherwise omit the bullet
   * For a spike, state the time box and that the deliverable is a written assessment, not code.

2. `h3. 🧭 *Scope*`: Two labeled bullets: `* *In scope*:` and `* *Out of scope*:`. Out of scope names adjacent work in words, never by ticket key.

3. `h3. 🚦 *Workflow*`: Numbered steps from start to handoff. Name each phase; do not restate a procedure that lives in a runbook or SOP, point at it instead. The last step is always "Notify the TPM."

4. `h3. ✅ *Definition of Done*`: Labeled bullets (`* *Label*: condition`), one per closure condition, written as outcomes. Always end with `* *Handoff*: TPM notified`. Common labels: *Deliverable*, *Recommendation*, *Documentation*, *Verification*, *Time box*.

**Standing emoji set (4 entries, shared with the DevOps task template)**

| Section | Emoji |
|---|---|
| Task Summary | 🎯 |
| Scope | 🧭 |
| Workflow | 🚦 |
| Definition of Done | ✅ |

**Required content rules**

- **Issue type is Task.** Summaries start with an area label, for example `Backend:`, `Documentation:`, `Spike:`, or the feature name.
- **No Jira ticket keys in the body.** Related work is a native Jira link.
- **Epic Link set on the ticket** via `customfield_12350`. Populate Assignee and the Developer field (`customfield_23650`, written as `[{"name": "username"}]`).
- **No quality-bar items.** Section 508, design system conformance, and test coverage are team-wide standards QA checks; they are not restated here.
- **Jira wiki authoring**: `h3.` headers, `* *Label*: content` lines, `#` numbered lists, `{{monospace}}` for identifiers, curly braces escaped as `\{...\}`, no em dashes.
