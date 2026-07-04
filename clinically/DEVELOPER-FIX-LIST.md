# Clinickly Co-pilot — Developer Fix List

One-page, priority-ordered actions from the screen-by-screen build review.
Full detail + evidence per screen: [BUILD-REVIEW.md](BUILD-REVIEW.md) (clinician + case screens).
Spec source of truth: [CLINICKLY-MASTER.md](CLINICKLY-MASTER.md).

Legend: **P0** safety/governance (block real use) · **P1** correctness bugs · **P2** build gaps (specced, not built) · **P3** tidy-ups/UX.

---

## ✅ What's strong — DON'T break these
- **Guideline detail page (Rosacea)** — exemplary: real governance state + named reviewer, "verify at source", clinician/patient toggle, BNF-defer, "no single first-line" honesty. **This is the quality bar for all content.**
- **Form structures** — MDT case dropdowns (Appendices B/C), consent gating, anonymisation banners.
- **Governance metadata** on guidelines; **real computed metrics** (dashboard, training CPD minutes).
- **Positioning/framing** everywhere — "teaching/CPD, not advice on a live patient", advisory caveats, "decision support not a directive".

---

## P0 — Safety & governance (must fix first)
- [ ] **Notes must draft from the transcript ONLY** (§3). Never invent content. Kill demo-scenario/context injection into `/api/notes`. *This one fix also cleans up the fabricated MDT case (§10).*
- [ ] **Never fabricate objective data / vitals** (§3). If not dictated → show a soft ⚠️ flag ("No vitals recorded"), never an invented value ("BP within normal range"). **Blank/flagged > fabricated.**
- [ ] **Anonymiser must strip identifiers** (§10). "J.M." leaked into an "anonymised" case while the clinician attested "no identifiers". Strip initials/patient-refs on note→case; the pre-submit identifier check must catch them.
- [ ] **Validate all codes** against a SNOMED/ICD terminology server (§3). Currently AI-guessed + mislabelled (e.g. cough code labelled "Fever"). Reject unmappable codes.
- [ ] **Note sign-off = draft → review → attest → sign** (§3). Editable draft; attestation tick ("I have read this and confirm it's accurate") is the only hard gate; then lock + addenda-not-edits.
- [ ] **Content licensing** (§5). Don't reproduce BNF/NICE text — write our own summaries that **cite + link** ("verify at source"). **BNF = link-out only** until the licence is bought.

## P1 — Correctness bugs
- [ ] **Tags & routing must follow actual content** (§1/§2/§3/§10). ADHD note tagged Autism; ADHD case routed to Dermatology; dashboard note title ≠ body. Same root cause as P0 (scenario injection + tag logic).
- [ ] **Remove the demo scenario from the real product** (§2). Real inputs only; never inject hidden context into the AI.
- [ ] **Age range → one standardised dropdown** (§2) with agreed bands. Two schemes currently in the data (30–39 vs 30–34).
- [ ] **Surface per-statement citations on the published page** (§6, Panel §P2). The per-statement source mapping **already exists** (used in Governance review) — carry it through to the published clinician page as inline chips, not just a document-level "Sources" bar. Smaller than "build from scratch".
- [ ] **Fix routing — cases AND content — by type/specialty** (Panel §P1/§P2). (a) Cases route to the panel member matching the **specialty tag** (Appendix B) — currently a Governance Chair gets clinical psych/derm cases. (b) **Content review** routes by content type: clinical guideline → **Clinical MDT** specialist (a derm guideline → dermatologist); SOP/policy → **Governance MDT** (§4B). Depends on the tag fix above.

## P2 — Build gaps (specced, not built)
- [ ] **Prove the MDT loop is DB-wired, not local** (§4/§10, Panel §P1). Loop round-trips **in one browser** (confirmed by live test) but that may be local/session state (earlier DB = 0). **Acceptance test:** submit as clinician on one device/login → answer as panel on a *different* device/login → it appears + **notifies** the clinician. Must persist server-side.
- [ ] **SOP "Build with AI" flow** (§7). Questions → AI draft → editable → compliance-check vs uploaded standards → sign-off → stored in the clinic's own (tenant-isolated) library.
- [ ] **Training module content + reflection capture** (§8). Modules are empty toggles; add real content + a "what will you change?" reflection.
- [ ] **CPD / revalidation log + PDF export** (§8). The actual record behind the tiles — auto-populated from modules + MDT participation; exports as a reflective-account portfolio.
- [ ] **Session library: real Bunny video + consent/sign-off gate** (§11).

## P3 — Tidy-ups & UX
- [ ] **Delete the "Saved records" page** (§4) — merged into Clinical notes / My cases.
- [ ] **Remove "Release to patient" / patient-sharing** (§4) — deferred patient feature.
- [ ] **Note-template footer**: "standard · not customisable per clinic" (§7). Keep "customise → governance" only for SOPs/leaflets.
- [ ] **Fold the "in DB" persistence badge** into Clinical notes (§4).
- [ ] **Nav badge "My cases · 1"** → unread-count that clears on open, not total-count (§11).
- [ ] **Soften "Auto-logged for revalidation"** → "CPD evidence, ready for your portfolio" (§8).
- [ ] **Govern clinical training modules** like guidelines — cited/signed (§8).
- [ ] **MDT overview**: fill or remove the empty shield card; eventually show the two panels (clinical vs governance) (§9).

---

## Still to review (separate files)
- **MDT panel-member portal** → [BUILD-REVIEW-PANEL.md](BUILD-REVIEW-PANEL.md)
- **Admin / Governance console** → [BUILD-REVIEW-ADMIN.md](BUILD-REVIEW-ADMIN.md)
