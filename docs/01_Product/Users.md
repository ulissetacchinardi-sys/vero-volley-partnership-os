# Users

## Title

Vero Volley Partnership OS — Users and Roles

## Purpose

This document defines who uses the system, what they need from it, and how that maps to the role
model already scaffolded in `System.gs` (Sprint 1) and the ownership model scaffolded in
`Ownership.gs` (Sprint 2). It is the product-level counterpart to the technical role/permission
definitions in `docs/04_Business_Rules/Permissions.md`.

## When to Use It

- When designing a new UI surface, to know which user persona it primarily serves.
- When deciding what a new role should be able to do before wiring the permission engine.
- When writing onboarding material for a new commercial hire.

## Table of Contents

1. Role Model
2. Persona: Commercial / Sales
3. Persona: Commercial Manager
4. Persona: Administrator
5. Persona: Read-Only Stakeholder
6. Current vs. Planned Access Control
7. Writing Guidelines
8. Notes for Future Contributors

---

## 1. Role Model

Four roles are defined in `System.gs`'s `ROLES` constant, in ascending order of privilege
(`ROLE_ORDER`): `Sola Lettura` (Read Only), `Sales`, `Manager`, `Amministratore` (Administrator).
Today these roles exist as data and as a fully-specified permission matrix (`PERMISSIONS`), but
`SYSTEM_CONFIG.enforcePermissions` is `false` — no role currently restricts anything. This section
describes the *intended* meaning of each role; enforcement is tracked separately in the roadmap.

## 2. Persona: Commercial / Sales

**Who**: A commercial team member responsible for prospecting and closing sponsor deals.

**Needs**: Enter/import leads quickly; trust that scoring and deduplication are automatic; see
their own pipeline clearly; send outreach and log follow-ups without leaving the tool.

**Intended access** (`PERMISSIONS[ROLES.SALES]`): view/edit own records only; cannot delete;
cannot manage system settings or users.

## 3. Persona: Commercial Manager

**Who**: Oversees the commercial team's overall pipeline and performance.

**Needs**: See the whole team's pipeline and funnel, not just their own; reassign ownership of a
lead or deal when workload shifts; understand where deals are stalling.

**Intended access** (`PERMISSIONS[ROLES.MANAGER]`): view/edit team-scoped records (today
equivalent to "own" — see `docs/04_Business_Rules/Permissions.md` for why); cannot manage system
settings or users.

## 4. Persona: Administrator

**Who**: Whoever is responsible for the system's configuration — in practice, likely the same
person as the Commercial Manager, wearing a different hat.

**Needs**: Manage users and roles; configure system-wide settings (dedup cooldown window, archive
age threshold, notification recipients); run one-off maintenance and migrations.

**Intended access** (`PERMISSIONS[ROLES.ADMIN]`): full view/edit/delete on all records, plus
`manage: true` (user/settings administration).

## 5. Persona: Read-Only Stakeholder

**Who**: Someone (e.g., club leadership) who needs visibility into commercial pipeline health
without editing rights.

**Needs**: See dashboards and pipeline value; never accidentally change data.

**Intended access** (`PERMISSIONS[ROLES.READ_ONLY]`): view own/assigned records only, no edit, no
delete. This is also the safe default role assigned when a user's identity cannot be resolved to a
role (`SYSTEM_CONFIG.defaultRoleWhenUnresolved`).

## 6. Current vs. Planned Access Control

| Capability | Current State | Planned |
|---|---|---|
| Role definition | Fully specified (`ROLES`, `PERMISSIONS`) | No change needed |
| Role enforcement | Off (`enforcePermissions: false`) | Enabled in a future release once ownership data is populated |
| Identity resolution | Implemented (`getCurrentUser`/`getCurrentRole`), not required anywhere | Required once enforcement is enabled |
| Ownership-based scoping | Data model ready (`Ownership.gs`), unused | Wired into `canView`/`canEdit` scoped checks |

## Writing Guidelines

- Describe personas by need and workflow, not by job title alone — titles vary by organization,
  needs do not.
- Whenever describing "intended access," cite the exact `System.gs` constant it maps to, so this
  document cannot silently drift from the code it describes.

## Notes for Future Contributors

- When permission enforcement is actually turned on, update Section 6's "Current State" column in
  the same change — this table exists specifically to prevent "planned" and "current" from getting
  confused after the fact.
- If a fifth role is ever introduced, add it here and to `docs/04_Business_Rules/Permissions.md` in
  the same change as the `System.gs` update.
