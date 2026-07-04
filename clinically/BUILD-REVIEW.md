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

**🐛 Fix / ❓ confirm**
- 🐛 **Tag/content mismatch:** Clinical area = Autism, scenario = ADHD, content = cough/cold — tags should follow actual content (also caused the Dashboard note mismatch).
- ❓ **SNOMED/ICD codes** (J00, R05.9…) look AI-generated — confirm validated against a terminology server, not AI-guessed.

---

*(more screens added as we review them)*
