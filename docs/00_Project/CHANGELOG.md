# Vero Volley Partnership OS

# Changelog

**Version:** 1.0  
**Status:** Living Document  
**Purpose:** Chronological history of the evolution of the Partnership OS.

---

# Overview

This document records every significant change made to the Partnership OS.

Unlike the Release documents, which describe a specific version, the Changelog provides a chronological history of the entire project.

Every important milestone should be recorded here.

---

# Entry Format

Each entry should include:

- Date
- Version
- Type
- Description
- Impact

---

# Legend

| Type | Description |
|------|-------------|
| 🏗 Architecture | Structural changes |
| ✨ Feature | New functionality |
| 🐞 Fix | Bug fix |
| ⚙️ Refactor | Internal improvement |
| 📄 Documentation | Documentation update |
| 🤖 AI | AI-related feature |
| 🚀 Release | Official release |
| 🔒 Security | Security or permission update |

---

# Project History

---

## July 2026

### ✨ Sprint 3 — Dashboard 2.0

Implemented the redesigned Dashboard (`docs/02_UX/Dashboard.md`) as an extension of the existing
Overview tab, per `docs/00_Project/IMPLEMENTATION_MASTER_PLAN.md` Sprint 3.

Delivered: team-wide KPI cards (Open Opportunities, Pipeline Value, Activities Today, Follow-ups
Due, plus two "Coming Soon" placeholders for Proposals/Match Invitations pending later sprints),
Today's Agenda, Follow-up Center, Open Opportunities table, Contact Directory, a static
sample-data Upcoming Matches widget, Recent Activities, and an "AI Assistant — Coming Soon"
placeholder. Added Global Search and two quick actions ("+ Nuova Azienda/Opportunita", "+ Nuova
Attivita") to the shared header.

This is the first sprint to wire the Activity Engine (`Activity.gs`) into a live workflow —
`logActivity_` and `getActivityTimeline_` now have real callers, with `Activity.gs` itself left
unmodified. Both new quick actions route through existing compliant flows only
(`addSingleLead` for company/opportunity entry, `logActivity_` for activity logging) — no direct
creation path bypassing deduplication/blacklist/scoring was introduced, per the approved Sprint 3
decision record.

Per the same decision, "personal" widgets are team-wide for this sprint, not filtered by logged-in
user: `appsscript.json`'s `executeAs: USER_DEPLOYING` deployment mode does not resolve per-viewer
identity, and `ID Utente Owner` is unpopulated pending the Migration Engine's first real run
(Sprint 11). No manual user selector was introduced and no deployment/authentication configuration
was changed.

Files modified: `Dashboard_AppsScript/Code.gs`, `Dashboard_AppsScript/Dashboard.html`,
`Dashboard_AppsScript/View_Overview.html`. No other Apps Script or HTML file was touched.

Impact:

`docs/00_Project/{PROJECT_STATUS,FEATURE_REGISTRY}.md` updated: Dashboard (redesigned) and
Activity Engine both move from Planned/Built-Unwired to Shipped. Next sprint: Sprint 4 — Company
Workspace.

Detailed implementation report:

docs/07_Releases/Sprint_03.md

---

### 🚀 Blueprint v1.1 Approved

The first complete Blueprint of the Vero Volley Partnership OS has been approved.

The project officially moves from Product Design into the Implementation Phase.

Blueprint v1.1 becomes the single source of truth for all future development.

Future work will follow the Blueprint before any implementation begins.

Impact:

Architecture is now frozen as the implementation baseline. See
`docs/00_Project/IMPLEMENTATION_MASTER_PLAN.md` for the sprint-by-sprint roadmap that governs all
subsequent work.

---

## July 2026 — Blueprint v1.1

### 📄 Blueprint Cleanup

Version: Blueprint v1.1

A full architectural review (`docs/00_Project/BLUEPRINT_REVIEW.md`) found that the documentation
set had split into two layers produced without cross-checking each other — a grounded, code-precise
layer and an aspirational product-vision layer, including a self-tracking status system
(`PROJECT_STATUS.md`, `FEATURE_REGISTRY.md`) that was itself factually wrong about the state of
several sibling documents. This entry records the cleanup that followed, scoped strictly to fixing
documentation inconsistencies — no architecture changed and no new feature was introduced.

Changes made:

- Merged `docs/01_Product/Features.md` into `docs/00_Project/FEATURE_REGISTRY.md`, which is now the
  single authoritative feature inventory. `Features.md` is now a redirect stub.
- Corrected `docs/00_Project/PROJECT_STATUS.md`: `Relationships`, `Timeline`, `Search`, `Analytics`,
  and `Settings` were incorrectly marked "Planned" despite being complete documents describing
  shipped functionality; `Activity Engine`, `Permission Engine`, and `Migration Engine` were
  incorrectly marked fully active/shipped despite being Built-Unwired. All corrected.
- Unified the status vocabulary used by `PROJECT_STATUS.md` and `FEATURE_REGISTRY.md` into one
  five-state legend (Shipped / Built (Unwired) / In Development / Planned / Deprecated), replacing
  three previously-independent vocabularies.
- Fixed eight broken cross-references into `ARCHITECTURE.md`'s old section numbering (in
  `Glossary.md`, `Features.md`, `Permissions.md`, `Backlog.md` ×3, `README.md`, `Ownership.md`),
  retargeting each to its correct current location or removing a section-number citation where the
  original content no longer exists anywhere.
- Added a Layer A / Layer B Terminology Bridge table to `docs/00_Project/Glossary.md`, mapping
  Azienda↔Company, Persona↔Contact, Trattativa↔Opportunity/Deal, and flagging the still-unreconciled
  Sponsor Fit Score / Sponsor Score duplication for future resolution.
- Added a terminology note to `docs/02_UX/Workspace_Azienda.md` and `docs/02_UX/Workspace_Trattativa.md`
  clarifying that their English content describes the same entities as their Italian filenames.
- Added a `docs/06_Roadmap/Backlog.md` entry for the previously-undocumented unbounded
  `Storico Assegnazioni` history array risk, so `Ownership.md`'s reference to it resolves correctly.

Impact:

Documentation is now internally consistent on the specific points above. The deeper reconciliation
work identified in `docs/00_Project/BLUEPRINT_REVIEW.md` (P1–P3: governance precedence rule,
Sponsor Research compliance question, `Entities.md` completeness, missing business-rules documents)
remains open and is intentionally out of scope for this cleanup.

---

## July 2026 — Blueprint v1.0

### 📄 Blueprint Foundation

Version: Blueprint v1.0

Created the documentation structure of the Partnership OS.

Documents introduced:

- Architecture
- Product Vision
- User Journey
- Entities
- Workspace Azienda
- Workspace Trattativa
- Dashboard
- Feature Registry
- Product Decisions

Impact:

The project transitions from a code-first approach to a documentation-driven product.

---

### 🏗 Architecture Approved

Architecture v1.0 approved.

Defined:

- Architectural Principles
- Design Principles
- AI Philosophy
- Development Workflow
- Release Policy

Impact:

All future development must follow Architecture.md.

---

### 📄 Product Blueprint

Completed the first version of the Product Blueprint.

Main objectives defined:

- Relationship First
- AI Native
- Action Driven Interface
- One Click Rule

Impact:

The future UX is now fully documented before implementation.

---

### ⚙️ Documentation Framework

Created the complete documentation repository.

Structure introduced:

docs/

00_Project/

01_Product/

02_UX/

03_Data_Model/

04_Business_Rules/

05_AI/

06_Roadmap/

07_Releases/

Impact:

The project now follows documentation-first development.

---

### ✨ CRM Evolution

Official decision:

The platform evolves from a traditional CRM into the Vero Volley Partnership Operating System.

Impact:

Future development will include:

- Proposal Management
- Hospitality
- Business Community
- AI Assistant
- Commercial Analytics
- Sponsor Research

---

# Future Entries

Every significant project change should be recorded here.

Examples:

- New module completed
- Architecture updated
- Major UX redesign
- New AI capability
- Production release
- Data migration
- Business process changes

---

# Rules

Every release must generate at least one Changelog entry.

Documentation updates that affect the product vision or architecture should also be recorded.

Minor code refactoring should only be recorded when it changes the behavior or structure of the system.

The Changelog represents the official history of the Partnership OS.