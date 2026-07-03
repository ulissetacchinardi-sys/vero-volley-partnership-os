# Glossary

## Title

Vero Volley Partnership OS — Glossary

## Purpose

This document defines every domain term and technical term used consistently across the codebase
and documentation, in both Italian (as it appears in the schema and UI) and English (as it appears
in code and docs). A shared vocabulary prevents drift between what the code calls something, what
the documentation calls it, and what a commercial-team user calls it.

## When to Use It

- When writing or reading any other `docs/` file and encountering an unfamiliar term.
- When naming a new field, function, or concept — check here first for an existing equivalent
  before inventing a new term.
- When translating a task specification (often given in English) into schema field names (always
  in Italian — this is a project-wide schema convention, see Section 6 for how it maps to the
  English product vocabulary used in `01_Product/User_Journey.md` and the `02_UX/` workspace docs).

## Table of Contents

1. Domain Entities
2. Pipeline & Status Vocabulary
3. Ownership & Collaboration Vocabulary
4. Activity Vocabulary
5. System & Infrastructure Vocabulary
6. Layer A / Layer B Terminology Bridge
7. Writing Guidelines
8. Notes for Future Contributors

---

## 1. Domain Entities

| Italian (schema) | English | Definition |
|---|---|---|
| Lead | Lead | A candidate sponsor contact under initial evaluation, row in "Lead Weekly". |
| Azienda | Company | A prospective or engaged sponsor organization. |
| Persona | Person / Contact | An individual contact at a company. |
| Trattativa | Deal | An open sponsorship negotiation/opportunity in the pipeline. |
| Esclusiva Sponsor | Sponsor Exclusive | An active exclusivity clause blocking a sector/competitor from being contacted. |
| Blocco (Da Non Contattare) | Blacklist Entry | A company, person, or sector that must not be contacted. |
| Utente | User | A Google Workspace identity registered in the CRM's user model (Sprint 1+). |
| Attivita | Activity | A single logged interaction/event on the timeline (Release 0.2+). |

## 2. Pipeline & Status Vocabulary

| Italian | English | Notes |
|---|---|---|
| Sponsor Fit Score | Sponsor Fit Score | 0–100 rules-based fit score, see `Scoring.gs`. |
| Priorita | Priority | A/B/C/Escludere, derived from the score via `PRIORITY_THRESHOLDS`. |
| Fase (Trattativa) | Deal Stage | One of `Fase Trattativa` in `LISTE_VALUES` (Primo contatto → Chiusura vinta/persa). |
| Stato (Lead) | Lead Status | One of `Stato Lead` (Nuovo → Archiviato). |
| Esito (Contatto) | Contact Outcome | Relationship-level outcome on Aziende/Persone Gia Contattate. |
| Motivo Scarto | Rejection Reason | Why a candidate lead was rejected before entering Lead Weekly. |

## 3. Ownership & Collaboration Vocabulary

| Italian | English | Notes |
|---|---|---|
| Owner | Owner | Legacy free-text field, human-readable name of the responsible commercial. |
| ID Utente Owner | Owner User ID | FK to `Utenti`, the real ownership field introduced in Sprint 2. |
| Collaboratori | Collaborators | JSON list of `{id, ruolo}` granting shared access to a record. |
| Visibilita | Visibility | Privata / Team / Management / Pubblica — who may see a record. |
| Storico Assegnazioni | Assignment History | JSON list of `{previousOwner, timestamp, actor}` per ownership change. |
| Editor / Visualizzatore | Editor / Viewer | The two collaborator roles (`COLLABORATOR_ROLE`). |

## 4. Activity Vocabulary

| Italian | English | Notes |
|---|---|---|
| Tipo (Attivita) | Activity Type | Chiamata, Email, Riunione, Nota, ... (`ACTIVITY_TYPES`). |
| Origine | Source | How the activity was created: Manuale, Email, Calendario, Import, Workflow, AI, Sistema. |
| Esito (Attivita) | Activity Outcome | Result of a single interaction, distinct from relationship-level "Esito Contatto". |
| Relazioni | Relations | Generic, repeatable `{tipo, id}` links from an activity to any current or future entity. |
| Metadata | Metadata | Free-form JSON payload on an activity; recommended shape documented in `Activity.gs`. |

## 5. System & Infrastructure Vocabulary

| Italian | English | Notes |
|---|---|---|
| Ruolo | Role | Amministratore / Manager / Sales / Sola Lettura (`ROLES`). |
| Motore Permessi | Permission Engine | `System.gs`'s `hasPermission`/`canView`/`canEdit`/`canDelete`/`canManage`, currently inert. |
| Workspace Personale | Personal Workspace | Planned: a user's owned-record view (`Ownership.gs`'s `getOwnedRecords_`). |
| Workspace Team | Team Workspace | Planned: a manager's team-scoped aggregate view. |

## 6. Layer A / Layer B Terminology Bridge

The technical documentation (schema, business rules, data model — grounded in `Data.gs`) and the
product vision documentation (`ARCHITECTURE.md`, `01_Product/User_Journey.md`,
`02_UX/{Dashboard,Workspace_Azienda,Workspace_Trattativa}.md`, `03_Data_Model/Entities.md`) use two
different vocabularies for several of the same underlying concepts, introduced independently. As of
Blueprint v1.1 (see `docs/00_Project/CHANGELOG.md`), this table is the single authoritative mapping
between them — added specifically to resolve the terminology inconsistencies identified in
`docs/00_Project/BLUEPRINT_REVIEW.md`.

| Schema term (Italian, `Data.gs`) | Product vocabulary (English, vision docs) | Notes |
|---|---|---|
| Azienda | Company | Same entity; `Workspace_Azienda.md` describes the "Company Workspace" for this entity. |
| Persona | Contact | Same entity. A "Stakeholder" (vision docs) is a Contact considered in the context of one specific Opportunity/Trattativa — not a separate entity in the schema today. |
| Trattativa | Opportunity, Deal | Same entity; `Workspace_Trattativa.md` describes the "Opportunity Workspace" for this entity. "Deal" (used in `Glossary.md` Section 2) and "Opportunity" (used in the vision docs) both refer to Trattativa — no third concept is intended. |
| Owner (free-text) / ID Utente Owner | Owner, Commercial Owner | Same concept at two levels of implementation maturity — see `03_Data_Model/Ownership.md`. |
| Esito Contatto / Esito Attivita | Outcome | The vision docs' generic "Outcome" fields (e.g., on Match/Hospitality activities) are not yet mapped to a specific schema field; see `docs/00_Project/BLUEPRINT_REVIEW.md` Weakness #10 for the open duplication this table does not yet fully resolve. |
| Sponsor Fit Score (`Scoring.gs`, deterministic) | Sponsor Score (vision docs, AI-framed) | These are two distinct, currently-unreconciled concepts, not synonyms — do not treat them as the same field. See `04_Business_Rules/Scoring.md` and `docs/00_Project/BLUEPRINT_REVIEW.md` Weakness #10. |
| (no schema equivalent) | Partner | Vision-docs term for a company with an active sponsorship agreement; closest schema concept is `Stato Contatto = Chiuso` on an Azienda Gia Contattata record, not formally aliased. |

This table does not introduce any new entity, field, or feature — it only records the mapping
between names already in use across the two vocabularies.

## Writing Guidelines

- New terms are added here in the same change that introduces them in the schema or code — not
  retroactively.
- Always give both the exact Italian schema string and its English gloss; the Italian string is
  the one that must match `HEADERS`/`LISTE_VALUES` character-for-character.
- Do not define implementation detail here (that belongs in `03_Data_Model/`); this file defines
  words, not structures.

## Notes for Future Contributors

- If a term's meaning changes (e.g., "Esito" gains a new sense in a future module), add a new row
  disambiguating it rather than editing the old row's meaning — history of terminology matters when
  reading old release notes.
- Keep this alphabetized within each table as it grows past a handful of rows, for scanability.
- Update Section 6 whenever a new vision-doc term is introduced or a duplicate concept (like
  Sponsor Fit Score / Sponsor Score) gets reconciled — that table is now the single place this
  project tracks whether the two vocabularies agree.
