# Release 1.0

## Title

Release 1.0 — Not Yet Scoped

## Purpose

This document is the reserved slot for Release 1.0's specification and, once shipped, its
completion report. 1.0 is intended to mark the point at which the multi-user infrastructure built
across Sprint 1, Release 0.2/0.2.1, and Sprint 2 is fully wired into live, enforced, user-facing
behavior — the "activation" milestone referenced throughout `docs/03_Data_Model/` and
`docs/04_Business_Rules/`.

## When to Use It

- When defining what "1.0" concretely means for this product, before scoping the releases that lead
  up to it.
- After 1.0 ships, as the completion report and as the historical record of what "done" meant at
  that point.

## Table of Contents

1. Status
2. What 1.0 Is Intended to Mean
3. Exit Criteria (Draft)
4. Goal (To Be Filled)
5. Completion Report (To Be Filled)
6. Writing Guidelines
7. Notes for Future Contributors

---

## 1. Status

**Not started.** Depends on Releases 0.3 through 0.5 (or however many intermediate releases prove
necessary) per `docs/06_Roadmap/Roadmap.md`.

## 2. What 1.0 Is Intended to Mean

Not "first release" (the system has been in productive use since before this documentation
framework existed) — rather, the point at which multi-user operation is real: permission
enforcement active, ownership populated and used by real dashboards, activity logging live across
core workflows. Before this point, the product is a single-shared-view tool with multi-user
infrastructure quietly waiting; after this point, it behaves as an actual multi-user system.

## 3. Exit Criteria (Draft)

Draft, to be confirmed/revised when this release is actually scoped:

- `SYSTEM_CONFIG.enforcePermissions = true`, with all preconditions in
  `docs/04_Business_Rules/Permissions.md` Section 6 met and verified.
- Every ownership-enabled sheet (`docs/03_Data_Model/Ownership.md` Section 2) has a populated
  `ID Utente Owner` on all active records, not only new ones going forward.
- At least one live workflow calls `Activity.gs:logActivity_()` as a side effect of normal use
  (not only as a manually-triggered backfill).
- `docs/00_Project/FEATURE_REGISTRY.md`'s "Multi-User Infrastructure" section has no remaining
  "Built, Unwired" rows for the core ownership/permission/activity mechanisms.

## 4. Goal (To Be Filled)

*Confirm and restate the exit criteria as the release's actual goal once scoping begins.*

## 5. Completion Report (To Be Filled)

*After implementation: files created, files modified, schema changes, backward compatibility
confirmation, future integration points, risks.*

## Writing Guidelines

- Treat Section 3 as a draft contract for what "1.0" means — revise it deliberately if scope
  changes, rather than letting the actual delivered release silently redefine the term after the
  fact.
- This release, more than any prior one, is likely to touch UI (`Dashboard.html`, `View_*.html`) —
  when scoped, its constraints section should say so explicitly rather than inheriting the
  "no UI changes" framing of the infrastructure sprints that preceded it.

## Notes for Future Contributors

- If exit criteria change, update Section 3 explicitly and note why — this is the definition of
  "done" for the project's first true multi-user milestone and deserves a visible history of how
  that definition evolved.
- Once shipped, this document's historical value is high — do not let its completion report be
  abbreviated relative to the smaller sprints that preceded it.
