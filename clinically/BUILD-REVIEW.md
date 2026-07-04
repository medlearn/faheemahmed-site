# Clinickly Co-pilot — Build Review (developer snag list)

Review of the developer's actual build against [CLINICKLY-MASTER.md](CLINICKLY-MASTER.md), screen by screen.
Legend: **✅ confirmed working** · **🐛 fix** · **❓ confirm with developer**

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

---

## Cross-cutting decision — note-template governance (locked)

**Note templates are central + standard — the SAME for every clinic.** Created by Clinickly → **MDT-reviewed → signed off → published to all** (governance pipeline, from the admin console). **No per-clinic customisation of note templates** — that would fragment documentation ("the structure melts"). Consistency across clinics is the point.

**Don't confuse with SOPs:** SOPs *are* clinic-specific by design (each clinic's own policies, named leads) — those vary. Note templates don't.

- Developer: note-template library is a **read-only, centrally-published** set for clinicians; editing/authoring lives in the **admin/governance console** only, gated behind MDT sign-off.

---

*(more screens added as we review them)*
