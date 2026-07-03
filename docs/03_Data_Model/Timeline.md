# Timeline

## Title

Data Model — Timeline (Reading and Presenting Activity History)

## Purpose

`docs/03_Data_Model/Activities.md` specifies the `Attivita` entity and its write/read API. This
document specifies the *timeline* concept built on top of it: how activity records are meant to be
composed into a chronological, entity-scoped, human-readable history — the piece a future UI or AI
summarization feature actually consumes. Kept separate from `Activities.md` because "the entity
schema" and "how you present a sequence of it" are different concerns that will evolve at different
rates.

## When to Use It

- Before building any UI panel that shows "history for this company/person/deal."
- Before building an AI feature that summarizes a timeline.
- Before adding a new timeline filter dimension.

## Table of Contents

1. Status
2. Timeline Definition
3. Composing a Timeline
4. Cross-Entity Timelines via Relazioni
5. Presentation Guidance
6. Planned Consumers
7. Writing Guidelines
8. Notes for Future Contributors

---

## 1. Status

**Built, Unwired.** `getActivityTimeline_()` exists and is fully functional; nothing renders its
output today. This document describes intended usage ahead of that UI work, per
`ARCHITECTURE.md`'s infrastructure-first pattern.

## 2. Timeline Definition

A timeline is simply the newest-first result of `Activity.gs:getActivityTimeline_(filters)`, scoped
to one entity (or one cross-entity relationship, see Section 4). There is no separate "timeline"
table or cache — it is a live, filtered read of `Attivita` on every call.

## 3. Composing a Timeline

For a single entity, scope by the matching direct filter:

- Company: `getActivityTimeline_({ idAzienda: id })`
- Person: `getActivityTimeline_({ idPersona: id })`
- Deal: `getActivityTimeline_({ idTrattativa: id })`
- Generic (Lead/Utente today): `getActivityTimeline_({ tipoEntitaRiferimento: 'Lead', idEntitaRiferimento: id })`

These can be combined with `tipo`, `stato`, `origine`, `esito`, or `visibilita` to build a filtered
sub-view (e.g., "only planned follow-ups for this deal": `{ idTrattativa: id, stato: 'Pianificata'
}`).

## 4. Cross-Entity Timelines via Relazioni

To find every activity touching a not-yet-existing or non-standard entity type (e.g., a future
`Proposta`), filter by `relazione`: `getActivityTimeline_({ relazione: { tipo: 'Proposta', id:
'PR-000001' } })`. This is the mechanism that lets a future Proposal Builder or Business Community
module get a working timeline view without this module needing to know about them in advance.

## 5. Presentation Guidance

When a UI eventually renders a timeline, it should:

- Group or visually separate `Pianificata` (upcoming) from `Completata`/`Annullata` (past) entries,
  since they answer different questions ("what's next" vs. "what happened").
- Use `Titolo` as the primary label and `Descrizione` as expandable detail, not the reverse — this
  matches how `logActivity_()` callers are expected to populate them.
- Treat `Metadata` as opaque unless it matches the recommended structure
  (`docs/03_Data_Model/Activities.md` Section 6); do not assume any key is present.
- Surface `Origine` subtly (e.g., an icon), not as a primary sort/filter dimension by default,
  since most users will care about *what* happened before *how* it was created.

## 6. Planned Consumers

- **Company/Person/Deal workspace views** (`docs/02_UX/Workspace_Azienda.md`,
  `Workspace_Persona.md`, `Workspace_Trattativa.md`) — replacing today's per-sheet section lists in
  the shared drawer.
- **AI Assistant** (`docs/05_AI/AI_Assistant.md`) — timeline as the primary input for summarization
  and next-best-action suggestion.
- **Notifications** (`docs/04_Business_Rules/Notifications.md`) — planned activities
  (`Stato: Pianificata`) with a `Data Scadenza` in the near future are a natural reminder source.

## Writing Guidelines

- Describe timeline composition in terms of the exact `getActivityTimeline_` filter object to pass
  — this document should let an implementer copy a filter shape directly rather than re-deriving it.
- Keep "Presentation Guidance" opinionated but not prescriptive of exact pixels/components — that
  belongs in the specific `02_UX/` file once a timeline UI is actually scoped.

## Notes for Future Contributors

- When the first timeline UI ships, link to it from Section 6 with the concrete component/file name,
  and update the corresponding `docs/02_UX/Workspace_*.md` file's "Planned Evolution" section to
  "Current Implementation."
- If timeline composition ever requires combining results from multiple filter calls (e.g., a
  cross-entity view spanning both direct FKs and `Relazioni` simultaneously), document the merge
  strategy (dedup by `ID Attivita`, re-sort) here before it's implemented ad hoc in a UI layer.
