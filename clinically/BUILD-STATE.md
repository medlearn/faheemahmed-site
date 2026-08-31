# Clinickly Co-pilot — State of the Build (review summary)

A plain-English summary of the full screen-by-screen review (clinician portal §1–§11, MDT panel P1–P5, admin console A1–A8). Companion to the prioritised [DEVELOPER-FIX-LIST.md](DEVELOPER-FIX-LIST.md).

## The headline
**The architecture and the governance model are right — and the hard part is genuinely well-built.** The three-portal structure, the two-step sign-off (panel reviews → clinical lead signs), the side-by-side content verification, and the audit trail all work and hang together. Where the build falls short is in **two areas**: (1) a handful of **safety bugs in the AI output**, and (2) the **actual AI generation layer** is mostly stubbed — the pipeline that *wraps* the AI is built, but the grounded, cited generation *inside* it is not.

## What's genuinely strong (protect these)
- **Governance review** — the reviewer checks every AI line against its source and nothing publishes until all are ticked. This is the whole value proposition, and it's built well.
- **Two-step, named, dated, versioned sign-off** + a live **audit trail** — the defensibility backbone.
- **The guideline detail page** is the quality bar: named reviewer, verify-at-source, patient/clinician views, defers doses to BNF, refuses to invent a first-line.
- **Positioning is consistent and correct** throughout — teaching/CPD not clinical advice, advisory-only, decision-support-not-a-directive.

## The must-fixes before anything real (P0)
1. **Notes invent content** — the AI is pulling in context that wasn't in the consultation, including **fabricated vital signs**. Must draft from the transcript only; flag gaps, never fill them.
2. **The anonymiser leaks identifiers** — "J.M." reached an "anonymised" case the clinician had attested was clean. Must strip identifiers from **text and images** before submit.
3. **Verification needs a real source link** — in governance review the "source passage" has no link, so ticking "matches source" checks AI against AI (the quote itself could be hallucinated). Each passage must deep-link to the real source.
4. **Codes are AI-guessed** (a cough code labelled "Fever") — validate against a terminology server.
5. **Separation of duties + signer qualification** — the same person can currently review and sign; and a non-clinician can sign clinical content. Enforce reviewer ≠ signer (risk-tiered) and clinical-content-needs-a-clinician.
6. **Licensing** — don't reproduce BNF/NICE text; cite + link; BNF stays a link-out until licensed.

## The one big build gap (P2 — the theme behind several findings)
**The grounded, cited AI generation isn't built.** "Create draft" makes an empty shell; the guideline citations, the SOP "Build with AI" flow, and the note-drafting all depend on the *same* missing capability: an AI that drafts **from retrieved source text with a citation on every statement**. Build this once and it lights up guidelines, SOPs, training, and the safer note-drafting together. This is the core engineering investment.

Other real build gaps: wire the MDT case loop to the database (persist + notify); case image upload; training content + the CPD/revalidation log; session video (Bunny) + recording PII-review gate; the full panel credentialing record; search-gap + CPD reporting; and a two-tier tenancy model (clinic-scoped vs platform-scoped) with proper isolation before a second clinic exists.

## Recurring themes (each fixes several screens at once)
- **Stop the AI inventing / leaking** → fixes the note, the MDT case, and the anonymisation attestation.
- **Fix routing once** → the content is tagged with the right specialty already; the bug is that everything also defaults to the Chair. Route to the right specialist and the cases *and* content queues come right.
- **Build grounded+cited generation once** → guidelines, SOPs, training, notes.
- **Persist + reconcile** → the "0 in DB", empty charts, and mismatched counts are one underlying data-wiring issue.

## Bottom line
This is a **strong prototype with the right bones.** It is **not yet safe for real clinical use** — the P0 list must land first. But nothing on the list is architectural rework; it's finishing the AI layer honestly and closing the safety gaps. The governance scaffolding that's hardest to get right is already here.
