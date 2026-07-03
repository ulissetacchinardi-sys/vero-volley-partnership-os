# Vero Volley Partnership OS — Documentation

## Title

Vero Volley Partnership OS — Repository Entry Point

## Purpose

This is the entry point for anyone joining the Vero Volley Partnership OS project — a developer,
an AI collaborator, or a stakeholder reviewing project state. It orients the reader before they
read anything else: what this software is, how the repository is organized, how the code and the
documentation relate to each other, and how work gets planned and shipped.

Current documentation version: **Blueprint v1.1**. See `docs/00_Project/CHANGELOG.md` for what
changed and `docs/00_Project/BLUEPRINT_REVIEW.md` for the review that prompted the v1.1 cleanup.

## When to Use It

- First document to read when joining the project.
- Reference when unsure which `docs/` folder covers a given question.
- Reference before starting any development workflow (setup, release, documentation update).

## Table of Contents

1. Project Overview
2. Folder Structure
3. Architecture Overview
4. Development Workflow
5. How Documentation Is Organized
6. How Releases Are Created
7. Relationship Between Blueprint and Implementation
8. Writing Guidelines
9. Notes for Future Contributors

---

## 1. Project Overview

Vero Volley Partnership OS is a Partnership Operating System for the commercial department of a
professional volleyball club (Vero Volley). It manages the full B2B sponsorship lifecycle:
prospecting, qualification/scoring, deduplication against blacklists and existing relationships,
pipeline/negotiation tracking, outreach execution, and (in progress) activity history and
multi-user ownership.

It is deliberately built entirely on Google Workspace: Google Sheets as the datastore, Google Apps
Script as the backend and web app host, Gmail/Calendar/Drive as outreach integrations. No paid
third-party tool is part of the architecture. This is a constraint carried forward from the
project's founding decision (see `docs/00_Project/Vision.md`), not an accident of scale.

The scope is explicitly B2B sponsor commercial activity. It does not cover fan engagement,
ticketing, membership, or athlete-facing systems.

## 2. Folder Structure

```
LINEKDIN CODEX/
├── Dashboard_AppsScript/        the live source code (Apps Script + HTML)
│   ├── Data.gs                  schema + generic CRUD (single source of truth)
│   ├── Dedup.gs, Scoring.gs, Pipeline.gs, Outreach.gs, Triggers.gs
│   ├── System.gs, Migration.gs, Activity.gs, Ownership.gs
│   ├── Code.gs                  web app entry point / controller layer
│   ├── Dashboard.html, View_*.html
│   ├── appsscript.json
│   └── README_Dashboard_AppsScript.txt   operational install/usage notes
├── 04_Output_Lead_Weekly/        historical pre-automation Excel reference (superseded)
├── 05_Blacklist_e_Storico_Contatti/  historical pre-automation Excel reference (superseded)
├── 06_Log_Automazioni/, 07_Archivio/  originally-planned local folders, superseded by Sheets/Drive
└── docs/                         this documentation framework
    ├── 00_Project/               what this is, how it's built, vocabulary
    ├── 01_Product/                who it's for, what it does, why
    ├── 02_UX/                      how each screen behaves
    ├── 03_Data_Model/               entities, relationships, ownership, activity, timeline
    ├── 04_Business_Rules/            pipeline, scoring, permissions, notifications, automation
    ├── 05_AI/                         AI Assistant, Sponsor Research, prompting conventions
    ├── 06_Roadmap/                     where the product is going
    └── 07_Releases/                     what shipped, release by release
```

## 3. Architecture Overview

See `docs/00_Project/ARCHITECTURE.md` for the full constitution. In summary: a single Google Sheet
is the datastore; a single Apps Script project is the backend; `Data.gs` is the schema and CRUD
single source of truth; every other backend module is a bounded-concern library consumed by
`Code.gs`, which is the only module the HTML frontend calls into via `google.script.run`. The
system grows by additive, narrowly-scoped sprints/releases, several of which introduce
fully-built-but-not-yet-wired infrastructure (roles/permissions, activity logging, ownership) ahead
of the features that will consume them.

## 4. Development Workflow

1. A unit of work is scoped as a Sprint (infrastructure) or Release (capability), with an explicit
   goal, an explicit list of files it may touch, and an explicit list of things it must not do.
2. Implementation follows `docs/00_Project/ARCHITECTURE.md` (coding standards, backward
   compatibility rules, naming conventions).
3. Because this environment has no automated test runner for Apps Script, verification is static:
   bracket/paren balance, duplicate top-level declaration checks, orphaned function-call checks,
   and file-timestamp diffs against the declared forbidden-files list.
4. A completion report is produced in the format requested (typically: files created/modified,
   schema changes, backward compatibility confirmation, future integration points, risks).
5. The relevant `docs/` files are updated in the same pass — documentation is not deferred to "a
   later cleanup."
6. Manual deployment steps (creating/pasting files in the Apps Script editor, running `setupCrm()`,
   publishing a web app deployment) are performed by a human; no tool in this environment has Apps
   Script API access to automate that step. See `Dashboard_AppsScript/README_Dashboard_AppsScript.txt`
   for the exact manual procedure.

## 5. How Documentation Is Organized

| Folder | Answers |
|---|---|
| `00_Project` | What is this, what are the rules, what do the words mean? |
| `01_Product` | Who is it for, what can they do, why does it matter? |
| `02_UX` | What does each screen/workspace actually do, screen by screen? |
| `03_Data_Model` | What entities exist, how do they relate, who owns what, what happened when? |
| `04_Business_Rules` | What logic governs pipeline movement, scoring, permissions, automation? |
| `05_AI` | How will AI features work, and how should prompts be written for this codebase? |
| `06_Roadmap` | What's next, what's backlogged, what's speculative? |
| `07_Releases` | What shipped, in which release, with what guarantees? |

As a rule of thumb: if a question is about *intent or design*, it belongs in `docs/`. If a question
is about *current literal behavior*, the source code in `Dashboard_AppsScript/` is authoritative,
and a mismatch against `docs/` is a documentation bug to fix.

## 6. How Releases Are Created

1. Define the release's single goal and write (or update) its `docs/07_Releases/Release_X.md`
   stub with that goal and scope before implementation starts.
2. Implement strictly within the declared file scope, following `ARCHITECTURE.md`.
3. Verify statically (see Section 4).
4. Fill in the release document with what was actually delivered: files touched, schema changes,
   compatibility confirmation, future integration points, and any deferred suggestions.
5. Update `docs/03_Data_Model/` and/or `docs/04_Business_Rules/` for any entity, field, or rule the
   release introduced.
6. If the release changes the roadmap (completes, defers, or supersedes a planned item), update
   `docs/06_Roadmap/Roadmap.md` accordingly.

## 7. Relationship Between Blueprint and Implementation

`docs/` is the blueprint: product intent, information architecture, data model, business rules,
and process. `Dashboard_AppsScript/` is the implementation: the literal, current, running code.

The blueprint is allowed to describe capability that does not exist yet — clearly marked as
planned, in `docs/06_Roadmap/` or in a not-yet-shipped `docs/07_Releases/` entry. The blueprint must
never silently claim that shipped behavior differs from what the code actually does; where a
`docs/03_Data_Model/` or `docs/04_Business_Rules/` file describes current state, that description
must match `Dashboard_AppsScript/` exactly at the time of writing.

When code and documentation disagree about *current* (not planned) behavior, treat it as a defect
and reconcile it immediately — do not assume either side is automatically correct.

## Writing Guidelines

- Write for a reader who has never seen this project: no unexplained acronyms, no assumed context
  from a prior conversation.
- Prefer concrete references (`Data.gs`, `HEADERS.leadWeekly`, `Activity.gs:logActivity_`) over
  vague ones ("the schema module").
- Keep this file a map, not an encyclopedia — details belong in the specific folder they concern.

## Notes for Future Contributors

- If a source-control system (e.g., Git/GitHub) is introduced, update Section 4 of this document —
  there is currently no dedicated branch-strategy section anywhere in `docs/` (a prior reference to
  one in `ARCHITECTURE.md` was removed when that document was restructured; define one at that
  point rather than assuming it still exists).
- If the historical folders (`04_Output_Lead_Weekly/`, `05_Blacklist_e_Storico_Contatti/`,
  `06_Log_Automazioni/`, `07_Archivio/`) are ever deleted or archived, update Section 2 to remove
  the stale references.
- Keep this README short. If it starts accumulating detail that belongs in a subfolder, move it and
  leave a pointer.
