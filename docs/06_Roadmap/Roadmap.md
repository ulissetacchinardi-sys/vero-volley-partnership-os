# Roadmap

## Title

Roadmap — Vero Volley Partnership OS

## Purpose

This document is the maintained, ordered view of what has shipped and what is planned next. It is
the single place to answer "what's the current state of the project and what's coming" without
reading every release document individually.

## When to Use It

- At the start of planning any new sprint or release.
- When a stakeholder asks for project status.
- When deciding what to work on next.

## Table of Contents

1. Shipped
2. In Progress / Next Up
3. Planned (Not Yet Scoped)
4. Speculative (See Future_Ideas.md)
5. Writing Guidelines
6. Notes for Future Contributors

---

## 1. Shipped

- **v1 Core CRM**: schema foundation, deduplication/blacklist engine, scoring engine,
  pipeline/Kanban, Gmail/Calendar/Drive outreach integrations, scheduled + reactive automation,
  multi-view web app UI. See `docs/07_Releases/` for pre-0.3 history once backfilled (see Section 6).
- **Sprint 1 — Infrastructure Foundation**: user registry, role model, permission engine (inert),
  authentication layer (prepared, not required), migration helpers (manual-only). See
  `docs/04_Business_Rules/Permissions.md`.
- **Release 0.2 — Activity Engine**: centralized activity/timeline entity. See
  `docs/03_Data_Model/Activities.md`.
- **Release 0.2.1 — Activity Engine Refinement**: generic relationships, source, outcome,
  visibility fields, metadata structure documentation. See `docs/03_Data_Model/Activities.md`.
- **Sprint 2 — Ownership Engine**: ownership/collaboration data model and engine functions. See
  `docs/03_Data_Model/Ownership.md`.
- **Documentation Framework** (this `docs/` tree): see `docs/07_Releases/` once a release entry is
  created for it.
- **Blueprint v1.1 — Documentation Cleanup**: merged `Features.md` into `FEATURE_REGISTRY.md`,
  fixed eight broken `ARCHITECTURE.md` cross-references, corrected factual errors in
  `PROJECT_STATUS.md`, and unified terminology via a new `Glossary.md` bridge table. See
  `docs/00_Project/CHANGELOG.md` and `docs/00_Project/BLUEPRINT_REVIEW.md`.

## 2. In Progress / Next Up

Nothing is currently mid-implementation as of this document's creation. The next logical release,
per the dependency chain documented across `docs/03_Data_Model/` and `docs/04_Business_Rules/`, is
one of:

- **Migration Execution**: run (not just prepare) `Migration.gs`'s user bootstrap and owner-ID
  backfill against the live spreadsheet, now that Sprint 2 has added the required columns. See
  `docs/04_Business_Rules/Permissions.md` Section 6 for why this must precede permission
  enforcement.
- **Personal Workspace (read-only)**: a first UI surface consuming `Ownership.gs:getOwnedRecords_`
  to show "my leads / my deals," without yet wiring reassignment or enforcement.

## 3. Planned (Not Yet Scoped)

In roughly the order implied by dependency (each depends on the item(s) before it):

1. Permission enforcement (`SYSTEM_CONFIG.enforcePermissions = true`) — see
   `docs/04_Business_Rules/Permissions.md` Section 6 for preconditions.
2. Manager Dashboard / team-scoped analytics — see `docs/02_UX/Analytics.md`.
3. Activity logging wired into live workflows (`Dedup.gs`, `Pipeline.gs`, `Outreach.gs` calling
   `logActivity_()`) — see `docs/03_Data_Model/Activities.md` Section 1.
4. Dedicated Company/Person/Deal workspace views replacing the current shared drawer — see
   `docs/02_UX/Workspace_Azienda.md`, `Workspace_Persona.md`, `Workspace_Trattativa.md`.
5. Notifications (activity due-dates, ownership changes) — see
   `docs/04_Business_Rules/Notifications.md`.
6. AI Assistant (timeline summarization, next-best-action) — see `docs/05_AI/AI_Assistant.md`.
7. Sponsor Research assistance — see `docs/05_AI/Sponsor_Research.md`.

## 4. Speculative

Longer-horizon, less-defined ideas (Proposal Builder, Business Community, Hospitality/Event
management, sponsor asset inventory) are tracked separately in
`docs/06_Roadmap/Future_Ideas.md` and in `docs/06_Roadmap/Backlog.md`, to keep this roadmap focused
on concretely sequenceable work.

## Writing Guidelines

- Move an item from Section 3 to Section 2 only when it has an actual owner and start date; do not
  let "planned" and "in progress" blur together.
- Every item must link to the `docs/` file that specifies it in detail — this document is an index,
  not a specification.

## Notes for Future Contributors

- Update this document at the end of every sprint/release: move the completed item from Section 2
  to Section 1, and re-derive what's newly unblocked in Section 2 from Section 3.
- If pre-0.3 releases (the original v1 build, Sprint 1, Release 0.2, Release 0.2.1, Sprint 2) do not
  yet have entries under `docs/07_Releases/`, backfilling them is a good first documentation task —
  the completion reports produced at the time contain everything needed.
