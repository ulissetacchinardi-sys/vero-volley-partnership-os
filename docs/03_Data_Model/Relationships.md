# Relationships

## Title

Data Model — Relationships

## Purpose

This document specifies how entities relate to one another: which foreign keys exist, which
lookups are ID-based versus name/domain-based fuzzy matching, and where an entity's identity is
shared across more than one physical sheet. This is the layer that turns a set of flat spreadsheet
tabs into a coherent relational model.

## When to Use It

- Before writing any new cross-entity query.
- Before adding a new foreign key field to any sheet.
- When debugging why two records that should be linked are not.

## Table of Contents

1. Relationship Diagram
2. Direct Foreign Keys
3. Shared-ID Lifecycle Pairs
4. Identity Resolution (Find-or-Create)
5. Generic Relationships (Activity Engine)
6. Writing Guidelines
7. Notes for Future Contributors

---

## 1. Relationship Diagram

```
Azienda (AZ-...)  ──┬── 1:N ──  Persona (PE-...)         [via ID Azienda on Persona]
                    ├── 1:N ──  Lead (LD-...)             [via ID Azienda on Lead]
                    ├── 1:N ──  Trattativa (TR-...)       [via ID Azienda on Trattativa]
                    ├── 1:N ──  Lead Scartato (SC-...)    [via ID Azienda]
                    └── 1:N ──  Blocco (BL-...)           [via ID Azienda, when Tipo = Azienda]

Persona (PE-...)   ──┬── 1:N ──  Lead (LD-...)            [via ID Persona on Lead]
                     ├── 1:N ──  Trattativa (TR-...)       [via ID Persona on Trattativa]
                     └── 1:N ──  Blocco (BL-...)           [via ID Persona, when Tipo = Persona]

Utente (US-...)     ──── 1:N ──  any ownership-enabled sheet  [via ID Utente Owner, Sprint 2]

Attivita (AT-...)   ──── N:1 ──  Azienda / Persona / Trattativa / (generic) Lead / Utente
                                 [via ID Azienda / ID Persona / ID Trattativa / Tipo+ID Entita
                                 Riferimento / Relazioni — see Section 5]
```

## 2. Direct Foreign Keys

Foreign keys are always a literal `ID X` column holding the referenced entity's generated ID,
resolved via `Data.gs:findRecordById_(sheetKey, id)` or a filtered `getAllRecords_(sheetKey)`
scan. There is no referential integrity enforcement at the spreadsheet level — a dangling FK
(referencing a deleted or never-created row) is possible and must be handled defensively by any
reader (as `Pipeline.gs:getEntityDetail_` does, via `.filter()` returning an empty array rather than
throwing).

| From | Field | To |
|---|---|---|
| `leadWeekly`/`archivioLead` | `ID Azienda` | `aziendeTarget`/`aziendeContattate` |
| `leadWeekly`/`archivioLead` | `ID Persona` | `personeContattate` |
| `personeContattate` | `ID Azienda` | `aziendeTarget`/`aziendeContattate` |
| `trattativeAperte` | `ID Azienda` | `aziendeTarget`/`aziendeContattate` |
| `trattativeAperte` | `ID Persona` | `personeContattate` |
| `daNonContattare` | `ID Azienda` / `ID Persona` | (optional, populated when the block references a known record) |
| `leadScartati` | `ID Azienda` / `ID Persona` | (populated when the reject matched an existing record) |
| any ownership-enabled sheet | `ID Utente Owner` | `utenti` (Sprint 2, unwired — see `docs/03_Data_Model/Ownership.md`) |
| `attivita` | `ID Azienda` / `ID Persona` / `ID Trattativa` / `ID Utente` | respective sheets |

## 3. Shared-ID Lifecycle Pairs

Two pairs of sheets represent one conceptual entity moving through lifecycle stages, sharing the
same ID prefix and the same generated ID value across the pair:

- **Lead** (`LD-`): `leadWeekly` (active) ↔ `archivioLead` (archived). A lead is *moved* between
  these sheets (`Data.gs:moveRecord_`), never duplicated with two different IDs.
- **Azienda** (`AZ-`): `aziendeTarget` (pre-contact) ↔ `aziendeContattate` (post-contact). A
  company can have rows in *both* sheets simultaneously (target data persists as historical
  context even after contact begins) — this is a deliberate exception to "moved not duplicated,"
  since the two sheets capture different, complementary facts about the same ID.

## 4. Identity Resolution (Find-or-Create)

Because incoming lead data is free text (manually entered or pasted), company and person identity
is resolved by fuzzy matching before assigning or reusing an ID:

- **Company** (`Data.gs:findOrCreateAzienda_`): matched first by normalized company name
  (`normalizeCompanyName_` — lowercased, diacritics stripped, legal-form suffix stripped), then by
  normalized domain (`normalizeDomain_`, from website or LinkedIn URL). First match across
  `aziendeTarget` + `aziendeContattate` wins; no match creates a new `aziendeTarget` row.
- **Person** (`Data.gs:findOrCreatePersona_`): matched first by normalized LinkedIn URL
  (`normalizeLinkedInUrl_`, the strongest available key), falling back to normalized
  Nome+Cognome+Azienda (`normalizePersonKey_`). First match across `personeContattate` +
  `leadWeekly` wins; no match generates a fresh `PE-` ID (a person record is not pre-created here —
  it is created later, on first status-changing contact, via `upsertPersonaRecord_`).

This matching is heuristic, not guaranteed-correct — it is the same normalization logic relied on
by `Dedup.gs` for blacklist/duplicate checks (see `docs/04_Business_Rules/Pipeline.md`).

## 5. Generic Relationships (Activity Engine)

`Attivita` rows use direct FK columns (`ID Azienda`/`ID Persona`/`ID Trattativa`/`ID Utente`) for
the four most common links, a single generic reference pair (`Tipo Entita Riferimento`/`ID Entita
Riferimento`) for one additional link to any entity type (today used mainly for `Lead` and
`Utente`, which lack a dedicated FK column on this sheet), and a repeatable JSON field
(`Relazioni`, an array of `{tipo, id}`) for linking to an arbitrary number of entities of any type
— including entity types that do not exist yet (Proposta, Contratto, Documento, Campagna). See
`docs/03_Data_Model/Activities.md` for full detail.

## Writing Guidelines

- Always specify the direction and cardinality of a relationship (`1:N`, `N:1`), not just "these
  are linked" — ambiguity here causes real query bugs.
- When documenting a fuzzy-match relationship, name the exact normalization function involved; a
  vague description ("matched by name") is not enough to predict edge-case behavior.

## Notes for Future Contributors

- If referential integrity enforcement is ever added (e.g., preventing deletion of a company with
  active deals), document the enforcement point here, not only in `04_Business_Rules/`.
- If a new shared-ID lifecycle pair is introduced, add it to Section 3 explicitly — this pattern is
  non-obvious and has previously been a source of confusion (e.g., "why does this company have two
  rows with the same ID").
