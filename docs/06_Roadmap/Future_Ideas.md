# Future Ideas

## Title

Future Ideas — Vero Volley Partnership OS

## Purpose

This document holds long-horizon, deliberately loosely-specified ideas for where the Partnership OS
could expand beyond its current B2B sponsor-prospecting core — the adjacent capabilities named in
the original CRM 3.0 "future compatibility" design discussion. It exists to preserve ambition
without pretending any of it is scoped or committed.

## When to Use It

- When a stakeholder proposes a large new capability area, to record it without either committing
  prematurely or losing the idea.
- When starting a new planning cycle, as a source of candidates to potentially promote into
  `docs/06_Roadmap/Backlog.md` with real scoping.

## Table of Contents

1. Status Note
2. Proposal Builder
3. Business Community
4. Hospitality & Event Management
5. Sponsor Asset Inventory
6. Advanced Analytics
7. Writing Guidelines
8. Notes for Future Contributors

---

## 1. Status Note

Nothing in this document is scoped, committed, or scheduled. Every idea here should be checked
against `docs/00_Project/Vision.md` Section 4 ("What This Product Is Not") before being taken
seriously, and against the zero-paid-tools constraint before assuming any particular
implementation approach.

## 2. Proposal Builder

Idea: generate sponsorship proposal documents (deck or PDF) from a deal's data
(`Trattative Aperte` fields, company enrichment from `Aziende Target`), tracked as an activity
(`ACTIVITY_TYPES.PROPOSAL_SENT` already exists) and linked via `Activity.gs`'s `Relazioni` mechanism
to a not-yet-existing `Proposta` entity. Google Docs/Slides API (available under the same Workspace
subscription) is the natural zero-cost implementation path.

## 3. Business Community

Idea: extend the relationship model beyond active sponsors/prospects to a broader network of club
stakeholders (past sponsors, community partners, local business contacts) with lighter-weight
relationship tracking than the full sponsor pipeline. `Activity.gs`'s `Relazioni` and
`ACTIVITY_VISIBILITY.PUBLIC` were named in earlier design discussion specifically with this use case
in mind.

## 4. Hospitality & Event Management

Idea: manage sponsor hospitality events (invitations, attendance, follow-up) as a first-class
entity. `ACTIVITY_TYPES.HOSPITALITY_INVITATION` and `BUSINESS_LUNCH` already exist as activity
types, anticipating this without committing to a dedicated entity yet.

## 5. Sponsor Asset Inventory

Idea: track what sponsorship assets/inventory (signage, jersey space, hospitality boxes) exist and
which are allocated to which sponsor/deal — would likely introduce a new entity with its own
`ID_PREFIXES` entry and relate to `Trattative Aperte` via a direct FK or via `Activity.gs`'s
`Relazioni`.

## 6. Advanced Analytics

Idea: predictive elements (e.g., deal-close likelihood beyond the manually-set `Probabilita`
field) — distinct from the deterministic `docs/04_Business_Rules/Scoring.md` model; would need
explicit evaluation against `docs/00_Project/ARCHITECTURE.md`'s principle that business logic
remains deterministic and rule-based unless a future release deliberately and narrowly introduces a
predictive/AI-driven exception.

## Writing Guidelines

- Keep entries short and idea-level; the moment an idea gets real scoping detail, it should move to
  `docs/06_Roadmap/Backlog.md` or a `docs/07_Releases/` draft, not stay here.
- Note, for each idea, which already-built structure (if any) was designed with it in mind — this
  project has a pattern of preparing data structures ahead of features, and that connective tissue
  is valuable context for whoever eventually builds the feature.

## Notes for Future Contributors

- Do not treat presence in this document as approval to build — every idea here still requires a
  deliberate scoping and roadmap decision.
- When an idea here is promoted, remove it from this document and link forward to where it now
  lives, rather than leaving a stale duplicate description in both places.
