# Vero Volley Partnership OS

# Workspace Azienda

**Version:** 1.1
**Status:** Approved
**Document Owner:** Product Team
**Last Updated:** July 2026

---

> **Terminology note (added Blueprint v1.1):** this document uses "Company" throughout to refer to
> the same entity the technical schema calls **Azienda** — the filename reflects the schema term,
> the body uses the product-vocabulary term. Both names refer to one entity; see
> `docs/00_Project/Glossary.md` Section 6 for the full Layer A / Layer B terminology mapping and
> `docs/00_Project/PRODUCT_DECISIONS.md` Decision #008 for why both names remain in use.

---

# 1. Purpose

The Company Workspace is the operational center of every commercial relationship.

It is the primary interface through which Partnership Managers understand, develop and manage relationships with companies.

The objective of this workspace is not simply to display company information.

Its objective is to provide a complete operational environment where every interaction, opportunity, proposal and activity connected to a company can be managed.

Whenever a commercial user opens a Company Workspace, they should immediately understand the complete status of the relationship.

---

# 2. Guiding Principle

The Company Workspace must answer one question:

> **"What is the current relationship between Vero Volley and this company, and what should I do next?"**

Everything displayed inside the workspace should help answer this question.

---

# 3. Workspace Overview

The Company Workspace is divided into functional sections.

Each section focuses on one aspect of the commercial relationship while remaining connected to the others.

Sections include:

- Overview
- Contacts
- Opportunities
- Activities
- Timeline
- Proposals
- Documents
- Match Invitations
- Hospitality
- Business Community
- AI Insights

---

# 4. Header

The top section provides immediate identification.

Display:

- Company Logo
- Company Name
- Industry
- Headquarters
- Website
- LinkedIn
- Company Status
- Commercial Owner
- Last Activity Date
- Next Planned Activity

Quick Actions:

- New Activity
- New Contact
- New Opportunity
- New Proposal
- Invite to Match
- Open Website
- Open LinkedIn

---

# 5. Overview

The overview summarizes the current commercial situation.

Display:

- Relationship Status
- Current Opportunities
- Total Partnership Value
- Open Proposals
- Active Contracts
- Last Meeting
- Next Follow-up
- Hospitality Participation
- AI Relationship Health

The user should understand the relationship in less than ten seconds.

---

# 6. Contacts

Every contact belonging to the company should appear here.

For each contact:

- Name
- Job Title
- Email
- Phone Number
- LinkedIn
- Relationship Owner
- Last Contact Date
- Next Planned Contact

Quick Actions:

- Call
- Send Email
- Open LinkedIn
- Log Activity
- Schedule Meeting

---

# 7. Opportunities

Displays every commercial opportunity related to the company.

Each opportunity includes:

- Title
- Value
- Stage
- Probability
- Expected Closing Date
- Owner
- Last Update

Users should immediately understand the commercial pipeline for this company.

---

# 8. Activities

Shows every interaction.

Examples:

- Calls
- Emails
- Meetings
- WhatsApp
- Business Lunches
- Notes
- Follow-ups

Activities should support filtering by:

- User
- Type
- Date
- Status

Every activity contributes to the company timeline.

---

# 9. Timeline

The Timeline provides a chronological history.

Examples:

Company Created

↓

First Contact

↓

Meeting

↓

Proposal Sent

↓

Business Lunch

↓

Match Invitation

↓

Contract Signed

The timeline should become the memory of the relationship.

---

# 10. Proposals

Every proposal sent to the company is managed here.

Display:

- Proposal Name
- Version
- Value
- Date Sent
- Current Status
- Last Modification
- Linked Opportunity
- Google Drive Link

Possible statuses:

- Draft
- Sent
- Under Review
- Negotiation
- Accepted
- Rejected

Users should never lose track of proposal versions.

---

# 11. Documents

Central repository of documents.

Examples:

- Presentations
- Contracts
- PDFs
- Images
- Meeting Notes

Each document should display:

- Name
- Type
- Upload Date
- Linked Entity
- Google Drive Link

---

# 12. Match Invitations

Professional sports create unique commercial opportunities.

The system should manage:

- Match
- Invitation Date
- Guests
- Attendance
- Hospitality Package
- Notes
- Outcome

This section should become the history of every invitation.

---

# 13. Hospitality

Hospitality is considered a commercial activity.

Display:

- Invited Guests
- Confirmed Guests
- Seats
- Lounge
- Business Lunch
- VIP Experiences
- Feedback
- Relationship Impact

---

# 14. Business Community

Shows the company's participation in the Vero Volley Business Community.

Display:

- Membership Status
- Events Attended
- Networking Sessions
- Business Lunches
- Collaborations with Other Partners

---

# 15. AI Insights

The AI Assistant supports commercial work.

Examples:

Relationship Summary

Commercial Risks

Suggested Next Action

Potential Cross Selling

Recommended Match Invitation

Sponsor Fit Score

Suggested Follow-up

The AI should always explain why a recommendation is being made.

---

# 16. Global Sidebar

The workspace should always provide quick access to:

- Company
- Contacts
- Opportunities
- Activities
- Timeline
- Proposals
- Documents
- Hospitality

Navigation should require no more than one click.

---

# 17. Design Principles

The Company Workspace follows these principles:

- Relationship First
- One Click Rule
- Context Before Data
- Zero Dead Ends
- Progressive Disclosure
- Action Driven Interface

Every section should naturally lead to another commercial action.

---

# 18. Future Evolution

Future releases may introduce:

- Contract Management
- Digital Signature
- Payment Tracking
- Proposal Builder
- Sponsor Activation Planner
- AI Meeting Preparation
- AI Email Drafting
- Hospitality Planning
- Partnership Performance Dashboard

The architecture should support these features without redesigning the workspace.

---

# 19. Success Criteria

A Partnership Manager should be able to manage an entire commercial relationship without leaving the Company Workspace.

The workspace succeeds when it becomes the primary daily interface of the commercial department.

---

# 20. Guiding Question

Every future enhancement should answer one question:

**Does this help the commercial team better understand and strengthen the relationship with this company?**

If the answer is no, the feature should be reconsidered before implementation.