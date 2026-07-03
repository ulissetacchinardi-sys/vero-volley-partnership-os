# Vero Volley Partnership OS

# Workspace Trattativa

**Version:** 1.1
**Status:** Approved
**Document Owner:** Product Team
**Last Updated:** July 2026

---

> **Terminology note (added Blueprint v1.1):** this document uses "Opportunity" throughout to refer
> to the same entity the technical schema calls **Trattativa** (also glossed elsewhere as "Deal") —
> the filename reflects the schema term, the body uses the product-vocabulary term. All three names
> refer to one entity; see `docs/00_Project/Glossary.md` Section 6 for the full Layer A / Layer B
> terminology mapping and `docs/00_Project/PRODUCT_DECISIONS.md` Decision #008 for why multiple
> names remain in use.

---

# 1. Purpose

The Opportunity Workspace is the operational center of every commercial negotiation.

It provides a complete view of the sales process, from the first contact with a prospect to the signature of the partnership agreement.

The objective is not simply to monitor pipeline stages.

Its objective is to help Partnership Managers close partnerships more effectively.

---

# 2. Guiding Principle

The Opportunity Workspace should answer one question:

> **"What is preventing this opportunity from becoming a partnership?"**

Every section of the workspace should help answer that question.

---

# 3. Workspace Overview

The workspace is composed of interconnected sections.

- Overview
- Company
- Contacts
- Opportunity Details
- Activities
- Timeline
- Proposals
- Documents
- Hospitality
- Match Invitations
- AI Assistant
- Closing Checklist

The user should never need to leave this workspace while managing an opportunity.

---

# 4. Header

The header provides an immediate summary.

Display:

- Opportunity Name
- Company
- Current Stage
- Estimated Value
- Probability
- Expected Closing Date
- Owner
- Collaborators
- Last Activity
- Next Planned Activity

Quick Actions:

- Log Activity
- Create Proposal
- Schedule Meeting
- Invite to Match
- Add Document
- Close Opportunity

---

# 5. Company Summary

A compact summary of the related company.

Display:

- Industry
- Headquarters
- Website
- Relationship Status
- Existing Partnerships
- Previous Opportunities

Quick Actions:

- Open Company Workspace
- Open Contacts

---

# 6. Stakeholders

Displays every person involved in the negotiation.

For each stakeholder:

- Name
- Position
- Decision Power
- Influence Level
- Relationship Strength
- Last Contact
- Preferred Communication Channel

The objective is to identify who really drives the decision.

---

# 7. Opportunity Details

Core commercial information.

Fields include:

- Opportunity Type
- Category
- Estimated Value
- Estimated Margin
- Competition
- Priority
- Closing Probability
- Expected Signature Date

Custom fields may be added in future releases.

---

# 8. Pipeline Stage

Displays the current stage.

Suggested stages:

- Prospect
- Qualified
- Discovery
- Proposal
- Negotiation
- Verbal Agreement
- Contract
- Won
- Lost

Every stage should have mandatory exit criteria.

---

# 9. Activities

Every interaction connected to the opportunity.

Examples:

- Calls
- Meetings
- Emails
- Business Lunches
- Match Invitations
- Internal Meetings

Activities should display:

- Date
- User
- Outcome
- Next Action

---

# 10. Timeline

Chronological history.

Examples:

Opportunity Created

↓

Qualification

↓

First Meeting

↓

Proposal Sent

↓

Negotiation

↓

Hospitality

↓

Contract Signed

Every important event should appear automatically.

---

# 11. Proposal Center

Every proposal belongs here.

Display:

- Proposal Version
- Value
- Status
- Delivery Date
- Expiration
- Drive Link
- PDF
- Internal Notes

Possible Statuses:

- Draft
- Sent
- Viewed
- Under Discussion
- Revision Requested
- Accepted
- Rejected

Proposal history should never be lost.

---

# 12. Documents

Central repository.

Examples:

- Presentations
- Price Lists
- Contracts
- Technical Documents
- Meeting Notes

Every document should remain linked to the opportunity.

---

# 13. Hospitality & Match Experience

Sport is one of the strongest commercial assets.

Display:

- Invited Matches
- Guests
- Attendance
- Hospitality Package
- Feedback
- Commercial Outcome

Hospitality should always be connected to business development.

---

# 14. AI Assistant

The AI Assistant supports the negotiation.

Examples:

Relationship Summary

Negotiation Summary

Missing Information

Suggested Next Step

Risk Analysis

Recommended Proposal

Suggested Hospitality Event

Email Draft

Meeting Preparation

Every recommendation should include an explanation.

---

# 15. Closing Checklist

Before marking an opportunity as Won, the system verifies:

✓ Proposal Approved

✓ Contract Uploaded

✓ Commercial Value Confirmed

✓ Owner Assigned

✓ Next Steps Defined

Before marking Lost:

- Loss Reason
- Competitor
- Lessons Learned
- Future Follow-up Date

---

# 16. Commercial Intelligence

Displays strategic information.

Examples:

- Deal Age
- Number of Meetings
- Proposal Revisions
- Average Response Time
- Engagement Score
- AI Success Prediction

The objective is to understand the health of the negotiation.

---

# 17. Related Opportunities

The system should identify:

- Previous negotiations
- Renewals
- Upselling opportunities
- Cross-selling opportunities

Commercial relationships rarely end with one partnership.

---

# 18. Future Modules

Future releases may integrate:

- Digital Signature
- Contract Workflow
- Budget Approval
- Revenue Forecast
- Sponsorship ROI
- Activation Planner
- Renewal Manager

The architecture should support these capabilities without redesigning the workspace.

---

# 19. Success Criteria

A Partnership Manager should be able to complete the entire sales process from this workspace.

No external spreadsheet should be required.

Every commercial decision should be supported by complete information.

---

# 20. Guiding Question

Every new feature added to this workspace should answer one question:

**Does this help the commercial team close partnerships more effectively?**

If the answer is no, the feature should be reconsidered before implementation.