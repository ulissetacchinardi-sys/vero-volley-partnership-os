# AI Assistant

## Title

AI — Partnership OS AI Assistant

## Purpose

This document specifies the intended design of a future in-product AI Assistant, and — more
concretely and more importantly today — exactly which existing data structures were deliberately
shaped to support it before it exists. It exists so that when this feature is finally built, it
consumes the prepared structures rather than requiring a data-model rework first.

## When to Use It

- Before designing or implementing any AI feature in this product.
- When evaluating whether a schema change would help or hinder future AI capability.

## Table of Contents

1. Status
2. Design Intent
3. Data Foundations Already in Place
4. Candidate Capabilities
5. Constraints
6. Writing Guidelines
7. Notes for Future Contributors

---

## 1. Status

**Planned.** No AI integration exists in the codebase today. This document is forward-looking by
definition; nothing in it should be read as current behavior.

## 2. Design Intent

The AI Assistant is meant to operate on top of the Activity Engine's timeline
(`docs/03_Data_Model/Timeline.md`) rather than requiring bespoke data access — summarizing a
company or deal's history, suggesting a next action, and (later) drafting outreach content. It is
explicitly not meant to be the source of business logic (scoring, deduplication, pipeline rules
remain deterministic and rule-based, per `docs/04_Business_Rules/`); AI augments the human's
judgment on top of a trustworthy, deterministic core, it does not replace that core.

## 3. Data Foundations Already in Place

- `ACTIVITY_METADATA_TEMPLATE` (`Activity.gs`, see `docs/03_Data_Model/Activities.md` Section 6)
  already reserves `summary`, `sentiment`, `nextSuggestedAction`, and `aiGenerated` fields on every
  activity, specifically so an AI feature has a consistent place to write structured output without
  a schema migration.
- `ACTIVITY_SOURCES.AI` (`Activity.gs`) already exists as a valid `Origine` value, so an
  AI-generated activity (e.g., an auto-drafted note) is distinguishable from a human-logged one from
  day one.
- `getActivityTimeline_()` (`docs/03_Data_Model/Timeline.md`) is the intended single read path for
  any future summarization feature — it should not need its own separate data access layer.

## 4. Candidate Capabilities

Listed in rough order of how directly the current data model already supports them, not in
priority order (priority is a roadmap decision, see `docs/06_Roadmap/Roadmap.md`):

- Timeline summarization for a company/person/deal (reads `getActivityTimeline_`, writes a
  `summary` back via `Metadata` on a new `Nota` activity with `Origine: AI`).
- Next-best-action suggestion (reads timeline + current `Fase`/`Stato`, writes
  `nextSuggestedAction`).
- Outreach draft generation (extends `Outreach.gs:OUTREACH_TEMPLATES` or generates ad hoc content
  for `sendOutreachEmail_`'s existing send path — see `docs/05_AI/Prompting.md` for how such a
  feature's own prompts should be structured).
- Sponsor Research assistance — see `docs/05_AI/Sponsor_Research.md`.

## 5. Constraints

- Must respect `docs/00_Project/Vision.md`'s no-paid-tools constraint: any AI capability must run
  within whatever AI features are available inside the Google Workspace subscription already in
  use, or be explicitly flagged as requiring a new paid dependency for a deliberate, separate
  decision — never assumed silently.
- Must not write directly to business-logic fields (`Sponsor Fit Score`, `Priorita`, `Fase`) as a
  side effect of a summarization/suggestion feature — AI output is additive (new activity rows,
  metadata, suggestions) unless a future release explicitly and narrowly scopes AI into a
  decision-affecting role.
- Must tag all AI-generated content clearly (`Origine: AI`, `metadata.aiGenerated: true`) so a human
  can always distinguish AI output from human-entered data.

## Writing Guidelines

- Do not describe this document's content as implemented — every section describes intent or
  already-prepared groundwork, never shipped behavior.
- When a capability moves from "candidate" to "in progress," move its description into a new
  `docs/07_Releases/` entry and update this document to reference that release rather than
  duplicating the specification in both places.

## Notes for Future Contributors

- Before implementing any capability from Section 4, re-read `docs/03_Data_Model/Activities.md` and
  `docs/03_Data_Model/Timeline.md` in full — the data shape this feature should consume already
  exists and was designed with this feature in mind.
- If Workspace's available AI capabilities change (new built-in features, new API access), update
  Section 5's constraints accordingly before scoping implementation.
