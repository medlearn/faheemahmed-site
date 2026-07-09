# Clinickly Co-pilot — Developer Fix List (all three portals)

Priority-ordered actions from the full screen-by-screen review.
Detail + evidence: [BUILD-REVIEW.md](BUILD-REVIEW.md) (clinician §1–§11) · [BUILD-REVIEW-PANEL.md](BUILD-REVIEW-PANEL.md) (panel P1–P5) · [BUILD-REVIEW-ADMIN.md](BUILD-REVIEW-ADMIN.md) (admin A1–A8).
Spec source of truth: [CLINICKLY-MASTER.md](CLINICKLY-MASTER.md).

Legend: **P0** safety/governance (block real use) · **P1** correctness bugs · **P2** build gaps (specced, not built) · **P3** tidy-ups/UX.

---

## ✅ What's genuinely strong — DON'T break these
- **Governance review workflow** (panel P2) — side-by-side recommendation ⟷ source, "Matches source", hard gate ("nothing publishes until all verified"). The keystone of the whole product.
- **Two-step sign-off, end to end** (panel → admin) — named, dated, versioned; full audit trail (admin A2/A8). This is the defensibility backbone.
- **Guideline detail page** (§6) — real governance state, named reviewer, "verify at source", clinician/patient toggle, BNF-defer, "no single first-line" honesty. The quality bar for all content.
- **Positioning/framing everywhere** — "teaching/CPD, not advice on a live patient", advisory caveats, "decision support not a directive".
- **Form structures** — MDT case dropdowns (Appendices B/C), consent gating, anonymisation banners, real computed metrics (dashboard, CPD minutes).

---

## P0 — Safety & governance (must fix first)
- [x] **Notes draft from the transcript ONLY** — **VERIFIED FIXED (R2.2, 9 Jul):** same cough-transcript test → Subjective contains only transcript content, zero scenario/ADHD leakage.
- [x] **Never fabricate objective data / vitals** — **VERIFIED FIXED (R2.2):** Objective now shows ⚠️ "No vital signs recorded — add if taken" / "No physical examination findings recorded"; Plan flags gaps instead of inventing. Flag-not-fill implemented.
- [x] **Anonymiser strips identifiers — TEXT VERIFIED (R2.4, 9 Jul):** note with patient ref "FS" → case summary contains no trace (age band only; round 1 leaked "J.M."). **Remainder:** AI identifiable-IMAGE check is a stated production integration — verify at launch.
- [ ] **Governance-review source passages need a real deep link** (P2). Each passage links to the exact cited location so the reviewer confirms the quote is *real* — without it, "Matches source" checks AI against AI (quote could be hallucinated). Store retrieved text + URL + date; ideally gate the tick on opening it.
- [ ] **Validate all codes** against a SNOMED/ICD terminology server (§3). **STILL BROKEN at R2.2:** `R05.9` again labelled "Fever, unspecified" (R05 = cough; fever = R50.9). "AI-suggested — verify before use" badge added = caveat, not validation. J00/J06.9 correct.
- [x] **Note sign-off = draft → review → attest → sign** — **VERIFIED FIXED (R2.3):** "Attest & sign" dialog with the exact attestation tick ("I have read this note and confirm it is an accurate record of this consultation"), sign button disabled until ticked, lock + addenda-never-edit stated.
- [x] **Content licensing** — **VERIFIED (R2.6 + R2.7):** BNF = "Open at BNF ↗" link-out on the card + `BNF (link-out)` chip on the doses line ("never from this summary"); own summaries cite + link with verify-at-source. Formal BNF licence still required before any deep BNF integration (unchanged).
- [ ] **Separation of duties — risk-tiered** (A1, §8). Reviewer ≠ signer (block same user_id). **High** (prescribing/safety, regulated SOPs) = full two-person; **Medium** = single reviewer + sign-off; **Low** (typo) = light-touch/auto-approve + audit.
- [ ] **Signer qualification matches content type** (A2). Clinical content → **clinically-qualified lead** signs; governance/admin content → admin/governance lead OK. System checks role/registration vs content type.

## P1 — Correctness bugs
- [ ] **Fix routing — cases AND content — by specialty/type**. **Content half looks FIXED (R2.6):** NG87 (ADHD) reviewed by Dr L. Bright (psychiatry). Remainder: verify case routing in the panel inbox (right specialist receives, not just Chair).
- [x] **Remove the demo scenario from the real product** — **VERIFIED (R2.2):** real inputs (area · encounter · age band · ref · reason "never analysed"); no hidden injection. "Load demo consultation" remains as demo-mode affordance (acceptable).
- [x] **Age range → one standardised dropdown** — **VERIFIED (R2.2):** dropdown with agreed bands (0–17 shown).
- [x] **Tags / title / content follow actual content** — **VERIFIED (R2.4):** note titled "Consultation note", tags match selections/content; case title auto-generated from tags, no patient info.
- [x] **Surface per-statement citations on the published page** — **VERIFIED FIXED (R2.7):** statements carry source+section chips (NICE CKS Rosacea – Diagnosis/Management/etc). Remainder: chip coverage ~70% — agree rule that every *recommendation* gets a chip; fix the duplicated "Management approach" section (rendering bug).
- [ ] **Two-tier tenancy + RLS isolation** (A7, §5.7). Clinic-scoped users (clinicians, clinic admins — see only their clinic) vs platform-scoped (MDT panel + Clinickly super-admin). Confirm with ≥2 clinics; enforce via RLS, not UI hiding.
- [ ] **Wire reports to real data** (A8). "Consultations by clinical area" / "MDT questions by type" empty despite activity elsewhere — analytics not reading the same data.
- [ ] **Reconcile case counts** (A1, A3, A8). "0 open cases" (admin) vs "1 awaiting" (panel) — different definitions or persistence gap.

## P2 — Build gaps (specced, not built)
- [ ] **⭐ Grounded, cited AI content generation** (§6, §7, A5) — THE big one. "Create draft" is a shell; the AI drafting from *retrieved source text* with *per-statement citations* isn't built. Underpins guideline citations, the SOP builder, and content drafts. Treat as one core capability, not three gaps.
- [ ] **Wire the MDT answering loop to the DB** (§4, §10, P1). **CONFIRMED STILL BROKEN at R2.5 (9 Jul):** case submission shows "NOT SENT TO THE PANEL — did not reach the clinic server"; Retry fails identically every time. Honest failure banner ✅ (fake success gone), but cases never persist. Notes API works — compare against it: cases endpoint deployed? Supabase RLS blocking insert? wrong URL? **The remaining Pillar-2 blocker.**
- [ ] **SOP "Build with AI" flow** (§7). Questions → AI draft → editable → compliance-check vs uploaded standards → sign-off → stored in the clinic's own (tenant-isolated) library.
- [x] **Case image upload** — **MOSTLY BUILT (R2.4):** photo upload (max 2 — spec said 1–5, OK for pilot) + crop-to-lesion guidance + EXIF/GPS strip on import + consent gate. **Remainder for production:** AI identifiable-image pre-check + encrypted UK/EU storage (verify at launch).
- [ ] **Training content + reflection + CPD log + PDF export** (§8). Modules are empty toggles; build embedded content + reflection capture + the accumulating CPD/revalidation record (auto-fed from modules + MDT participation) that exports as a reflective-account portfolio.
- [ ] **Panel member = full credentialing record** (A3, §4). Add: professional registration/PIN (verify against register), CV, photo, signed contract + terms, DBS, indemnity, verified qualification tags. One profile = the vetting gate.
- [ ] **Session library: Bunny video + real consent/PII-review/sign-off gate** (§11, P4, §5.10). Embedded signed-URL playback (no downloads); recordings go record → private → human PII review → redact → consent/anonymise → sign-off → publish.
- [ ] **Search-gap analytics + pointer-open tracking + CPD reporting** (A8, §4, R2.8 decision). **Not built at round 1 — the two-tier library depends on it.** Build in admin → Reports: (a) log every Guidelines search + Ask-Clinickly query with hit/miss + frequency → **"Top missed searches"** with one-click "Add to authoring backlog"; (b) **log opens of `INDEX → SOURCE` pointer entries** — a frequently-opened pointer is the promotion signal to author it as a full summary; (c) team CPD/training completion (inspection evidence). PII-safe (aggregate/tag-based, scrub free text).
- [ ] **Audit trail: immutable/append-only + exportable** (A8). Tamper-evident; PDF/CSV export for inspection.

## P3 — Tidy-ups & UX
- [ ] **Library entry tiers — DECISION locked (spec §5.6), implement it** (R2.8). Two tiers with **mandatory card badges**: `FULL SUMMARY` (Rosacea layout) vs `INDEX → SOURCE` (interim placeholder, no own content). Pointer entries are stopgaps promoted by search demand. **Starter-set topics (incl. NG112 recurrent UTI) must be FULL summaries before launch.** List which current entries are which.
- [ ] **Delete "Saved records" page** + **remove "Release to patient"** (deferred patient feature) (§4).
- [ ] **Note-template footer**: "standard · not customisable per clinic"; keep "customise → governance" only for SOPs/leaflets (§7).
- [ ] **Nav badges = unread-count that clears on open** (My cases §11; Governance review P2/P3) — not total-count.
- [ ] **"Recently published"** visually distinct from the actionable queue + clickable-to-view (A2).
- [ ] **"Panel members" tile subtitle** overflows → "across 4 specialties" (A1).
- [ ] **Soften "Auto-logged for revalidation"** → "CPD evidence for your portfolio" (§8).
- [ ] **Govern clinical training modules** like guidelines — cited/signed (§8).
- [ ] **MDT overview**: fill/remove empty shield card; show two panels (clinical vs governance) (§9); verified tags in panel directory (P5).
- [ ] **Regulatory standards**: restrict Upload to central admin/governance; assign named currency owner + review cadence (A6).
- [ ] **Teaching-slot free text**: add "general topic — no patient identifiers" hint + light PII check (A4). *(Free text itself is correct here.)*
