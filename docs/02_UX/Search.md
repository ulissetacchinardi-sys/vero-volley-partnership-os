# Search (Aziende & Contatti Tab)

## Title

UX Specification — Search / Aziende & Contatti Tab

## Purpose

This document specifies the "Aziende & Contatti" tab: the cross-entity search surface and the
follow-up scheduling panel it hosts. It is the reference for anyone modifying `View_Aziende.html`
or `Pipeline.gs:searchEntities_`.

## When to Use It

- Before changing search matching behavior or result rendering.
- Before changing the follow-up scheduling form on this tab.

## Table of Contents

1. Screen Purpose
2. Search Behavior
3. Result Rendering
4. Follow-Up Scheduling Panel
5. Known Constraints
6. Writing Guidelines
7. Notes for Future Contributors

---

## 1. Screen Purpose

Let a commercial user find any company or person already in the system by name, from a single
search box, regardless of which sheet the record currently lives in.

## 2. Search Behavior

Input is debounced 350ms (`azDebouncedSearch`) before calling `searchEntities(query)` →
`Pipeline.gs:searchEntities_`. Matching is substring-based on the normalized company name
(`normalizeCompanyName_`: lowercased, diacritics stripped, legal-form suffixes like "S.p.A."/"S.r.l."
removed) for companies, and normalized full name for people. Companies are searched across
`Aziende Target` + `Aziende Gia Contattate` combined and de-duplicated by `ID Azienda`; people
across `Persone Gia Contattate` + `Lead Weekly` combined and de-duplicated by `ID Persona`. Results
are capped at 25 per entity type.

## 3. Result Rendering

Two side-by-side result panels (Aziende / Persone). Each result card shows the primary label
(company name, or person name + job title/company) and two actions: clicking the bold name opens
the shared detail drawer (see `docs/02_UX/Workspace_Azienda.md` /
`docs/02_UX/Workspace_Persona.md`); clicking "Pianifica follow-up" selects that entity as the
target for the scheduling panel below, without opening the drawer.

## 4. Follow-Up Scheduling Panel

A single form, shared across both entity types, that creates a Google Calendar event
(`scheduleFollowUp` → `Outreach.gs:createFollowUpEvent_`) for whichever entity is currently
selected. Fields: date/time (`datetime-local`), event title (defaults to "Follow-up {label}" if
left blank), and free-text details. See `docs/04_Business_Rules/Automation.md` for the event
creation rule (including the date-only vs. date-time default-hour behavior).

## 5. Known Constraints

- Search only matches companies/people that already exist in `Aziende Target`, `Aziende Gia
  Contattate`, `Persone Gia Contattate`, or `Lead Weekly` — a company known only from a rejected
  lead (`Lead Scartati`) or a blacklist entry (`Da Non Contattare`) will not appear here.
- There is no dedicated deal search; deals are only reachable via the Pipeline board or via a
  company's drawer.

## Writing Guidelines

- Keep the matching algorithm description (Section 2) precise and in sync with
  `normalizeCompanyName_`/`normalizePersonKey_` in `Data.gs`, since subtle normalization behavior
  (e.g., legal-suffix stripping) is easy to describe incorrectly from memory.

## Notes for Future Contributors

- If search is extended to cover deals or blacklist/rejected entries, update Section 5 to remove
  the corresponding constraint and document the new matching scope in Section 2.
- If result ranking (currently: insertion order, capped at 25) becomes relevance-scored, document
  the ranking rule here.
