# Vero Volley Partnership OS

# Product Decisions

**Version:** 1.0  
**Status:** Living Document

---

# Purpose

This document records every major product and architectural decision taken during the development of the Partnership OS.

Its purpose is to preserve context and explain why important decisions were made.

Every significant decision should include:

- Decision
- Rationale
- Impact
- Date

---

# Decision Template

## Decision #000

### Decision

...

### Why

...

### Impact

...

### Date

...

---

# Decisions

## Decision #001

### Decision

The CRM will evolve into a complete Partnership Operating System rather than remain a traditional CRM.

### Why

Commercial work extends beyond contact management.

The platform must support sponsorship sales, hospitality, networking, proposals and AI-assisted decision making.

### Impact

Entire platform.

### Date

July 2026

---

## Decision #002

### Decision

Companies are the central business entity of the platform.

### Why

Every commercial relationship begins with a company.

All other entities connect to it.

### Impact

Entire data model.

### Date

July 2026

---

## Decision #003

### Decision

Activities are independent entities.

### Why

Every interaction should become part of the commercial timeline.

### Impact

Timeline

AI

Reporting

Automation

### Date

July 2026

---

## Decision #004

### Decision

Ownership and Permissions are separate concepts.

### Why

Responsibility and access control solve different business problems.

### Impact

Ownership Engine

Permission Engine

### Date

July 2026

---

## Decision #005

### Decision

Proposals are business entities rather than simple documents.

### Why

They have versions, statuses, negotiations and commercial value.

### Impact

Opportunity Workspace

Proposal Builder

Company Workspace

### Date

July 2026

---

## Decision #006

### Decision

The Dashboard is an operational workspace, not a reporting page.

### Why

Its objective is to help users decide what to do next.

### Impact

Dashboard UX

AI Assistant

### Date

July 2026

---

## Decision #007

### Decision

Every future feature must first be documented before implementation.

### Why

Documentation drives development.

### Impact

Entire project.

### Date

July 2026

---

## Decision #008

### Decision

Where the technical documentation (Italian schema terms: Azienda, Persona, Trattativa) and the
product vision documentation (English terms: Company, Contact, Opportunity) name the same
underlying entity, both names remain in use side by side. The English terms are not a rename of the
schema; the Italian schema is not being retired. `docs/00_Project/Glossary.md` Section 6 is the
single authoritative mapping between the two vocabularies.

### Why

An architectural review (`docs/00_Project/BLUEPRINT_REVIEW.md`) found that the two vocabularies had
been used independently, with no documented relationship between them, which produced filename/
content mismatches and made it unclear whether "Company" meant something different from "Azienda."
Declaring one vocabulary the sole survivor would require renaming either the live spreadsheet schema
or the entire product-vision document set — a change with real implementation cost, not a
documentation fix. Declaring them explicitly equivalent, instead, resolves the ambiguity without
requiring either change.

### Impact

`docs/00_Project/Glossary.md`, `docs/02_UX/Workspace_Azienda.md`, `docs/02_UX/Workspace_Trattativa.md`

### Date

July 2026

---

## Decision #009

### Decision

Blueprint v1.1 is approved and frozen as the implementation baseline. The project moves from the
Documentation/Blueprint phase into the Implementation Phase, following the sprint sequence in
`docs/00_Project/IMPLEMENTATION_MASTER_PLAN.md`.

### Why

The Blueprint had reached a reviewed, internally consistent state (`docs/00_Project/BLUEPRINT_REVIEW.md`,
cleanup recorded in `docs/00_Project/CHANGELOG.md`'s "Blueprint v1.1" entry). Continuing to revise
the Blueprint indefinitely instead of building against it would contradict the project's own
"Documentation First" principle, which requires a stable specification to build against, not an
perpetually-open one.

### Impact

Entire project — architecture and Blueprint are now frozen for implementation purposes; open P1–P2
items from `docs/00_Project/BLUEPRINT_REVIEW.md` remain tracked but non-blocking except where a
specific sprint in `docs/00_Project/IMPLEMENTATION_MASTER_PLAN.md` names a dependency on one.

### Date

July 2026