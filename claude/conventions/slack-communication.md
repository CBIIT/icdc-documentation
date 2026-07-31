<!-- Extracted from claude/SKILL.md on 2026-07-31 to slim the skill file. This is the canonical home for this content. -->

## 14. 💬 Slack Communication Reference

> **The single source of truth for Slack channel routing, mention syntax, message formatting, and known failures on the ICDC project.**
>
> Sections 7c, 9c, 10a–10d, and 11 all reference this section. When channel IDs change, when a new channel is created, or when a new Slack formatting failure is discovered, update this section and the cross-references will stay correct.

### 14a. Channel Routing — Where Each Type of Message Goes

ICDC has more channels than CTDC, and they're more topical than audience-segmented. Route by what the message is about, not by which engineer should see it (engineers are in most channels).

| Channel | Channel ID | Use For |
|---|---|---|
| `#icdc` | `CE0EA6W93` | **Primary announcement channel.** Sprint review/release demo announcements, retro reminders, leadership-facing summaries, broad team news. *(This is the analog of CTDC's `#ctdc-discussions`.)* |
| `#icdc-dev` | `CKGQKEGBB` | Engineering-only detail — file paths, code snippets, ticket links, design questions |
| `#icdc-devops` | `CKENP6AH3` | Deployment activity, infra changes, environment provisioning, AWS/cloud topology |
| `#icdc-jenkins` | `CK37T2R0B` | CI/CD notifications, build/pipeline issues, Jenkins job failures |
| `#icdc-test-questions` | `CNPLNFR2R` | QA coordination, test environment questions, test data clarifications |
| `#icdc-security` | `C0AT3D3KJN6` | Security work — Invicti findings, vulnerability remediation, ICDC-4120 epic activity |
| `#icdc-monitoring` | `C023T6X65V5` | Production monitoring alerts, uptime, observability |
| `#icdc-crdc` | `CU8CYPQKB` | Cross-team CRDC coordination (with the broader Cancer Research Data Commons program) |
| `#icdc-links-resources` | `C04722U0W8N` | Reference links, documentation pointers, useful threads to retain |

### 14b. Ephemeral / Topic-Specific Channels

ICDC also creates short-lived channels for specific work streams. **Do not document these individually in the SKILL.md** — by the time the entry stabilizes, the channel is closed. Recognize the patterns instead:

- `#icdc-sprint-NN-planning` — per-sprint planning channels (e.g., `#icdc-sprint-44-planning`)
- `#icdc-YYYY-qN-software-release` — per-release coordination (e.g., `#icdc-2026-q3-software-release`)
- `#icdc-banner-hotfix`, `#icdc-hotfix-security-vulnerability-cve-XXXX` — incident-specific channels
- `#icdc-unit-testing`, `#icdc-2026-q3-software-release` — work-stream channels

If a sprint or release announcement needs to reference one of these, link directly to it; do not try to memorize them.

### 14c. Slack Mention Syntax — `<@UXXX>` vs `@display name`

This is the single most-common Slack formatting mistake. Get it right:

| What you write in API-composed message | What renders in Slack | Pings the person? |
|---|---|---|
| `<@U01TADC2E67>` | Clickable @ambar rana mention | ✅ Yes |
| `<@ambar.rana@nih.gov>` | Plain text — fails to mention | ❌ No |
| `@ambar rana` | Plain text "at-ambar-rana" | ❌ No |
| `@ambar.rana` | Plain text "at-ambar.rana" | ❌ No |

**Rule of thumb:** any Slack message composed via the MCP must use `<@UXXXXXXXXX>` syntax for mentions. The display-name format (`@ambar rana`) only works when typed directly into the Slack UI by a human, where the autocomplete picker resolves it to the User ID before sending.

**For broadcast notifications:**

| Token | Effect |
|---|---|
| `<!channel>` | Notifies every member of the channel currently online or away |
| `<!here>` | Notifies only members currently active |
| `<!everyone>` | Notifies the entire workspace (use sparingly, generally only in `#general`) |

### 14d. Slack Message Formatting — Known Failures

Real failures encountered when building ICDC announcements. Avoid these patterns.

- **`---` horizontal rules trigger `invalid_blocks` errors.** Slack's block validator rejects them. Use blank lines or a `:large_blue_diamond:` / `:white_medium_square:` as a visual break between sections instead.
- **Arrow characters (`→`) combined with user mentions can fail validation.** Use plain text labels ("Presenters:", "Tickets:") instead of decorative arrows in the same line as `<@U123>` mentions.
- **User mentions render as `<@U123456>`.** If you see `<mailto:@U123...>` in a message (often in pasted content from Slack exports), that's a malformed mention — strip and re-format.
- **For `@channel` notifications, use `<!channel>` in the API payload.** Slack UI renders it as `@channel` and pings the channel on send.
- **Bot-sent messages show bot attribution** (e.g., "sent by Claude"). To post as yourself, copy the message text and paste it in the Slack UI directly. The draft tool solves this for new messages — drafts created via MCP send as the user when they hit "Send."

### 14e. Draft Tool Behavior

- Drafts created via `slack_send_message_draft` attach to a specific channel. They appear **only when you navigate to that channel**, not in the global "Drafts & Sent" sidebar view. If a user says they don't see the draft, the most likely cause is they're looking at the global Drafts view instead of the target channel.
- **Only one attached draft per channel at a time.** Creating a new draft may replace an existing draft.
- When the user has already reviewed the message in chat, `slack_send_message` is appropriate. If they haven't, use `slack_send_message_draft` so they can review in the Slack UI.

### 14f. Standard Sprint Review + Release Demo Announcement Template

Use this structure for combined Sprint Review + Release Demo announcements in `#icdc` (`CE0EA6W93`):

```
<!channel>  (use only if you need to notify the full channel — most sprint reviews warrant it)
:feet::dna: *Sprint [N] Review + Release [version] Demo Day!* :dog2:

[Hook sentence — what's happening and why it matters]

:calendar: *When:* [Day] at [Time] [Timezone]

*What's on the docket:*
• Sprint [N] review — what we shipped, what's carrying over ([goal scorecard tease])
• Live demos from the devs on every feature and bug fix
• Retrospective — Liked / Lacked / Learned on our retro board
• Action items

Full release notes: <[github release URL]|[release tag]>

:microphone: *Demo Schedule — who's on deck:*

*Slot N ([N] min)* — [Feature name]
Presenter(s): <@[slack_user_id]>  ← USE USER ID, not display name
Tickets: [ICDC-XXXX, ICDC-YYYY]

[repeat for each slot]

<@[QA Slack User ID]> will be in the room to back up QA acceptance — thank you for shepherding *[N] tickets* through QA this sprint! :test_tube: :trophy:

:clipboard: *Retro board — bookmark before [day]:*
<[retrotool URL]|[retrotool URL]>
Format: *10 min silent brainstorm* → group similar cards → discuss → dot-vote top 3 actions

*Demo presenters — quick prep ask (24h before):*
• [Prep item 1]
• [Prep item 2]

*Shout-outs from the release:* :gift:
• [Cross-team wins, on-time delivery, notable collaboration]

See you [day] at [time]! :raised_hands: Drop questions, heckles, or demo tips in the thread.
```

**ICDC-specific emoji conventions** observed in real announcements:
- :feet: :dna: :dog2: — opening flair for sprint announcements (canine theme)
- :siren2: — schedule changes / urgency
- :microphone: — demo schedule section
- :test_tube: :trophy: — QA shoutout
- :clipboard: — retro board reference
- :gift: — release shoutouts

These are conventions, not requirements. Match the team's existing voice.

### 14g. Per-Presenter Prep Sheet DM Template

When DM'ing prep sheets, use the presenter's User ID as the channel:

```
slack_send_message_draft(
  channel_id = "U01MJCG0MS8",   # Toyo Udosen's User ID — DM goes here
  message    = "[full prep sheet markdown content]"
)
```

The draft will appear in your DM thread with that person, ready to review and send.

### 14h. Searching Slack History — When and How

Use `slack_search_public_and_private` for:
- Finding past announcements to model new ones on (`from:@Gina Kuffel sprint review`)
- Confirming where a specific kind of message was previously posted
- Pulling context for an ongoing thread

Use `slack_search_channels` to:
- Look up a channel's User ID before composing a message
- Discover topic-specific channels created since the last SKILL.md update

Use `slack_search_users` to:
- Look up a User ID by name before composing a mention
- Find the right person when only an email or display name is known

**Do not memorize User IDs across sessions** — always pull from this section's roster table or the `slack_search_users` tool. The MCP user-ID-by-display-name search is reliable; assumptions are not.
