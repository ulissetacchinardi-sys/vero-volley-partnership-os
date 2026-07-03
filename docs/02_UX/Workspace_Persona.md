# Workspace — Persona (Contact)

## Title

UX Specification — Contact Detail Workspace

## Purpose

This document specifies how an individual contact's detail and history is presented today, and how
it is expected to evolve. It is the reference for anyone modifying
`Pipeline.gs:getEntityDetail_('persona', ...)` or its rendering in `Dashboard.html`.

## When to Use It

- Before changing what data is shown when a person row is clicked anywhere in the app.
- When adding outreach or activity capability that should surface on this view.

## Table of Contents

1. Current Implementation
2. Data Assembled
3. Entry Points
4. Actions Available
5. Planned Evolution
6. Writing Guidelines
7. Notes for Future Contributors

---

## 1. Current Implementation

As with the company workspace (`docs/02_UX/Workspace_Azienda.md`), there is no dedicated full-page
contact workspace today. Clicking a person's name opens the same shared slide-over drawer,
populated by `getEntityDetail('persona', id)` → `Pipeline.gs:getEntityDetail_`.

## 2. Data Assembled

`getEntityDetail_('persona', id)` returns:

- `contattate` — the `Persone Gia Contattate` row, if contact has begun.
- `leadAttivi` — active `Lead Weekly` rows for this person.
- `leadArchiviati` — archived `Archivio Lead` rows for this person.
- `trattative` — `Trattative Aperte` rows where this person is the primary contact.
- `blocchi` — any `Da Non Contattare` block referencing this person.

Unlike the company view, there is no `target`/`scartati` section, since a person does not have a
"target" pre-contact stage of their own (that concept applies at the company level) and a rejected
lead's person-level record is not separately tracked beyond what's in `Lead Scartati` (surfaced at
the company level today).

## 3. Entry Points

- Search results (`docs/02_UX/Search.md`) — clicking a person's name.
- The company workspace's drawer does not currently cross-link to a person's own drawer; navigating
  to a person's detail requires searching for them directly.

## 4. Actions Available

- Send a templated outreach email (`sendOutreachEmail_`) — reachable from the person's record
  context, not currently exposed as a button inside the drawer itself; today this is invoked from
  wherever the calling view wires it (see `docs/04_Business_Rules/Automation.md` for the function's
  behavior).
- Select the person as the target of a scheduled follow-up (Aziende & Contatti tab).

## 5. Planned Evolution

Same trajectory as the company workspace: owner/collaborator display and reassignment
(`Ownership.gs`), and a unified activity timeline scoped to this person
(`Activity.gs:getActivityTimeline_({idPersona: id})`), plus a direct link from a person's drawer to
their associated company's drawer (currently absent).

## Writing Guidelines

- Keep Section 2 in exact sync with `getEntityDetail_`'s actual return shape for `'persona'`.
- Call out asymmetries with the company workspace explicitly (as in Section 2) rather than letting
  a reader assume both entity types behave identically.

## Notes for Future Contributors

- If a company ↔ person cross-link is added to the drawer, document it here and in
  `docs/02_UX/Workspace_Azienda.md` in the same change.
- If outreach email sending is added directly as a drawer action, update Section 4 to reflect the
  concrete entry point instead of the current "not currently exposed" note.
