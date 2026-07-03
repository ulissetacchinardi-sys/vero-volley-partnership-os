# Vero Volley Partnership OS

# Implementation Master Plan

**Version:** 1.0
**Status:** Approved
**Document Owner:** Product Team
**Last Updated:** July 2026
**Baseline:** Blueprint v1.1 (Approved)

---

# 1. Purpose

The Blueprint has been completed. Blueprint v1.1 was reviewed (`docs/00_Project/BLUEPRINT_REVIEW.md`),
cleaned up (`docs/00_Project/CHANGELOG.md`, "Blueprint v1.1" entry), and formally approved
(`docs/00_Project/CHANGELOG.md`, "Blueprint v1.1 Approved" entry). The objective of the project now
shifts from documentation to implementation.

**Architecture is frozen.** `docs/00_Project/ARCHITECTURE.md` is not open for redesign as part of
implementation work. Any architectural question that arises during a sprint is a signal to stop and
raise it as a decision (`docs/00_Project/PRODUCT_DECISIONS.md`), not to resolve it by quietly
changing the architecture inside a feature sprint.

**Future work must follow the Blueprint.** No sprint below implements anything that is not already
specified in a `docs/` file. Where the Blueprint is silent or incomplete for a given sprint, that
gap is the deliverable of a documentation step within the sprint, not an invitation to improvise.

This document is the operational bridge between the Blueprint and the codebase. It does not
introduce new product decisions, new entities, or new architecture — it sequences the
already-approved Blueprint into sprints and defines how each sprint is run, verified, and closed.

## When to Use It

- Before starting any implementation sprint, to confirm scope, required reading, and Definition of
  Done.
- When scoping a new sprint's Claude Code (or human) implementation prompt.
- When reviewing whether a completed sprint actually met its stated deliverables.

---

# 2. Project Philosophy

The same discipline that produced a reconcilable Blueprint (rather than an unreviewable pile of
aspiration) now governs implementation:

- **Documentation First.** A capability is specified in `docs/` before it is built. If a sprint
  discovers the Blueprint doesn't cover something it needs, the sprint's first deliverable is the
  missing `docs/` content, produced before code is written against it.
- **Blueprint Driven Development.** Every implementation decision traces back to a specific
  `docs/` file and section. "Because the Blueprint says so" is a valid, expected justification in
  code review; "because it seemed better" is not, during implementation — that kind of judgment
  belongs in the Blueprint stage, which is now closed for the features in scope.
- **Incremental Delivery.** Each sprint delivers one coherent, demonstrable piece of the product —
  not a partial slice of several.
- **Small, Safe Releases.** Every sprint preserves backward compatibility with everything shipped
  before it, per `ARCHITECTURE.md` Section 4.4. A sprint that would break existing functionality is
  scoped smaller until it doesn't.
- **No Feature Without Specification.** If a UI element, AI capability, or business rule appears in
  a `docs/02_UX/` blueprint but has no corresponding entity, business rule, or AI scope document,
  it is not implemented until that specification exists. Several such gaps are already known and
  are called out explicitly in Section 5 below (e.g., Sponsor Score, AI Daily Briefing, Closing
  Checklist enforcement) — they are not silently skipped, they are explicitly deferred with a
  named reason.
- **One Sprint = One Deliverable.** Each sprint below has exactly one primary deliverable. Secondary
  documentation deliverables (e.g., writing a missing business-rules document) are listed
  explicitly where a sprint requires one, not left implicit.

---

# 3. Current Project State

**Architecture:** Single Google Sheet datastore, single Apps Script backend project, `Data.gs` as
schema/CRUD single source of truth, `Code.gs` as the sole controller layer the frontend calls into.
Frozen as of Blueprint v1.1 — see `docs/00_Project/ARCHITECTURE.md`.

**Blueprint:** Complete and approved. 40 documents across 8 folders (`docs/00_Project` through
`docs/07_Releases`), reviewed for consistency (`BLUEPRINT_REVIEW.md`), with known open items (P1–P2
in that review) tracked but not blocking implementation start, except where a specific sprint below
depends on one.

**Documentation:** Governed by `docs/00_Project/{PROJECT_STATUS,CHANGELOG,FEATURE_REGISTRY,
PRODUCT_DECISIONS}.md`, kept in alignment as of this document (see Section 6, Implementation Rules,
for the ongoing obligation).

**Apps Script (current, shipped):** `Data.gs`, `Dedup.gs`, `Scoring.gs`, `Pipeline.gs`,
`Outreach.gs`, `Triggers.gs`, `Code.gs`, `Dashboard.html`, four `View_*.html` partials — all live
and unchanged by this plan or its preparation.

**Apps Script (built, unwired):** `System.gs` (roles/permissions, disabled), `Migration.gs`
(manual-only, never run against live data), `Activity.gs` (timeline engine, no live caller),
`Ownership.gs` (ownership/collaboration engine, no live caller). These four modules are the primary
raw material several sprints below wire into live workflows for the first time.

**CRM Existing Features:** Lead prospecting, deduplication/blacklist protection, rules-based
scoring, Kanban pipeline, Gmail/Calendar/Drive outreach, scheduled maintenance — see
`docs/00_Project/FEATURE_REGISTRY.md` Sections 1–5 for the complete, current, shipped inventory.

**Future Partnership OS:** The aspirational vision in `docs/02_UX/{Dashboard,Workspace_Azienda,
Workspace_Trattativa}.md`, `docs/03_Data_Model/Entities.md`, and `docs/00_Project/ARCHITECTURE.md`
Section 15 (Long-Term Vision) — Company/Opportunity/Contact Workspaces, Proposal Center,
Hospitality, Business Community, AI Assistant. This is what Sprints 3–12 below build, in dependency
order.

---

# 4. Implementation Strategy

Every sprint follows the same fixed sequence. No sprint skips a step.

```
Read Blueprint
   ↓
Implement
   ↓
Review
   ↓
Test
   ↓
Deploy
   ↓
Update Documentation
```

- **Read Blueprint** — read every document listed in that sprint's "Blueprint Documents to Read"
  (Section 5) in full before writing any code, per the established, effective pattern documented in
  `docs/05_AI/Prompting.md`.
- **Implement** — strictly within that sprint's stated scope and file list. Anything discovered
  along the way that's out of scope is recorded (`docs/06_Roadmap/Backlog.md`), not implemented.
- **Review** — against `docs/00_Project/ARCHITECTURE.md`'s Code Review Checklist expectations
  (additive schema, backward compatibility, naming conventions) and this document's Definition of
  Done (Section 7).
- **Test** — per Section 8 (Testing Strategy); every sprint ends with a testing pass before being
  considered closed, not after documentation is updated.
- **Deploy** — manual deployment via the Apps Script editor, per
  `Dashboard_AppsScript/README_Dashboard_AppsScript.txt`'s established procedure. No sprint assumes
  automated deployment exists.
- **Update Documentation** — `docs/00_Project/{CHANGELOG,PROJECT_STATUS,FEATURE_REGISTRY}.md` at
  minimum, plus `PRODUCT_DECISIONS.md` if the sprint made a product decision, plus the relevant
  `docs/03_Data_Model/` or `docs/04_Business_Rules/` file for any schema or rule the sprint
  introduced. See Section 6.

---

# 5. Sprint Roadmap

A note on numbering: this plan continues the sprint numbering already established in
`docs/00_Project/CHANGELOG.md` and `docs/00_Project/FEATURE_REGISTRY.md` (Sprint 1 — Infrastructure
Foundation, Sprint 2 — Ownership Engine, both already shipped). It is independent of the
`docs/07_Releases/Release_0.3.md`–`Release_1.0.md` numbering, which predates this plan, was never
scoped beyond a template, and covered a narrower candidate scope (migration execution, a read-only
personal workspace). Reconciling the two numbering schemes is not done in this pass — those four
files are outside the scope of this document — but is flagged here so the two are not confused with
each other going forward.

Every sprint's Definition of Done is the General Definition of Done (Section 7) plus the
sprint-specific criteria listed under that sprint.

## Sprint 3 — Dashboard 2.0

**Objective:** Implement the redesigned Dashboard (`docs/02_UX/Dashboard.md`) as an evolution of
the current shipped Overview tab, wiring the Ownership and Activity engines into a live UI surface
for the first time.

**Blueprint documents to read:** `docs/02_UX/Dashboard.md`, `docs/01_Product/User_Journey.md`,
`docs/03_Data_Model/{Ownership,Activities,Timeline}.md`, `docs/04_Business_Rules/Permissions.md`
(Section 6, so ownership-scoped widgets are not confused with permission enforcement),
`docs/00_Project/Glossary.md` Section 6.

**Apps Script files likely involved:** `Code.gs` (new controller functions), `Dashboard.html` /
`View_Overview.html` (extend, do not discard existing shipped metrics), `Ownership.gs` (first live
caller of `getOwnedRecords_`), `Activity.gs` (first live caller of `getActivityTimeline_`, and
first live caller of `logActivity_` if any widget writes an activity).

**Expected Deliverables:** "My KPIs," "Today's Agenda," "My Opportunities," "Upcoming Follow-ups,"
"Contact Directory," and "Recent Activities" widgets, built on real data. "AI Sponsor Research,"
"AI Daily Briefing," "Upcoming Matches," and "Business Community" widgets are explicitly **out of
scope** for this sprint — they depend on entities/AI capability that don't exist yet (Sprints 8–10)
and must appear, if at all, as a visibly-labeled "Coming Soon" placeholder, never as fake data.

**Definition of Done:** General DoD (Section 7), plus: existing Overview-tab metrics
(`buildMetrics_`, `buildFunnel_`) remain unchanged and regression-tested; this is the first sprint
to move `Ownership.gs`/`Activity.gs` from "Built (Unwired)" to "Shipped" in
`docs/00_Project/FEATURE_REGISTRY.md` — that update is part of Done, not a follow-up.

**Risks:** Wiring Ownership/Activity engines before permission enforcement exists means "My
Opportunities" will show owned records without access control — acceptable only because nothing is
being restricted from anyone today; must not be framed to users as a security boundary.

**Dependencies:** None blocking. Reuses only already-Built-Unwired engines.

**Testing:** Manual walkthrough of every widget against seeded data; full regression pass on the
existing Overview tab's metrics and funnel; static verification (bracket balance, duplicate
declarations, timestamp diff against untouched files) per `docs/00_Project/README.md` Section 4.

---

## Sprint 4 — Company Workspace

**Objective:** Implement `docs/02_UX/Workspace_Azienda.md`'s full-page Company Workspace, replacing
the current shared detail drawer for Azienda records.

**Blueprint documents to read:** `docs/02_UX/Workspace_Azienda.md` (including its Blueprint v1.1
terminology note), `docs/03_Data_Model/{Entities,Relationships,Ownership,Activities,Timeline}.md`,
`docs/04_Business_Rules/Automation.md` (Section 6, Document Upload).

**Apps Script files likely involved:** `Pipeline.gs:getEntityDetail_` (extend), `Code.gs`, a new
`View_CompanyWorkspace.html` (the current shared drawer in `Dashboard.html` remains for other
entity types until Sprint 5/7 replace them too).

**Expected Deliverables:** Header, Overview, Contacts, Opportunities, Activities, Timeline,
Documents sections per the blueprint, built on real data. Proposals, Match Invitations, Hospitality,
Business Community, and AI Insights sections ship as labeled placeholders — their real
implementations are Sprints 6, 8, 9, and 10 respectively.

**Definition of Done:** General DoD, plus: the current shared drawer's data (Section 2 of
`docs/02_UX/Workspace_Azienda.md`'s Layer A predecessor content) is fully covered by the new
workspace — nothing a user could see before is now missing.

**Risks:** Placeholder sections for not-yet-built modules must be clearly labeled as such, not left
ambiguous — this is exactly the "status discipline" failure `BLUEPRINT_REVIEW.md` flagged in the
Blueprint stage; it must not recur in the implementation.

**Dependencies:** Sprint 3 (Ownership/Activity wiring pattern reused here).

**Testing:** Manual walkthrough per company record with and without existing pipeline/contact
history; regression test that entity search and follow-up scheduling (`docs/02_UX/Search.md`) still
open the correct record.

---

## Sprint 5 — Opportunity Workspace

**Objective:** Implement `docs/02_UX/Workspace_Trattativa.md`'s full-page Opportunity Workspace,
closing the "no dedicated deal detail view" gap identified in `docs/00_Project/BLUEPRINT_REVIEW.md`
(Missing UX Flows) and in the pre-v1.1 `docs/02_UX/Workspace_Trattativa.md` predecessor content.

**Blueprint documents to read:** `docs/02_UX/Workspace_Trattativa.md`, `docs/04_Business_Rules/
Pipeline.md` (deal stage transition rules — must not change), `docs/03_Data_Model/{Ownership,
Activities}.md`.

**Apps Script files likely involved:** `Pipeline.gs` (new `getTrattativaDetail_`-style function;
`moveTrattativaToFase_` unchanged), `Code.gs`, a new `View_OpportunityWorkspace.html`.

**Expected Deliverables:** Header, Company Summary, Stakeholders, Opportunity Details, Pipeline
Stage, Activities, Timeline sections, on real data. Proposal Center, Hospitality, AI Assistant,
Closing Checklist, and Commercial Intelligence sections ship as labeled placeholders (Sprints 6, 8,
10; Closing Checklist and Commercial Intelligence have no business-rules specification yet at all —
see Section 6's "No Feature Without Specification" rule, and do not implement any enforcement logic
for either until that specification exists).

**Definition of Done:** General DoD, plus: clicking a Kanban card now opens this workspace instead
of the company drawer — `docs/02_UX/Workspace_Trattativa.md`'s "Known Limitation" note (in its
Layer A predecessor content) is resolved and should be marked as such in that document's next
revision.

**Risks:** The "Stakeholders" section's fields (Decision Power, Influence Level, Relationship
Strength) have no business rule for who sets them — implement as plain manual-entry fields only;
do not infer or default them, since no specification exists for how they should be computed.

**Dependencies:** Sprint 4 (workspace pattern), Sprint 3 (engine wiring).

**Testing:** Manual walkthrough per deal at every pipeline stage; regression test on drag-and-drop
stage transitions and the existing closing-stage contact-sync behavior (`syncAziendaEsitoChiusura_`).

---

## Sprint 6 — Proposal Center

**Objective:** Introduce the Proposal entity and its lifecycle — the first genuinely new schema
entity of the implementation phase.

**Blueprint documents to read:** `docs/00_Project/FEATURE_REGISTRY.md` Section 9,
`docs/06_Roadmap/Future_Ideas.md` Section 2, `docs/02_UX/Workspace_Trattativa.md` Section 11,
`docs/00_Project/PRODUCT_DECISIONS.md` Decision #005, `docs/00_Project/ARCHITECTURE.md` Section 4.4
(Backward Compatibility — additive schema rules), `docs/03_Data_Model/Activities.md` Section 5
(`Relazioni` generic linking — use this mechanism to link Proposals to Opportunities, do not invent
a parallel FK scheme).

**This sprint's first deliverable is documentation, not code:** a new
`docs/04_Business_Rules/Proposals.md` specifying status transitions and versioning rules, and a new
Proposal entity section in `docs/03_Data_Model/Entities.md` — both currently missing per
`docs/00_Project/BLUEPRINT_REVIEW.md` Missing Business Rules / Missing Entities. Do not write
`Proposals.gs` before these exist.

**Apps Script files likely involved:** `Data.gs` (new sheet, `HEADERS`/`ID_PREFIXES`/
`LISTE_VALUES`/`SHEET_ROW_CAPACITY`/`VALIDATION_MAP` entries, additive only), a new `Proposals.gs`
module, `Code.gs`, `Outreach.gs` (reuse the existing Drive-attachment pattern for proposal
documents, do not duplicate it).

**Expected Deliverables:** Proposal records linked to Opportunities via `Relazioni`; Proposal
Center section of the Opportunity Workspace (Sprint 5) becomes live instead of a placeholder;
Draft → Sent → Viewed → Under Discussion → Revision Requested → Accepted/Rejected status flow.

**Definition of Done:** General DoD, plus: the new `docs/04_Business_Rules/Proposals.md` exists and
is followed exactly by the implementation; `docs/03_Data_Model/Entities.md` and `Relationships.md`
both updated in the same change, per `ARCHITECTURE.md` Section 12 (How New Modules Must Be Added).

**Risks:** Scope creep into automated proposal document *generation* (the aspirational "Proposal
Builder" feature) — out of scope; this sprint manages proposal records and status, it does not
generate documents.

**Dependencies:** Sprint 5 (Proposal Center placeholder exists to fill in).

**Testing:** Manual creation/status-transition walkthrough; verify `ensureSheet_`/
`ensureListeSheet_` per-cell idempotency on the new sheet by re-running `setupCrm()` against a
populated test spreadsheet.

---

## Sprint 7 — Contact Workspace

**Objective:** Design and implement the Contact Workspace — currently absent from `docs/02_UX/`
entirely (`docs/00_Project/FEATURE_REGISTRY.md` Section 7 lists it as "not yet designed").

**Blueprint documents to read:** `docs/02_UX/Workspace_Persona.md` (current, shipped drawer
behavior), `docs/02_UX/Workspace_Azienda.md` (structural template to follow for consistency).

**This sprint's first deliverable is documentation:** a new `docs/02_UX/Workspace_Contatto.md` (or
equivalently-named) blueprint, written before implementation, following the same section structure
as `Workspace_Azienda.md` and including the same kind of Blueprint v1.1 terminology note.

**Apps Script files likely involved:** `Pipeline.gs:getEntityDetail_` (extend for `'persona'`),
`Code.gs`, a new `View_ContactWorkspace.html`.

**Expected Deliverables:** Full-page Contact Workspace per the newly-written blueprint; resolves
`docs/02_UX/Workspace_Persona.md`'s "no cross-link to the person's company" gap.

**Definition of Done:** General DoD, plus: the new UX blueprint document exists, follows the
established template, and is what was actually implemented — not retrofitted after the fact.

**Risks:** Designing and implementing in the same sprint risks skipping genuine review of the new
blueprint before code is written against it — treat the "Read Blueprint" step (Section 4) as
applying to this sprint's own newly-written document, with an explicit pause for review between
writing it and implementing it.

**Dependencies:** Sprint 4 (workspace pattern).

**Testing:** Manual walkthrough; regression test that company ↔ contact cross-navigation works in
both directions.

---

## Sprint 8 — Hospitality

**Objective:** Introduce Match, Invitation, and Hospitality entities and their workflow.

**Blueprint documents to read:** `docs/02_UX/Dashboard.md` Section 8, `docs/02_UX/Workspace_Azienda.md`
Sections 12–13, `docs/02_UX/Workspace_Trattativa.md` Section 13, `docs/06_Roadmap/Future_Ideas.md`
Section 4, `docs/03_Data_Model/Activities.md` (note `ACTIVITY_TYPES.HOSPITALITY_INVITATION` and
`BUSINESS_LUNCH` already exist — reuse them, do not invent new activity type constants for the same
concepts).

**This sprint's first deliverable is documentation:** new `docs/03_Data_Model/` entity definitions
for Match/Invitation/Hospitality, and a new `docs/04_Business_Rules/Hospitality.md` covering guest/
seat capacity and allocation rules — both currently missing per `BLUEPRINT_REVIEW.md`.

**Apps Script files likely involved:** `Data.gs` (new sheets, additive), a new `Hospitality.gs`
module, `Outreach.gs` (reuse existing `CalendarApp` integration pattern for match-day scheduling).

**Expected Deliverables:** Match/Invitation/Hospitality records; Hospitality sections of the
Company and Opportunity Workspaces (Sprints 4–5) become live; Dashboard's "Upcoming Matches" widget
(deferred in Sprint 3) becomes live.

**Definition of Done:** General DoD, plus the new business-rules document exists and is followed.

**Risks:** This is the first sprint to model a real-world scheduled event (a match) rather than a
CRM record — resist the temptation to also build ticketing/attendance features beyond hospitality
guest management, which is explicitly out of the product's scope (`docs/00_Project/Vision.md`
Section 4).

**Dependencies:** Sprints 4–5 (placeholder sections to fill in).

**Testing:** Manual walkthrough of invitation → confirmation → attendance → feedback flow.

---

## Sprint 9 — Business Community

**Objective:** Introduce the Business Community / Partner entity and membership model.

**Blueprint documents to read:** `docs/02_UX/Workspace_Azienda.md` Section 14, `docs/02_UX/
Dashboard.md` Section 13, `docs/06_Roadmap/Future_Ideas.md` Section 3, `docs/00_Project/Glossary.md`
Section 6 (Partner definition).

**This sprint's first deliverable is documentation:** a new `docs/03_Data_Model/` entity definition
for Business Community/Partner and a new `docs/04_Business_Rules/Business_Community.md` covering
membership rules — both currently missing.

**Apps Script files likely involved:** `Data.gs` (new sheet, additive), a new
`BusinessCommunity.gs` module, `Code.gs`.

**Expected Deliverables:** Business Community membership records; Business Community sections of
the Company Workspace and Dashboard (deferred in Sprints 3–4) become live.

**Definition of Done:** General DoD, plus the new business-rules document exists and is followed.

**Risks:** Membership criteria ("who qualifies as a Partner vs. a Prospect") were never formally
decided at the Blueprint stage — this sprint's documentation step must make that decision explicit
in `docs/00_Project/PRODUCT_DECISIONS.md`, not leave it implicit in code.

**Dependencies:** Sprint 4 (placeholder section to fill in).

**Testing:** Manual walkthrough of membership assignment and the Company Workspace's Business
Community section.

---

## Sprint 10 — AI Assistant

**Objective:** Implement the first real AI capability, strictly scoped to what
`docs/05_AI/AI_Assistant.md` actually specifies — timeline summarization and next-best-action
suggestion — not the broader aspirational AI surface (Sponsor Score, AI Success Prediction, Risk
Analysis, Daily Briefing, Meeting Preparation) described informally elsewhere in the Blueprint.

**Blueprint documents to read:** `docs/05_AI/{AI_Assistant,Prompting}.md` in full,
`docs/03_Data_Model/{Activities,Timeline}.md` (the AI Assistant reads `getActivityTimeline_`, it
does not get its own data access layer).

**Hard gate — read before starting:** `docs/05_AI/Sponsor_Research.md` Section 3 draws a hard
boundary against automated company discovery, and `docs/00_Project/BLUEPRINT_REVIEW.md` Weakness #9
/ Section 12 flags that `docs/02_UX/Dashboard.md` Section 11's "AI Sponsor Research" widget may
conflict with that boundary. **This sprint does not implement the Dashboard's "AI Sponsor Research"
widget, "AI Daily Briefing," "Sponsor Score," "AI Success Prediction," or "Risk Analysis"** — none
of these have a reconciled specification. Implementing any of them requires the P1 decision in
`BLUEPRINT_REVIEW.md` to be resolved first, which is outside this sprint's authority.

**Apps Script files likely involved:** A new `AiAssistant.gs` module, `Code.gs`,
`Activity.gs` (first live caller of `logActivity_` with `Origine: AI`, per `ACTIVITY_SOURCES.AI`).

**Expected Deliverables:** Timeline summarization and next-best-action suggestion, surfaced in the
Company and Opportunity Workspaces' "AI Insights"/"AI Assistant" sections (placeholders since
Sprints 4–5), tagged `Origine: AI` and `metadata.aiGenerated: true` per
`docs/05_AI/AI_Assistant.md` Section 5.

**Definition of Done:** General DoD, plus: no AI output writes directly to `Sponsor Fit Score`,
`Priorita`, or `Fase` (per `AI_Assistant.md` Section 5); every AI-generated activity is correctly
tagged and distinguishable from human-entered data in the UI.

**Risks:** The single highest risk in the entire roadmap — implementing the wrong AI capability
(anything touching sponsor discovery) without the P1 compliance decision would be a compliance
exposure, not just a scope error. If in doubt, do not implement; escalate.

**Dependencies:** Sprints 4–5 (placeholder sections); the P1 Sponsor Research decision (external to
this plan) blocks only the sponsor-discovery-adjacent features explicitly excluded above — it does
not block timeline summarization or next-best-action.

**Testing:** Manual review of AI output against known timelines for accuracy and appropriate
tagging; explicit test that no AI action modifies a business-logic field.

---

## Sprint 11 — Analytics

**Objective:** Implement the dedicated Analytics view (`docs/02_UX/Analytics.md`), including
owner/team-scoped reporting.

**Blueprint documents to read:** `docs/02_UX/Analytics.md` in full (its own "Data Availability for
Planned Metrics" table is this sprint's scope checklist), `docs/03_Data_Model/Ownership.md`,
`docs/04_Business_Rules/Permissions.md` Section 6.

**Hard dependency check:** Owner-scoped analytics require real ownership data. Per
`docs/02_UX/Analytics.md` Section 4, "Performance by owner" is only "Partially" available today
because `ID Utente Owner` is unpopulated. Before this sprint can deliver owner-scoped analytics, the
Migration Engine (`Migration.gs:backfillOwnerIdOnSheet_`) must actually be run against the live
spreadsheet — this has never happened. Running it is a deliberate, separate action (see
`docs/04_Business_Rules/Permissions.md` Section 6) that must be explicitly approved before this
sprint begins its owner-scoped-analytics deliverables; the sector/stage/pipeline-value analytics do
not have this dependency and can proceed independently.

**Apps Script files likely involved:** `Code.gs` (new aggregate-query controller functions,
building on `Pipeline.gs:getPipelineBoard_`'s existing per-stage value calculation), a new
`View_Analytics.html`.

**Expected Deliverables:** Pipeline value trends, win/loss rate by sector/territory (no
dependency); performance by owner/team (dependent on the migration step above being run).

**Definition of Done:** General DoD, plus `docs/02_UX/Analytics.md` Section 4's table updated to
reflect the new real availability of each metric.

**Risks:** Running the owner-ID backfill migration for the first time against live production data
is the highest-risk single action in this entire roadmap from a data-integrity standpoint — it must
be treated as its own reviewed, approved action, not a routine step inside this sprint.

**Dependencies:** Sprint 3 (ownership wiring pattern); the Migration Engine execution decision
above.

**Testing:** Verify aggregate figures against manual spreadsheet totals for a sample period before
trusting the dashboard; regression test that the migration step did not alter any existing record's
visible fields other than `ID Utente Owner` and `Data Assegnazione`.

---

## Sprint 12 — Production Release

**Objective:** Harden, regression-test, and formally release the assembled Partnership OS,
retiring remaining "Planned"/"Built (Unwired)" statuses for everything implemented in Sprints 3–11.

**Blueprint documents to read:** `docs/07_Releases/Release_1.0.md` in full — its Section 3 (Exit
Criteria) is this sprint's Definition of Done for the multi-user activation portion of the release;
`docs/00_Project/FEATURE_REGISTRY.md` in full, as the checklist of what must now read "Shipped."

**Apps Script files likely involved:** Potentially all of them, in the sense that this sprint is a
hardening/regression pass, not new feature work — no new module is expected to be introduced here.

**Expected Deliverables:** `SYSTEM_CONFIG.enforcePermissions = true` (only if
`docs/04_Business_Rules/Permissions.md` Section 6's preconditions are all independently verified
met — this is itself the P1 governance decision, not a default outcome of reaching Sprint 12);
full regression suite passed; production web app deployment published;
`docs/07_Releases/Release_1.0.md` filled in with the real completion report in the same format
established by Sprint 1/Release 0.2/0.2.1/Sprint 2.

**Definition of Done:** `docs/07_Releases/Release_1.0.md` Section 3's exit criteria, in full, plus
the General DoD (Section 7).

**Risks:** The temptation to treat "Sprint 12" as a deadline that forces enabling permission
enforcement regardless of readiness — do not. If the preconditions aren't met, this sprint's correct
outcome is "not yet," documented as such, not a forced flip of the flag.

**Dependencies:** Every prior sprint.

**Testing:** Full User Acceptance Testing per Section 8; production deployment verification per
`Dashboard_AppsScript/README_Dashboard_AppsScript.txt`'s installation procedure, run end-to-end
against a clean copy of the spreadsheet.

---

# 6. Implementation Rules

- Never implement a capability that is not specified in `docs/`. If it's not written down, it's not
  in scope yet — write it down first (see "No Feature Without Specification," Section 2).
- Never redesign `docs/00_Project/ARCHITECTURE.md` during a sprint. A discovered architectural gap
  is escalated as a decision (`PRODUCT_DECISIONS.md`), not resolved unilaterally mid-sprint.
- Never touch a file outside a sprint's declared file list. If a sprint's implementation reveals
  that a file outside that list must change, that is a signal to re-scope the sprint, not to expand
  it silently.
- Every sprint must update, in the same change:
  - `docs/00_Project/CHANGELOG.md` — a new entry for the sprint.
  - `docs/00_Project/PROJECT_STATUS.md` — updated status tables for anything the sprint shipped.
  - `docs/00_Project/FEATURE_REGISTRY.md` — status changes for every feature the sprint touched.
  - `docs/00_Project/PRODUCT_DECISIONS.md` — only if the sprint made a genuine product decision
    (as several sprints above are flagged as requiring — e.g., Sprint 9's membership-criteria
    decision).
- Every sprint ends with a testing pass (Section 8) before being considered closed — documentation
  updates do not substitute for testing, and testing does not substitute for documentation updates;
  both are required, per the sequence in Section 4.
- Every sprint produces a completion report in the format established by prior sprints (Sprint 1,
  Release 0.2, Release 0.2.1, Sprint 2): files created/modified, schema changes, backward
  compatibility confirmation, future integration points, risks.

---

# 7. Definition of Done

A sprint is Done when, and only when:

- [ ] The feature described in the sprint's Expected Deliverables is implemented.
- [ ] No regression was introduced in any previously-shipped feature (verified, not assumed).
- [ ] The implementation has been reviewed against `docs/00_Project/ARCHITECTURE.md`'s standards
      (additive schema, backward compatibility, naming conventions).
- [ ] The sprint's Testing (Section 8) has been performed and passed.
- [ ] All required documentation updates (Section 6) have been made in the same change.
- [ ] Deployment has been validated (see Section 9) — for sprints that touch the live app, this
      means a manual verification pass against a real or test deployment, not just code review.
- [ ] Any deferred/out-of-scope item discovered during the sprint has been recorded in
      `docs/06_Roadmap/Backlog.md`, not silently dropped.

---

# 8. Testing Strategy

This environment has no automated test runner for Apps Script (established in
`docs/00_Project/README.md` Section 4). Testing is therefore multi-layered and manual/static rather
than automated:

- **Unit-level validation (static):** bracket/paren balance, duplicate top-level declaration checks,
  and orphaned function-call checks, run against every changed `.gs` file — the same methodology
  used throughout the Blueprint's own preparation.
- **Manual testing:** every sprint's deliverable is exercised by hand against seeded or real data in
  the actual web app before being considered working — not inferred from reading the code.
- **Regression testing:** every sprint explicitly re-verifies the specific prior features named in
  its own "Testing" entry in Section 5, plus a general pass over the Dashboard's existing metrics
  and the Pipeline board, since these are the most central shared surfaces.
- **Apps Script deployment verification:** after deploying a new version, `setupCrm()` is re-run
  against a populated test spreadsheet to confirm `ensureSheet_`/`ensureListeSheet_` per-cell
  idempotency holds for any new columns/sheets — this is the concrete check that backward
  compatibility (Section 4.4 of `ARCHITECTURE.md`) was actually preserved, not just claimed.
- **Spreadsheet verification:** for any sprint that adds or modifies schema, a direct inspection of
  the live/test Google Sheet confirms headers, validation dropdowns, and data placement match the
  updated `docs/03_Data_Model/Entities.md`.
- **User Acceptance Testing (UAT):** before Sprint 12's production release, and at the end of any
  sprint that changes a user-facing workflow, a Partnership Manager (the primary persona, per
  `docs/01_Product/Users.md`) walks through the real daily workflow end-to-end and confirms it
  matches `docs/01_Product/User_Journey.md`'s intent.

---

# 9. Release Strategy

- **Development:** implementation happens against a copy of the Apps Script project, following the
  sprint's file scope exactly.
- **Testing:** Section 8's full sequence, run before any deployment.
- **Internal Release:** deployed to the live Apps Script web app with access restricted to the
  commercial team already using the CRM today (no wider audience) — this is a low-ceremony step
  given the project's current single-deployment model, but it is still a distinct, deliberate action
  from "code is done."
- **Production:** the same deployment, once Internal Release has been used for at least one real
  working day without a regression being found — there is no separate production environment in
  this architecture (one Google Sheet, one Apps Script project), so "Production" means the
  deployment is now trusted for daily use, not that it is a different system.
- **Post-Release Review:** at the end of each sprint, a short review against that sprint's
  Definition of Done and against `docs/00_Project/BLUEPRINT_REVIEW.md`'s open items, to confirm the
  sprint didn't reintroduce a documentation/implementation mismatch of the kind that review found.

---

# 10. Long-Term Vision

This roadmap is how the existing, already-valuable CRM — deduplication, scoring, pipeline, outreach,
all shipped and in daily use — becomes the Vero Volley Partnership Operating System described in
`docs/00_Project/ARCHITECTURE.md` Section 15 and `docs/00_Project/Vision.md` Section 5: a single
platform covering the full commercial relationship lifecycle, including sponsorship sales,
proposals, hospitality, business community management, and AI-assisted decision-making, without
ever requiring a rewrite. Every sprint above builds additively on the infrastructure the Blueprint
stage deliberately built ahead of time (Ownership Engine, Activity Engine, generic `Relazioni`
linking) — the long-term vision is reached by sequencing already-approved work, not by further
redesign.

---

# Notes for Future Contributors

- If a sprint's actual outcome differs from what's planned here (a common and expected occurrence),
  update this document's Sprint Roadmap entry in the same change that closes the sprint — do not
  leave this plan describing an intention that implementation has already superseded.
- If `docs/07_Releases/Release_0.3.md`–`Release_0.5.md` are ever reconciled with this Sprint
  numbering, do it as its own deliberate documentation pass, and update this document's Section 5
  note about the two numbering schemes in the same change.
- Sprint 10 (AI Assistant) and Sprint 11 (Analytics) both name a specific external decision or
  action that must happen before their full scope can proceed. Do not let sprint-sequencing pressure
  cause either gate to be skipped.
