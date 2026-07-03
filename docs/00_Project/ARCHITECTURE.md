# Vero Volley Partnership OS

# ARCHITECTURE

**Version:** 1.0  
**Status:** Approved  
**Product Owner:** Ulisse Tacchinardi  
**Architecture Owner:** Vero Volley Partnership Team  
**Last Updated:** July 2026

> **The Partnership OS is designed to help commercial professionals make better decisions, not simply to record past actions.**

---

# 1. Purpose

This document defines the architectural principles governing the design, development and evolution of the Vero Volley Partnership OS.

It is the highest-level technical document of the project.

Its objective is not to describe how the software currently works, but to define how it must evolve over time.

Every future release, feature and architectural decision must comply with the principles defined in this document.

When implementation and documentation differ, this document takes precedence.

---

# 2. Product Mission

The Partnership OS exists to support the complete commercial lifecycle of sponsorships at Vero Volley.

Its purpose is not simply to collect or organize information.

Its purpose is to help the commercial department:

- identify new opportunities;
- build stronger relationships;
- manage every interaction with companies;
- simplify daily work;
- make faster and better commercial decisions.

Every feature introduced into the platform should contribute to one or more of these objectives.

Information is valuable only when it enables action.

---

# 3. Product Vision

The long-term objective is to build the operating system used daily by every member of the Partnership Department.

The platform should centralize every commercial process inside a single environment.

Instead of navigating between spreadsheets, emails, calendars, documents and notes, commercial users should be able to perform their work inside one integrated platform.

The software should become the single source of truth for every commercial relationship.

---

# 4. Architectural Principles

## 4.1 Single Source of Truth

Every business entity has one authoritative source.

Data duplication should be avoided whenever possible.

If duplication becomes necessary for performance or reporting reasons, synchronization rules must be clearly documented.

---

## 4.2 Documentation First

Documentation is part of the product.

Every significant feature begins with documentation.

Implementation follows approved documentation.

Documentation must always evolve together with the codebase.

---

## 4.3 Data Model First

Every feature starts from the data model.

Before implementing interfaces or workflows, entities, relationships and business rules must be defined.

The UI is built on top of the model, never the opposite.

---

## 4.4 Backward Compatibility

Backward compatibility is mandatory.

Existing data must remain usable after every release.

Allowed:

- add new modules;
- add new sheets;
- add new fields;
- extend existing entities.

Forbidden:

- remove existing fields;
- rename existing identifiers;
- break public functions;
- invalidate historical data.

The preferred strategy is additive evolution.

---

## 4.5 Modular Architecture

Every major capability must exist as an independent module.

Examples:

- Activity Engine
- Ownership Engine
- Permission Engine
- Proposal Engine
- Notification Engine
- AI Assistant

Each module owns one responsibility and communicates through well-defined public functions.

---

## 4.6 Progressive Enhancement

Infrastructure may exist before interfaces.

Interfaces may exist before automation.

Automation may exist before AI.

Features should be activated only when intentionally connected to the system.

---

## 4.7 Action over Information

The purpose of the platform is not to display information.

The purpose of the platform is to help users decide what to do next.

Every screen should answer at least one operational question.

Examples:

- Who should I contact today?
- Which proposal requires follow-up?
- Which opportunity is at risk?
- Which company should be invited to the next match?

---

## 4.8 Relationship Intelligence

The system is built around relationships rather than isolated records.

Companies, contacts, meetings, activities, proposals, invitations and partnerships together represent a single commercial relationship.

Every workspace should preserve and present this context.

---

## 4.9 AI Native

Artificial Intelligence is considered a native capability of the platform.

The AI layer should consume existing data rather than creating separate datasets.

AI must support users, not replace them.

---

# 5. System Architecture

The platform is organized into logical layers.

Presentation Layer

↓

Application Layer

↓

Business Logic Layer

↓

Data Layer

↓

Google Sheets

Each layer has a specific responsibility.

No layer should bypass another.

---

# 6. Data Architecture

Google Sheets acts as the persistent datastore.

Apps Script provides:

- business logic;
- validation;
- orchestration;
- integrations.

Business rules should never be embedded directly inside spreadsheet formulas.

The spreadsheet stores data.

The application interprets it.

---

# 7. Core Business Entities

The platform revolves around business entities.

Current entities include:

- Users
- Companies
- Contacts
- Opportunities
- Activities

Future entities include:

- Proposals
- Contracts
- Hospitality
- Match Invitations
- Business Community
- Events
- Documents
- Campaigns

Every entity should eventually support:

- unique identifier;
- ownership;
- activities;
- timeline;
- AI metadata.

---

# 8. Ownership Model

Ownership defines responsibility.

Permissions define access.

These are different concepts.

Every business record should eventually support:

- Primary Owner
- Collaborators
- Visibility
- Assignment History

Ownership must remain independent from security rules.

---

# 9. Activity Model

Activities are independent business objects.

An activity may reference multiple entities simultaneously.

Examples:

- Company
- Contact
- Opportunity
- Proposal

Activities represent the chronological memory of the commercial relationship.

---

# 10. Design Principles

The user experience should always respect these principles.

## One Click Rule

Frequently used information should be reachable within one click.

---

## Context Before Data

Always present the commercial context before isolated information.

---

## Relationship First

Relationships are more important than records.

---

## Progressive Disclosure

Display essential information first.

Advanced information should appear only when necessary.

---

## Zero Dead Ends

Every screen should naturally lead to another meaningful action.

---

## Search Everywhere

Every business entity should be searchable from a single global search.

---

## Action Driven Interface

Every major page should suggest one or more recommended next actions.

---

# 11. Development Workflow

Every feature follows the same lifecycle.

Idea

↓

Blueprint

↓

Review

↓

Approval

↓

Implementation

↓

Testing

↓

Release

↓

Documentation Update

No implementation begins without an approved specification.

---

# 12. Release Policy

Every release must be:

- incremental;
- documented;
- testable;
- reversible;
- backward compatible.

Each release must include a Completion Report describing:

- scope;
- modified files;
- migration requirements;
- future integration points.

---

# 13. Coding Standards

The project values consistency over individual coding style.

Code should be:

- readable;
- modular;
- documented;
- loosely coupled;
- easy to maintain.

Complexity should be introduced only when justified by measurable value.

---

# 14. Definition of Done

A feature is considered complete only when:

- implementation is finished;
- documentation is updated;
- development environment has been tested;
- backward compatibility has been verified;
- no regressions are detected;
- completion report has been produced.

---

# 15. Long-Term Vision

The objective is not to build a better CRM.

The objective is to build the first Partnership Operating System specifically designed for professional sports organizations.

The platform should eventually support the entire commercial lifecycle, including:

- sponsorship sales;
- relationship management;
- proposal generation;
- hospitality management;
- business community management;
- commercial analytics;
- AI-assisted decision making;
- mobile experience.

Every architectural decision should be evaluated against this long-term vision.

---

# 16. Guiding Principle

Every feature, every screen and every release should answer one simple question:

**Does this help the commercial team build stronger relationships and make better decisions?**

If the answer is no, the feature should be reconsidered before implementation.