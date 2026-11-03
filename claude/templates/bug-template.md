### 🐞 Bug Template (ICDC, v1)

> **Use this template for every ICDC bug**: anything that worked, or was specified to work, and does not, in any tier, in the application, an API, or a pipeline. The canonical example is **ICDC-4312 (Prefect OpenSearch flows time out connecting to the Stage and Prod OpenSearch domains)**.
>
> **Status:** v1 (2026-11-03). Replaces the plain-label Bug Format that lived in `claude/SKILL.md` section 8, which predated the move to `h3.` emoji headings and was the one ticket type with no template. Same five pieces of information as that format (Environment, Severity, Steps to Reproduce, Expected, Actual, Logs), regrouped into the standard heading style. CTDC adopted the identical template the same day (`CBIIT/ctdc-documentation → claude/templates/bug-template.md`); the two are kept in lockstep.

**Which template to use**

A bug records something that is broken. If the work is new behavior, it is a **user story**; if it is an infrastructure change that was planned rather than discovered broken, it is a **DevOps task**; if it came from a security scan, use the **Invicti templates** instead. A bug found during a release that blocks the release is still filed on this template.

**Section order (5 sections, exactly this sequence)**

Each header is a Jira wiki `h3.` heading using the emoji + bold title format shown. Don't omit, reorder, or merge sections. If a section has no content, say "None at this time" rather than dropping the header.

1. `h3. 🐞 *Bug Summary*`: One or two sentences: what is broken and who or what it stops. Describe the symptom, not a suspected cause. Follow with labeled bullets:
   * `* *Environment*:` the tiers where the bug is seen (`Dev`, `QA`, `Stage`, `Prod`), separated by ` / `
   * `* *Severity*:` one value from the severity table below
   * `* *Reported in*:` where the bug surfaced, as a link (a Slack thread, a QA test run, a user email); omit the bullet when the reporter filed the ticket directly

2. `h3. 🔁 *Steps to Reproduce*`: Numbered steps from a known starting point to the failure. Name the tier, the page or pipeline, and any input that matters. If the bug cannot be reproduced on demand, say so and describe when it was seen.

3. `h3. ✅ *Expected Behavior*`: What should happen at the last step.

4. `h3. ❌ *Actual Behavior*`: What happens instead, in plain words. Quote the exact error message inline in `{{monospace}}` when it is short.

5. `h3. 📋 *Logs & Screenshots*`: Full error output in a `{noformat}` block, one block per log. Screenshots go in as Jira attachments and are referenced by filename here. Remove secrets, tokens, and personal data before pasting.

**Standing emoji set (5 entries)**

| Section | Emoji |
|---|---|
| Bug Summary | 🐞 |
| Steps to Reproduce | 🔁 |
| Expected Behavior | ✅ |
| Actual Behavior | ❌ |
| Logs & Screenshots | 📋 |

**Severity**

| Severity | Use when |
|---|---|
| Critical | Production is down, data is lost or exposed, or a release cannot ship, and there is no workaround |
| High | A feature, page, or pipeline is blocked in any tier and there is no workaround |
| Medium | Something works incorrectly but a workaround exists |
| Low | Cosmetic or minor: wording, alignment, a non-blocking display issue |

Severity is written in the body. The Jira Priority field is left at its default for the TPM to set at triage.

**Required content rules**

- **Issue type is Bug.** No `[BUG]` or `Bug:` prefix on the summary; the issue type already says it. The summary names the symptom in plain words (for example `Case Detail page fails to load for multi-study cases`), not the cause or the fix.
- **No fix in the body.** The bug records what is wrong. Root cause and remediation are worked out by the engineer and recorded in a comment when found.
- **No Jira ticket keys in the body.** A bug that blocks other work gets a `Blocks` link with the bug as the inward (blocking) issue; work that may fix it, or that it duplicates, gets `Relates`.
- **Epic Link set on the ticket** via `customfield_12350`: the epic for the feature or pipeline that is broken. Leave Assignee empty at creation unless the TPM names an owner; populate the Developer field (`customfield_23650`, written as `[{"name": "username"}]`) once the engineer is known.
- **No time boxes or estimates.** Story points (`customfield_10042`) are decided by the whole team at refinement; leave the field empty when filing.
- **Jira wiki authoring**: `h3.` headers with a blank line after each, `* *Label*: content` lines, `#` numbered lists, `{{monospace}}` for identifiers and short errors, `{noformat}` for logs, curly braces outside `{noformat}` escaped as `\{...\}`, underscores in plain text wrapped in `{{monospace}}`, no em dashes.

**Workflow (Claude in Chrome, Jira REST API v2)**

1. Search open ICDC issues for the same symptom and for the work it touches; link rather than duplicate.
2. `POST /rest/api/2/issue` with issue type `Bug`, the summary, and a placeholder description.
3. `PUT /rest/api/2/issue/<KEY>` with the full Jira wiki body and `customfield_12350`.
4. `POST /rest/api/2/issueLink` for each `Blocks` or `Relates` link.
5. Read the ticket back: the description starts with `h3.`, the Epic Link is set, and the links are in the right direction. Ask the TPM to confirm the rendered ticket in the Jira UI.

**Skeleton**

```
h3. 🐞 *Bug Summary*

<What is broken and who or what it stops.>
* *Environment*: <Dev / QA / Stage / Prod>
* *Severity*: <Critical | High | Medium | Low>
* *Reported in*: [<source>|<url>]

h3. 🔁 *Steps to Reproduce*

# <Starting point: tier, page or pipeline>
# <Action>
# <Observe>

h3. ✅ *Expected Behavior*

<What should happen.>

h3. ❌ *Actual Behavior*

<What happens instead.>

h3. 📋 *Logs & Screenshots*

{noformat}
<full error output>
{noformat}
```
