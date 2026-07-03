# Analytics

## Title

UX Specification — Analytics

## Purpose

This document specifies the current, minimal analytics surface (embedded in the Dashboard tab) and
the planned dedicated analytics view. It exists so that "Analytics" as a distinct screen is
scoped deliberately rather than organically bolted onto the Dashboard tab over time.

## When to Use It

- Before adding a new metric anywhere in the app, to decide whether it belongs on the existing
  Dashboard tab or in a future dedicated Analytics view.
- When scoping the Analytics release referenced in the roadmap.

## Table of Contents

1. Current State
2. Gap
3. Planned Scope
4. Data Availability for Planned Metrics
5. Writing Guidelines
6. Notes for Future Contributors

---

## 1. Current State

There is no dedicated "Analytics" tab today. All current metrics live inside the Dashboard/Overview
tab: headline totals, priority/status breakdowns, top sectors/regions, and the five-stage
conversion funnel (see `docs/02_UX/Dashboard.md`). These are global, unfiltered by owner or team.

## 2. Gap

The product vision anticipates manager-level reporting (pipeline value by stage, performance by
sector/territory/owner — see `docs/01_Product/Product_Vision.md` Section 5). None of this is
currently filterable by owner or time period beyond what the existing global metrics happen to
show.

## 3. Planned Scope

A dedicated Analytics view is expected to add: pipeline value trends over time, performance
breakdown by owner/team (once `Ownership.gs` is wired into a live workflow), and win/loss rate
analysis by sector, territory, and deal stage duration (once `Activity.gs` accumulates enough
stage-transition history to compute duration).

## 4. Data Availability for Planned Metrics

| Planned metric | Data available today? |
|---|---|
| Pipeline value by stage | Yes — `getPipelineBoard_()` already computes this per column. |
| Performance by owner | Partially — `Owner` free-text field exists; `ID Utente Owner` exists but is unpopulated (Sprint 2, unwired). |
| Win/loss rate by sector | Yes — derivable from `Trattative Aperte`'s `Fase` + `Settore` today, just not surfaced. |
| Stage duration / time-in-stage | No — requires stage-transition history, which `Activity.gs` can provide once deal-stage moves start calling `logActivity_`. |

## Writing Guidelines

- Do not describe a planned metric as available without checking Section 4 first — this table
  exists specifically to prevent optimistic overstatement of what analytics work is "just a UI
  change" versus what requires new data collection first.

## Notes for Future Contributors

- When a dedicated Analytics tab is built, split this document's "Planned Scope" content into the
  same structure as `docs/02_UX/Dashboard.md` (Screen Purpose, Layout, Data Sources, ...) and move
  Section 1's content into `docs/02_UX/Dashboard.md`'s history if the metrics move off that tab.
- Update Section 4 the moment any prerequisite (e.g., ownership wiring) ships, even if the
  Analytics feature itself is still not built — the table's value is tracking prerequisite
  readiness independently of the feature's own timeline.
