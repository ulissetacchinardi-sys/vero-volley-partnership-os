# Automation Business Rules

## Title

Business Rules — Scheduled and Reactive Automation

## Purpose

This document specifies every automated (non-user-initiated) behavior in the system: scheduled
triggers, reactive spreadsheet-edit handling, and outreach side effects. It is the reference for
anyone modifying `Triggers.gs` or `Outreach.gs`, and for debugging "why did this happen without
anyone clicking a button."

## When to Use It

- Before modifying any trigger's schedule or handler.
- Before modifying outreach email, calendar, or Drive integration behavior.
- When investigating unexpected data changes with no corresponding UI action.

## Table of Contents

1. Installed Triggers
2. Weekly Maintenance
3. Reactive onEdit Sync
4. Outreach Email Side Effects
5. Follow-Up Scheduling Side Effects
6. Document Upload Side Effects
7. Writing Guidelines
8. Notes for Future Contributors

---

## 1. Installed Triggers

`Triggers.gs:installTriggers_()` installs exactly two triggers, after first removing any existing
ones with the same handler names (`uninstallTriggers_`, making installation idempotent — safe to
re-run):

- `weeklyMaintenance_` — time-based, every Monday at 07:00 (script timezone, `Europe/Rome`).
- `onEditInstallable_` — installable `onEdit` trigger bound to the CRM spreadsheet.

## 2. Weekly Maintenance

`weeklyMaintenance_()` runs `archiveOldLeads_()` (see
`docs/04_Business_Rules/Pipeline.md` Section 7), computes total open pipeline value (sum of every
Kanban column except the two closing stages), logs a summary to `Log Automazioni`, and — only if
`notificationRecipients` (`Dashboard Config`) is non-empty — emails each recipient a plain-text
summary via Gmail. No recipients configured means no email is sent; this is silent by design, not
an error condition.

## 3. Reactive onEdit Sync

`onEditInstallable_(e)` exists to keep `Persone Gia Contattate` synchronized even when a commercial
user changes a lead's `Stato` by editing the `Lead Weekly` sheet directly (not through the web app).
It is deliberately narrow:

- Ignored if the edit spans more than one cell (multi-cell paste, fill-down) — only single-cell
  edits trigger sync. A bulk edit must be redone through the web app to synchronize correctly.
- Ignored if the edited sheet is not `Lead Weekly`, the edited row is the header row, or the edited
  column is not `Stato`.
- Otherwise, calls the same `updateLeadStatus_()` used by the web app, so the synchronization logic
  (Section on Contact Sync in `docs/04_Business_Rules/Pipeline.md`... see `Pipeline.gs`) is not
  duplicated between the two entry points.
- Wrapped in try/catch logging to `console.error` — a failure here must never surface as a visible
  spreadsheet error to the editing user.

## 4. Outreach Email Side Effects

`sendOutreachEmail_(personaId, templateKey, overrides)` sends via `GmailApp.sendEmail` using one of
two named templates (`primoContatto`, `followUp`, in `OUTREACH_TEMPLATES`) with `{{placeholder}}`
substitution (`renderTemplate_`) from context (name, company, job title, LinkedIn URL, sending
user's email as `owner`). After sending, it always upserts (creates or updates) the person's
`Persone Gia Contattate` record: `Canale` set to `Email`, `Stato` to `Contattato`, `Esito` reset to
`Nessuna risposta`, timestamps updated. This means sending an email is never a "fire and forget"
action — it always leaves a durable contact-history trace.

## 5. Follow-Up Scheduling Side Effects

`createFollowUpEvent_(entityType, id, whenDate, title, details)` creates a 30-minute Google
Calendar event on the caller's default calendar with a 60-minute popup reminder, and always writes
the resulting date back to the source record's `Data Follow Up` field (routing to `trattativeAperte`,
`aziendeContattate`, `personeContattate`, or `leadWeekly` depending on `entityType`), keeping the
spreadsheet and the calendar in agreement.

Date handling rule: if `whenDate` contains no explicit time component (matched via `T\d{2}:\d{2}`),
the event defaults to 09:00 rather than midnight. If a time is present, it is honored exactly as
given. This exists because an earlier version unconditionally forced 09:00, silently discarding a
user-chosen time.

## 6. Document Upload Side Effects

`uploadAziendaDocument_(aziendaId, fileData)` decodes a base64 payload from the client, saves it
into a single dedicated Drive folder ("Vero Volley - CRM Archivio Documenti", created once and its
ID cached in `Dashboard Config.archivioFolderId`), and appends a `"filename: url"` link to the
`Documenti` field of **every** matching row for that company ID across both `Aziende Target` and
`Aziende Gia Contattate` (a company can have a row in both simultaneously — see
`docs/03_Data_Model/Relationships.md` Section 3). If the cached folder ID is no longer accessible
(e.g., manually deleted), a fresh folder is created transparently rather than failing.

## Writing Guidelines

- State every side effect explicitly, including ones that might seem "obvious" (e.g., sending an
  email also writes a contact record) — automation is exactly the place where an undocumented side
  effect causes the most confusing bugs.
- Note every silent-no-op condition (e.g., no notification recipients configured) so it is never
  mistaken for a failure during debugging.

## Notes for Future Contributors

- If a new trigger is added, document its schedule/binding here and add its handler name to
  `Triggers.gs:TRIGGER_HANDLERS` so `uninstallTriggers_` remains able to clean it up idempotently.
- If activity logging (`Activity.gs`) is wired into any of these automations, document the new
  `logActivity_()` call site here, including which `Origine` value it uses (per
  `docs/03_Data_Model/Activities.md`).
