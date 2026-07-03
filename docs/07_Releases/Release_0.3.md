# Release 0.3

## Title

Release 0.3 — Not Yet Scoped

## Purpose

This document is the reserved slot for Release 0.3's specification and, once shipped, its
completion report. It exists now, ahead of scoping, so the release-numbering sequence and template
structure are established before real content is written under time pressure.

## When to Use It

- When Release 0.3 is formally scoped, replace this template's placeholder sections with the real
  goal, file scope, and constraints, following the pattern in `docs/00_Project/ARCHITECTURE.md`
  Section 7.
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

**Not started.** No implementation work has begun under this release number.

## 2. Candidate Scope

Per `docs/06_Roadmap/Roadmap.md` Section 2 ("In Progress / Next Up"), the most likely candidates
for this release are Migration Execution (running `Migration.gs`'s prepared-but-unexecuted
functions against the live spreadsheet) and/or a first read-only Personal Workspace view built on
`Ownership.gs:getOwnedRecords_`. This is a candidate, not a commitment — confirm against the
roadmap at scoping time, since it may have changed.

## 3. Goal (To Be Filled)

*State the single goal of this release here when scoped.*

## 4. Files In Scope (To Be Filled)

*List every file this release is allowed to touch.*

## 5. Explicit Constraints (To Be Filled)

*List what this release must NOT do, following the pattern of prior sprints (e.g., "no UI changes,"
"no permission wiring").*

## 6. Completion Report (To Be Filled)

*After implementation: files created, files modified, schema changes, backward compatibility
confirmation, future integration points, risks — following the format established by Sprint 1,
Release 0.2, Release 0.2.1, and Sprint 2.*

## Writing Guidelines

- Do not fill in Sections 3–6 speculatively before the release is actually scoped and implemented —
  a half-filled release document is more misleading than an honestly empty template.
- When filling this in for real, follow the same structure and rigor as the sprint/release
  completion reports already produced for this project (file-timestamp verification, explicit
  backward-compatibility confirmation).

## Notes for Future Contributors

- Update `docs/06_Roadmap/Roadmap.md` in the same change that this release moves from "Not started"
  to actually scoped/in-progress.
- If Release 0.3 ends up covering different scope than Section 2's candidate, that is fine — Section
  2 is a forecast, not a constraint; just update it to reflect the real, confirmed goal once decided.
