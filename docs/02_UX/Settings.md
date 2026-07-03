# Settings

## Title

UX Specification — Settings

## Purpose

This document specifies where system configuration currently lives, since there is no dedicated
"Settings" screen today — configuration is split between the Dashboard tab's weekly-settings form
and direct edits to the `Dashboard Config` sheet. It exists so a future dedicated Settings screen is
scoped against a clear inventory of what actually needs to be configurable.

## When to Use It

- Before building a dedicated Settings UI.
- When looking for where a given piece of system configuration is currently set.

## Table of Contents

1. Current State
2. Configuration Inventory
3. Gap
4. Planned Scope
5. Writing Guidelines
6. Notes for Future Contributors

---

## 1. Current State

There is no dedicated Settings tab in `Dashboard.html`. Two configuration surfaces exist today:

- **Weekly commercial settings** (territory, sector, focus, lead count) — set via the Dashboard
  tab's form (`saveWeeklySettings`), documented in `docs/02_UX/Dashboard.md` Section 4.
- **System-level configuration** — stored as key/value rows in the `Dashboard Config` sheet
  (`getConfigValue_`/`setConfigValue_` in `Data.gs`), set either by direct spreadsheet edit or by
  code defaults applied once during `setupCrm()`.

## 2. Configuration Inventory

| Key | Meaning | Set by |
|---|---|---|
| `crmStatus` | Marks the CRM as initialized | `setupCrm()`, automatic |
| `dedupCooldownDays` | Days before a previously-contacted person can be treated as a fresh lead | `setupCrm()` default (90), editable only via direct sheet edit today |
| `archiveAfterDays` | Age threshold for automatic lead archival | `setupCrm()` default (28), editable only via direct sheet edit today |
| `activeWeek`/`activeTerritory`/`activeSector`/`activeFocus`/`activeLeadCount` | Current week's prospecting defaults | Dashboard tab's weekly settings form |
| `notificationRecipients` | Comma-separated emails for the weekly maintenance reminder | Direct sheet edit only today |
| `archivioFolderId` | Drive folder ID for uploaded documents | Set automatically on first upload |

## 3. Gap

Every system-level key above except the weekly commercial settings requires a direct edit to the
`Dashboard Config` sheet — there is no UI for an administrator to change the dedup cooldown,
archive threshold, or notification recipients without opening the spreadsheet directly and knowing
the exact key name.

## 4. Planned Scope

A dedicated Settings screen, gated to the Administrator role once `System.gs`'s permission
enforcement is active (`canManage()`), exposing: dedup cooldown, archive threshold, notification
recipients, and — once `Ownership.gs`/`System.gs` are wired — user and role management (today only
possible via direct edits to the `Utenti` sheet and manual runs of `Migration.gs` functions).

## Writing Guidelines

- Keep Section 2's table as the single authoritative list of `Dashboard Config` keys — update it in
  the same change that introduces a new key anywhere in the codebase.
- Do not imply a Settings UI exists; be explicit that configuration today means editing the
  spreadsheet directly, so a new contributor doesn't go looking for a screen that isn't there.

## Notes for Future Contributors

- When a Settings screen is built, this document becomes that screen's specification (following the
  same structure as `docs/02_UX/Dashboard.md`) rather than a "gap analysis" — rewrite accordingly at
  that point instead of appending to it indefinitely.
- Every new `Dashboard Config` key introduced by any future module must be added to Section 2 in
  the same change, regardless of whether a Settings UI exists yet to expose it.
