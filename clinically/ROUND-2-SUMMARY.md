# Round 2 — Verification Summary (9–13 Jul 2026)

Full evidence: [BUILD-REVIEW.md](BUILD-REVIEW.md) §R2.1–R2.26 · Action list: [DEVELOPER-FIX-LIST.md](DEVELOPER-FIX-LIST.md) · Spec: [CLINICKLY-MASTER.md](CLINICKLY-MASTER.md)

## Headline
**An excellent fix round.** 21 items verified fixed — including every heavyweight safety item from round 1 — several implemented word-for-word from the spec and some beyond it (the source-open-gated verification tick is gold standard). Two items are confirmed still broken, and the final screen surfaced one significant NEW problem (Ask Clinickly's positioning).

## ✅ Verified fixed (21) — highlights
- **Notes draft from the transcript only** — same test that produced 12 invented lines in round 1 now produces zero; missing vitals are flagged, never fabricated.
- **Attestation sign-off** — word-perfect dialog, tick-gated, lock + addenda.
- **Anonymiser (text)** — patient ref stripped at note→case.
- **Governance source links — GOLD STANDARD** — every passage links out; "Matches source" is *enforced-gated* on opening the source ("the quote alone is not evidence").
- **Two-step sign-off sequenced** — no Sign-off button until panel review completes; reviewer ≠ signer in practice.
- **Routing by specialty** — both cases and content reach the right specialist.
- **Per-statement citations + BNF link-out** — licensing model complete on published pages.
- **Training/CPD complete loop** — module content + reflection capture + CPD log auto-fed by MDT participation + GPhC/GMC-shaped portfolio export.
- **Claim-a-task marketplace + fee-band table** — §4B near-verbatim (no bidding, tag-gating, one-owner, risk tiers on items, claim/release, audit-logged).
- **Recording pipeline** — HOLDING → PII REVIEWED → CONSENT → PUBLISHED with named steps; promote-to-training.
- **Reports plumbing** — charts wired to real data; audit trail append-only + CSV export; flag-back-with-reason and NEEDS-UPDATE proven in the log.
- Two-panel split, live library state badges, honest failure states, urgent escalation, admin tile fixes, standards ownership/cadence.

## ❌ Confirmed still broken (2)
1. **Code validation** — `R05.9` still labelled "Fever" (it's the cough code). The "verify before use" badge is a caveat, not a fix. Needs terminology-server validation.
2. **Case submission regression** — worked 6–8 Jul, fails since 9 Jul. Diagnostic: failed cases appear in admin Case-assignment WITHOUT IDs — the insert half-succeeds, then ID-assignment/panel-handoff fails.

## 🛑 NEW P0s found in round 2 (3)
1. **Ask Clinickly must be rescoped** — as built it solicits an individual patient's details to refine a differential (patient-specific diagnostic support — contradicts the positioning AND the draft MHRA letter) and answers uncited from model memory. Rescope: cited guidance-navigator over the governed library; general only; hand-offs to MDT case / co-pilot.
2. **Credential gating** — members are ACTIVE with "Registration/PIN missing / DBS pending". Vetting must gate activation/claiming.
3. **Patient refs leak into the central audit trail** ("patient N.R / JS") — audit descriptions must carry item type only; include in the retro-scrub.

## 🔶 Other new/remaining work
- **Two-tier tenancy + clinics management** — still conflated; mystery unscoped gmail clinician accounts (close open signup, require display names).
- **Retro-scrub legacy data** — old "J.M." case, mis-tags, "Not recorded" consultations, audit rows.
- **Schedule single-source** — admin correct (28 Jul), panel view stale (15 Aug, a Saturday).
- **Reports v2** — current page = audit + counters; needs trends, per-clinic/clinician breakdowns, MDT SLAs, governance health, CPD matrix, exports, inspection pack.
- **Demand analytics** — missed-searches box exists but logging unverified (gibberish-search test); successful-search/pointer-open/SOP-demand/Ask-themes signals not built.
- **Grounded AI core (the big P2)** — cited generation for drafts + standards RAG-ingestion (gap-checks currently run a theme checklist — relabel the clinic-facing claim until real).
- **Test-data purge + no-test-data rule** — R3 sign test, Impetigo E2E, ddd, Dr P. Word, Ep Och, duplicate Riverside SOPs.
- Duplicate-SOP guard; clinic name from profile; SOP builder full best-practice output (§5.7 decision); Rosacea duplicate-section render; chip coverage rule; note-template footer check (outstanding micro-check).

## Round-3 priority order for the developer
1. Rescope **Ask Clinickly** (P0, device risk)
2. **Codes** via terminology server (P0)
3. **Case-submission regression** (with the no-ID diagnostic)
4. **Credential gating** + close open signup / tenancy model + clinics management
5. **Retro-scrub** (J.M. case, audit patient refs, legacy tags)
6. Schedule single-source · test-data purge · SOP builder best-practice output
7. Reports v2 + demand analytics signals
