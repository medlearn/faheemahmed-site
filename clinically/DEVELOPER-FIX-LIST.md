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
- [ ] **Retro-scrub legacy records** (R2.14). The anonymiser fix did not clean pre-fix data: old case C-236 **still shows "J.M."** to panel members (and keeps its mis-tag). One-off migration: strip identifiers + correct tags on all existing cases/notes created before the fix.
- [x] **Fix routing — cases AND content — by specialty/type** — **VERIFIED FIXED (R2.6 + R2.14):** content reviewed by matching specialist (NG87→Dr Bright); dermatologist's inbox shows only dermatology-tagged cases; badge = awaiting-count. Remainder: legacy C-236 keeps its round-1 mis-tag (fix with the legacy scrub below).
- [x] **Remove the demo scenario from the real product** — **VERIFIED (R2.2):** real inputs (area · encounter · age band · ref · reason "never analysed"); no hidden injection. "Load demo consultation" remains as demo-mode affordance (acceptable).
- [x] **Age range → one standardised dropdown** — **VERIFIED (R2.2):** dropdown with agreed bands (0–17 shown).
- [x] **Tags / title / content follow actual content** — **VERIFIED (R2.4):** note titled "Consultation note", tags match selections/content; case title auto-generated from tags, no patient info.
- [x] **Surface per-statement citations on the published page** — **VERIFIED FIXED (R2.7):** statements carry source+section chips (NICE CKS Rosacea – Diagnosis/Management/etc). Remainder: chip coverage ~70% — agree rule that every *recommendation* gets a chip; fix the duplicated "Management approach" section (rendering bug).
- [ ] **Two-tier tenancy + RLS isolation** (A7, §5.7). Clinic-scoped users (clinicians, clinic admins — see only their clinic) vs platform-scoped (MDT panel + Clinickly super-admin). Confirm with ≥2 clinics; enforce via RLS, not UI hiding.
- [ ] **Wire reports to real data** (A8). "Consultations by clinical area" / "MDT questions by type" empty despite activity elsewhere — analytics not reading the same data.
- [ ] **Reconcile case counts** (A1, A3, A8). "0 open cases" (admin) vs "1 awaiting" (panel) — different definitions or persistence gap.

## P2 — Build gaps (specced, not built)
- [ ] **Upgrade CPD log/export to GPhC + GMC native formats** (§5.8 decisions 9 Jul, from the real forms). **Capture once** — 4-question reflection wizard (learned · practice change · benefit-to-service-users with example · SMART next steps) — **render per regulator**: GPhC = record types, records not minutes (6/yr = 4 CPD [≥2 planned] + 1 peer discussion + 1 reflective account; **MDT response→peer discussion with named panel peer**); GMC = Academy reflective template (activity + supporting-info category + GMP-domain tags + influence + SMART next steps). Auto-category/domain tagging; **AI criteria pre-check** (concrete patient-benefit example present? beyond one-word/descriptive?); profile registration sets default. Replace minutes-led framing. NMC phase 2.
- [ ] **⭐ Grounded, cited AI content generation** (§6, §7, A5) — THE big one. "Create draft" is a shell; the AI drafting from *retrieved source text* with *per-statement citations* isn't built. Underpins guideline citations, the SOP builder, and content drafts. Treat as one core capability, not three gaps.
- [ ] **MDT case submission — FIX THE REGRESSION** (reframed R2.14). The loop **works**: cases C-236–243 submitted 6–8 Jul, routed, answered, persisted with timestamps. But clinician-side submission **fails on 9 Jul** ("did not reach the clinic server", retry fails). Recent regression or session-specific failure — compare what changed since 8 Jul (deploy? env? auth token? RLS change?).
- [ ] **SOP builder — output must be a COMPLETE best-practice SOP, never a skeleton** (§5.7 decision 9 Jul, R2.10). Current build: minimal input → empty headings ("unfilled sections stay visibly unfinished") = inspection liability. Fix the rule split: clinic FACTS never invented (form/profile or flagged `[CONFIRM: …]` placeholder); process CONTENT always the full pre-authored best-practice default (zero input still yields an adoptable SOP); clinic DECISIONS get default + flag (`[CONFIRM: controlled drugs? Default NO]`); sign-off warns on unresolved placeholders. **Output anatomy = real CQC policy** (version-control block: Policy No · Responsible Person · Authorised · Issue/Review date · Version; References; Scope; AIM→POLICY→PROCEDURE). Also: duplicate guard (re-build → v2, never second v1) + clinic name from clinic profile not free text. **KEEP the "How this process actually runs in your clinic" field** (Faheem — it is what makes the SOP true to the clinic; empty = defaults, filled = woven in). **Catalogue taxonomy now = the Ahmeys CQC master index** (spec Appendix D — 5 categories, policy numbering, review cycles); phased via starter set + demand data. **New feature: auto-generated Master Policy Index per clinic** (number · title · version · signed-by · review date — the first thing inspectors ask for).
- [x] **Case image upload** — **MOSTLY BUILT (R2.4):** photo upload (max 2 — spec said 1–5, OK for pilot) + crop-to-lesion guidance + EXIF/GPS strip on import + consent gate. **Remainder for production:** AI identifiable-image pre-check + encrypted UK/EU storage (verify at launch).
- [ ] **Training content + reflection + CPD log + PDF export** (§8). Modules are empty toggles; build embedded content + reflection capture + the accumulating CPD/revalidation record (auto-fed from modules + MDT participation) that exports as a reflective-account portfolio.
- [ ] **Panel member = full credentialing record** (A3, §4). Add: professional registration/PIN (verify against register), CV, photo, signed contract + terms, DBS, indemnity, verified qualification tags. One profile = the vetting gate.
- [ ] **Session library: Bunny video + real consent/PII-review/sign-off gate** (§11, P4, §5.10). Embedded signed-URL playback (no downloads); recordings go record → private → human PII review → redact → consent/anonymise → sign-off → publish.
- [ ] **Demand analytics (search-gap + pointer-opens + SOP demand) + CPD reporting** (A8, §4, R2.8/R2.10 decisions). **Not built at round 1 — the two-tier library AND the SOP catalogue both depend on it.** Build in admin → Reports: (a) log every Guidelines search + Ask-Clinickly query with hit/miss + frequency → **"Top missed searches"** with one-click "Add to authoring backlog"; (b) **log opens of `INDEX → SOURCE` pointer entries** — promotion signal to author as full summary; (c) **log SOP demand — builds per starter template + "Request an SOP" submissions** → signal to author the next starter centrally; (d) team CPD/training completion (inspection evidence). PII-safe (aggregate/tag-based, scrub free text).
- [ ] **Audit trail: immutable/append-only + exportable** (A8). Tamper-evident; PDF/CSV export for inspection.

## P3 — Tidy-ups & UX
- [ ] **Templates & SOPs page: add SEARCH + a visible "Request an SOP" button** (R2.10, §5.7). Currently 8 fixed cards + category tabs only — a clinic wanting an SOP not in the catalogue (e.g. chaperoning) has no way to search for it or request it. The request mechanism exists admin-side ("submissions arrive as drafts") — expose the front door. Requests feed the demand analytics above.
- [ ] **Library entry tiers — DECISION locked (spec §5.6), implement it** (R2.8). Two tiers with **mandatory card badges**: `FULL SUMMARY` (Rosacea layout) vs `INDEX → SOURCE` (interim placeholder, no own content). Pointer entries are stopgaps promoted by search demand. **Starter-set topics (incl. NG112 recurrent UTI) must be FULL summaries before launch.** List which current entries are which.
- [ ] **Delete "Saved records" page** + **remove "Release to patient"** (deferred patient feature) (§4).
- [ ] **Note-template footer**: "standard · not customisable per clinic"; keep "customise → governance" only for SOPs/leaflets (§7).
- [ ] **Nav badges = unread-count that clears on open** (My cases §11; Governance review P2/P3) — not total-count.
- [ ] **"Recently published"** visually distinct from the actionable queue + clickable-to-view (A2).
- [ ] **"Panel members" tile subtitle** overflows → "across 4 specialties" (A1).
- [x] **Soften "Auto-logged for revalidation"** — **VERIFIED (R2.11):** now "CPD evidence for your portfolio · reflections included in export".
- [x] **Govern clinical training modules** — **VERIFIED (R2.11 + R1 P3):** modules badge "MDT-governed content" and appear in the governance review queue.
- [x] **MDT overview: shield card + two panels** — **VERIFIED FIXED (R2.12):** Clinical MDT vs Governance MDT shown with correct remits; shield card gone; pharmacist (Dr N. Newman) added. Remainders: **delete test members "Dr P. Word"/"Ep Och" from the roster**; verified qualification tags in the panel directory still to check (P5).
- [ ] **Regulatory standards**: restrict Upload to central admin/governance; assign named currency owner + review cadence (A6).
- [ ] **Teaching-slot free text**: add "general topic — no patient identifiers" hint + light PII check (A4). *(Free text itself is correct here.)*
