# Release 0.4

## Title

Release 0.4 — Not Yet Scoped

## Purpose

This document is the reserved slot for Release 0.4's specification and, once shipped, its
completion report. It exists now, ahead of scoping, so the release-numbering sequence and template
structure are established before real content is written under time pressure.

## When to Use It

- When Release 0.4 is formally scoped, replace this template's placeholder sections with the real
  goal, file scope, and constraints.
- After implementation, fill in the completion report sections with what was actually delivered.

## Table of Contents

1. Status
2. Candidate Scope
3. Goal (To Be Filled)
4. Files In Scope (To Be Filled)
5. Explicit Constraints (To Be Filled)
6. Completion Report (To Be Filled)
7. Writing Guidelines
8. Notes for Future Contributors

---

## 1. Status

**Not started.** No implementation work has begun under this release number. Depends on Release
0.3 being completed first (see `docs/06_Roadmap/Roadmap.md` Section 3 for the dependency-ordered
plan).

## 2. Candidate Scope

Per the roadmap's dependency ordering, this release is a plausible home for either permission
enforcement activation (`docs/04_Business_Rules/Permissions.md` Section 6) or the beginning of
Activity Engine wiring into live workflows (`docs/03_Data_Model/Activities.md` Section 1) —
whichever Release 0.3 leaves as the next unblocked item. Confirm against the roadmap at scoping
time.

## 3. Goal (To Be Filled)

*State the single goal of this release here when scoped.*

## 4. Files In Scope (To Be Filled)

*List every file this release is allowed to touch.*

## 5. Explicit Constraints (To Be Filled)

*List what this release must NOT do.*

## 6. Completion Report (To Be Filled)

*After implementation: files created, files modified, schema changes, backward compatibility
confirmation, future integration points, risks.*

## Writing Guidelines

- Do not fill in Sections 3–6 speculatively before the release is actually scoped and implemented.
- Re-check Section 2's candidate scope against the actual outcome of Release 0.3 before finalizing
  this release's real goal — the dependency chain may have shifted.

## Notes for Future Contributors

- Update `docs/06_Roadmap/Roadmap.md` in the same change that this release moves from "Not started"
  to actually scoped/in-progress.
- If permission enforcement is scoped into this release, `docs/04_Business_Rules/Permissions.md`
  Section 6's preconditions must all be confirmed met before implementation begins, not discovered
  mid-implementation.
