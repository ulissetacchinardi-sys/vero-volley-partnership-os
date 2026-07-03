# Vero Volley Partnership OS

# Feature Registry

**Version:** 1.1
**Status:** Approved
**Purpose:** Single, authoritative inventory of every feature — shipped, built, in development, or
planned — within the Vero Volley Partnership OS.

---

# Overview

The Feature Registry is the single authoritative inventory of all product capabilities. Every
feature appears exactly once in this document, cited against the exact code or documentation that
proves its status.

**Blueprint v1.1 is approved and frozen as the implementation baseline.** The "Planned" rows in
Sections 7–9 below are now sequenced into concrete sprints in
`docs/00_Project/IMPLEMENTATION_MASTER_PLAN.md` Section 5 (Sprints 3–12) — consult that document
for what order they will be built in and what each sprint explicitly excludes.

**As of Blueprint v1.1, this document merges and supersedes `docs/01_Product/Features.md`.** That
file previously made the same "single authoritative inventory" claim independently, and disagreed
with this one on at least one row (Migration Engine). This merge resolves that conflict — see
`docs/00_Project/CHANGELOG.md` and `docs/00_Project/BLUEPRINT_REVIEW.md` Section 3c for the history.
`docs/01_Product/Features.md` now redirects here; do not add feature rows to that file.

Every feature has a lifecycle:

Planned → In Development → Built (Unwired) → Shipped → (eventually, possibly) Deprecated

A feature that is "Built (Unwired)" is fully implemented and verified correct, but not yet called
by any live workflow — this is a deliberate infrastructure-first pattern used repeatedly in this
project (see `ARCHITECTURE.md` Section 4.6, Progressive Enhancement), not a sign of incomplete work.

---

# Status Legend

| Status | Meaning |
|----------|----------|
| 🟢 Shipped | Implemented and active in the live workflow today. |
| 🟡 Built (Unwired) | Implemented and verified correct, but not yet called by any live workflow. |
| 🔵 In Development | Actively being implemented right now. |
| ⚪ Planned | Described in a blueprint or roadmap document; no implementation exists yet. |
| 🔴 Deprecated | No longer maintained; kept only for historical/migration reference. |

This is the one status vocabulary used across `docs/`. `PROJECT_STATUS.md` uses the same five
labels for consistency — see that document for the project-wide rollup view; this document is the
per-feature detail view.

---

# 1. Prospecting & Data Entry

| Feature | Status | Reference |
|---|---|---|
| Weekly search criteria capture | 🟢 Shipped | `Code.gs:saveWeeklySettings`, `docs/02_UX/Dashboard.md` (current, shipped Overview tab — not the aspirational Dashboard redesign in Section 7) |
| Manual single-lead entry | 🟢 Shipped | `Code.gs:addSingleLead` |
| Batch lead import | 🟢 Shipped | `Code.gs:importLeadBatch` |
| Find-or-create company/person matching | 🟢 Shipped | `Data.gs:findOrCreateAzienda_`/`findOrCreatePersona_` |

# 2. Automation

| Feature | Status | Reference |
|---|---|---|
| Blacklist / sponsor-exclusive checking | 🟢 Shipped | `Dedup.gs:checkBlacklist_`, `docs/04_Business_Rules/Pipeline.md` |
| Duplicate contact detection | 🟢 Shipped | `Dedup.gs:checkDuplicate_` |
| Sponsor Fit Score + Priority calculation | 🟢 Shipped | `Scoring.gs`, `docs/04_Business_Rules/Scoring.md` |
| Bulk score recalculation | 🟢 Shipped | `Code.gs:recalculateScores` |
| Weekly archival + reminder | 🟢 Shipped | `Triggers.gs:weeklyMaintenance_` |
| Manual-edit-to-status sync (`onEdit`) | 🟢 Shipped | `Triggers.gs:onEditInstallable_` |

# 3. Company, Contact & Opportunity Records

The underlying record-level capability (create, read, update, search) for Companies (Azienda),
Contacts (Persona), and Opportunities (Trattativa) is shipped today, through the current pipeline
UI — this is distinct from the redesigned, not-yet-built Workspace UX described in Section 7.

| Feature | Status | Reference |
|---|---|---|
| Company records (Azienda) | 🟢 Shipped | `Data.gs`, `Pipeline.gs` |
| Contact records (Persona) | 🟢 Shipped | `Data.gs`, `Pipeline.gs` |
| Opportunity / Deal records (Trattativa) | 🟢 Shipped | `Data.gs`, `Pipeline.gs` |
| Kanban pipeline board | 🟢 Shipped | `Pipeline.gs:getPipelineBoard_`, `docs/02_UX/Workspace_Trattativa.md` (current, shipped drawer-based UI — see that document's terminology note) |
| Deal stage transition + auto contact-sync on close | 🟢 Shipped | `Pipeline.gs:moveTrattativaToFase_` |
| Deal creation from lead | 🟢 Shipped | `Pipeline.gs:createTrattativaFromLead_` |
| Entity search (company/person) | 🟢 Shipped | `Pipeline.gs:searchEntities_`, `docs/02_UX/Search.md` |
| Entity detail / full history view | 🟢 Shipped | `Pipeline.gs:getEntityDetail_` |

# 4. Outreach

| Feature | Status | Reference |
|---|---|---|
| Templated outreach email via Gmail | 🟢 Shipped | `Outreach.gs:sendOutreachEmail_` |
| Calendar follow-up scheduling | 🟢 Shipped | `Outreach.gs:createFollowUpEvent_` |
| Drive document attachment on company record | 🟢 Shipped | `Outreach.gs:uploadAziendaDocument_` |

# 5. Reporting

| Feature | Status | Reference |
|---|---|---|
| Dashboard metrics (totals, priority/status breakdown, top sectors/regions) | 🟢 Shipped | `Code.gs:buildMetrics_` |
| Conversion funnel | 🟢 Shipped | `Code.gs:buildFunnel_` |
| Team/manager aggregate analytics | ⚪ Planned | `docs/02_UX/Analytics.md`, `docs/06_Roadmap/Roadmap.md` |

# 6. Multi-User Infrastructure

| Feature | Status | Reference |
|---|---|---|
| User registry (`Utenti` sheet) | 🟡 Built (Unwired) | `Data.gs`, Sprint 1 |
| Role model + permission matrix | 🟡 Built (Unwired) | `System.gs`, `docs/04_Business_Rules/Permissions.md` |
| Identity resolution from Workspace session | 🟡 Built (Unwired) | `System.gs:getCurrentUser` |
| Migration helpers (owner-from-text-field bootstrap, owner-ID backfill) | 🟡 Built (Unwired) | `Migration.gs` — manual-only; not yet run against live data |
| Activity / timeline engine | 🟢 Shipped | `Activity.gs` (unmodified), first live callers wired in Sprint 3 (`Code.gs:logDashboardActivity`, `buildDashboardAgenda_`, Recent Activities widget) |
| Ownership + collaboration engine | 🟡 Built (Unwired) | `Ownership.gs`, `docs/03_Data_Model/Ownership.md` |
| Personal / Manager dashboards scoped by ownership | ⚪ Planned | `docs/06_Roadmap/Roadmap.md` |
| Permission enforcement (`SYSTEM_CONFIG.enforcePermissions`) | ⚪ Planned | `docs/04_Business_Rules/Permissions.md` Section 6 |

# 7. Aspirational UX Redesign

These are fully-specified blueprints (`docs/02_UX/`), not implementations. None of the following
change the underlying data or engines described in Sections 3 and 6 — they describe a richer future
front end for the same records.

| Feature | Status | Reference |
|---|---|---|
| Dashboard (redesigned, "Dashboard 2.0") | 🟢 Shipped (Sprint 3) | `docs/02_UX/Dashboard.md`, `Dashboard.html`/`View_Overview.html`. Team-wide scope only — AI Sponsor Research, AI Daily Briefing, Notifications, Business Community, Personal Performance sections deferred, see `docs/00_Project/IMPLEMENTATION_MASTER_PLAN.md` Sprint 3 |
| Company Workspace | ⚪ Planned | `docs/02_UX/Workspace_Azienda.md` — blueprint complete |
| Opportunity Workspace | ⚪ Planned | `docs/02_UX/Workspace_Trattativa.md` — blueprint complete |
| Contact Workspace | ⚪ Planned | Not yet designed — no `docs/02_UX/` file exists for this yet |
| Global Search (redesigned) | ⚪ Planned | No dedicated blueprint exists yet beyond the current `docs/02_UX/Search.md` |

# 8. AI

| Feature | Status | Reference |
|---|---|---|
| AI Assistant (summarization, next-best-action) | ⚪ Planned | `docs/05_AI/AI_Assistant.md` |
| Sponsor Research assistant | ⚪ Planned | `docs/05_AI/Sponsor_Research.md` — see that document's Section 3 hard boundary before scoping |
| AI Daily Briefing | ⚪ Planned | `docs/02_UX/Dashboard.md` Section 15 — no business-rules document exists yet |
| Opportunity / Company AI Insights | ⚪ Planned | `docs/02_UX/Workspace_Azienda.md` Section 15, `docs/02_UX/Workspace_Trattativa.md` Section 14 — no business-rules document exists yet |

# 9. Commercial Expansion Modules

Entirely aspirational — no schema, business rules, or implementation exists for any row in this
section. Included here because they were already named in this registry prior to Blueprint v1.1;
this merge does not add any new module beyond what previously existed in this document or in
`docs/06_Roadmap/Future_Ideas.md`.

| Feature | Status | Reference |
|---|---|---|
| Proposal Management | ⚪ Planned | `docs/06_Roadmap/Future_Ideas.md` Section 2 |
| Proposal Builder | ⚪ Planned | `docs/06_Roadmap/Future_Ideas.md` Section 2 |
| Contract Management | ⚪ Planned | No document yet |
| Renewal Management | ⚪ Planned | No document yet |
| Match Invitations | ⚪ Planned | `docs/06_Roadmap/Future_Ideas.md` Section 4 |
| Hospitality | ⚪ Planned | `docs/06_Roadmap/Future_Ideas.md` Section 4 |
| Guest Management | ⚪ Planned | No document yet |
| Business Community | ⚪ Planned | `docs/06_Roadmap/Future_Ideas.md` Section 3 |
| Networking Events | ⚪ Planned | `docs/06_Roadmap/Future_Ideas.md` Section 3 |
| Business Lunches | ⚪ Planned | `docs/06_Roadmap/Future_Ideas.md` Section 3 |

---

# Rules

- Every feature must appear exactly once, in exactly one section, in this document.
- Every row must cite a code reference (for Shipped/Built-Unwired) or a docs reference (for
  Planned/In Development) — a row with neither is not verifiable and should be flagged, not added.
- Update a feature's status here in the same change that changes its actual status. This is the
  fastest way to answer "is X built" for the whole project — staleness here is costly.
- Every new feature must be added here before implementation begins.
- Do not create a second "authoritative" feature list anywhere else in `docs/`. If a more detailed
  per-feature writeup is needed, it belongs in `01_Product/`, `03_Data_Model/`, or
  `04_Business_Rules/`, linked from this table — not duplicated as another registry.

---

# Notes for Future Contributors

- When a "Built (Unwired)" feature is wired into a live workflow, move it to a "Shipped" row in the
  same change, and update `docs/06_Roadmap/Roadmap.md` and the relevant `docs/07_Releases/` entry.
- When correcting a status here, cross-check `docs/00_Project/PROJECT_STATUS.md`'s rollup tables at
  the same time — the two are meant to always agree, and disagreement between them was one of the
  defects this v1.1 merge fixed.
- If this table grows large enough to be unwieldy, split it further by module rather than by
  abandoning the single-inventory principle.
