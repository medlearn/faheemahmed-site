# Clinickly Co-pilot — Build Review (developer snag list)

Review of the developer's actual build against [CLINICKLY-MASTER.md](CLINICKLY-MASTER.md), screen by screen.
Legend: **✅ confirmed working** · **🐛 fix** · **❓ confirm with developer**

---

## ROUND 2 — verification pass (developer's fixes, 9 Jul 2026)

### R2.1 Dashboard — strong signals, P0s not yet verifiable here
- ✅ **Discrepancy flagging appears IN** — the §1/§3 smoking-gun note ("ADHD medication review" with cough content) now shows *"Discrepancy noted: case context indicates adult patient on ADHD shared-care review; transcript describes…"* → flags the context/transcript mismatch instead of silently blending. Right behaviour; verify at note level.
- ✅ **Safe hedged language in new notes** — "consistent with X or Y", "clinician to confirm"; **"Not recorded"** shown for missing patient ref (blank > fabricated, applied).
- ✅ Metrics live (5 consults · 5 notes signed · 2.6 hrs · **2 open MDT cases "awaiting panel"** — open cases now surface; was 0-in-DB).
- ✅ **Second named signer visible** — "Kazeem" signs a *clinic* SOP; Faheem signs central content (clinic-lead model + separation-of-duties signal).
- 🆕 "Ask Clinickly" in nav (§5.11) — review when reached.
- 🐛 **Duplicate audit entries** — Kazeem's "Signed off clinic SOP Private prescribing" logged twice (00:39 + 00:40). Double-log or double-sign allowed? Ask.
- ⏳ P0 verification needs the note body — next: same cough-transcript test on Consultation/Clinical notes.

### R2.2 Consultation — same cough-transcript test — ✅ **TOP TWO P0s VERIFIED FIXED**
Same input as round 1: *"4-day history of cough, cold and headache. No allergies."*
- ✅ **P0 transcript-only VERIFIED** — Subjective = cough · cold · headache · NKDA, **nothing else**. Zero ADHD/scenario content (round 1: 12 invented lines). UI states "THE NOTE IS DRAFTED FROM THIS — AND ONLY THIS."
- ✅ **P0 no-invented-vitals VERIFIED** — Objective now: ⚠️ "No vital signs recorded — add if taken" + ⚠️ "No physical examination findings recorded" (round 1: fabricated "BP and pulse within normal range"). Plan flags "management plan not documented" / "no safety-netting recorded" instead of inventing. **Flag gaps, never fill = implemented.**
- ✅ **Demo scenario removed; real inputs in** — Clinical area · Encounter type · **Age range dropdown with agreed bands (0–17)** · patient ref · reason "never analysed". ("Load demo consultation" remains as demo-mode affordance — acceptable.)
- ✅ **Decision support repositioned to general + documentation prompts** (the device-risk fix) — "NICE/PHE guidance advises against routine antibiotics for uncomplicated viral URTI" (general, cited, medium-confidence, "requires clinician judgement"); no "in this patient" phrasing; footer "a documentation aid, not clinical instructions".
- ✅ Assessment appropriately hedged inference ("likely viral aetiology", "consistent with").
- ✅ **Attest & sign** button present — click through to verify attestation wording + lock (pending).
### R2.3 Attest & sign dialog — ✅ **P0 attestation gate VERIFIED, word-perfect**
- ✅ Attestation tick = exact spec wording: *"I have read this note and confirm it is an accurate record of this consultation."*
- ✅ "Sign the note" **disabled until ticked** (hard gate); lock + addenda-never-edit stated in the dialog ("the signed note is never edited").
- Chain complete: draft → review → attest → sign → lock.

### R2.4 Signed note → Create MDT case — ✅ **ANONYMISER P0 VERIFIED (text)**
- ✅ **"FS" stripped** — note carries patient ref FS; generated case summary = "Age 0–17 — anonymised; no identifiers", no initials anywhere (round 1: "J.M." leaked). Note→case anonymisation working for text.
- ✅ **Image upload built** (max 2; spec said 1–5 — OK for pilot): crop-to-lesion guidance, **EXIF/GPS stripped on import**, consent gate. ⏳ **AI identifiable-image check + encrypted storage = stated production integration** ("photos stay in this browser in the prototype") — verify at launch.
- ✅ **Tags/title follow content** (P1 verified) — "Consultation note", tags = General & acute prescribing · New/initial assessment; case title auto-generated from tags, no patient info; sensible routing default (Pharmacy & prescribing).
- ✅ "Key question for panel" now **required** with sharper prompt; consent checkbox still gates Submit; note shows **"NOT IN CLINIC RECORD"** badge (Version A clarity).
- 🐛 P3: case summary embeds the ⚠ documentation-prompt lines verbatim ("No vital signs recorded — add if taken.;") — strip prompts from case export.

### R2.5 Case submission — ✅ honest failure state (big improvement); ❓ persistence inconclusive
- ✅ **Silent fake success is GONE** — round 1 claimed "MDT case created" while DB showed 0. Now: red **"NOT SENT TO THE PANEL — the submission did not reach the clinic server"** + **Retry submission**; case ID correctly unassigned ("C–…"). App knows whether persistence succeeded and says so. Honest failure = safety feature.
- ✅ Anonymised summary held through submit (age band, no "FS").
- ❌ **CONFIRMED: case backend not working** — Retry gives the same "did not reach the clinic server" every time. Notes persist (notes API wired) but **cases never land**. Same gap as round 1 (0-in-DB), now surfaced honestly instead of faked. **The Pillar-2 case loop remains the single biggest outstanding build item.** Likely causes for dev: cases endpoint missing/erroring, Supabase RLS blocking insert, or wrong URL — notes API works, so compare against it.

### R2.6 Guidelines library — ✅ BNF link-out + live state badges + specialist routing evidence
- ✅ **BNF = link-out (licensing fix, BNF half VERIFIED)** — Lisdexamfetamine card button now **"Open at BNF ↗"** (external), not our content. (Own-summary cite+link still to verify on a detail page.)
- ✅ **State badges live from the pipeline** — Rosacea update draft shows "draft · IN REVIEW", "check accuracy before it publishes", **no Open button** ("In the pipeline") → unpublished drafts unreadable in clinician library. Cards carry **versions** (NG87 v3). (NEEDS-UPDATE/stale badge still unseen.)
- ✅ **Content-review routing to specialist (evidence)** — NG87 (ADHD) "AI-drafted · reviewed by **Dr L. Bright**" (psychiatry) — round 1 had clinical content reviewed by governance chair. Content half of routing P1 looks fixed; case half (panel inbox) still to verify.
- 🐛 **Test junk published as GOVERNED v1** — "R3 sign test" (summary "s"), "Impetigo first-line — cross-machine E2E" (summary "e2e") live in the library. Delete before demos. Also a process note: junk passed sign-off (deliberate testing, but pilot needs a no-test-data-in-production rule). ("Cross-machine E2E" name suggests dev is testing persistence across machines — good sign.)

### R2.7 Rosacea detail page — ✅ **per-statement citations VERIFIED; licensing complete**; 🐛 duplicate section
- ✅ **Per-statement citation chips IN (P1 verified)** — statements carry source+section chips: `NICE CKS Rosacea – Diagnosis / Ocular involvement / General measures / Management`. "Which source said this exact line" now on the published page (round 1: one document-level bar only).
- ✅ **Licensing model complete** — doses line: "come from the BNF — never from this summary" + **`BNF (link-out)` chip**; with the library's "Open at BNF ↗" both halves verified (own cite+link summaries; BNF = pointer).
- ✅ Governance block intact (NICE CKS · BAD · Draft v1.0 · reviewed Dr R. Kaur → awaiting sign-off) + clinician/patient toggle + verify-at-source.
- 🐛 **"Management approach" renders TWICE** — first instance malformed (repeats Assess-&-rule-out bullets under the wrong heading + empty half-rendered box), then the correct full section. Section duplication/content bleed — fix rendering.
- ⚠️ **Chip coverage ~70%, not universal** — e.g. "Consider differentials…" (a recommendation) has no chip. Agree the rule: every recommendation chips; descriptive lines may inherit section source.

### R2.8 NG112 detail (recurrent UTI) — two-tier library discovered; needs card signposting
- **This is a POINTER/INDEX entry, not a full summary** — no clinical content, just scope + guardrails + verify-at-source. **Correction: this was NOT in the spec** — the spec had ONE format for our guidance (Rosacea layout); only BNF entries were pointers. The developer invented this tier unasked. **Faheem has now ADOPTED it as official (9 Jul)** with rules → spec §5.6: two tiers, **mandatory card badges** (`FULL SUMMARY` / `INDEX → SOURCE`), pointers = interim placeholders promoted by search demand, **starter-set topics (incl. NG112 recurrent UTI) must be authored in full before launch.**
- ✅ Guardrails on-page are excellent: "read and apply, never a patient-specific directive"; doses-from-BNF; **"flag it if out of date → routed to the panel for review"**; **"version-tracked so you can evidence what guidance said at the time of your decision"** (core spec promise, stated).
- 🐛 **UX: tiers are indistinguishable on the library cards** — clinicians click expecting Rosacea-depth and get a meta-page (Faheem's "why is this different?"). **Fix: badge the tier on the card** (`FULL SUMMARY` vs `INDEX → SOURCE`).
- ❓ Confirm with dev: intentional tiering (which entries are full summaries — should match the ~12 starter set) vs never-authored.

### R2.9 Templates & SOPs — ✅ SOP builder exists with correct governance split; 🐛 duplicate SOPs possible
- ✅ **"Build for my clinic" on SOP cards** (§7 builder entry point) — and **NOT on note templates** (Open only) = the locked governance split implemented (SOPs clinic-customisable; note templates standard).
- ✅ **"Your clinic's SOPs" section** evidences 4 spec requirements at once: per-clinic tenant scope ("visible only to your clinic") · **clinic-lead signing** (Kazeem) · **gap-checked vs GPhC, CQC, MHRA, NHS** (compliance check vs uploaded standards) · versioned (v1).
- 🔍 **Dashboard duplicate-audit mystery SOLVED** — two literal copies of the same SOP exist (both v1; "RIverside Pharmacy Clinic" typo vs "Riverside pharmacy clinic"). Kazeem built + signed it twice; the audit was honest. Real bugs:
  1. **No duplicate guard** — re-building an existing SOP should warn/update to **v2**, never a second v1.
  2. **Clinic name typed free-text each time** (hence the typo) — pull from the **clinic profile**, don't retype.
- ⏳ Click-throughs pending: "Build for my clinic" flow (questions → AI draft → edit → gap-check → sign) · note-template modal footer (must say standard/not customisable — round-1 §7 contradiction).

### R2.10 SOP builder click-through — 🛑 output too thin (Faheem); DECISION: full best-practice by default
- Builder form is right-minded (clinic name · named clinical lead · data/IG lead · premises · "how this process actually runs") and the grounding line is honest — but **"unfilled sections stay visibly unfinished" is the notes rule wrongly applied to SOPs**: minimal input → skeleton with empty headings → **inspection liability** ("kind of useless" — Faheem).
- Template modal confirms the skeleton problem (Scope & competence `<conditions prescribed for>` etc.) and **retains the round-1 §7 footer contradiction** — "Your clinic customises this" is correct on SOPs, but note-template modals still need the standard/not-customisable wording (verify separately).
- **DECISION (→ spec §5.7):** clinic FACTS never invented; process CONTENT always full best-practice default (pre-authored, MDT-validated); clinic DECISIONS default + `[CONFIRM: …]` flag; sign-off warns on unresolved placeholders; **output anatomy = real CQC policy** (version-control block · References · Scope · AIM→POLICY→PROCEDURE — exemplar: Faheem's C07f Prescribing Policy).

### R2.11 Training — ✅ **BOTH round-1 gaps CLOSED (module content + CPD log/export)**
- ✅ **Content behind cards** — module opens with "MDT-governed content" badge, covers-outline, guardrails ("approach-level teaching only… doses from the BNF"), and **reflective-account capture (CPD EVIDENCE) + Save** → "Completed · reflection saved". (Video = honest Bunny production integration; outline stands in.)
- ✅ **CPD log EXISTS** — module completions (time/date/"reflective account recorded") + **auto-entries for MDT participation** (C-236/C-237, 15 min) = the MDT→CPD by-product, working.
- ✅ **Export CPD portfolio EXISTS** — PDF "reflective record… structured for GPhC/GMC/NMC shared-core submission" with modules + reflections + MDT entries, honest prototype footer.
- ✅ **Wording softened as asked** — "Auto-logged for revalidation" → "CPD evidence for your portfolio · reflections included in export".
- Refinements: **(1) portfolio PDF lacks clinician identity** — add name · profession · registration number · period covered (appraiser needs whose record); **(2) reflection quality** — junk one-liner accepted; add "what will you do differently?" prompt + gentle minimum; (3) Bunny embed = production (tracked).

### R2.12 MDT overview — ✅ **two-panel split implemented**; pharmacist added; 🐛 test members on roster
- ✅ **Clinical MDT vs Governance MDT** — implemented with correct remits ("clinical content + anonymised case answers" / "SOPs, policies and regulatory content"). §4B structural flag closed.
- ✅ **Pharmacist added** — Dr N. Newman · Pharmacy & prescribing (closes the round-1 routing-target gap for medication queries).
- ✅ Empty shield card removed; framing/cycle/agenda all hold.
- 🐛 **Test accounts on the public roster** — "Dr P. Word" (password) + "Ep Och" (epoch), both "Dermatology". Delete before demos; reinforces the no-test-data-in-production rule (with R2.6 test guidelines).
- Known: "asynchronous case input → documented response" still depends on the broken case backend (R2.5).

### R2.13 Session library — ✅ clean pass; per-recording signer now on the card
- ✅ **New "June MDT — full session recording"** shows provenance on-card: "signed off by Faheem Ahmed · governance-signed · 87 min" — per-recording named sign-off surfaced (round 1: footer claim only).
- ✅ Library grows with the live schedule (June recorded 30 Jun; July upcoming) — not static seed data.
- Unchanged knowns: Bunny playback = production ("illustrative in this prototype"); consent-capture flow behind "governance-signed" = verify at production; tag filters still nice-to-have.

### R2.14 Panel portal — My assigned cases (as Dr Kaur) — ✅ **routing VERIFIED; backend works (R2.5 = regression)**
- ✅ **Routing by specialty WORKING** — dermatologist sees dermatology-tagged cases only (round 1: all funnelled to Chair). Badge "3" = awaiting-response count (correct semantics).
- 🔄 **R2.5 reframed: the case backend WORKS** — real IDs (C-236…C-243), submissions 6–8 Jul, status transitions, **persisted timestamped responses** (7 Jul). Full loop submit→route→respond→persist has been functioning. **Today's "did not reach the clinic server" = a recent regression or clinician-session-specific failure** — tell dev: "cases landed 6–8 Jul; submission fails 9 Jul — what changed?"
- ✅ **Photos flow to panel** — "Clinical photos · consented · metadata stripped" provenance on the urgent rash case; URGENT tag renders.
- ✅ **Structured responses** — "Agree with the documented triage & plan" chip + free text.
- ✅ New cases (C-238–243) properly anonymised (age band, no initials).
- 🆕 **"Available tasks" nav item** — looks like the §4B claim-a-task marketplace; review next.
- 🐛 **Legacy data NOT retro-scrubbed** — old C-236 still shows **"J.M."** (created pre-fix) → panel can still see a pre-fix identifier. **One-off scrub of existing records needed** (+ legacy mis-tag: C-236 still labelled Dermatology). 
- 🐛 Test junk cases ("Case-loop E2E one/two", "R3 notif case") → cleanup pile; response quality ("ok") needs the same nudge as reflections; case summaries still embed ⚠ prompt lines (known P3).

- ❌ **P0 codes STILL NOT FIXED** — `R05.9` again labelled **"Fever, unspecified"** (R05 = cough; fever = R50.9). "AI-suggested — verify before use" badge added = caveat, **not validation**. J00/J06.9 correct. Terminology-server validation still outstanding.

---

## 1. Dashboard — ✅ strong

**Working / matches spec**
- ✅ Metrics are now **real/dynamic** (1 consultation · 1 note (1 signed) · 0.5 hrs saved · 0 open cases) — no longer static placeholders. *(Addresses the spec fix.)*
- ✅ MDT banner **advanced to July cycle · 28 Jul 2026**, and reads **"Teaching slot — End-of-dose wearing-off…"** — the educational/CPD framing.
- ✅ **MDT case loop visible** in Activity: *Submitted anonymised case C-236 → Responded by Dr A. Demo → Response received.*
- ✅ Positioning consistent: "Submit an **anonymised** case", "**Check guidance**" (reference), banner "…not a live clinical system… anonymised, synthetic data only."
- ✅ Notifications ("1 new").

**🐛 Fix**
- **Recent-note title/content mismatch:** note titled **"ADHD medication review"** but the body is **"Acute viral upper respiratory tract infection — cough/cold symptoms."** The title (or consultation-type tag) doesn't match the note content. Check the title/tag logic.

**❓ Confirm with developer**
- **MDT date** — does it **auto-advance** on a recurring rule (e.g. last Tuesday monthly) + admin override, or was 28 Jul set manually?
- **MDT answering loop** — did a **panel member actually log in and respond** (persisted to DB), or is the Activity feed scripted? *(This is the key Pillar-2 build — worth confirming it's genuinely wired.)*

---

## 2. Consultation co-pilot — ✅ strong build, ⚠️ one safety issue

**Working / matches spec**
- ✅ **Taxonomy built exactly** — Clinical area (10 options) × Encounter type (7), both required (Appendix A).
- ✅ **Demo scenario correctly labelled** "DEMO SCENARIO (pre-fills the above)" — demo-only.
- ✅ **Note template auto-selects from consultation type** — "New/initial assessment — full history structure (PC·HPC·PMH·DH·FH·SH·ROS)."
- ✅ **Decision support is cited** (BNF, NICE NG87, NICE CKS) + confidence + "Requires clinician judgement" + BNF for interaction check.
- ✅ Documentation prompts, anonymised (J.M. / age range), "Demo signature only — not a clinical sign-off," real AI, editable transcript.

**⚠️ #1 SAFETY — note contains content NOT in the transcript**
- Transcript: *"4-day history of cough cold and headache. No allergies."*
- Note added (not said): *"improved focus on current stimulant medication," "mild appetite reduction," "no cardiovascular symptoms,"* Plan to *"continue ADHD medication / shared-care."*
- The AI is **importing the demo-scenario context into the note** → breaks the core rule *"draft only from the transcript, never invent."* **Must fix:** the note must reflect only the actual consultation input.

**⚠️ Positioning — decision support is patient-specific**
- Cards say *"…in **this patient**…"* and *"consider whether **current ADHD** dosing should be reviewed"* → **patient-specific decision support** (CDSS / medical-device territory), at odds with the agreed "surface guidance, don't instruct on this patient" positioning. Decision needed (the fork).

**Data provenance (Faheem's question — where did J.M./age/reason/template come from?)**
- Patient info (J.M., age range, reason) = **canned sample data pre-filled by the "Demo scenario"** — nobody typed it; it's baked into the demo.
- Template in use = **auto-selected from the Encounter type** (correct system behaviour ✅).
- **Root cause of the safety issue:** the Demo scenario **injects hidden context into the AI note** (the ADHD/stimulant content came from the ADHD scenario, not the cough transcript). It's doing too much.
  - **Fix 1:** note drafts **only from the actual transcript** — never scenario context.
  - **Fix 2:** demo scenario should pre-fill **visible input fields only** — nothing hidden into the AI.
  - **Fix 3:** in **real use, remove the demo scenario** — clinician enters the anonymised context themselves (or pulls from booking).

**Decisions (Faheem — inputs & tagging)**
- **Age range → make it a DROPDOWN** (bands: 0–17 · 18–29 · 30–39 · 40–49 · 50–59 · 60–69 · 70+) — free text isn't taggable, and bands help anonymisation.
- **Tag on the dropdowns only** (Clinical area × Encounter type × Age band). Reason-for-encounter + patient reference stay free text but are **never analysed** (context/label only).
- **Remove the "Demo scenario" from the real product** — it's demo scaffolding, doesn't belong in the clinician workflow. At most a hidden demo-mode toggle. Real screen = Clinical area · Encounter type · Age range · Patient ref · Reason → transcript → note.

**🐛 Fix / ❓ confirm**
- 🐛 **Tag/content mismatch:** Clinical area = Autism, scenario = ADHD, content = cough/cold — tags should follow actual content (also caused the Dashboard note mismatch).
- ❓ **SNOMED/ICD codes** (J00, R05.9…) look AI-generated — confirm validated against a terminology server, not AI-guessed.

---

## 3. Clinical notes — the AI-drafted note ⚠️ **TOP-PRIORITY SAFETY FIX**

**Working / matches spec (strong UX)**
- ✅ "Live AI" tag, "Demo signature only — not a clinical sign-off" banner, Signed status.
- ✅ Locked-on-sign + **addenda-not-edits** model ("Signed demo note — locked. Later changes recorded as addenda").
- ✅ Codes rendered as chips; **Copy SOAP / Create MDT case / Add addendum** actions; **Activity (local only)** audit trail (draft → signed → MDT case created).

**🛑 #1 SAFETY — the note fabricates most of its content**
Transcript was only: *"4-day history of cough, cold and headache. No allergies."* Of ~15 note lines, **only 3 are real** (cough/cold/headache · no allergies · viral-URTI management). The rest are **invented**:
- *"Reports improved focus on stimulant medication"* · *"Mild appetite reduction"* · *"No cardiovascular symptoms today"* — invented history.
- 🚨 *"Last recorded blood pressure and pulse within normal range"* — **INVENTED VITAL SIGNS.** Signing this = attesting to observations never taken. Worst single line.
- *"Currently stable on stimulant medication for ADHD"*, *"ADHD — stable on current stimulant therapy"*, *"Continue ADHD medication / shared-care monitoring"* — invented Dx + plan.
- **Root cause:** the AI drafted an **ADHD stimulant-med-review note** (hence the title + all the BP/pulse/CVS/appetite/shared-care lines = the stimulant-monitoring checklist) and bolted the cough transcript on top. The **demo scenario is injecting hidden ADHD context into `/api/notes`.**

**🐛 Three-way title/tag/content mismatch**
- Title = *ADHD medication review* (from scenario) · Tags = *Autism (ASD)* + *New/initial assessment* (from dropdowns) · Content = cough + ADHD mixed. All three disagree.

**🐛 Codes are AI-guessed, not validated (confirmed)**
- `R05.9 — Fever, unspecified` → **wrong label.** R05 = *Cough*; fever unspecified = **R50.9**.
- `R06.02 — Cough` → **wrong.** R06.02 = US ICD-10-CM *shortness of breath*; also wrong code system (US not UK).
- `F90.9 — ADHD` → shouldn't be present (no ADHD this encounter).
- No terminology server would mislabel these → confirms codes are model-generated, not validated.

**Fix (developer — priority order)**
1. **Draft from the transcript + structured tags ONLY.** `/api/notes` must never see the demo scenario's hidden narrative. *(This single fix removes ~80% of the fabrication.)*
2. **No invented objective data, ever** — if vitals/exam weren't dictated, the note must not state them. **Blank > fabricated.**
3. **Validate every code** against SNOMED/ICD terminology server; reject unmappable codes. No free-guessed codes.
4. **Title + tags follow actual content**, not the scenario (also fixes the Dashboard note mismatch, §1).
5. **Remove the demo scenario in real use** (already logged, §2).

---

## 4. Saved records — ⚠️ page is scheduled for deletion + reintroduces deferred patient feature

**🛑 Remove the page (spec §5.5).** "Saved records" was already cut from scope — merged into **Clinical notes** (notes) + **My cases** (cases). It duplicates both. Developer built a page we'd flagged to delete.

**🛑 Remove "Release to patient" / "Shared with patient" (deferred).** This is the **patient-facing sharing feature deferred to a later phase** (§5.12 patient portal deferred; §5.5 remove "Release to patient"). It carries its own regulatory weight (consent, right of access, what-patients-see governance). Must come out for the pilot — it's the main risk on this screen.

**Useful truths this screen surfaced (keep the signal, drop the page):**
- ✅ **DB persistence is real** — "2 in DB" proves notes persist to Postgres across sessions/devices (real backend). → **Fold the "in DB" badge into the Clinical notes page**, don't keep a separate screen.
- ⚠️ **"MDT cases — 0 in DB" reconfirms the Pillar-2 gap.** Note screen claimed "MDT case created" but that was **local-only**; DB shows **zero** cases → **case creation isn't persisting.** Ties to §5.4 answering-loop build (still the key gap).
- ⚠️ **Inconsistent age bands** — J.M. "30–39" (agreed band ✅) vs J.P. "30–34" (different scheme). Confirms age range must be the **one standardised dropdown** (already logged); two schemes currently in the data.

**Positive — note-writing style is safe here:** both snippets are well-hedged (*"unclear aetiology… warrants further characterisation"*, *"partial response… **not a diagnostic statement**"*). Shows the model writes safely when not fed scenario context → reinforces that §3's problem was **scenario injection**, not the writing.

---

## 5. Guidelines (library index) — ✅ strong; ⚠️ copyright/licensing is the gating issue

**Working / matches spec (best screen so far)**
- ✅ **Source references are real + correctly numbered** — NICE NG87 (ADHD), NG109 (lower UTI), NG112 (recurrent UTI), CKS Rosacea, GPhC Standards, GMC Good Medical Practice (correctly 2024), MHRA valproate. Not invented → real credibility.
- ✅ **Governance metadata on every card** — source · code · **GOVERNED** badge · "Updated YYYY-MM" (matches §5.6).
- ✅ **Source filter tabs** All/NICE/GPHC/GMC/BNF/MHRA (taxonomy).
- ✅ **Approach/dose split correct** — NICE = approach; **BNF Lisdexamfetamine monograph** = dosing/monitoring (HR/BP). Matches §5.6 "doses from BNF."

**🛑 Copyright / licensing — the gating issue**
- Cards reference **NICE / BNF / GMC / GPhC / MHRA** — not free to reproduce. **BNF is licensed/commercial (Pharmaceutical Press)** — the Lisdexamfetamine monograph **cannot reproduce BNF text without a licence** (§7 lists BNF as the licensed *target* integration). NICE has reuse terms; GMC/GPhC standards are their copyright.
- **Safe model (= §7):** library = **our own governed summaries that CITE + LINK to source** (+ "verify at source"), **not copies of source text**. Reference "NICE NG87 says X" + link out = fine; reproducing their text = not. **Get the BNF licence before the monograph ships.**

**❓ Confirm behind "Open" (does detail page hit the `guideline-sample.html` bar?)**
- Per-statement citations (each claim → its source), not just a card badge?
- "Verify at source" link + **dual-audience** (clinician/patient view)?
- Is **"GOVERNED"** a *real state* (signed via §8 pipeline, named signer + version) or a static label?
- Do **"Updated" dates track the actual source** (§8 change-detection/fast-follow) or are they manual? (If NICE updates NG87, does the card flag stale?)

## 6. Guideline detail (Rosacea) — ✅ **exemplary; model for the whole library**

Opening a card resolves nearly every §5 "confirm behind Open" question — built dead-on to spec.
- ✅ **Real governance state + named reviewer + live pipeline position** — *"AI-drafted → reviewed (Dr R. Kaur) → awaiting sign-off"*, Version Draft v1.0, Last reviewed 24 Jun, Sources NICE CKS · BAD. → **"GOVERNED" is a real state, not a static badge** (answers §5).
- ✅ **"Decision support, not a directive — the treating clinician decides"** banner (positioning locked).
- ✅ **Clinician View / Patient View toggle** (dual-audience) + **"Verify at source"** button.
- ✅ **Hardest §5.6 rules honoured inline:** *"no single mandated first-line; verify the current options at source"* (don't invent a preference) **and** *"Doses, cautions, interactions and monitoring come from the BNF — never from this summary"* (approach/dose split; the page **refuses to reproduce BNF** → directly mitigates the §5 copyright risk: own wording + cite + link).
- ✅ Clinically sound (no-comedones→not-acne, sensible differentials, ocular-rosacea prompt, ophthalmology safety-net).

**🐛 CONFIRMED gap — per-statement citations missing.** Faheem confirmed: **only one document-level source at the top**, no per-line chips. §5.6 non-negotiable = every recommendation carries its **own** inline citation. **Fix: add a citation chip to every statement** (like `guideline-sample.html`'s `.ref` chips) — "which source said *this exact line*" is the defensibility core.

**Content strategy (decided — now in §5.6):** we do **not** replicate NICE/BNF. NICE/CKS/society = own summary + cite + link; **BNF = link/integrate only, never reproduce** (sidesteps licensing until BNF licence bought). Author **by data** (search-gaps, commonest cases, clinic scope, high-freq + high-risk). Starter set of ~12 defined. Authoring pipeline: signal → AI draft (per-statement cited, doses→BNF) → Clinical MDT review → lead sign-off → Published vX → §8 change-detection.

---

## 8. Training — ✅ strong; confirm content + governance behind the cards

**Working / matches spec**
- ✅ **Metrics are real/computed** — 3/6 complete, CPD minutes = sum of completed durations (45+30+60 = **135**, ≈2.3h). Dynamic, not hardcoded (like the Dashboard fix).
- ✅ **CPD-as-by-product** — "Auto-logged for revalidation · reflective record ready"; *"Reflective practice & revalidation — turning MDT discussions into CPD evidence"* module embodies §5.8.
- ✅ **Category taxonomy** CORE/SPECIALTY/SAFETY/PROFESSIONAL (colour-coded) + durations; progress bars; complete/incomplete toggle.
- ✅ **Product-aligned topics** (documentation-for-inspection, independent prescribing, deteriorating patient).

**🛑 CONFIRMED BUILD GAPS (Faheem verified)**
1. **Nothing behind the module cards.** "Mark complete" just flips state — **no lesson content, no reflection capture.** Build per §5.8: each module opens **embedded content** (Bunny video + text + optional quiz) → completion **logs CPD + prompts a reflection** ("what will you do differently?"). Self-ticking ≠ appraiser-acceptable CPD.
2. **The CPD / revalidation log doesn't exist** — the tiles ("135 min · reflective record ready") summarise a record that isn't being created. **Build the actual CPD log** (§5.8): one accumulating record per clinician — per entry: date · activity · domain · time · **reflection** · evidence link. **Auto-populates from** (a) completed modules + reflection, (b) **MDT participation** (each case = a reflective learning event → the "MDT → CPD by-product"). **Must export as a reflective-account PDF portfolio** (GPhC/GMC/NMC shared core) — *that export is the product.* Lives as its own **"CPD / Revalidation log"** area; the Training tiles are its summary and should link into it.

**❓/⚠️ Also confirm**
- **Soften the revalidation claim (positioning).** *"Auto-logged for revalidation"* risks implying guaranteed credit — the **appraiser/regulator decides**, and CPD must be reflective. Reframe: **"Generates CPD evidence, ready for your portfolio/appraisal."**
- **Clinical training content = same governance as Guidelines.** Modules making clinical claims (Rosacea first-line, ADHD titration) must be **cited · governance-signed · "verify at source" · no-reproduce-BNF/NICE** — guidance content by another name. Confirm training modules go through the §8 pipeline (§5.8).

---

## 9. MDT overview (Pillar 2 front page) — ✅ strong, correctly framed

**Working / matches spec**
- ✅ **Positioning locked-in** — "Anonymised case-based teaching, discussion & CPD"; "reflective material — useful for revalidation"; "with consent and anonymisation." Educational/CPD, not a clinical-advice service (§5.9).
- ✅ **Auto-advancing cycle** — "Monthly MDT — July cycle · 28 Jul 2026," consistent with Dashboard.
- ✅ **Panel matches routing taxonomy** (Appendix B): Chair/governance, GP, psychiatrist, dermatologist.
- ✅ **Agenda auto-pulls** submitted cases (scheduling logic).
- ✅ **Internal consistency win** — Dr R. Kaur (dermatologist) here = the reviewer named on the Rosacea guideline. Panel ↔ governance pipeline joined up in demo data.

**Flags**
1. **Advertises the loop that isn't wired.** "Asynchronous case input → documented response from the relevant panel member" = the loop that shows **0 in DB**. This is the shopfront; the submit→route→respond→persist→notify engine is still the gap (§5.4).
2. **Two-panel model (§4B) not reflected** — shows **one combined panel** with a governance chair. Eventually "The panel" should distinguish **Clinical MDT** from **Governance MDT** members (recent decision; low priority).
3. **Confirm the case-response UI caveat** — responses must read as **teaching/discussion points, clinician stays responsible** (§5.4), not directives. Check on the response screen.
4. **Minor:** empty shield card (right) looks unfinished — fill (governed/anonymised trust badge) or remove.

---

## 10. My MDT cases (submit + answering loop) — ✅ great structure; 🛑 anonymisation failed

**Working / matches spec**
- ✅ **All 3 dropdowns match spec exactly** — Specialty (Appendix B), Query type (Appendix C, all 10), Urgency (routine/soon/urgent).
- ✅ **Consent gating** — "no patient-identifiable information" checkbox required; Submit disabled until ticked.
- ✅ **Answering loop renders end-to-end** — case → "Answered" → **panel response w/ named attribution + timestamp** (Dr A. Demo). C-236 consistent with Dashboard feed.
- ✅ **Advisory caveat present (resolves §9 flag)** — *"Teaching/discussion points — advisory only. The treating clinician remains responsible"* + footer. Positioning locked.

**🛑 CRITICAL — the "anonymised" case contains an identifier ("J.M.")**
- Case summary reads **"J.M., age 30–39…"** while the banner + text claim *"no identifiers"* and the clinician ticked the "no PII" box. **Initials ARE an identifier.** → the **AI auto-anonymiser failed** to strip the patient reference when the note became a case, and the "flag identifiers before submit" check didn't catch it. Makes the **consent tick a false attestation** — an info-governance/ICO hole.
- **Fix:** strip/blank initials + patient refs on note→case; the pre-submit identifier check must catch initials like "J.M.".

**🛑 §3 fabrication propagates into the MDT**
- The case summary **is** the fabricated §3 cough-note (invented ADHD/appetite/stimulant content) — now the material the panel "teaches" on. Fixing §3 (draft-from-transcript-only) fixes this downstream; shows how far a fabrication travels once in the record.

**🐛 Wrong specialty routing**
- Title "Stable adult ADHD on stimulant — monitoring query" tagged **DERMATOLOGY** (should be Psychiatry or Pharmacy). Same tag/content mismatch pattern — routing tag doesn't follow content.

**❓ Confirm persistence**
- Response body = "vvknkn…" (manual test keystroke). Confirm the answered case + response **persist server-side and notify the submitter** (earlier Saved records = 0 MDT cases in DB). Is this DB or local/seeded?

**🛑 Missing image upload + AI PII check (Faheem — specced §5.4, NOT built)**
- Case submission has **no photo upload** — but §5.4 requires **1–5 clinical photos** (essential for **dermatology**, which is a routing specialty) with: **AI pre-check flagging identifiable images** (faces/tattoos/jewellery/background) before submit · **auto-strip EXIF** (GPS/timestamps) · **consent checkbox** · encrypted UK/EU storage, access limited to submitter + routed panel member, audited, deletable.
- Ties to the anonymisation theme: **the AI must catch identifiers in images too, not just text** (photo is the highest PII risk — a face/name-band in shot). Build this.

---

## 11. Session library — ✅ clean, correctly framed

**Working / matches spec**
- ✅ **Governance framing nailed** — footer: "Recordings require consent and anonymisation and are governance-signed before publishing"; honest "playback illustrative in this prototype."
- ✅ **Consistent with the panel** — presenters = Bright/Kaur/Mehta/Okafor (same roster as §9). Ecosystem coheres.
- ✅ **Dates follow the MDT cycle** (monthly, descending, tied to live schedule).
- ✅ **Searchable + tagged**; on-brand titles mapping to guideline/training topics.

**Real-build notes (not bugs — still to build)**
1. **No actual video** — needs **Bunny-hosted recording + player** behind the play button.
2. **Consent + governance must be a real mechanism, not a footer** — recording a live MDT + publishing is sensitive: **capture consent per recording**, **anonymisation check on the recording itself** (spoken identifiers / shared-screen leaks), **sign-off gate before it appears.** Confirm the gate exists (same pipeline).
3. **"Promote session → Training module"** (§5.10) admin action not visible (admin-side; low priority).

**Nice-to-have:** tag/topic filters (like Guidelines source tabs) once the library grows — currently search-only.

**Nav badge "My cases · 1" — confirm it's a notification, not a total.** A nav count badge should mean **"N items need your attention"** (new/unread panel responses) and **clear when opened** — not the total number of cases (that's permanent noise). Confirm the "1" = unread answered cases and clears after viewing C-236; if it's total-count, change to unread-count. (Ties to Dashboard "1 new" notification logic — keep them consistent.)

---

## Cross-cutting decision — note workflow: draft → review → attest → sign (locked)

The safety model behind the §3 fix. Acceptance criteria for the developer:
1. **Draft-only from what was said** — AI note contains only transcript/typed content + structured tags. Never scenario context, never memory.
2. **Flag gaps, never fill them** — missing expected data (esp. **vitals/objective/exam**) shows a **soft ⚠️ flag** ("No vitals recorded — add if taken"), **never an invented value**. Blank/flagged > fabricated. *(This is the direct fix for the invented "BP within normal range.")*
3. **No step-by-step / no forced fields** — clinician just talks; tool auto-populates + prompts. Flags are nudges, not blockers.
4. **Attestation sign-off = the only hard gate** — note stays an editable **DRAFT** until the clinician signs with a tick: *"I have read this note and confirm it is an accurate record of this consultation."* Then lock (→ addenda-not-edits, already built).

---

## 7. Templates & SOPs — ✅ strong; 🛑 one governance contradiction

**Working / matches spec**
- ✅ Category tabs (Note template / SOP / Governance / Patient-facing) = taxonomy.
- ✅ Guardrails present: **"MDT-validated"**, **"Draft only — clinician review required"**, *"clinical impression — not a definitive diagnosis"*, governance-pipeline footer.
- ✅ Sensible set: consent & confidentiality, **safeguarding with named leads**, private prescribing, governance pack, patient leaflet.
- ✅ **Patient-facing leaflet builder is OK** — it's a *document the clinician fills + hands over*, **not** the deferred patient *portal/login/release*. Keep it. *(Line to hold: patient-facing content templates OK; patient portal deferred.)*

**🛑 Governance contradiction — "your clinic may customise" on NOTE TEMPLATES**
- Both modals reuse one footer: *"Clinickly provides the skeleton; your clinic may customise it."* Correct for **SOPs/leaflets**; **breaks the §5.7 lock for note templates** (central/standard/SAME-for-all, **no per-clinic customisation**).
- **Fix — split the footer by type:**
  - **Note template:** *"Standard across all clinics · MDT-validated · centrally governed. Not customisable per clinic — keeps documentation consistent."*
  - **SOP / leaflet:** *"Your clinic customises → changes go through governance sign-off."* (current wording, correct here).

**"Use — copy to my system" — clarified (Version A)**
- Copies the **governed skeleton OUT** to the clinician's own EHR/docs (clipboard/export); does **not** populate inside Clinickly. Then by type: **note templates auto-fill in a consultation** (encounter type → auto-select → AI drafts from transcript; the library just previews/copies the blank); **SOPs/leaflets are shells the clinic completes + governs.**

**Lower-priority (§5.7 direction):** eventually **split** — note templates live *next to note-writing*; SOPs get their *own admin area*. Combined browse library OK for now.

**🛑 BUILD GAP — SOP "Build with AI" flow is missing (the whole middle).** Current "Open" shows only a **blank skeleton** (Step 1) + "copy to my system" copies the blank (Step 6). Steps 2–5 aren't built. **Build the guided flow:**
1. **Pick SOP** → "Build with AI".
2. **Structured clinic questions** (name · named lead · deputy · LA contact · referral route · scope).
3. **AI generates the full SOP** from template + answers — **editable in Clinickly** (this IS "add it in Clinickly AI").
4. **AI compliance-check** vs uploaded CQC/GPhC/MHRA/NHS standards → flags gaps (cites the standard).
5. **Sign-off** (clinic lead / Governance MDT premium) → **stored + versioned in the clinic's Clinickly SOP library** (+ audit trail).
6. **"Copy to my system" = optional export**, not the generation step.

**Storage distinction (clarify in UI):** **SOPs are generated + STORED + versioned INSIDE Clinickly** (that's the "stands up to inspection" value = the governed library + audit trail). **Notes** get copied **OUT** to the clinic's EHR (Clinickly isn't the patient record). The shared "copy to my system" button blurs this — SOP modal should lead with **"Build with AI"/"Open in builder"**, with export as secondary.

---

## Cross-cutting decision — note-template governance (locked)

**Note templates are central + standard — the SAME for every clinic.** Created by Clinickly → **MDT-reviewed → signed off → published to all** (governance pipeline, from the admin console). **No per-clinic customisation of note templates** — that would fragment documentation ("the structure melts"). Consistency across clinics is the point.

**Don't confuse with SOPs:** SOPs *are* clinic-specific by design (each clinic's own policies, named leads) — those vary. Note templates don't.

- Developer: note-template library is a **read-only, centrally-published** set for clinicians; editing/authoring lives in the **admin/governance console** only, gated behind MDT sign-off.

---

*(more screens added as we review them)*
