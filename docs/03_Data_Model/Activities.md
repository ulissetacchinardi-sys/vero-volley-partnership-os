# Activities

## Title

Data Model — Activity Engine

## Purpose

This document specifies the centralized activity/interaction log introduced in Release 0.2 and
refined in Release 0.2.1 (`Activity.gs`). It is the reference for any future release that logs
activities from a live workflow, or that reads the timeline for display.

## When to Use It

- Before calling `logActivity_()` from any module for the first time.
- Before building any UI that displays activity history.
- Before adding a new activity type, source, or outcome value.

## Table of Contents

1. Status
2. Why This Exists
3. Fields
4. Controlled Vocabularies
5. Generic Relationships (Relazioni)
6. Recommended Metadata Structure
7. Read/Write API
8. Writing Guidelines
9. Notes for Future Contributors

---

## 1. Status

**Built, Unwired.** No module currently calls `logActivity_()`. The `Attivita` sheet is created
empty by `setupCrm()` and stays empty until a future release wires activity logging into
`Dedup.gs`, `Pipeline.gs`, or `Outreach.gs`'s existing write paths.

## 2. Why This Exists

Before this engine, "what happened and when" on a given relationship was scattered across free-text
`Note` fields and a handful of date columns (`Data Ultimo Contatto`, `Data Apertura`) spread across
multiple sheets. `Attivita` centralizes this into one queryable timeline, intended to become the
single source both a future UI panel and a future AI summarization feature read from, instead of
each reinventing its own way to reconstruct history.

## 3. Fields

`ID Attivita`, `Tipo`, `Tipo Entita Riferimento`, `ID Entita Riferimento`, `ID Azienda`, `ID
Persona`, `ID Trattativa`, `ID Utente`, `Titolo`, `Descrizione`, `Data Creazione`, `Creato Da`,
`Data Scadenza`, `Data Completamento`, `Stato`, `Tag`, `Metadata`, `Relazioni`, `Origine`, `Esito`,
`Visibilita`.

Design rationale for the direct FK columns vs. the generic reference pair: `ID Azienda`/`ID
Persona`/`ID Trattativa` are explicit columns because they are the most frequent links and a single
activity commonly touches more than one at once (e.g., a call concerns both a contact and the deal
they're tied to). `Tipo Entita Riferimento`/`ID Entita Riferimento` is a single generic reference,
used today mainly for `Lead` and `Utente`, which have no dedicated FK column here. `ID Utente` is
who the activity is *about/associated with* (e.g., who made the call); `Creato Da` is a separate
audit field, since they can differ — a manager may log an activity on a colleague's behalf, or an
automation may create one with no human "doer."

## 4. Controlled Vocabularies

- `ACTIVITY_TYPES` (14 values): Chiamata, Email, Riunione, Follow-up, Nota, Task Completato,
  Trattativa Creata, Trattativa Aggiornata, Lead Importato, Proposta Inviata, Invito Hospitality,
  Pranzo di Lavoro, Contratto Firmato, Documento Caricato.
- `ACTIVITY_STATUSES`: Pianificata, Completata (default), Annullata.
- `ACTIVITY_ENTITY_TYPES` (for the generic reference pair): Lead, Azienda, Persona, Trattativa,
  Utente.
- `ACTIVITY_SOURCES` (`Origine`, Release 0.2.1): Manuale (default), Email, Calendario, Import,
  Workflow, AI, Sistema.
- `ACTIVITY_OUTCOMES` (`Esito`, Release 0.2.1, optional): Interessato, Nessuna Risposta, Riunione
  Programmata, Proposta Richiesta, Vinto, Perso, Follow-up Necessario. Deliberately distinct from
  the relationship-level `Esito Contatto` field used on `Aziende`/`Persone Gia Contattate`: that
  field describes the state of an ongoing relationship over time; this describes the result of one
  specific, punctual activity, and includes deal-level outcomes (Vinto/Perso) that would not make
  sense on the relationship-level field.
- `ACTIVITY_VISIBILITY` (`Visibilita`, Release 0.2.1, optional): Privata, Team, Management,
  Pubblica — a placeholder for when `System.gs`'s permission engine begins filtering activities; no
  permission logic reads it yet.

## 5. Generic Relationships (Relazioni)

`Relazioni` is a JSON array of `{tipo, id}` objects, complementary to the single generic reference
pair above — used when an activity must link to more than one additional arbitrary entity,
including entity types that do not exist in the schema yet (Proposta, Contratto, Documento,
Campagna, Evento Hospitality). Adding a new linkable entity type in the future requires zero schema
changes: just a new `tipo` value inside the array. Managed via `getActivityRelations_(activity)`
(safe parse, never throws) and `addActivityRelation_(activityId, tipo, id)` (append without
duplicates).

## 6. Recommended Metadata Structure

`Metadata` is a free-form JSON column; `ACTIVITY_METADATA_TEMPLATE` in `Activity.gs` documents (but
does not enforce) a recommended shape so that future modules do not each invent their own format:

```json
{
  "summary": "",
  "sentiment": "",
  "participants": [],
  "attachments": [],
  "emailThreadId": "",
  "calendarEventId": "",
  "nextSuggestedAction": "",
  "aiGenerated": false
}
```

No field is required and no code parses these specific keys today — this is guidance for the AI
Assistant, Notifications, and Analytics modules referenced in `docs/06_Roadmap/Roadmap.md`, so they
converge on one shape instead of diverging.

## 7. Read/Write API

- `logActivity_(fields)` — the single write path. All fields optional; sensible defaults (`Stato`
  defaults to Completata, `Origine` to Manuale, `Creato Da` falls back to `idUtente` or `'Sistema'`).
- `completeActivity_(activityId)` — marks a planned activity completed, stamping `Data
  Completamento`.
- `getActivityTimeline_(filters)` — the single read path, filterable by `idAzienda`, `idPersona`,
  `idTrattativa`, `idUtente`, the generic reference pair, a `relazione` object, `tipo`, `stato`,
  `origine`, `esito`, `visibilita`; always returns newest-first.
- `getActivityTags_(activity)` / `getActivityMetadata_(activity)` — safe accessors for the
  comma-separated `Tag` field and the JSON `Metadata` field respectively.

## Writing Guidelines

- Keep the field rationale (Section 3) intact when this document is updated — the *why* behind
  seemingly-redundant columns (`ID Utente` vs `Creato Da`, `Esito` vs `Esito Contatto`) is exactly
  the kind of thing a future contributor would otherwise "simplify" incorrectly.
- Any new controlled vocabulary value must be added here and to `Data.gs:LISTE_VALUES` in the same
  change.

## Notes for Future Contributors

- When `logActivity_()` is first called from a live workflow, update Section 1 and
  `docs/00_Project/FEATURE_REGISTRY.md`, and add a `docs/03_Data_Model/Timeline.md`-referenced
  example of the actual call site.
- If `Metadata`'s recommended structure (Section 6) is ever formally validated/enforced, document
  the validation rule in `docs/04_Business_Rules/` and link it from here.
