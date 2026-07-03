# Vision

## Title

Vero Volley Partnership OS — Project Vision

## Purpose

This document captures why this project exists, the founding constraints it was built under, and
the trajectory it is on. It exists so that every future scoping decision can be checked against the
original intent instead of drifting toward "generic CRM" by default.

## When to Use It

- When evaluating whether a proposed feature belongs in this product.
- When a new contributor asks "why doesn't this just use [paid CRM product]?"
- When prioritizing the roadmap (`docs/06_Roadmap/Roadmap.md`).

## Table of Contents

1. Origin
2. Founding Constraints
3. What This Product Is
4. What This Product Is Not
5. Long-Term Trajectory
6. Writing Guidelines
7. Notes for Future Contributors

---

## 1. Origin

Vero Volley needed a system to run its B2B sponsor commercial pipeline: prospecting, qualifying,
tracking negotiations, and managing the relationship lifecycle with existing and prospective
sponsors. Before this project, this work was spread across manually maintained spreadsheets with no
deduplication, no scoring, no pipeline visibility, and no automation.

Three build paths were evaluated: adopting a market CRM (HubSpot, Salesforce, Pipedrive, Zoho),
building on a Google Workspace low-code layer (AppSheet), or building a custom application directly
on Apps Script and Sheets. The third path — this project — was chosen deliberately.

## 2. Founding Constraints

These constraints are permanent unless explicitly revisited and changed at the vision level, not
worked around silently at the implementation level:

- **No paid tools.** The system must run entirely on the Google Workspace subscription the club
  already has. No CRM SaaS subscription, no paid API, no paid automation platform.
- **Google Workspace only.** Apps Script, Sheets, Gmail, Calendar, Drive. Not AppSheet (tier
  availability was not guaranteed at project start), not a self-hosted server, not a separate
  cloud database.
- **B2B sponsor scope only.** Fan engagement, ticketing, membership, and athlete-facing systems are
  explicitly out of scope. This is a commercial department tool, not a whole-club platform.
- **No LinkedIn scraping or automated lead harvesting.** Lead entry is manual by design, for
  compliance reasons. This is a deliberate product boundary, not a missing feature.

## 3. What This Product Is

A Partnership Operating System: a single place where the commercial team can prospect sponsors,
see automatically-computed fit scores and priorities, avoid re-contacting blocked or already-engaged
companies and people, run a visual negotiation pipeline, execute outreach (email, calendar
follow-ups, document attachments) without leaving the tool, and — as the ownership and activity
layers come online — see who owns which relationship and what has happened on it over time.

The long-term ambition, reflected in the roadmap, is for this to become the operating system for
the entire partnership function: not just prospecting and pipeline, but proposal generation,
hospitality/event management, business community relationship tracking, and AI-assisted research
and drafting — all still running on the same zero-cost Google Workspace foundation.

## 4. What This Product Is Not

- Not a generic, configurable CRM platform for arbitrary industries.
- Not a fan CRM, ticketing system, or membership platform.
- Not a lead-generation or scraping tool.
- Not dependent on any paid SaaS subscription for its core functionality.

## 5. Long-Term Trajectory

The product grows in the following broad arc (see `docs/06_Roadmap/Roadmap.md` for the current,
maintained version of this list):

1. Data foundation and automation (deduplication, scoring, pipeline) — shipped.
2. Outreach integration (Gmail, Calendar, Drive) — shipped.
3. Multi-user infrastructure (identity, roles, permissions, ownership, activity history) — in
   progress, built ahead of activation by design.
4. Multi-user activation (dashboards scoped by owner/team, enforced permissions).
5. AI-assisted capability (sponsor research, drafting, next-best-action suggestions) on top of the
   activity/metadata structures already prepared for it.
6. Adjacent partnership-function capability (proposal builder, hospitality/event management,
   business community, inventory of sponsor assets).

## Writing Guidelines

- State constraints as constraints, with the reasoning behind them — a future contributor should
  understand *why* a constraint exists well enough to know when (if ever) it would be legitimate to
  revisit it.
- Avoid restating implementation detail here; that belongs in `ARCHITECTURE.md` and
  `03_Data_Model/`.

## Notes for Future Contributors

- If a founding constraint (e.g., "no paid tools") is ever lifted, update this document explicitly
  and explain the reasoning — do not let the constraint quietly stop being true while this document
  still asserts it.
- Cross-check new roadmap items against Section 4 ("What This Product Is Not") before accepting
  them — scope creep away from the sponsor-commercial domain is the most likely long-term risk to
  this project's coherence.
