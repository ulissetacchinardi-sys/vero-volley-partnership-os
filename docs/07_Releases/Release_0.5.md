# Release 0.5

## Title

Release 0.5 — Not Yet Scoped

## Purpose

This document is the reserved slot for Release 0.5's specification and, once shipped, its
completion report. It exists now, ahead of scoping, so the release-numbering sequence and template
structure are established before real content is written under time pressure.

## When to Use It

- When Release 0.5 is formally scoped, replace this template's placeholder sections with the real
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

**Not started.** No implementation work has begun under this release number. Depends on Releases
0.3 and 0.4 (see `docs/06_Roadmap/Roadmap.md` Section 3).

## 2. Candidate Scope

Per the roadmap's dependency ordering, this release is a plausible home for dedicated
Company/Person/Deal workspace views (`docs/02_UX/Workspace_Azienda.md`,
`Workspace_Persona.md`, `Workspace_Trattativa.md`), once ownership and activity data are actually
populated and readable by prior releases. Confirm against the roadmap at scoping time.

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
- If this release is the first to touch `Dashboard.html`/`View_*.html` since the infrastructure
  sprints began, the completion report should explicitly call that out, since every prior release
  from Sprint 1 onward deliberately avoided UI changes.

## Notes for Future Contributors

- Update `docs/06_Roadmap/Roadmap.md` in the same change that this release moves from "Not started"
  to actually scoped/in-progress.
- If this release does introduce the first live UI consumption of `Ownership.gs`/`Activity.gs`,
  update `docs/00_Project/FEATURE_REGISTRY.md` to move those rows from "Built, Unwired" to
  "Shipped."
