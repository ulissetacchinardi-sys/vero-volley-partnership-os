# Ownership

## Title

Data Model — Ownership

## Purpose

This document specifies the ownership and collaboration data model introduced in Sprint 2
(`Ownership.gs`), covering the fields it added, the engine functions available, and — critically —
its current activation status. It is the reference for any future release that wires ownership into
a live workflow (dashboards, permissions, notifications).

## When to Use It

- Before calling any `Ownership.gs` function from a new release.
- Before wiring `System.gs`'s permission engine to ownership-scoped checks.
- Before designing a Personal or Manager dashboard.

## Table of Contents

1. Status
2. Ownership-Enabled Sheets
3. Fields
4. Constants
5. Engine Functions
6. Assignment History Mechanics
7. Access Check Semantics
8. Writing Guidelines
9. Notes for Future Contributors

---

## 1. Status

**Built, Unwired** (see `docs/00_Project/FEATURE_REGISTRY.md`). Every function and field described here
exists and is verified correct, but nothing in `Code.gs`, any `View_*.html`, `Dedup.gs`,
`Scoring.gs`, `Pipeline.gs`, `Outreach.gs`, `Triggers.gs`, or `System.gs` calls into `Ownership.gs`
or reads its columns. All ownership columns are blank on every existing row until a future release
explicitly populates them.

## 2. Ownership-Enabled Sheets

Defined in `Ownership.gs:OWNERSHIP_ENABLED_SHEETS`: `leadWeekly`, `aziendeTarget`,
`aziendeContattate`, `personeContattate`, `trattativeAperte`. Every `Ownership.gs` function
rejects any other `sheetKey` (`assertOwnershipEnabled_`), to prevent accidentally writing ownership
columns to a sheet that does not have them (e.g., `Utenti`, `Attivita`).

## 3. Fields

Added to all five sheets: `ID Utente Owner` (FK to `Utenti`), `Collaboratori` (JSON array of
`{id, ruolo}`), `Visibilita` (enum, see Section 4), `Data Assegnazione` (timestamp of the most
recent owner assignment/change), `Storico Assegnazioni` (JSON array of `{previousOwner, timestamp,
actor}`, one entry per ownership change).

`trattativeAperte` additionally has `Ultima Riassegnazione` — a plain, human-readable timestamp of
the last reassignment, kept separate from the JSON history field for spreadsheet readability, in
line with `ARCHITECTURE.md`'s "human-readable alongside machine-readable" principle.

`Storico Assegnazioni` exists on all five sheets even though only `trattativeAperte`'s
`Ultima Riassegnazione` was named explicitly in the original task specification for this field —
it was added to the other four sheets so that `changeOwner_()` has somewhere to persist history
generically, regardless of which sheet it is called against.

## 4. Constants

- `OWNER_VISIBILITY`: `PRIVATE` (Privata), `TEAM` (Team), `MANAGEMENT` (Management), `PUBLIC`
  (Pubblica). Validated in `Data.gs` against `Liste` column `Visibilita Ownership` — kept as a
  separate list from `Visibilita Attivita` (used by the Activity Engine) even though the values are
  currently identical, since a business-record's visibility and a timeline entry's visibility are
  conceptually distinct and may diverge in future.
- `COLLABORATOR_ROLE`: `EDITOR` (Editor), `VIEWER` (Visualizzatore).

## 5. Engine Functions

| Function | Purpose |
|---|---|
| `getOwner_(sheetKey, recordId)` | Current owner's user ID, or `''`. |
| `assignOwner_(sheetKey, recordId, ownerId, actor)` | First assignment / direct overwrite, no history entry recorded (no "previous" to record meaningfully). |
| `changeOwner_(sheetKey, recordId, newOwnerId, actor)` | Reassignment: appends `{previousOwner, timestamp, actor}` to `Storico Assegnazioni`, updates `ID Utente Owner`/`Data Assegnazione`, and `Ultima Riassegnazione` if the sheet has that column. |
| `getCollaborators_(sheetKey, recordId)` | Parsed `Collaboratori` array. |
| `addCollaborator_(sheetKey, recordId, userId, role)` | Adds or updates a collaborator's role, no duplicates. |
| `removeCollaborator_(sheetKey, recordId, userId)` | Removes a collaborator. |
| `getAssignmentHistory_(sheetKey, recordId)` | Parsed `Storico Assegnazioni` array. |
| `canUserAccessRecord_(sheetKey, recordId, userId)` | See Section 7. |
| `getOwnedRecords_(sheetKey, userId)` | All records owned by a user — building block for a Personal Dashboard. |
| `getSharedRecords_(sheetKey, userId)` | All records where the user is a collaborator but not the owner. |
| `getVisibleRecords_(sheetKey, userId, role)` | Union of owned + shared + publicly visible — building block for a Manager Dashboard; `role` is a reserved, currently-unused parameter for future team-scope logic. |

## 6. Assignment History Mechanics

`changeOwner_()` reads the record's *current* owner before overwriting it, appends
`{previousOwner, timestamp, actor}` to the existing (parsed, defensively) history array, and writes
the updated array back as a JSON string in a single `updateRecordById_` call alongside the new
owner and timestamp. `assignOwner_()` deliberately does not touch history — it is meant for the
"no owner yet" case, where recording a "previous owner of none" is not meaningful information.

The history array has no size cap today — tracked as a risk to monitor, not yet a problem at
current volumes, in `docs/06_Roadmap/Backlog.md` Section 2 (Performance & Scale).

## 7. Access Check Semantics

`canUserAccessRecord_(sheetKey, recordId, userId)` returns `true` if the user is the record's
owner, is listed in `Collaboratori` (any role), or the record's `Visibilita` is `Pubblica`.
It is explicitly **not** the permission engine — it does not know about roles
(`System.gs:ROLES`/`PERMISSIONS`) and does not implement a real "Team" concept (a `Team`/`Management`
visibility value today behaves identically to requiring owner-or-collaborator status, since no
grouping of users into teams exists yet). It is designed to be called *from* a future enhancement
to `System.gs`'s scoped permission checks, not to replace them.

## Writing Guidelines

- Keep this document's field/function list in exact sync with `Ownership.gs` — this file is
  effectively that module's docstring, expanded.
- When documenting activation status, be explicit and current (Section 1) — this is the fact most
  likely to change and most important not to get stale.

## Notes for Future Contributors

- When any `Ownership.gs` function is first called from a live workflow, update Section 1's status
  from "Built, Unwired" to describe exactly which workflow now depends on it, and update
  `docs/00_Project/FEATURE_REGISTRY.md` in the same change.
- When a real "Team" concept is introduced, update Section 7 to describe the new semantics of
  `Visibilita = Team`, and update `docs/01_Product/Users.md` Section 6 accordingly.
