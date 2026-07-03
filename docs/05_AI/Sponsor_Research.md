# Sponsor Research

## Title

AI — Sponsor Research Assistant

## Purpose

This document specifies the intended design of a future Sponsor Research capability: AI-assisted
identification and qualification of prospective sponsor companies, distinct from the manual lead
entry that is the only supported entry path today. It exists to define this feature's boundaries
clearly before it is built, given that automated data harvesting is an explicit non-goal of this
project.

## When to Use It

- Before designing or implementing any sponsor research/discovery feature.
- When evaluating a proposed integration that touches company discovery.

## Table of Contents

1. Status
2. Design Intent
3. Hard Boundary: No Automated Scraping
4. Candidate Capability
5. Data Foundations Already in Place
6. Writing Guidelines
7. Notes for Future Contributors

---

## 1. Status

**Planned.** No sponsor research feature exists in the codebase today.

## 2. Design Intent

Support a commercial user who already has a candidate company in mind by helping them qualify and
enrich it faster — not to discover candidate companies on the user's behalf through automated means.
The distinction matters: enrichment of a human-provided input is compatible with this project's
compliance posture; automated discovery/harvesting is not (see Section 3).

## 3. Hard Boundary: No Automated Scraping

`docs/00_Project/Vision.md` Section 2 states this as a founding, compliance-driven constraint: "No
LinkedIn scraping or automated lead harvesting. Lead entry is manual by design." Any Sponsor
Research feature must preserve this: a human enters or names a candidate company; AI assistance
operates on and around that human-provided input (summarizing publicly available information the
human points it to, suggesting fit rationale, drafting research notes) — it must not autonomously
crawl or bulk-harvest company/contact lists. Any proposed capability that would cross this line
must be escalated as a vision-level decision, not implemented as a routine feature addition.

## 4. Candidate Capability

- Given a company name/domain entered by a user, assist in populating `Aziende Target` fields
  (`Settore`, `Dimensione Azienda`, `Fatturato Stimato`, `Motivo Interesse`) from information the
  user supplies or points the assistant to — not from autonomous web crawling.
- Draft a `Motivo Interesse` / fit rationale narrative, complementary to (not a replacement for) the
  deterministic `Scoring.gs` fit score — framed as a human-readable qualitative companion to the
  quantitative score, tagged as AI-originated per `docs/05_AI/AI_Assistant.md` Section 5.
- Surface a plain-language explanation of `Scoring.gs`'s `Motivo del Fit` output for a
  non-technical reader, without changing the underlying deterministic score.

## 5. Data Foundations Already in Place

`Aziende Target`'s existing `Motivo Interesse` and `Note` fields are the natural landing spot for
AI-assisted qualification narrative; no new columns are anticipated to be required for the
candidate capability in Section 4. If a future concrete design needs a new field (e.g., a
structured research summary distinct from free-text `Note`), it should be added following
`docs/00_Project/ARCHITECTURE.md`'s additive-schema rules, and documented in
`docs/03_Data_Model/Entities.md` at that time.

## Writing Guidelines

- Every candidate capability description must be checked against Section 3's boundary before being
  written down — do not describe a capability that implies autonomous discovery, even as an aside.
- Keep this document explicitly distinct from `docs/05_AI/AI_Assistant.md`: that document covers
  general AI capability (timeline summarization, next-best-action); this one covers company
  discovery/qualification assistance specifically, because its compliance boundary is unique to it.

## Notes for Future Contributors

- If this feature is ever scoped for real implementation, the scoping document must explicitly
  restate and reaffirm Section 3's boundary, not merely link to it — this is a compliance-sensitive
  area worth restating deliberately each time.
- If the underlying compliance constraint in `docs/00_Project/Vision.md` is ever formally revisited
  and changed, update this document's Section 3 to match, but do not let this document's scope
  expand ahead of that vision-level decision.
