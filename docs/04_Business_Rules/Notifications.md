# Notifications Business Rules

## Title

Business Rules — Notifications

## Purpose

This document specifies the one notification mechanism that exists today and the planned,
richer notification system that the Activity and Ownership engines are designed to support. It
exists to prevent "notifications" from being built ad hoc across multiple future releases without
a shared model.

## When to Use It

- Before adding any new notification/reminder mechanism.
- Before wiring `Activity.gs`'s planned/due activities into an alerting surface.

## Table of Contents

1. Current State
2. Gap
3. Planned Model
4. Planned Triggers
5. Delivery Channel
6. Writing Guidelines
7. Notes for Future Contributors

---

## 1. Current State

The only notification in the system today is the weekly maintenance email
(`Triggers.gs:weeklyMaintenance_`, see `docs/04_Business_Rules/Automation.md` Section 2): a static,
scheduled, plain-text summary sent to whichever addresses are configured in `Dashboard
Config.notificationRecipients`. It is not personalized, not owner-scoped, and not tied to any
specific record.

Calendar follow-up reminders (`Outreach.gs:createFollowUpEvent_`) are the other de facto
notification path today — a 60-minute Google Calendar popup reminder — but this is a side effect of
scheduling a follow-up, not a general-purpose notification system.

## 2. Gap

There is no per-user, per-record notification (e.g., "a deal assigned to you has been idle for 10
days," "a collaborator added you to a lead," "an activity you logged is now overdue"). Building
these requires both the Ownership Engine (to know *who* to notify) and the Activity Engine (to know
*what* is due), which as of Sprint 2 both exist but are unwired (see
`docs/03_Data_Model/Ownership.md`, `docs/03_Data_Model/Activities.md`).

## 3. Planned Model

A future Notifications module should be able to answer, for a given user: "which activities
assigned to or associated with me (`Activity.gs`'s `idUtente`, or ownership via `Ownership.gs`'s
`getOwnedRecords_`/`getVisibleRecords_`) have `Stato: Pianificata` and a `Data Scadenza` at or before
now/soon." This is a read-only composition of the two existing engines — it should not require new
schema, only a new query and a delivery mechanism.

## 4. Planned Triggers

Candidate notification triggers, once the model above exists: an activity's `Data Scadenza`
approaching or passing while still `Pianificata`; an ownership change
(`Ownership.gs:changeOwner_`) affecting a record the new owner did not know about; a collaborator
being added (`Ownership.gs:addCollaborator_`).

## 5. Delivery Channel

The only zero-cost delivery channel available in this architecture is Gmail
(`GmailApp.sendEmail`), as already used for the weekly maintenance summary. Any future in-app
notification (e.g., a badge in `Dashboard.html`) would need to be computed on page load from the
same underlying query, since there is no persistent server process to push notifications
proactively — Apps Script triggers are the only "background" execution model available.

## Writing Guidelines

- Do not describe planned notification behavior as if it exists — Section 1 is exhaustive of
  current behavior; everything else in this document is explicitly planned, and must stay marked
  as such until implemented.
- When scoping an actual notifications release, replace Sections 3–5 with the real, shipped
  specification rather than leaving them as forward-looking prose.

## Notes for Future Contributors

- When any planned trigger (Section 4) is implemented, move it to a new "Current State" section and
  update `docs/00_Project/FEATURE_REGISTRY.md`.
- If a delivery channel other than Gmail becomes available (e.g., a chat webhook), document it here
  before wiring it in, since it affects the zero-paid-tools constraint in
  `docs/00_Project/Vision.md` and should be checked against that constraint first.
