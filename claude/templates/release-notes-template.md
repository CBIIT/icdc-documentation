# 📣 Release Notes Template

> **Use this template for the GitHub release notes of every ICDC software release, monthly or patch.** The notes are the body of a GitHub release on `CBIIT/bento-icdc-frontend`, and the ICDC **News** page (`caninecommons.cancer.gov`) loads them from there through the GitHub API, so every release note is published on the site as well as on GitHub. Companions: the Software Release Playbook (`../conventions/software-release-playbook.md`) and the Release Ticket Templates (`release-ticket-templates.md`). CTDC's equivalent is `CBIIT/ctdc-documentation/claude/templates/release-notes-template.md`; the differences are listed at the end.

**Why this template**

Release notes are the public record of what a release changed for ICDC users. They are read by researchers in the comparative oncology community, by federal leadership, and by the CRDC communications team, so they describe outcomes in plain language rather than tickets or code.

Every line must be traceable to work that actually shipped. The scope comes from the release's Jira Fix Versions, and each claim is checked against the merged code, not only the ticket title: ticket summaries are often thin, and a claim nobody can trace back is a claim that may be wrong.

---

## How the News page reads a release

The News page parses the release body in `src/pages/landing/views/news/releaseNotes.ts` (`bento-icdc-frontend`). Two rules follow from that code and are not optional:

1. **Build Details** is read from the section under a `## Build Details` heading, one version per line, with the service name first. A table row that starts with a pipe (`| Frontend | 4.x |`) has an empty first cell and is silently dropped, so the table below is written **without outer pipes**. Only these service names are recognized: Frontend (FE), Backend (BE), File Service (FS), Interop, Data Retriever. Any other row is ignored.
2. **Every bullet in the rest of the body** is flattened into one "New Features and Improvements" list on the page. Section headings and bold are stripped, so each bullet must make sense on its own. The bold label carries the meaning there: write `**Cart download fix:**` rather than relying on the 🐛 heading.

The full release, with its section headings, stays readable on GitHub through the page's "Official Release Notes" link.

---

## Deriving the scope

1. Confirm the Deployment Package on the Release Dashboard (`ICDC Monthly Release <Month YYYY>.xlsx`): the version of every microservice in the release. These versions fill Build Details.
2. Pull every shipped ticket with one JQL query across the release's Fix Versions, excluding test artifacts:

   ```
   project = ICDC AND fixVersion in ("<FE version>", "<BE version>", "<Files version>", "<Interop version>", ...) AND issuetype not in ("Test", "Test Set", "Test Execution") ORDER BY key ASC
   ```

3. For each ticket, confirm what shipped against the merged pull requests on the release branch. When a ticket's description is empty or a pull request changed the scope, the code wins.
4. Cross-check: a microservice version in Build Details with no tagged tickets is either an infrastructure-only bump (fine, no bullet) or a tagging gap to fix before publishing.
5. Invicti remediations shipped in the release go under Security, described by the protection gained, never by CVE detail an attacker could use against an unpatched tier.
6. List open bugs against features in this release; they become Known Limitations.

---

## GitHub release fields

* *Repository*: `CBIIT/bento-icdc-frontend`. Data model releases are published separately on `CBIIT/icdc-model-tool`, and the News page shows them as their own card.
* *Release title*: `ICDC v.<major>.<minor>.<patch>`.
* *Tag*: the Frontend gamma version, `<major>.<minor>.<patch>.<build>`.
* *Target*: `main`, after Engineering has merged and tagged the release.

---

## Body

Copy everything inside the block below into the GitHub release body. Delete any section that has no bullets, and any Build Details row for a microservice not in this release's Deployment Package. Never publish an empty section or a placeholder.

```markdown
## Release Notes - [Integrated Canine Data Commons (ICDC)](https://caninecommons.cancer.gov/#/) 🐕

## Build Details

Service | Version
--- | ---
Frontend (FE) | <version>
Backend (BE) | <version>
File Service (FS) | <version>
Interop | <version>
Data Retriever | <version>

---

## ✨ New Features

- **<Feature name>:** <What a user can now do, and where in the ICDC they do it.>

## 🔒 Security

- **<Area> security update:** <What is now protected, in plain language.>

## 🛠️ Improvements

- **<Area>:** <What works better than before, from the user's point of view.>

## 🍱 Contributions to the Bento Framework

- **<Contribution>:** <What was contributed upstream, to which Bento repository and branch, and which data commons can reuse it.>

## 🐛 Bug Fixes

- **<Area> fix:** <What the user experienced before, and what happens now.>

## ⚠️ Known Limitations

- **<Area> known limitation:** <What the user may encounter, and any workaround.>
```

---

## Section rules

| Section | What belongs here | What does not |
|---|---|---|
| ✨ New Features | Capabilities a user did not have before | Refinements to existing features (Improvements) |
| 🔒 Security | Invicti remediations and other protections, by the protection gained | Exploit detail, CVE specifics, affected endpoints |
| 🛠️ Improvements | Better behavior of existing features, accessibility fixes | New capabilities, defect fixes |
| 🍱 Contributions to the Bento Framework | Code or designs contributed upstream for reuse by other Bento-based commons | ICDC-only work |
| 🐛 Bug Fixes | Closed bugs, described by user-visible symptom | Bugs found and fixed inside the same release cycle that never reached production |
| ⚠️ Known Limitations | Open bugs in shipped features, with a workaround when one exists | Future plans, roadmap items |

A Bug Fix that resolves an earlier release's Known Limitation says so: "This resolves the known limitation noted in v<x.y.z>."

---

## House style

* `- **Label:** sentence.` bullets: a bold short label, a colon, then one or two plain-language sentences. One bullet per line; a bullet that wraps onto a second line is joined back together on the News page, but a blank line ends it.
* End the label with `security update`, `fix`, or `known limitation` in those three sections, because the News page drops the section headings.
* Write for researchers, not engineers: describe what the user sees or can do. No Jira keys, pull request numbers, environment variable names, or internal service names.
* Name UI labels exactly as they appear on screen (**Explore**, **Study Details**, **My Files**).
* Spell out an acronym on first use, then use the acronym.
* Data model and data releases are separate events with their own records; do not list study loads or model versions in software release notes.
* Never call standard browser behavior a bug.
* Colons, not em dashes.

---

## Before publishing

* Every Build Details version matches the Release Dashboard and `/version` on Production.
* Every bullet traces to a ticket in the Fix Version query and to merged code.
* No empty sections, no placeholders, no Jira keys.
* After publishing, open the ICDC **News** page and confirm the release shows its **Versions** and its full list of changes.

---

## Differences from CTDC

* *Repository*: ICDC publishes on `CBIIT/bento-icdc-frontend`; CTDC publishes on `CBIIT/crdc-ctdc-starter-kit`.
* *Build Details*: ICDC has no Auth service and no Data Model Navigator row; it adds Data Retriever. The table has no outer pipes so the News page can read it.
* *Labels*: Security, Bug Fix, and Known Limitation bullets end their label with the category, because the News page flattens sections.
* *Version check*: ICDC verifies against `/version`; CTDC uses the `/#/sysinfo` page.

---

## Changelog

- **v1 (2026-10-23)**: Ported from CTDC's Release Notes Template (v1, 2026-10-23). ICDC differences: published on `CBIIT/bento-icdc-frontend` and rendered on the ICDC News page; Build Details written without outer pipes and limited to the service names the News page parser recognizes (no Auth, adds Data Retriever); category named in Security, Bug Fix, and Known Limitation labels; `/version` check; News page render check after publishing.
