# Blueprint Review

## Title

Architectural Review of the Vero Volley Partnership OS Documentation Blueprint

## Purpose

This document is a point-in-time architectural review of every file in `docs/`, performed by
reading each document in full and cross-checking it against every other document it references or
should reference. It exists to surface completeness gaps, internal contradictions, terminology
drift, and structural risk before further implementation or documentation work builds on top of an
inconsistent foundation.

This review does not modify any existing document. It is a standalone assessment.

**Resolution status (added, Blueprint v1.1):** the P0 items in Section 16 have been addressed — see
`docs/00_Project/CHANGELOG.md`'s "Blueprint v1.1" entry for exactly what changed. The findings below
are left as originally written, as the historical record of what was found; they are not "live"
descriptions of current documentation state where a P0 fix has since resolved them. P1–P3 items
remain open. Do not treat this review as needing re-verification of P0 items — that has been done —
but do treat P1–P3 as still-accurate open work.

**A note on this review's own process, disclosed for transparency**: this review was first drafted
against a 35-file inventory of `docs/`. A verification pass afterward found four additional files
in `00_Project/` (`PROJECT_STATUS.md`, `CHANGELOG.md`, `FEATURE_REGISTRY.md`,
`PRODUCT_DECISIONS.md`) that were missed on the first pass. This version accounts for all 39 files.
The four newly-included files turn out to be significant evidence for this review's central
finding, not a footnote — see Section 3.

## When to Use It

- Before starting the next sprint/release, to understand what must be reconciled first.
- Before writing any new `docs/` content, to avoid extending an already-diverging pattern.
- When a stakeholder asks "is the documentation trustworthy right now" — this is the honest answer.
- As the baseline for a follow-up review once the reconciliation work below is completed.

## Table of Contents

1. Executive Summary and Overall Score
2. Methodology
3. Central Finding: A Blueprint Split Into Two Incompatible Layers
4. Per-Document Scorecard
5. Strengths
6. Weaknesses
7. Missing Documents
8. Missing UX Flows
9. Missing Business Rules
10. Missing Entities
11. Missing Relationships
12. Missing AI Capabilities
13. Future Scalability Assessment
14. AI Readiness Assessment
15. Suggested Document Order
16. Priority Roadmap
17. Notes for Future Contributors

---

## 1. Executive Summary and Overall Score

**Overall Score: 52 / 100**

`docs/` contains 39 files. Twenty-nine of them form a precise, code-grounded, well
cross-referenced technical specification of the system as it actually exists today. Ten of them —
including the two most "constitutional" files in the tree, `ARCHITECTURE.md` and
`03_Data_Model/Entities.md`, plus a self-appointed parallel status/registry/decision-log system
(`PROJECT_STATUS.md`, `FEATURE_REGISTRY.md`, `CHANGELOG.md`, `PRODUCT_DECISIONS.md`) — were
produced independently of the other twenty-nine, in a different template, a different vocabulary,
and with no evidence their authors read the rest of `docs/` first.

This is no longer just a terminology or ambition mismatch. The newly-found governance documents
make the disconnection concrete and self-incriminating: `PROJECT_STATUS.md` marks
`03_Data_Model/Relationships.md` and `03_Data_Model/Timeline.md` as "⚪ Planned" and
`02_UX/Search.md`, `Analytics.md`, `Settings.md` as "⚪ Planned" — all six are fully written,
detailed, accurate documents that already exist and describe already-shipped functionality.
`FEATURE_REGISTRY.md` explicitly declares itself "the authoritative inventory of all product
capabilities" in the same tree as `01_Product/Features.md`, which explicitly declares itself "the
single inventory of every feature" — two documents, ten folders apart, each claiming exclusive
canonical status, with contradictory content. `CHANGELOG.md`'s "Blueprint Foundation" entry lists
the documents it believes were "introduced" and never mentions two-thirds of `docs/`.

| Component | Score | Basis |
|---|---|---|
| Grounded layer (29 docs), internal coherence | 88 / 100 | Precise, cross-referenced, honest status labeling, matches the actual codebase |
| Aspirational layer (10 docs), internal coherence | 68 / 100 | Coherent product vision, but now includes a self-tracking system that misreports the state of its own sibling documents |
| Cross-layer integration | 12 / 100 | Broken section references, contradictory entity models in the same folder, duplicate "authoritative" documents, a status tracker factually wrong about documents that already exist |
| **Weighted overall** | **52 / 100** | Integration failure, and evidence the failure is systemic rather than a one-off oversight |

## 2. Methodology

Every file under `docs/` was read in full, not sampled — 39 files across 8 folders, following a
verification pass that caught four files missed on the initial 35-file inventory (disclosed above).
Each was evaluated against the ten dimensions requested: completeness, consistency with
`ARCHITECTURE.md`, consistency with `User_Journey.md`, terminology consistency, missing entities,
missing workflows, contradictions, duplicate concepts, future scalability, and AI readiness.
Cross-references between documents (e.g., "see `ARCHITECTURE.md` Section 5") were individually
verified against the current content of the target section, not assumed correct. Status claims in
the newly-found governance documents were individually checked against the actual current state of
the files they describe. No source file was modified in the course of this review.

## 3. Central Finding: A Blueprint Split Into Two Incompatible Layers

**Layer A (grounded, 29 files)** — `00_Project/{README,Vision,Glossary}.md`, `01_Product/
{Product_Vision,Users,Features}.md`, `02_UX/{Workspace_Persona,Search,Analytics,Settings}.md`, all
five `03_Data_Model/` files except `Entities.md`, all five `04_Business_Rules/` files, all three
`05_AI/` files, all three `06_Roadmap/` files, all four `07_Releases/` files. Written in the
Title/Purpose/When-to-Use/TOC/Writing-Guidelines/Notes-for-Future-Contributors template. Uses the
real Italian schema vocabulary (Azienda, Persona, Trattativa, Lead) matched exactly against
`Data.gs`. Every capability is explicitly labeled Shipped, Built-Unwired, or Planned, and those
labels are individually verifiable against the codebase.

**Layer B (aspirational, 10 files)** — `00_Project/{ARCHITECTURE,PROJECT_STATUS,CHANGELOG,
FEATURE_REGISTRY,PRODUCT_DECISIONS}.md`, `01_Product/User_Journey.md`, `02_UX/{Dashboard,
Workspace_Azienda,Workspace_Trattativa}.md`, `03_Data_Model/Entities.md`. Written in a different
template (Version/Status/Document Owner/Last Updated header, emoji status legends, numbered `#`
sections). Uses English-first, rebranded vocabulary (Company, Contact, Opportunity, Partner,
Stakeholder) with no mapping back to the Italian schema. Describes dozens of features with no
reliable "is this built" signal — several status claims within Layer B are independently false.

These two layers were evidently produced without either side consulting the other. Three separate,
independently-verifiable kinds of evidence establish this, not merely a stylistic read:

**(a) Eight broken cross-references.** Layer A documents cite specific `ARCHITECTURE.md` section
numbers; Layer B's rewrite renumbered and re-themed every section without updating any citation:

| Referencing document | Cited section | What that section used to contain | What it contains now |
|---|---|---|---|
| `Glossary.md` (When to Use It) | Section 5 | Coding Standards — Italian/English naming split | System Architecture (layer diagram) |
| `Features.md` §1 | Section 2 | Architectural Principles — infrastructure-first pattern | Product Mission |
| `Permissions.md` §1 | Section 2 | same as above | same as above |
| `Backlog.md` §5 | Section 7 | Release Process — static verification methodology | Core Business Entities |
| `Backlog.md` §5 | Section 8 | Branch Strategy | Ownership Model |
| `README.md` (Notes) | Section 8 | Branch Strategy | Ownership Model |
| `Backlog.md` §2 | Section 14 | Performance Principles | Definition of Done |
| `Ownership.md` §6 | Section 15 | Security Principles (risk register) | Long-Term Vision |

**(b) A self-tracking document that is factually wrong about its own sibling files.**
`PROJECT_STATUS.md`'s "Data Model" table marks `Relationships` and `Timeline` as "⚪ Planned" —
both are complete, detailed, accurate documents (`03_Data_Model/Relationships.md`,
`03_Data_Model/Timeline.md`) that already exist and describe already-shipped mechanisms. Its "User
Experience" table marks `Search`, `Analytics`, and `Settings` as "⚪ Planned" — all three are
complete documents (`02_UX/Search.md`, `Analytics.md`, `Settings.md`) describing UI tabs that are
live in the deployed application today, per `01_Product/Features.md`. A status tracker that is
wrong about whether a sibling document exists is strong evidence its author never opened that
sibling folder.

**(c) A duplicate "sole authoritative" document.** `FEATURE_REGISTRY.md`'s Overview states: "The
Feature Registry is the authoritative inventory of all product capabilities. Every feature must
appear exactly once in this document." `01_Product/Features.md`'s Purpose states: "This document is
the single inventory of every feature in the product... so that 'is X built?' always has one
authoritative answer." Both claims cannot be true simultaneously, and the two documents disagree
where they overlap — `FEATURE_REGISTRY.md` marks "Migration Engine" as "🟢 Active," while
`Features.md`, `Ownership.md`, and `Permissions.md` all agree it is manual-only and has never been
run against live data.

Beyond this, the rewritten `ARCHITECTURE.md` also silently dropped several concrete,
currently-followed engineering rules that the rest of the blueprint still depends on: the
Italian-schema/English-code naming split, the trailing-underscore convention, the `ensureSheet_`/
`ensureListeSheet_` per-cell-idempotency guarantee, the ID-prefix scheme, and a checkable Code
Review Checklist. These rules are still true of the actual codebase, but the document that is
supposed to be their authoritative source no longer states them.

Finally, the two layers make **opposite claims about precedence**. New `ARCHITECTURE.md` §1 states:
"When implementation and documentation differ, this document takes precedence." `README.md` §7
(untouched, Layer A) states the opposite for current-state description: a mismatch between docs and
implementation "is a documentation bug to fix" — i.e., the code wins for describing what exists
today. Nothing reconciles these, and — per finding (b) above — Layer B's own governance documents
are not even internally reliable enough to be a safe tiebreaker in the meantime.

## 4. Per-Document Scorecard

Legend: **A** = Layer A (grounded), **B** = Layer B (aspirational). Completeness/Consistency scored
qualitatively (High/Medium/Low) against this review's ten dimensions.

| Folder | File | Layer | Completeness | Consistency w/ ARCHITECTURE.md | Consistency w/ User_Journey.md | Terminology | Flags |
|---|---|---|---|---|---|---|---|
| 00_Project | README.md | A | High | Broken ref (§8) | N/A | Italian-grounded | 1 broken cross-ref |
| 00_Project | ARCHITECTURE.md | B | Medium | — (is the doc) | High (same layer) | English/aspirational | Dropped rules; precedence conflict w/ README §7 |
| 00_Project | Vision.md | A | High | Low overlap | Medium | Italian-grounded | Not cited by Layer B at all |
| 00_Project | Glossary.md | A | Medium | Broken ref (§5) | Low | Mixed | Missing "Opportunity," "Stakeholder," "Partner" entries |
| 00_Project | PROJECT_STATUS.md | B | Low | High (same layer) | Medium | English/aspirational | Factually wrong about 5 sibling documents (finding b) |
| 00_Project | CHANGELOG.md | B | Low | High (same layer) | Medium | English/aspirational | "Blueprint Foundation" entry omits ~27 of 39 files |
| 00_Project | FEATURE_REGISTRY.md | B | Medium | High (same layer) | Medium | English/aspirational | Duplicate-canonical conflict with `Features.md` (finding c) |
| 00_Project | PRODUCT_DECISIONS.md | B | Medium | High (same layer) | Medium | English/aspirational | Good pattern; doesn't address the terminology-shift question it should |
| 01_Product | Product_Vision.md | A | High | Low overlap | Low | Italian-grounded | Core value prop (dedup/scoring) absent from new User_Journey |
| 01_Product | User_Journey.md | B | Medium | High (same layer) | — (is the doc) | English/aspirational | Omits Lead, dedup, blacklist, scoring entirely |
| 01_Product | Users.md | A | High | Low overlap | Low | Italian-grounded | Untouched sibling of a rewritten folder |
| 01_Product | Features.md | A | High | Broken ref (§2) | Low | Italian-grounded | Duplicated by `FEATURE_REGISTRY.md` |
| 02_UX | Dashboard.md | B | Medium | High (same layer) | High (same layer) | English/aspirational | Implies AI/Hospitality/Business Community exist today |
| 02_UX | Workspace_Azienda.md | B | Medium | High | High | English/aspirational | Filename says "Azienda," body never uses the word |
| 02_UX | Workspace_Persona.md | A | High | Low overlap | Low | Italian-grounded | Marked "Planned" by `PROJECT_STATUS.md` despite existing in full |
| 02_UX | Workspace_Trattativa.md | B | Medium | High | High | English/aspirational | Filename says "Trattativa," body never uses the word |
| 02_UX | Search.md | A | High | Low overlap | Low | Italian-grounded | Marked "Planned" by `PROJECT_STATUS.md` despite describing shipped UI |
| 02_UX | Analytics.md | A | High | Low overlap | Low | Italian-grounded | Same as above |
| 02_UX | Settings.md | A | High | Low overlap | Low | Italian-grounded | Same as above |
| 03_Data_Model | Entities.md | B | Low (schema-blind) | High | High | English/aspirational | Omits Lead, Blocco, Esclusiva Sponsor, Utente entirely |
| 03_Data_Model | Relationships.md | A | High | Low overlap | Low | Italian-grounded | Marked "Planned" by `PROJECT_STATUS.md` despite existing in full |
| 03_Data_Model | Ownership.md | A | High | Broken ref (§15) | Low | Italian-grounded | Otherwise excellent |
| 03_Data_Model | Activities.md | A | High | Low overlap | Low | Italian-grounded | Already supports much of Layer B's Timeline vocabulary, uncited |
| 03_Data_Model | Timeline.md | A | High | Low overlap | Low | Italian-grounded | Marked "Planned" by `PROJECT_STATUS.md` despite existing in full |
| 04_Business_Rules | Pipeline.md | A | High | Low overlap | Low | Italian-grounded | Consistent, unaffected |
| 04_Business_Rules | Scoring.md | A | High | Low overlap | Low | Italian-grounded | Contradicted by Entities.md's "Sponsor Score" concept |
| 04_Business_Rules | Permissions.md | A | High | Broken ref (§2) | Low | Italian-grounded | Otherwise excellent |
| 04_Business_Rules | Notifications.md | A | Medium | Low overlap | Low | Italian-grounded | Doesn't cover Dashboard.md §12's notification list |
| 04_Business_Rules | Automation.md | A | High | Low overlap | Low | Italian-grounded | Consistent, unaffected |
| 05_AI | AI_Assistant.md | A | Medium | Low overlap | Low | Italian-grounded | Scope far narrower than Layer B's AI claims |
| 05_AI | Sponsor_Research.md | A | High | Low overlap | Low | Italian-grounded | Possible conflict with Dashboard.md §11 (see §12 below) |
| 05_AI | Prompting.md | A | High | Low overlap | Low | Italian-grounded | Consistent, unaffected |
| 06_Roadmap | Roadmap.md | A | Medium | Low overlap | Low | Italian-grounded | Doesn't mention the Layer B rewrite as shipped work |
| 06_Roadmap | Backlog.md | A | High | 3 broken refs | Low | Italian-grounded | Most-affected file by the renumbering |
| 06_Roadmap | Future_Ideas.md | A | High | Low overlap | Low | Italian-grounded | Overlaps un-cross-referenced with Layer B's entity list |
| 07_Releases | Release_0.3.md | A | High (as template) | Low overlap | Low | Italian-grounded | Consistent, unaffected |
| 07_Releases | Release_0.4.md | A | High (as template) | Low overlap | Low | Italian-grounded | Consistent, unaffected |
| 07_Releases | Release_0.5.md | A | High (as template) | Low overlap | Low | Italian-grounded | Consistent, unaffected |
| 07_Releases | Release_1.0.md | A | High (as template) | Low overlap | Low | Italian-grounded | Consistent, unaffected |

## 5. Strengths

- **The grounded layer is genuinely excellent.** Every Layer A document cites exact function and
  field names, states current activation status honestly, and cross-references its neighbors
  correctly. This is not typical of early-stage product documentation.
- **The infrastructure was built with real foresight.** `Activity.gs`'s generic `Relazioni`
  mechanism and `ACTIVITY_METADATA_TEMPLATE` were explicitly designed to support future entities
  like Proposta, Contratto, and Documento — exactly what Layer B now wants to build. The gap
  between the two layers is smaller than it looks structurally, even though it is large
  procedurally.
- **Layer B is a coherent product vision on its own terms.** Each rewritten UX document follows the
  same internal structure (Purpose → Guiding Principle → sections → Success Criteria → Guiding
  Question), which is a good product-spec pattern and gives the vision a consistent voice.
- **The instinct behind `PRODUCT_DECISIONS.md` is correct and was independently identified as
  missing by this review** (see Section 7) — a decision log is exactly the right tool for recording
  why the terminology/scope shift happened. It simply doesn't yet answer the question it most needs
  to.
- **The AI-readiness groundwork in Layer A is ahead of the AI ambition in Layer B**, not behind it,
  in one respect: `Origine: AI` tagging, `aiGenerated` metadata flags, and an explicit
  "AI augments, never replaces deterministic business logic" constraint already exist. Most of
  Layer B's AI claims could be built on top of this without a schema change.

## 6. Weaknesses

1. **Eight broken cross-references into `ARCHITECTURE.md`** (Section 3a) — concrete, checkable
   defects, not matters of opinion.
2. **A governance document that is factually wrong about which documents exist.**
   `PROJECT_STATUS.md` marks six fully-written, accurate Layer A documents as "Planned" (Section
   3b). This is the most serious single finding in this review: it is not a matter of differing
   opinion about status, it is a checkable factual error in a document whose sole purpose is to
   track status accurately.
3. **Two documents each explicitly claim to be the sole authoritative feature inventory**
   (`Features.md` vs. `FEATURE_REGISTRY.md`, Section 3c), with contradictory content on at least one
   shared row (Migration Engine).
4. **`Entities.md` no longer describes the actual data model.** It shares a folder with
   `Relationships.md`, `Ownership.md`, and `Activities.md`, all three of which precisely describe
   `Data.gs`'s real sheets, ID prefixes, and headers — but `Entities.md` itself never mentions a
   sheet, an ID prefix, or a header field.
5. **Filename/content mismatches.** `Workspace_Azienda.md`'s body never uses the word "Azienda";
   `Workspace_Trattativa.md`'s body never uses the word "Trattativa." Both are 100% "Company" and
   "Opportunity" respectively.
6. **Status discipline is absent from most of Layer B**, and where Layer B does attempt status
   discipline (`PROJECT_STATUS.md`, `FEATURE_REGISTRY.md`), it gets the status wrong (Weakness #2).
   Every Layer A document with an unbuilt capability says so explicitly and correctly. Every
   UX-facing Layer B document (`Dashboard.md`, `Workspace_Azienda.md`, `Workspace_Trattativa.md`)
   presents unbuilt capability as current-tense fact, with a header stamped "Status: Approved."
7. **Governance precedence conflict** between `ARCHITECTURE.md` §1 ("documentation takes
   precedence") and `README.md` §7 ("code is authoritative for current behavior"). Given Weakness
   #2, resolving this in Layer B's favor without independent verification would currently be unsafe.
8. **`User_Journey.md`'s rewrite drops the product's own stated core differentiator** — automatic
   deduplication, blacklist protection, and rules-based scoring, named by `Vision.md` and
   `Product_Vision.md` as the primary value proposition, appear nowhere in the sixteen sections of
   the new `User_Journey.md`.
9. **A likely compliance-boundary conflict.** `Sponsor_Research.md` §3 draws a hard line against
   automated company discovery/scraping. `Dashboard.md` §11 ("AI Sponsor Research") lists, as a
   present-tense widget, "Suggest potential sponsors," "Detect similar companies," and "Highlight
   growing sectors" — capabilities that read as the exact behavior the compliance boundary forbids.
10. **Duplicate, unreconciled scoring/outcome concepts.** At least four overlapping "how good is
    this opportunity" concepts now exist with no stated relationship: `Sponsor Fit Score`
    (`Scoring.gs`, real/deterministic), `Sponsor Score` (`Entities.md`, aspirational/AI), `Engagement
    Score`, and `AI Success Prediction` (both `Workspace_Trattativa.md` §16). Similarly, at least
    five "outcome"-shaped fields now exist with no unifying model, after `Activities.md` §4 had
    deliberately disambiguated exactly this kind of proliferation once already.
11. **Roadmap and Changelog staleness relative to each other.** `Roadmap.md` §1 doesn't mention the
    Layer B rewrite at all. `CHANGELOG.md`'s "Blueprint Foundation" entry lists only nine documents
    as having been "introduced," omitting the other thirty — meaning the one document whose stated
    job is "chronological history of the entire project" does not know about most of the project.

## 7. Missing Documents

- A document explaining *why* the terminology shifted from Italian schema-matched naming
  (Azienda/Persona/Trattativa) to English aspirational naming (Company/Contact/Opportunity), and
  whether this is meant to eventually rename the live schema or remain UI-layer vocabulary over an
  unchanged Italian backend. `PRODUCT_DECISIONS.md` is the right home for this and already exists,
  but its current entries (Decision #002, "Companies are the central business entity") assert the
  new naming without addressing the relationship to the existing Italian schema at all.
- A dedicated data-model document per new Layer B entity category currently only described in prose
  inside `Entities.md`: Proposal, Contract, Document (as a first-class entity), Match, Invitation,
  Hospitality, Business Community, Partner.
- A dedicated `04_Business_Rules/` document for Proposal lifecycle rules.
- A dedicated `04_Business_Rules/` document for Closing Checklist enforcement semantics.
- A `docs/07_Releases/` entry documenting the Layer B rewrite itself (`ARCHITECTURE.md`, the UX
  docs, and the four new governance documents), per the project's own norm that significant
  documentation changes get a release entry.
- An updated `Glossary.md` covering "Opportunity," "Stakeholder," "Partner," "Activation," "Media
  Asset," "Hospitality," and "Business Community."
- A single reconciliation pass merging `FEATURE_REGISTRY.md` and `Features.md` into one document,
  or an explicit statement of how their scopes differ if both are to remain.

## 8. Missing UX Flows

- A dedicated Proposal Center screen specification.
- A dedicated Hospitality / Match Invitation screen specification.
- A dedicated Business Community screen specification.
- A mobile experience specification — named in `ARCHITECTURE.md` §15 but addressed nowhere in
  `02_UX/`.
- An onboarding / first-run flow.
- Empty-state and error-state specifications for any new workspace.
- A flow reconciling the current shared-drawer UX (`Workspace_Azienda.md`/`Workspace_Persona.md` as
  they exist in Layer A, still accurate to the live app) with the full-page workspace UX Layer B now
  specifies for the same screens under the same filenames.

## 9. Missing Business Rules

- Proposal status transition rules and validation.
- Closing Checklist pass/fail enforcement semantics.
- Hospitality guest/seat capacity and allocation rules.
- Business Community membership rules.
- AI Daily Briefing generation rules: schedule, data sources, failure behavior.
- Notification triggers matching `Dashboard.md` §12's list (proposal accepted/viewed, contract
  expiration, mention by another user) — `Notifications.md` (Layer A) covers none of these.
- A rule for who assigns/updates Stakeholder fields like "Decision Power" and "Influence Level."

## 10. Missing Entities

Entities referenced as current or near-term by Layer B with no corresponding schema, sheet, ID
prefix, or field definition anywhere in `03_Data_Model/`: Proposal, Contract, Document (as a
first-class entity), Match, Invitation, Hospitality, Business Community, Partner (as distinct from
Prospect), Activation, Campaign, Media Asset, AI Insight, Sponsor Score, Recommendation,
Stakeholder (as distinct from Contact).

Conversely, entities that are real, shipped, and central to the product's actual value proposition
but are **absent from `Entities.md`**, which claims to be "the authoritative reference for the
Domain Model": Lead, Blocco (blacklist entry), Esclusiva Sponsor, Utente. `PROJECT_STATUS.md`'s
Data Model table has the identical omission pattern — neither Layer B document accounts for the
entities that the deduplication/compliance engine (the product's own stated differentiator) is
built on.

## 11. Missing Relationships

None of the following — several explicitly implied by `Entities.md`'s own prose — appear in
`Relationships.md`'s diagram or table: Proposal ⟷ Opportunity, Contract ⟷ Opportunity, Document ⟷
Company / Opportunity / Proposal, Match ⟷ Invitation ⟷ Company / Contact, Business Community ⟷
Company, Stakeholder ⟷ Opportunity ⟷ Contact. Every one of these could be expressed today via the
existing generic `Relazioni` mechanism on `Attivita` without a schema change, but `Relationships.md`
doesn't mention any of them.

## 12. Missing AI Capabilities

Relative to what Layer B describes as present-tense AI functionality, the following have no
corresponding entry in `AI_Assistant.md`'s "Candidate Capabilities" list and no data-model field to
store their output: Sponsor Score (AI-driven), AI Success Prediction, Engagement Score, Risk
Analysis, Recommended Proposal, Recommended Hospitality Event, Meeting Preparation, AI Daily
Briefing generation logic.

Most urgently: `Dashboard.md` §11's "AI Sponsor Research" widget should be explicitly checked
against `Sponsor_Research.md` §3's hard no-automated-discovery boundary before any implementation —
see Weakness #9. This is the one place in the review where the gap is not just a documentation
quality issue but a potential compliance conflict.

## 13. Future Scalability Assessment

The Layer B entity list (14+ new business objects) has no accompanying scalability discussion. The
existing architecture's known scaling constraint — `getAllRecords_()` reading a full sheet into
memory on every call, already flagged in `Backlog.md` §2 — becomes materially more relevant at 14+
additional sheet-backed entities, and none of the new documents acknowledge it. On the positive
side, the `Relazioni` generic-linking mechanism was specifically designed to absorb new entity
types without schema changes — if Layer B's entities are built to use this mechanism rather than a
parallel bespoke relational model, most of the scalability risk is already mitigated by existing
infrastructure. Separately: `PROJECT_STATUS.md`, `FEATURE_REGISTRY.md`, and `CHANGELOG.md` are three
more places that will now need to be kept in sync with every future release, on top of
`Features.md` and `Roadmap.md` — this is a documentation-maintenance scalability risk in its own
right, since it multiplies the number of places a status update must be applied correctly.

## 14. AI Readiness Assessment

Layer A's AI groundwork (metadata template, `Origine: AI` tagging, the "AI augments, never replaces
deterministic logic" constraint) is more mature than Layer B's AI ambition currently accounts for —
Layer B describes AI capability roughly 5–10x broader in surface area without updating
`AI_Assistant.md`'s scope, constraints, or candidate-capability list to match. Before any of Layer
B's AI features are implemented, `AI_Assistant.md` §5's constraints should be explicitly
re-affirmed against each new capability — particularly "AI Success Prediction," which risks
feeding into deal probability/stage fields that §5 currently protects.

## 15. Suggested Document Order

1. `00_Project/Vision.md` — founding constraints, unaffected by the split.
2. `00_Project/README.md` — entry point; note its precedence claim (§7) conflicts with
   `ARCHITECTURE.md` §1.
3. `00_Project/PRODUCT_DECISIONS.md` — read early as a decision log, but with awareness that it
   does not yet resolve the terminology-shift question (Missing Documents, item 1).
4. `00_Project/ARCHITECTURE.md` — read as **product vision**, not current engineering constitution.
5. `00_Project/Glossary.md` — authoritative only for Layer A terms; missing Layer B's core nouns.
6. `01_Product/Product_Vision.md`, `Users.md`, `Features.md` — the real, current, honestly-labeled
   product state. Treat as authoritative over `00_Project/FEATURE_REGISTRY.md` where they conflict,
   since `Features.md`'s status claims were independently verified against this review's
   cross-checks and `FEATURE_REGISTRY.md`'s were not (and at least one, Migration Engine, is wrong).
7. `01_Product/User_Journey.md` — read as **aspirational vision**, not the shipped lead-to-deal
   workflow (which lives in `04_Business_Rules/Pipeline.md`).
8. `03_Data_Model/Relationships.md`, `Ownership.md`, `Activities.md`, `Timeline.md` — the real
   schema. Do **not** trust `00_Project/PROJECT_STATUS.md`'s claim that `Relationships` and
   `Timeline` are "Planned" — both are complete; read them.
9. `03_Data_Model/Entities.md` — read last within this folder, explicitly as aspirational domain
   vision, not the actual schema.
10. `04_Business_Rules/*` — any order; mutually consistent and code-grounded.
11. `02_UX/Search.md`, `Analytics.md`, `Settings.md`, `Workspace_Persona.md` — real, current UX.
    Do **not** trust `PROJECT_STATUS.md`'s claim that Search/Analytics/Settings are "Planned."
12. `02_UX/Dashboard.md`, `Workspace_Azienda.md`, `Workspace_Trattativa.md` — aspirational UX
    vision; cross-reference against Sections 10–11 above before treating any section as buildable.
13. `05_AI/*`, `06_Roadmap/*`, `07_Releases/*` — grounded and consistent, though `Roadmap.md` and
    `00_Project/CHANGELOG.md` should both be read knowing neither yet accounts for the Layer B
    rewrite.
14. `00_Project/FEATURE_REGISTRY.md` — read last, and skeptically, as a draft that duplicates and in
    places contradicts `Features.md`.

## 16. Priority Roadmap

**P0 — Immediate, low-effort, high-value (fixes verifiable defects only):**
1. Correct `PROJECT_STATUS.md`'s factually wrong rows (Relationships, Timeline, Search, Analytics,
   Settings all marked "Planned" despite existing in full) — this is the single highest-priority
   fix in this review, since it is an outright factual error, not a judgment call.
2. Fix the eight broken `ARCHITECTURE.md` section cross-references (Section 3a).
3. Resolve the `FEATURE_REGISTRY.md` vs. `Features.md` duplicate-authority conflict — merge into
   one document, or explicitly scope each as covering a different concern and cross-link them.
4. Add a one-paragraph "status" preamble to each UX-facing Layer B document
   (`Dashboard.md`, `Workspace_Azienda.md`, `Workspace_Trattativa.md`, `Entities.md`,
   `User_Journey.md`) stating explicitly that the capabilities described are a product vision, not
   shipped or built-but-unwired functionality.
5. Reconcile the filename/content mismatch on `Workspace_Azienda.md` and `Workspace_Trattativa.md`.

**P1 — Short-term (requires a real decision, not just an edit):**
6. Resolve the governance precedence conflict between `ARCHITECTURE.md` §1 and `README.md` §7.
7. Resolve the Sponsor Research compliance question (Weakness #9) as a deliberate, escalated
   decision before any AI Sponsor Research capability is scoped for implementation.
8. Add a `PRODUCT_DECISIONS.md` entry explicitly addressing the terminology-shift question
   (Missing Documents, item 1) — the document and process already exist; the specific decision does
   not yet.
9. Update `CHANGELOG.md`'s "Blueprint Foundation" entry to account for the twenty-nine Layer A
   documents it currently omits, or add a preceding entry documenting when and how that layer was
   produced.

**P2 — Medium-term (structural reconciliation):**
10. Reconcile `Entities.md` with its own sibling documents — merge into a single coherent domain
    model covering both real schema entities (Lead, Blocco, Esclusiva Sponsor, Utente) and
    aspirational ones, or explicitly split into "Current" and "Future" domain model sections.
11. Extend `Relationships.md`'s diagram to include the aspirational entities' relationships
    (Section 11), built on the existing `Relazioni` generic-linking mechanism.
12. Rewrite `User_Journey.md` to re-integrate the product's actual core differentiator alongside
    the aspirational relationship-management vision.

**P3 — Longer-term (net-new work, once P0–P2 are resolved):**
13. Author the missing business-rules documents for Proposal lifecycle, Closing Checklist
    enforcement, Hospitality/Match Invitation workflow, and Business Community membership.
14. Expand `AI_Assistant.md`'s scope and constraints to formally cover the AI capabilities Layer B
    now implies, re-affirming the existing "AI augments, never replaces deterministic logic"
    constraint against each one individually.
15. Add a `docs/07_Releases/` entry for the documentation rewrite itself (including the four
    governance documents), and update `Roadmap.md` §1 accordingly.

## 17. Notes for Future Contributors

- This review is a snapshot, and was itself produced in two passes after missing four files on the
  first pass — before treating any future review as complete, run `find docs -name "*.md" | wc -l`
  and confirm the count matches what the review claims to have covered.
- Do not resolve the two-layer problem by deleting either layer. The grounded layer's precision and
  the aspirational layer's ambition are both valuable; the fix is reconciliation (P1–P2), not a
  rollback.
- If a future status-tracking document is introduced (as `PROJECT_STATUS.md` and
  `FEATURE_REGISTRY.md` were here), its author must read every document it claims to summarize
  before publishing it — Weakness #2 exists specifically because that did not happen.
- If a future rewrite of a foundational document (`ARCHITECTURE.md`, `Entities.md`, or any file
  other documents cite by section number) is undertaken again, grep the rest of `docs/` for
  references to that file *before* renumbering sections, and update citing documents in the same
  change.
