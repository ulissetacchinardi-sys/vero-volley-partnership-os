# Product Vision

## Title

Vero Volley Partnership OS — Product Vision

## Purpose

This document translates the project vision (`docs/00_Project/Vision.md`) into a product statement:
what value the software delivers, to whom, and how success is measured. It is the reference point
for prioritization decisions that trade off competing feature requests.

## When to Use It

- When deciding whether a proposed feature serves the product's actual users.
- When writing a new roadmap item, to justify it in terms of the value it delivers.
- When onboarding a product-minded stakeholder who does not need architectural detail.

## Table of Contents

1. Problem Statement
2. Product Promise
3. Target Users
4. Value Proposition by User
5. Success Metrics
6. Non-Goals
7. Writing Guidelines
8. Notes for Future Contributors

---

## 1. Problem Statement

Before this system, Vero Volley's B2B sponsor commercial process ran on manually maintained
spreadsheets with no structural connection between a lead, the company it belonged to, and any deal
that resulted from it. There was no automatic protection against re-contacting a blocked company,
no consistent scoring to prioritize effort, and no visual pipeline to track negotiations. Everything
depended on individual memory and manual cross-referencing.

## 2. Product Promise

The commercial team can prospect, qualify, pursue, and manage sponsor relationships in one tool,
with automatic deduplication and blacklist protection, automatic fit scoring, a visual negotiation
pipeline, and integrated outreach — without adopting any paid software.

## 3. Target Users

- **Commercial / Sales staff**: the primary daily users. They enter leads, work the pipeline, send
  outreach, and log activity.
- **Commercial Manager**: oversees the team's pipeline and performance; the primary consumer of
  planned team-level dashboards and reporting.
- **Administrator** (typically the same manager, wearing a different hat): manages settings, users,
  and — once wired — permissions.

See `docs/01_Product/Users.md` for detailed role definitions.

## 4. Value Proposition by User

| User | Value Delivered |
|---|---|
| Commercial staff | Never accidentally re-contact a blocked or already-engaged company; know instantly which leads are worth prioritizing; track every deal without a separate spreadsheet. |
| Commercial Manager | See the whole team's pipeline and funnel in one dashboard; (planned) see ownership and activity history per relationship without asking. |
| Administrator | Zero licensing cost; full data ownership inside the club's own Google Workspace; no vendor lock-in. |

## 5. Success Metrics

These are the qualitative and quantitative signals the product should be judged against as it
matures (formal instrumentation is not yet built — see `docs/06_Roadmap/Roadmap.md`):

- Reduction in duplicate/blocked-company outreach incidents to zero (structurally enforced by
  `Dedup.gs`, not just policy).
- Time from lead entry to first qualified outreach.
- Pipeline value visibility: is the open pipeline's estimated value always current and trustworthy?
- Adoption: is the web app the single place the team works, or do spreadsheets-on-the-side creep
  back in?

## 6. Non-Goals

- Becoming a general marketing/lead-generation platform.
- Supporting fan, ticketing, or membership use cases (see `docs/00_Project/Vision.md` Section 4).
- Matching feature-for-feature the surface area of HubSpot/Salesforce — the product optimizes for
  this specific commercial workflow, not for configurability.

## Writing Guidelines

- Tie every stated value proposition back to a real, current or planned capability referenced
  elsewhere in `docs/` — avoid aspirational claims with no corresponding roadmap entry.
- Keep this document free of implementation detail; link to `02_UX/`, `03_Data_Model/`, and
  `04_Business_Rules/` instead of restating them.

## Notes for Future Contributors

- When a success metric becomes actually measurable (e.g., once Activity Engine data accumulates
  enough history), add the real number here instead of leaving it qualitative.
- Revisit Non-Goals whenever a roadmap item is proposed that brushes against them — either reject
  the item or deliberately revise this document, do not let scope drift silently.
