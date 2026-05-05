# Pending SKILL.md changes — apply on next pass

These changes are queued for `claude/SKILL.md` but not yet applied to the live file because applying them requires re-emitting the full 87KB SKILL.md content via the GitHub MCP, which carries transcription risk and significant context window cost in a single session. The fragment file at `claude/templates/7e-4-products.md` was committed first (lower risk, smaller surface) so the template content itself is already canonical and fetchable.

The next session that touches SKILL.md (epic normalization, section update, etc.) should apply these queued changes in the same commit.

**⚠️ Affiliation discipline reminder.** When applying these changes (or any future SKILL.md edit involving roster entries), do NOT silently change anyone's affiliation tag. The `@nih.gov` email domain is given to FNL/BACS/CTOS contractors as well as federal employees and is not evidence of federal status. Confirmed federal employees on ICDC: Mark Jensen (NIH/NCI). Confirmed FNL/BACS contractors: Gina Kuffel, Ambar Rana, Eric Miller, Toyo Udosen, Charles Ngu, Philip Musk. Any other affiliation tag must be verified with the user before being added or changed. When unsure, ask.

---

## Change 1 — Insert 7e-4 reference block

**Where:** After the end of section 7e-1 (after the line `7. **Update the related-epics cross-reference list** in the Notes section of every other Application Pages epic when a new page epic is added or an existing one is retitled.` and the `---` divider), and **before** the start of `## 8. Ticket Writing Standards`.

**Why a reference block (not the full template):** SKILL.md is already at ~85KB. Per-grouping templates are stored as fragments in `claude/templates/` so the operational sections of SKILL.md (1–6, 8–14) stay scannable. The reference block points readers at the fragment.

**Insert this content verbatim:**

```markdown
### 7e-4. 📦 Products (Drafted)

> **Use this template for every epic that scopes a standalone deliverable consumed by external systems or end users.** Anchor example: ICDC-4134 (synthetic data generator). Other examples include the ICDC Data Model itself as a versioned product, manifest format specifications, and any tool published publicly to GitHub or Hugging Face Spaces for use by data submitters or downstream commons.

**The full template lives at** `claude/templates/7e-4-products.md` in this repo.

**Why a separate file:** SKILL.md is already large; per-grouping templates are referenced rather than embedded so the operational sections (1–6, 8–14) stay scannable. The fragment file is the canonical source of truth for the Products template — fetch it on demand when drafting or normalizing a Products epic.

**Quick reference — what's in the fragment:**

- **Section order:** identical to 7e-1 (15 sections, same emojis, same order).
- **Content rules tuned for Products:** distribution channels (GitHub, Hugging Face Spaces, PyPI, npm) instead of live URLs; predecessor product cross-reference (e.g., the existing Bento Data Generator); cold-start and zero-data generation modes considered; reproducibility, contextual fidelity, and schema conformance as the Performance & Quality bar; open-source license stance and no-PHI/PII constraint stated explicitly.
- **Components Breakdown sub-blocks:** Generation Engine / Configuration & Inputs / Distribution & Documentation / Testing (UI optional).
- **Verification workflow:** verify the public repo state, the schema source on `icdc-model-tool`, and any predecessor product README before drafting.

**When to fetch the fragment:**

- Drafting a new Products epic — read `claude/templates/7e-4-products.md` first
- Normalizing or refreshing an existing Products epic
- Auditing whether a candidate epic belongs in Products vs. Microservices vs. Features (the fragment's "why this template" section is the deciding lens)

**When the fragment changes:**

- Update the fragment in `claude/templates/7e-4-products.md`
- Note the change here if it affects the Quick Reference summary above
- Consider a normalization pass across all existing Products epics so they stay consistent — see Section 13 (Maintenance Notes)

---
```

## Change 2 — Update Section 13a status tracker row for 7e-4

**Where:** Section 13a Epic Template Status Tracker table.

**Find this row:**

```
| Products (7e-4) | 🚧 TBD | TBD |
```

**Replace with:**

```
| Products (7e-4) | ✅ Drafted v1 (2026-05-05) | ICDC-4134 (Synthetic Data Generator — anchor) |
```

---

## Change 3 — Update Philip Musk's row in §11 Active Team Members

**Where:** Section 11 Active Team Members table.

**Find this row:**

```
| Business Analyst (NIH/NCI) | Philip Musk | — | `muskp2` | *(not yet confirmed)* | `@Philip Musk` |
```

**Replace with:**

```
| Business Analyst, FNL/BACS — leads ICDC Data team | Philip Musk | philip.musk@nih.gov | `muskp2` | `UE1AJ02EB` | `@Philip Musk` |
```

**Why three changes in one row:**

1. **Role correction:** "Business Analyst (NIH/NCI)" → "Business Analyst, FNL/BACS — leads ICDC Data team". Philip is an FNL/BACS contractor (not NIH/NCI federal), and he leads the ICDC Data team (correcting a prior misattribution to Todd Pihl).
2. **Email added:** `philip.musk@nih.gov` (sourced from his Slack profile via `slack_search_users`).
3. **Slack User ID added:** `UE1AJ02EB` (sourced from `slack_search_users` query "Philip Musk").

---

## Change 4 — Remove Todd Pihl's row from §11 NCI/CBIIT Stakeholders (or verify and reframe)

**Where:** Section 11 NCI/CBIIT Stakeholders table.

**Find this row:**

```
| DataHub Adoption Driver | Todd Pihl | NCI/CBIIT — drove DMN adoption in CRDC DataHub |
```

**Two options — pick based on what is verified:**

**Option A — Remove the row entirely.** Use this if the user wants to clean out unverified stakeholder entries. The DataHub adoption history is already preserved in the Data Model Explorer / Navigator product summary document and in the cross-project Jira ticket history (CRDCDH-18, CRDCDH-550, etc.) — it doesn't need to live in the SKILL.md roster.

**Option B — Verify Todd's affiliation and keep the row with corrected text.** If Todd is confirmed FNL/BACS or another contractor org rather than NCI/CBIIT federal, replace the row with:

```
| DataHub Adoption Driver (historical) | Todd Pihl | <verified affiliation> — drove DMN adoption in CRDC DataHub circa 2023 |
```

**The change recorded in user memory** (and reflected in the ICDC-4134 epic description) is that Philip Musk leads the ICDC Data team — NOT Todd Pihl. The Todd-Pihl-as-DataHub-driver framing is historical and may still be accurate in that narrow sense, but Todd's affiliation tag (NCI/CBIIT) is unverified. The next session applying these changes should ask the user before keeping it as `NCI/CBIIT`.

---

## How to apply

Either:

1. **Manual PR:** edit `claude/SKILL.md` directly in GitHub UI, paste in the changes above, commit. ~5 minutes for all four.
2. **Next Claude session:** ask "apply the pending SKILL.md changes from claude/CHANGES_PENDING.md and then delete the file." The next session can fetch SKILL.md fresh, apply the surgical edits, push, and clean this file up. For Change 4, the next session must ask the user about Todd's affiliation before proceeding.

After applying all four changes, **delete this file** so it stays a true to-do queue.
