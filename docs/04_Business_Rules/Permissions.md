# Permissions Business Rules

## Title

Business Rules — Roles and Permission Engine

## Purpose

This document specifies the role and permission model built in Sprint 1 (`System.gs`), its current
activation status, and the exact conditions under which it may be safely enabled. It is the
reference for any future release that turns on `SYSTEM_CONFIG.enforcePermissions`.

## When to Use It

- Before enabling `SYSTEM_CONFIG.enforcePermissions`.
- Before adding a new role or changing what an existing role can do.
- When explaining to a stakeholder what access control currently exists (answer: effectively none
  beyond Google Workspace's own sharing settings on the spreadsheet).

## Table of Contents

1. Status
2. Roles
3. Permission Matrix
4. Identity Resolution
5. Scoped Permission Evaluation
6. Activation Preconditions
7. Writing Guidelines
8. Notes for Future Contributors

---

## 1. Status

**Built, Unwired.** `SYSTEM_CONFIG.enforcePermissions = false` and
`SYSTEM_CONFIG.requireAuthentication = false`. Every function in `System.gs`
(`hasPermission`/`canView`/`canEdit`/`canDelete`/`canManage`) returns the most permissive answer
while these flags are false. No controller function in `Code.gs` calls any of them. This is a
deliberate infrastructure-first sequencing (`ARCHITECTURE.md` Section 4.6, Progressive
Enhancement), not an oversight.

## 2. Roles

`ROLES`, in ascending privilege order (`ROLE_ORDER`): `Sola Lettura` (Read Only), `Sales`,
`Manager`, `Amministratore` (Administrator). See `docs/01_Product/Users.md` for the persona-level
meaning of each.

## 3. Permission Matrix

`PERMISSIONS`, per role, per action (`view`/`edit`/`delete`: `'all' | 'team' | 'own' | 'none'`;
`manage`: boolean):

| Role | view | edit | delete | manage |
|---|---|---|---|---|
| Amministratore | all | all | all | true |
| Manager | team | team | team | false |
| Sales | own | own | none | false |
| Sola Lettura | own | none | none | false |

Note: `'team'` is currently evaluated identically to `'own'` (`evaluateScopedPermission_`), because
no concept of team membership/grouping exists yet — this is a documented placeholder, not a bug.

## 4. Identity Resolution

`getCurrentUserEmail_()` reads `Session.getActiveUser().getEmail()`, defensively returning `''` on
any failure (e.g., insufficient OAuth scope, execution context without a resolvable user).
`findUserByEmail_()` looks up the `Utenti` sheet by normalized email. `getCurrentUser()` composes
both, returning `null` if unresolvable. `getCurrentRole()` returns the resolved user's `Ruolo`, or
`SYSTEM_CONFIG.defaultRoleWhenUnresolved` (`Sola Lettura` — deliberately the most restrictive
default, never a permissive fallback) if the user cannot be resolved.

**Precondition not yet met**: reliable identity resolution requires the OAuth scope
`https://www.googleapis.com/auth/userinfo.email`, which is not yet present in `appsscript.json`
(not required today because this code path is not yet exercised in production), and requires the
web app deployment mode to be one where `Session.getActiveUser()` resolves per-viewer (see
`docs/04_Business_Rules/Permissions.md` Section 6).

## 5. Scoped Permission Evaluation

`evaluateScopedPermission_(action, ownerId)`: `'all'` → always true; `'none'`/undefined → always
false; `'own'`/`'team'` → true only if the resolved current user's `ID Utente` equals the record's
owner ID. This function is fully implemented and correct, but nothing calls it yet — it depends on
records actually having a populated owner ID, which itself depends on
`docs/03_Data_Model/Ownership.md`'s Sprint 2 fields being populated (also currently unwired).

## 6. Activation Preconditions

Enabling `SYSTEM_CONFIG.enforcePermissions` should not happen until, in order:

1. `appsscript.json` is updated with the `userinfo.email` OAuth scope, and the web app deployment
   mode is verified to resolve `Session.getActiveUser()` correctly per viewer (not just for the
   deploying account).
2. The `Utenti` sheet is populated with real users (via `Migration.gs:bootstrapUsersFromOwnerFields_`
   or direct entry), each with a correct `Ruolo`.
3. `Ownership.gs`'s `ID Utente Owner` field is populated on existing records (via
   `Migration.gs:backfillOwnerIdOnSheet_`, now runnable since Sprint 2 added the column — see
   `docs/03_Data_Model/Ownership.md`), so that `'own'`/`'team'` scoped checks have real data to
   evaluate against instead of universally failing closed.
4. `Code.gs`'s controller functions are updated to actually call `canView`/`canEdit`/`canDelete`/
   `canManage` at the appropriate points — this is itself a scoped release, not a side effect of
   flipping the flag.

Flipping the flag before these preconditions are met would make the system fail closed (nothing
resolves to an owner, so `'own'`/`'team'` checks return false for everyone), effectively breaking
the app rather than securing it.

## Writing Guidelines

- Always state activation preconditions as an ordered list with a stated failure mode if skipped —
  "just flip the flag" is exactly the mistake this document exists to prevent.
- Keep Section 3's table in exact sync with `System.gs:PERMISSIONS`.

## Notes for Future Contributors

- When any precondition in Section 6 is met, update this document to check it off explicitly rather
  than leaving the reader to guess current readiness.
- When `enforcePermissions` is actually flipped to `true`, this document's Section 1 status and
  `docs/01_Product/Users.md` Section 6 must both be updated in the same change.
