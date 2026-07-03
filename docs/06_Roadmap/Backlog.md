# Backlog

## Title

Backlog — Vero Volley Partnership OS

## Purpose

This document holds concrete, scoped-enough-to-eventually-pick-up items that are not yet sequenced
into `docs/06_Roadmap/Roadmap.md`. It is the intake list between "someone had an idea"
(`Future_Ideas.md`) and "this is next" (`Roadmap.md`).

## When to Use It

- When a small improvement is identified during unrelated work but is out of scope for the current
  release (per `ARCHITECTURE.md`'s "no speculative improvements" rule — record it here instead of
  implementing it).
- When triaging what to sequence into the next roadmap planning pass.

## Table of Contents

1. How Items Move Through This Document
2. Performance & Scale
3. Data Quality
4. UX Improvements
5. Developer Experience
6. Writing Guidelines
7. Notes for Future Contributors

---

## 1. How Items Move Through This Document

An item enters here when identified (often as a "future integration point" or "risk" noted in a
release's completion report). It leaves here either by being sequenced into
`docs/06_Roadmap/Roadmap.md` Section 3, or by being explicitly rejected (moved to a "Rejected"
note with reasoning, not silently deleted, so the reasoning isn't re-litigated later).

## 2. Performance & Scale

- `getAllRecords_()` reads full sheets on every call; revisit if row counts approach
  `SHEET_ROW_CAPACITY` limits meaningfully (`Data.gs`).
- `processLeadBatch_` re-reads reference sheets (blacklist, exclusives, contacted lists) per row
  rather than once per batch — an optimization opportunity if batch sizes grow significantly.
- `Storico Assegnazioni` (the JSON assignment-history array added by `Ownership.gs`) has no size
  cap and grows by one entry per ownership change indefinitely; not yet a problem at current
  volumes, but worth revisiting before any automation calls `changeOwner_()` frequently. See
  `docs/03_Data_Model/Ownership.md` Section 6.

## 3. Data Quality

- `parseRevenue_`'s heuristic parsing (`docs/04_Business_Rules/Scoring.md` Section 4) remains a
  best-effort heuristic over free text; consider a structured revenue-range input instead of free
  text if data quality issues recur.
- No referential integrity enforcement on foreign keys (`docs/03_Data_Model/Relationships.md`
  Section 2) — a dangling FK is possible today; consider a periodic integrity-check report.

## 4. UX Improvements

- No dedicated deal detail view (`docs/02_UX/Workspace_Trattativa.md` Section 5) — clicking a deal
  card currently opens the associated company's drawer instead.
- No cross-link from a person's detail drawer to their company's drawer
  (`docs/02_UX/Workspace_Persona.md` Section 3).
- No UI for `Dashboard Config` system settings (`docs/02_UX/Settings.md` Section 3) — currently
  requires direct spreadsheet edits.

## 5. Developer Experience

- No automated test runner for Apps Script in this environment; verification is currently static
  (bracket balance, duplicate declarations, timestamp diffs — see `docs/00_Project/README.md`
  Section 4). Revisit if a `clasp`-based local test harness becomes viable.
- No source control repository yet backing this project; no branch strategy is currently defined
  anywhere in `docs/` pending one.

## Writing Guidelines

- Every backlog item must be concrete enough that a future reader can pick it up without needing to
  reconstruct context from a conversation — state the specific file/function affected.
- Do not let this document become a dumping ground for vague dissatisfaction — an item without a
  specific, actionable next step belongs in `Future_Ideas.md` instead, not here.

## Notes for Future Contributors

- When a release's completion report lists a "future integration point" or "risk" that isn't
  immediately actioned, copy it here in the same change, with a reference back to the release that
  raised it.
- Periodically review this list for items that have become moot (e.g., resolved as a side effect of
  unrelated work) and remove them explicitly, noting why.
