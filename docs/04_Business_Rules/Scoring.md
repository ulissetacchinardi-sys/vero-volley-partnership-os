# Scoring Business Rules

## Title

Business Rules — Sponsor Fit Score and Priority

## Purpose

This document specifies the deterministic, rules-based scoring model that replaces manual fit
assessment. It is the reference for anyone modifying `Scoring.gs`, and for explaining to the
commercial team exactly why a lead received a given score.

## When to Use It

- Before changing any scoring weight or threshold.
- When a commercial user asks why a specific lead has a given score or priority.
- Before adding a new scoring criterion.

## Table of Contents

1. Design Intent
2. Scoring Weights
3. Scoring Criteria
4. Revenue Parsing
5. Priority Thresholds
6. Recalculation
7. Writing Guidelines
8. Notes for Future Contributors

---

## 1. Design Intent

Every lead's `Sponsor Fit Score` (0–100) and `Priorita` are computed automatically, from explicit,
inspectable weights and thresholds (`Scoring.gs`, top of file) — not a black box, and not manually
compiled. The stated intent is that the commercial team can ask for weights to be retuned without
needing to understand the rest of the codebase.

## 2. Scoring Weights

`SCORING_WEIGHTS`: territorio 25, settore 25, dimensioneMax 20, fatturatoMax 20, benchmark 10.
Maximum achievable score is 100 (25+25+20+20+10).

## 3. Scoring Criteria

`computeSponsorFitScore_` awards points independently for each criterion (no criterion excludes
another):

- **Territorio** (25 pts): awarded if the week's requested territory (`Territorio Richiesto`,
  comma-separated) fuzzy-matches (substring, either direction, after normalization) any of the
  lead's sede/provincia/regione.
- **Settore** (25 pts): same fuzzy-match logic, against the lead's `Settore` vs. `Settore
  Richiesto`.
- **Dimensione Azienda** (up to 20 pts): fixed lookup via `COMPANY_SIZE_SCORES` — `1-10`→5,
  `11-50`→10, `51-200`→15, `200+`→20.
- **Fatturato Stimato** (up to 20 pts): tiered by parsed revenue value (see Section 4) — ≥50M→20,
  ≥10M→15, ≥2M→10, ≥500K→5, below→0.
- **Benchmark di Riferimento** (10 pts): awarded simply if the field is non-empty — presence of a
  known comparable sponsor is itself considered a positive signal, regardless of its content.

The final score is clamped to `[0, 100]` and rounded. A human-readable `Motivo del Fit` is built by
joining the natural-language reason for every criterion that scored above its threshold (or a
single explanatory sentence if none did).

## 4. Revenue Parsing

`parseRevenue_` interprets free-text revenue figures (e.g., `"5.000.000"`, `"5,5 mln"`, `"5M€"`).
Rule: if a "millions" indicator is present (`mln`, `mil`, `m€`, `m eur`, or a bare `m`), a `.`
followed by exactly 3 digits is treated as a thousands separator and stripped, while `,` is always
treated as a decimal separator; the resulting number is multiplied by 1,000,000. Without a millions
indicator, all non-digit characters are stripped and the remaining digits are read as a plain
integer. This is a heuristic over free-text input, not a guaranteed-correct parse — this specific
rule exists because a naive "strip everything but digits" approach previously misread `"5,5 mln"`
as 55,000,000 instead of 5,500,000 (a 10x error), by discarding the decimal separator along with
formatting punctuation.

## 5. Priority Thresholds

`PRIORITY_THRESHOLDS`, evaluated highest-first, first match wins: score ≥80 → `A - Alta`; ≥60 →
`B - Media`; ≥40 → `C - Bassa`; otherwise → `Escludere`.

## 6. Recalculation

`recalculateOpenLeadScores_` (exposed as `recalculateScores` in `Code.gs`) re-scores every row
currently in `Lead Weekly` using its stored field values — intended to be run manually after a
weight/threshold change, so historical leads reflect the new rules instead of only new leads going
forward. It does not touch `Archivio Lead`.

## Writing Guidelines

- State exact numeric thresholds and weights — a scoring document that says "high revenue scores
  well" without the exact tier boundaries is not useful for predicting behavior.
- When documenting a parsing heuristic (Section 4), state the known limitation explicitly rather
  than implying it is a fully general solution.

## Notes for Future Contributors

- Any weight or threshold change must be reflected here in the same change as the `Scoring.gs`
  edit, and should prompt a reminder (in the release's completion report) to run
  `recalculateScores` if retroactive consistency matters.
- If a new scoring criterion is added, document its weight, its condition, and its contribution to
  `Motivo del Fit` in the same structure as Section 3, and update `SCORING_WEIGHTS`'s documented max
  total in the same change.
