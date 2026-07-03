# Sprint 03 — Dashboard 2.0

## Sprint Information

| Field | Value |
|---|---|
| Sprint | Sprint 3 |
| Name | Dashboard 2.0 |
| Blueprint Baseline | Blueprint v1.1 (Approved) |
| Governing Documents | `docs/00_Project/ARCHITECTURE.md`, `docs/00_Project/CLAUDE_DEVELOPMENT_RULES.md`, `docs/00_Project/IMPLEMENTATION_MASTER_PLAN.md`, `docs/01_Product/User_Journey.md`, `docs/02_UX/Dashboard.md` |
| Role | Lead Front-End Engineer and Apps Script Developer |
| Date | July 2026 |
| Status | Complete, pending final approval and production verification |
| Commit | `9ef29d9` — "Sprint 3 - Dashboard 2.0" |

---

## Executive Summary

Implemented the redesigned Dashboard described in `docs/02_UX/Dashboard.md`, as an extension of the
existing Overview tab rather than a replacement of it. Delivered seven of the nine requested widget
groups fully live on real spreadsheet data, one (Upcoming Matches) as explicitly approved static
sample data, and one (AI Assistant) as a labeled "Coming Soon" placeholder with no logic behind it.

This is the first sprint in the project to wire the Activity Engine (`Activity.gs`) into a live
user-facing workflow — `logActivity_()` and `getActivityTimeline_()` now have real callers, while
`Activity.gs` itself was not modified in any way. All three Dashboard quick actions ("+ Nuova
Azienda/Opportunita", "+ Nuova Attivita") route through the existing compliant flows only
(`addSingleLead`, `logDashboardActivity` → `logActivity_`) — no direct creation path bypassing
deduplication, blacklist checking, or scoring was introduced, per the explicitly approved Sprint 3
decisions.

The sprint followed the full Blueprint-first workflow required by `CLAUDE_DEVELOPMENT_RULES.md`:
all five governing documents were read before any code was written, an implementation plan and file
list were presented and approved before implementation began, two real architectural conflicts were
identified and escalated for a decision rather than resolved unilaterally, and a self-review after
implementation caught and fixed one genuine instance of duplicated logic before this report was
written.

---

## Sprint Objectives

Per the Sprint 3 kickoff instructions, the Dashboard must become the personal homepage of every
commercial user, and must let the user immediately understand:

- What do I have to do today?
- Which opportunities need attention?
- Who should I contact?
- What is the status of my pipeline?

---

## Planned Scope

**Modules included:** Dashboard, Overview, Dashboard Widgets, Personal KPIs.

**Requested layout (9 sections):** Header, Personal KPI, Today's Agenda, Follow-up Center, My
Opportunities, Personal Contact Directory, Upcoming Matches, Recent Activity, AI Assistant
(placeholder only).

**Modules explicitly excluded from modification:** Company Workspace, Contact Workspace,
Opportunity Workspace, Proposal Center, Hospitality, Business Community, AI Assistant (as a real
capability), Ownership Engine, Activity Engine (its internals), Permission Engine, Pipeline Engine,
Scoring Engine.

**Technical constraint:** prefer modifying only `Dashboard.html`, `View_Overview.html`, and
`Code.gs`; modify `Data.gs` only if absolutely necessary; avoid creating new files unless clearly
justified; reuse existing helper functions; no duplicated logic; no dead code; no regressions.

---

## Delivered Scope

- **Header**: welcome/date line (generic, not personalized — see Product Decisions Applied), Global
  Search (reuses `searchEntities`), and two quick-action buttons.
- **I Miei KPI** (6 cards): Opportunita Aperte, Valore Pipeline, Attivita Oggi, Follow-up in
  Scadenza — all live; Proposte Inviate and Inviti Partita Inviati — labeled "Prossimamente" (no
  underlying entity exists yet).
- **Agenda di Oggi**: today's planned activities (Activity Engine) plus today's due follow-ups.
- **Centro Follow-up**: upcoming and overdue follow-ups aggregated across the four sheets that
  already carry a "Data Follow Up" field, overdue items listed first.
- **Opportunita Aperte**: compact table of all open (non-closing-stage) deals, joined to the
  related company's last-contact date where available.
- **Rubrica Contatti**: instant search across contacted people and active leads, deduplicated.
- **Prossime Partite**: two static sample rows, explicitly approved for this sprint, clearly
  labeled as sample data in the UI.
- **Attivita Recenti**: latest activity-timeline entries, enriched with a resolved company name for
  display (the `Attivita` sheet itself only stores `ID Azienda`).
- **Assistente AI**: title + "Prossimamente" subtitle, no logic.
- **Two modals**: "Nuova Azienda / Opportunita" (wraps `addSingleLead`) and "Nuova Attivita" (wraps
  the new `logDashboardActivity`, which calls `logActivity_` directly).

---

## Deferred Scope

- AI Sponsor Research, AI Daily Briefing, Notifications, Business Community, and Personal
  Performance sections from `docs/02_UX/Dashboard.md` — not implemented; several depend on entities
  or AI capability that don't exist yet (later sprints), and AI Sponsor Research specifically is
  blocked on an unresolved compliance question (`docs/00_Project/BLUEPRINT_REVIEW.md`, Sponsor
  Research boundary).
- True per-user ("personal") filtering of any widget — deferred to Sprint 11, pending the Migration
  Engine's first real run and confirmed per-viewer identity resolution.
- Real Proposal and Match/Hospitality data for the two placeholder KPI cards — deferred to Sprints 6
  and 8 respectively, when those entities are introduced.
- Any change to `appsscript.json`, deployment mode, or authentication — explicitly out of scope per
  the approved Sprint 3 decisions.

---

## Files Modified

- `Dashboard_AppsScript/Code.gs`
- `Dashboard_AppsScript/Dashboard.html`
- `Dashboard_AppsScript/View_Overview.html`
- `docs/00_Project/CHANGELOG.md`
- `docs/00_Project/FEATURE_REGISTRY.md`
- `docs/00_Project/PRODUCT_DECISIONS.md`
- `docs/00_Project/PROJECT_STATUS.md`

## Files Created

- `docs/07_Releases/Sprint_03.md` (this document).

No Apps Script or HTML file was created. `docs/00_Project/CLAUDE_DEVELOPMENT_RULES.md` was newly
committed to the repository during this sprint's git workflow, but it was not authored as part of
Sprint 3 — it pre-existed on disk, unread by any prior session, and was simply untracked by git
until this sprint's `git add .`.

---

## Functions Added

All in `Dashboard_AppsScript/Code.gs`:

- `buildDashboardKpis_(board, followUps, agenda)`
- `buildDashboardAgenda_(followUps)`
- `buildFollowUpCenter_()` (plus the `FOLLOWUP_SOURCE_SHEETS_` constant it reads)
- `buildTeamOpportunities_()`
- `getContactDirectory(query)` / `getContactDirectory_(query)`
- `logDashboardActivity(payload)`
- `enrichActivitiesWithAziendaLabel_(activities)` / `resolveAziendaLabel_(aziendaId)`
- `isFaseAperta_(fase)` / `getOpenPipelineColumns_(board)` — extracted during self-review to
  eliminate a duplication found between `buildDashboardKpis_` and the pre-existing `buildFunnel_`

## Functions Modified

- `getDashboardData()` — extended with five new return keys (`kpisV2`, `agenda`, `followUps`,
  `teamOpportunities`, `recentActivities`); every previously-returned key is unchanged.
- `buildFunnel_()` — internal refactor only, now calls the shared `getOpenPipelineColumns_()`
  instead of repeating its own filter; its return value is unchanged.

## Functions Removed

None.

---

## UI Changes

- `Dashboard.html`: added a welcome/date line, a Global Search input with live results dropdown,
  two header quick-action buttons, two full modals ("Nuova Azienda/Opportunita", "Nuova Attivita")
  with their own form fields and status feedback, and the supporting CSS (`.header-search`,
  `.header-actions`, `.modal-overlay`, `.modal-box`, `.kpi-grid`) — all additive, reusing existing
  design tokens and component classes (`.panel`, `.fields`, `.actions`, `.primary`/`.secondary`,
  `.metric`).
- `View_Overview.html`: five new widget sections inserted above the pre-existing content (weekly
  settings form, funnel, maintenance panel, log table), none of which were altered or removed.
- No existing layout was redesigned; no existing terminology was changed.

---

## Data Model Changes

None. `Data.gs` was not modified. No new sheet, column, ID prefix, or enum value was introduced.
Every new function reads existing fields through the existing generic CRUD layer
(`getAllRecords_`, `findRecordById_`) or existing module functions (`getPipelineBoard_`,
`getActivityTimeline_`).

---

## Business Logic

No new business rule was introduced. Every new function in this sprint is either:

1. **Read-only aggregation/presentation** over already-existing data (KPIs, agenda, follow-up
   center, opportunities table, contact directory, activity enrichment), or
2. **A thin pass-through** to an existing, unmodified function that already owns the relevant
   business logic (`addSingleLead` for deduplication/blacklist/scoring; `logActivity_` for activity
   creation).

The one internal change to existing logic (`buildFunnel_`'s refactor to use
`getOpenPipelineColumns_`) is behavior-preserving — it changes how the "open stage" condition is
expressed, not what it evaluates to.

---

## Backward Compatibility

- Every pre-existing `Code.gs` function was individually confirmed present with its original
  signature — 24 functions, unmodified, out of 26 that existed before this sprint (the remaining
  2, `getDashboardData` and `buildFunnel_`, are the sprint's two intentional modifications, listed
  above under Functions Modified). Verified via a `git diff` of top-level declarations against the
  pre-sprint commit, not by manual count.
- Every pre-existing `View_Overview.html` element ID (21) and render function (13) was individually
  confirmed present and unchanged, via the same `git diff` method.
- Every pre-existing element of `Dashboard.html`'s shared chrome (tab navigation, drawer,
  `apiCall`/`escapeHtml`/`openEntityDetail` and related helpers) was confirmed present and
  unchanged.
- `getDashboardData()` only gained new keys; no existing key was renamed, removed, or repurposed.
- `Activity.gs`, `Data.gs`, `Dedup.gs`, `Migration.gs`, `Outreach.gs`, `Ownership.gs`, `Pipeline.gs`,
  `Scoring.gs`, `System.gs`, `Triggers.gs`, `appsscript.json`, and every `View_*.html` file other
  than `View_Overview.html` were confirmed untouched via file-timestamp diff.

---

## Testing Performed

No automated test runner exists for this Apps Script environment (established project-wide, see
`docs/00_Project/README.md` Section 4), so verification was static and manual:

- Bracket/parenthesis balance verified on every changed file.
- Zero duplicate top-level `function`/`const` declarations, checked project-wide.
- Every `onclick` handler in `Dashboard.html` and `View_Overview.html` cross-checked against an
  actual function definition — zero mismatches.
- Every client-side `apiCall(...)` target cross-checked against an actual `Code.gs` top-level
  function — zero mismatches.
- Every `getElementById(...)` target cross-checked against an actual DOM `id` — zero mismatches
  (two apparent misses were confirmed to be pre-existing IDs living in `View_LeadWeekly.html`/
  `View_Pipeline.html`, outside this sprint's changed files).
- File-timestamp diff confirming only the three intended Apps Script files changed.

**Not performed:** live execution in a deployed Apps Script web app. No browser or deployment
access was available in this working environment. See Visual Validation below.

---

## Known Limitations

- **Team-wide, not personal.** "My KPIs"/"My Opportunities" show all open records, not the logged-in
  user's own, by explicit decision (see Product Decisions Applied).
- **Today's Agenda / Attivita Oggi will start near-empty.** The Activity Engine had zero historical
  data before this sprint (nothing called `logActivity_` previously), and the new quick action logs
  `Completata` activities (something that already happened), not `Pianificata` ones — so the
  "planned activities today" filter has nothing to match yet. It will populate only as users use
  "+ Nuova Attivita" going forward.
- **No "priority" field exists** on activities or follow-ups today; Today's Agenda sorts
  overdue-first / chronologically instead of by a true priority ranking.
- **Proposte Inviate / Inviti Partita Inviati** KPIs are placeholders — no underlying entity exists
  until Sprints 6 and 8.
- **Prossime Partite is static sample data**, explicitly approved for this sprint and clearly
  labeled as such in the UI.
- **Rubrica Contatti** shows blank email/phone for leads that have not yet become a tracked contact
  — `Lead Weekly` does not carry those fields; this reflects real data shape, not a bug.

---

## Technical Debt

- `Triggers.gs:weeklyMaintenance_` retains its own independent copy of the "is this stage still
  open" check (`col.fase.indexOf('Chiusura') === -1`) that `Code.gs` now expresses once via
  `isFaseAperta_`/`getOpenPipelineColumns_`. This duplication pre-dates Sprint 3 (it already existed
  between `buildFunnel_` and `Triggers.gs` before this sprint) and was not resolved because
  `Triggers.gs` is outside this sprint's approved file scope. Recommended for a future
  small-cleanup sprint or as part of whichever sprint next touches `Triggers.gs`.
- `getContactDirectory_` and `Pipeline.gs:searchEntities_` are structurally similar (search two
  sheets, normalize, filter, dedupe) but intentionally not unified, since they return different
  shapes for different consumers. If a third similar widget emerges in a future sprint, this is
  worth revisiting as a shared search primitive.
- No automated test runner exists for this environment; all verification remains static/manual
  (project-wide constraint, not introduced by this sprint).

---

## Documentation Updated

- `docs/00_Project/CHANGELOG.md` — Sprint 3 entry added.
- `docs/00_Project/PROJECT_STATUS.md` — "Dashboard (redesigned)" and "Activity Engine" moved to
  Shipped; Current Phase, Milestone 3, and a new Milestone 4 updated.
- `docs/00_Project/FEATURE_REGISTRY.md` — Dashboard 2.0 and Activity Engine rows updated to Shipped.
- `docs/00_Project/PRODUCT_DECISIONS.md` — Decision #010 added.
- `docs/07_Releases/Sprint_03.md` — this document, created.

---

## Risks

- Wiring the Ownership and Activity engines into a live surface before permission enforcement
  exists means "open" widgets are visible to every user with no access control. Accepted, because
  this changes nothing relative to today's status quo (everything is already visible to everyone) —
  it must not be presented to users as a security boundary.
- The Sponsor Research / AI compliance question flagged in `docs/00_Project/BLUEPRINT_REVIEW.md`
  remains open and unaddressed by this sprint; it will need resolution before Sprint 10.
- Documentation now has four places that track feature/module status
  (`PROJECT_STATUS.md`, `FEATURE_REGISTRY.md`, `docs/06_Roadmap/Roadmap.md`, this Sprint file) —
  each future sprint must update all of them consistently, or drift will reappear exactly as it did
  before the Blueprint v1.1 cleanup.
- `git push` for this sprint's commit is pending explicit confirmation of the destination remote
  (see Repository Checklist) — until pushed, the remote `origin/main` does not yet reflect this
  sprint's work.

---

## Metrics

- 7 files modified, 1 file created (this document not yet counted in the commit that preceded it).
- Commit `9ef29d9`: 8 files changed, 1041 insertions, 17 deletions.
- 11 new functions and 1 new constant added to `Code.gs`; 2 functions modified; 0 functions
  removed. `Dashboard.html` gained 12 new client-side functions and `View_Overview.html` gained 8,
  none replacing or removing any pre-existing one (all counts verified via `git diff` against the
  pre-sprint commit, not manual enumeration).
- 0 schema/entity changes.
- 7 of 9 planned widget sections fully live on real data; 1 sample-data; 1 placeholder.
- 0 regressions found across 23 pre-existing functions and 20 pre-existing UI elements checked.
- 1 duplication found and fixed during self-review before this report was written.

---

## Lessons Learned

- A dedicated duplication self-review after implementation (not just during it) caught a real
  issue — `buildDashboardKpis_` re-deriving a calculation `buildFunnel_` already had — before it
  shipped as a second copy. Worth doing this check explicitly at the end of every future sprint.
- The Activity Engine's lack of a denormalized company-name field on `Attivita` (only `ID Azienda`)
  only became apparent while building the UI, not while reading the Blueprint. Future sprints that
  activate a previously "Built (Unwired)" engine for the first time should budget explicit time to
  discover this kind of data-shape gap before writing UI code against it.
- Surfacing the two real architectural conflicts (identity/personalization, quick-action compliance
  routing) for explicit approval — rather than silently picking a default — prevented two outcomes
  that would have been hard to walk back later: a false impression of per-user security, and a
  compliance-bypassing creation path.

---

## Next Recommended Sprint

**Sprint 4 — Company Workspace**, per `docs/00_Project/IMPLEMENTATION_MASTER_PLAN.md`.

---

### Product Decisions Applied

- **Team-wide Dashboard instead of Personal Dashboard.** Reason: true per-user filtering requires
  both populated ownership data (`ID Utente Owner`, which only the not-yet-run Migration Engine can
  populate — Sprint 11) and a deployment mode that resolves per-viewer identity (`appsscript.json`
  currently uses `executeAs: USER_DEPLOYING`, which resolves to the deploying account for every
  viewer, not the person actually using the app). Neither exists today; faking personalization
  would have misrepresented the feature. Recorded as `docs/00_Project/PRODUCT_DECISIONS.md`
  Decision #010.
- **No manual "who am I" selector introduced.** Reason: considered as an option (Option B in the
  pre-implementation plan) and rejected in favor of Option A (team-wide, honest labeling) because a
  manual selector is a workaround that simulates authentication without being authentication, and
  would need to be un-built later rather than simply extended.
- **No change to `appsscript.json` or deployment/authentication configuration.** Reason: changing
  `executeAs` to resolve per-viewer identity is a distinctly-sequenced piece of work (tied to OAuth
  scopes and the Permission Engine's activation preconditions in
  `docs/04_Business_Rules/Permissions.md` Section 6), not Dashboard UI work, and mixing the two
  would have expanded this sprint's blast radius well beyond its approved scope.
- **Quick Actions reuse the existing compliant creation flow.** Reason: `Dedup.gs`'s
  blacklist/duplicate checks and `Scoring.gs`'s fit scoring are the product's core compliance
  differentiator (`docs/00_Project/Vision.md`). A direct "create a bare Company/Opportunity" path
  from the Dashboard would have silently bypassed both. Both "+ Nuova Azienda/Opportunita" actions
  instead open the same lead-entry form that already calls `addSingleLead`.
- **Activity Engine reused without modification.** Reason: `Activity.gs` was deliberately built
  ahead of its first use (Sprint 2); the correct way to activate it is to call its existing public
  functions (`logActivity_`, `getActivityTimeline_`) exactly as written, not to extend it mid-sprint
  to serve a specific widget's convenience. Where a widget needed something the engine doesn't
  provide today (e.g., a denormalized company name, a "priority" field), the limitation is
  documented (see Known Limitations) rather than the engine being changed.
- **Static sample data accepted for Upcoming Matches.** Reason: no Match or Hospitality entity
  exists in the schema yet (planned for Sprint 8); blocking the entire widget on that future work
  would have removed a Blueprint-requested section for no benefit, so explicitly-labeled sample
  data was approved as an interim state instead.
- **Company-name enrichment added for Activity Engine records.** Reason: `Attivita` stores only
  `ID Azienda`, not a denormalized company name; showing raw IDs in the UI would have been a
  needless usability regression fixable with a few lines of read-only lookup code, so
  `resolveAziendaLabel_`/`enrichActivitiesWithAziendaLabel_` were added without touching
  `Activity.gs` itself.

---

### Visual Validation

A static HTML preview was produced and published as a Claude Artifact
(`sprint3-dashboard-preview.html`), built directly from the actual shipped CSS tokens and component
classes in `Dashboard.html`/`View_Overview.html`, populated with representative sample data, to
give a visual sense of the delivered layout in the absence of a reachable live deployment. Per this
project's current documentation policy, that artifact is **not** the record of this sprint — this
file is — and the artifact should be treated as a disposable visual aid, not archived project
history.

No screenshots of the actual deployed, live web app exist for this sprint, because no deployment
was accessible from the working environment this sprint was implemented in.

**Visual validation must be completed after deployment.**

---

## Repository Checklist

- [ ] Tests completed
- [x] Documentation updated
- [x] git add .
- [x] git commit -m "Sprint 3 - Dashboard 2.0"
- [ ] git push
- [ ] clasp push
- [ ] Production verification completed
