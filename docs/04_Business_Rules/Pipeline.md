# Pipeline Business Rules

## Title

Business Rules — Deduplication, Blacklist, and Pipeline Progression

## Purpose

This document specifies the deterministic rules that govern whether a candidate lead is accepted,
how it moves through the pipeline, and what side effects each transition triggers. It is the
reference for anyone modifying `Dedup.gs` or `Pipeline.gs`'s stage-transition logic, and for anyone
debugging "why was this lead rejected" or "why did this record change."

## When to Use It

- Before modifying blacklist, exclusive-sponsor, or duplicate-detection logic.
- Before modifying deal stage transitions or their side effects.
- When explaining to a commercial user why a specific lead was rejected.

## Table of Contents

1. Lead Evaluation Order
2. Blacklist Rules
3. Sponsor Exclusive Rules
4. Duplicate Detection Rules
5. Rejection Recording
6. Deal Stage Transitions and Side Effects
7. Weekly Archival Rule
8. Writing Guidelines
9. Notes for Future Contributors

---

## 1. Lead Evaluation Order

Every candidate lead passes through `Dedup.gs:evaluateNewLead_` in this fixed order: blacklist
check first, duplicate check second. A blacklist hit rejects immediately and duplicate checking is
skipped. This order is deliberate: blacklist reasons (compliance/reputational) are considered more
authoritative than duplicate reasons (operational) and should not be masked by a duplicate match
that might exist for an unrelated reason.

## 2. Blacklist Rules

`checkBlacklist_` matches a candidate against `Da Non Contattare`:

- `Tipo = Persona`: matched by normalized LinkedIn URL if both sides have one, else by normalized
  Nome+Cognome+Azienda.
- `Tipo = Settore`: matched by normalized sector name — stored, for schema-legacy reasons, in the
  block record's `Azienda` field (there is no dedicated sector column on `Da Non Contattare`).
- `Tipo = Azienda` / `Competitor` / `Esclusiva sponsor` / `Reputazionale`: matched by normalized
  company name.

A block is ignored if expired: `Livello Blocco = Temporaneo` and `Scadenza Blocco` is a past date
(`isBlockExpired_`). Permanent and to-be-verified blocks never expire automatically.

## 3. Sponsor Exclusive Rules

Independently of the blacklist, `checkBlacklist_` also checks active `Esclusive Sponsor` records
(`isExclusiveActive_`: today within `Data Inizio`/`Data Fine`, or unbounded if either is blank).
A candidate is rejected if its sector matches `Settore Bloccato`, or its company name matches any
comma-separated entry in `Competitor Da Evitare`.

## 4. Duplicate Detection Rules

`checkDuplicate_` only blocks on a **person**-level match: the same person (by LinkedIn URL, or by
Nome+Cognome+Azienda) already present in `Persone Gia Contattate` with a non-`Archiviato` status and
a last-contact date within the configured cooldown window (`dedupCooldownDays`, default 90 —
`Dashboard Config`). A company already in an open deal is **not** blocked — it only produces a
non-blocking warning attached to the accepted lead's `Note`, naming the current deal owner to
coordinate with, since a different person at an already-engaged company is a legitimate parallel
contact, not a duplicate.

## 5. Rejection Recording

A rejected candidate is never silently dropped: it is written to `Lead Scartati` with a
`Motivo Scarto` classification. The mapping from blacklist `Tipo` to `Motivo Scarto` is fixed in
`Dedup.gs:TIPO_BLOCCO_TO_MOTIVO_SCARTO` (e.g., `Tipo: Persona` → `Motivo Scarto: Reputazione
incerta`; `Tipo: Azienda`/`Competitor`/`Esclusiva sponsor` → `Competitor sponsor`). A duplicate
rejection always uses `Motivo Scarto: Duplicato`. The original free-text reason is preserved in the
`Note` field regardless of the classified bucket, so no detail is lost to the classification.

## 6. Deal Stage Transitions and Side Effects

`Pipeline.gs:moveTrattativaToFase_` updates `Fase` (and optionally `Probabilita`) with no
restriction on which stage transitions are allowed (any stage can move to any other stage). Moving
into either closing stage (`Chiusura vinta` or `Chiusura persa`) triggers
`syncAziendaEsitoChiusura_`, which upserts the company's `Aziende Gia Contattate` record: `Esito` is
set to `Chiuso` (won) or `Non interessato` (lost), and `Stato` to `Chiuso` (won) or `Follow up`
(lost) — a lost deal keeps the company in an actively-followable state rather than closing the
relationship outright.

Opening a deal from a lead (`createTrattativaFromLead_`) copies the lead's company/contact context
into the new `Trattative Aperte` row, defaults `Fase` to `Primo contatto` and `Probabilita` to
`20`, and marks the originating lead's `Stato` as `Interessato`.

## 7. Weekly Archival Rule

`Pipeline.gs:archiveOldLeads_` (invoked by the Monday 07:00 trigger, see
`docs/04_Business_Rules/Automation.md`) moves a `Lead Weekly` row to `Archivio Lead` if either: its
`Stato` is in `{Archiviato, Duplicato, Non interessato, Da non contattare}`, or its `Data
Inserimento` is older than the configured `archiveAfterDays` threshold (default 28). Both
conditions are evaluated independently — an old-but-still-active lead is archived by age alone.

## Writing Guidelines

- State every rule as a precise, testable condition (exact field, exact comparison), not a
  paraphrase — this document is meant to let a reader predict exact system behavior for a given
  input.
- When a rule has an intentional asymmetry (e.g., company-in-deal is a warning, person-in-contact is
  a block), explain the reasoning, not just the mechanics — the "why" is what prevents a future
  change from accidentally "fixing" an intentional design choice.

## Notes for Future Contributors

- If evaluation order (Section 1) ever changes, update this document first — it directly affects
  what rejection reason a user sees, which is user-facing behavior even though it's driven by
  backend logic.
- If deal stage transitions become restricted (e.g., disallowing skipping stages), document the new
  restriction here and update `docs/02_UX/Workspace_Trattativa.md`'s interaction model accordingly.
