# Prompting

## Title

AI — Prompting Conventions for This Codebase

## Purpose

This document specifies how prompts — both prompts written by humans to direct Claude Code (or any
other AI coding assistant) against this repository, and prompts that a future in-product AI feature
would send to a language model — should be structured, given this project's demonstrated,
effective pattern of strictly-scoped, sprint/release-based instructions.

## When to Use It

- Before writing a Claude Code prompt for a new sprint or release.
- Before designing the prompt template for any in-product AI feature (Section 5).

## Table of Contents

1. Why This Document Exists
2. Anatomy of an Effective Implementation Prompt
3. Anatomy of an Effective Documentation/Analysis Prompt
4. Anti-Patterns Observed
5. In-Product AI Prompting (Forward-Looking)
6. Writing Guidelines
7. Notes for Future Contributors

---

## 1. Why This Document Exists

Every sprint and release in this project so far (Sprint 1, Release 0.2, Release 0.2.1, Sprint 2)
was specified to Claude Code using a consistent, effective structure. This document extracts that
structure explicitly so future prompts (from any human collaborator) reliably produce the same
quality and scope discipline, instead of relying on tacit convention.

## 2. Anatomy of an Effective Implementation Prompt

Based on the pattern used successfully across this project's sprints:

1. **Context statement** — name the project, state that it follows a sprint/release roadmap, list
   what has already shipped.
2. **Explicit "IMPORTANT" framing constraints** — stated before the task list, not after: no UI
   changes, no permission wiring, backward compatibility mandatory, etc.
3. **Numbered task list** — each task self-contained and concrete enough to verify independently.
4. **Explicit forbidden-files/forbidden-actions list** — named modules and behaviors that must not
   change, stated as an enumerated list, not a vague "don't break anything."
5. **Explicit required output format** — a numbered list of exactly what the completion report must
   contain (e.g., "1. Files modified 2. Data model changes 3. Backward compatibility confirmation
   ...").

A prompt missing (4) or (5) still works, but produces a weaker completion report and a higher risk
of scope creep, since there is nothing concrete to check the delivered work against.

## 3. Anatomy of an Effective Documentation/Analysis Prompt

For read-only or documentation-only work (e.g., the architecture review, the CRM 3.0 design
document, this documentation framework itself): state the role/perspective explicitly ("Principal
Software Architect"), state the read-only/no-code-change constraint explicitly and early, specify
the exact output structure (named sections), and repeat the no-code-change constraint at the end —
redundant framing around irreversible-action constraints is a deliberate, effective pattern here,
not noise.

## 4. Anti-Patterns Observed

- **Vague scope with no forbidden list**: leads to an implementer (human or AI) making reasonable
  but unrequested improvements, which then need to be reviewed and possibly reverted.
- **No required output format**: leads to a completion report that doesn't let the requester verify
  compliance without re-reading the diff themselves.
- **Implicit assumption of prior context in a fresh session**: an AI collaborator's context can be
  reset (e.g., a new agent, a compacted conversation) — a prompt that depends on unstated prior
  context should instead restate the needed facts, or point to the exact `docs/` file that has them
  (this documentation framework exists partly to make that pointing possible).

## 5. In-Product AI Prompting (Forward-Looking)

Not yet applicable (see `docs/05_AI/AI_Assistant.md` Section 1 — status: Planned), but the same
underlying discipline should carry over: any prompt template built for the future AI Assistant
should (a) constrain the model to operate only on the specific entity/timeline data passed in, not
invent facts, (b) explicitly request `Origine: AI` tagging and structured `Metadata` output matching
`ACTIVITY_METADATA_TEMPLATE` (`docs/03_Data_Model/Activities.md` Section 6), and (c) never be given
implicit authority to write to deterministic business-logic fields (see
`docs/05_AI/AI_Assistant.md` Section 5).

## Writing Guidelines

- Ground every convention stated here in a real, observed instance from this project's history —
  this document is meant to codify what has actually worked, not abstract best practice.
- Keep Sections 2–3 as checklists a human can literally copy when drafting the next prompt.

## Notes for Future Contributors

- When a new prompt pattern proves effective (or a new anti-pattern is observed), add it here
  immediately — this document's value compounds with real examples over time.
- When the in-product AI Assistant is actually built, replace Section 5's forward-looking language
  with the real, implemented prompt template and link to its source location.
