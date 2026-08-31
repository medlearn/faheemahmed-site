# 🚦 Red lines — staying outside the medical device definition

**One page. Build against this. Check before every release.**
Basis: [MHRA-RESPONSE.md](MHRA-RESPONSE.md) (21 Jul 2026) · Owner: **Faheem Ahmed** — any change to note-drafting, decision support, or EHR connectivity needs his sign-off against this sheet.

## The line
> You are **outside** the device definition while the software **documents what the clinician did** and provides **general reference material**.
> You are **inside** it the moment the software **influences what happens to a specific patient**.

MHRA's words: anything intended to *"diagnose, monitor, detect, predict, treat, triage, prioritise, or otherwise influence patient management"* is a device (at least Class I / IIa).

---

## The seven rules

| # | ✅ ALLOWED | ❌ FORBIDDEN |
|---|---|---|
| 1 | Note contains **only what the clinician said or typed** | AI adds clinical content the clinician didn't provide |
| 2 | Missing information is **flagged** ("no vital signs recorded") | Missing information is **filled in** (inventing values) |
| 3 | **General** guidance: *"NICE guidance for X says…"* | **Patient-specific**: *"for this patient, do X"* |
| 4 | Documentation prompts: *"consider documenting safety-netting"* | Clinical instructions: *"this patient requires urgent assessment"* |
| 5 | **Anonymised** teaching cases; responses are teaching points | Advice on an identifiable patient; directives to the treating clinician |
| 6 | Codes **suggested**, clinician reviews and **signs** | Codes applied without clinician review |
| 7 | Note **copied out** to the clinic's own system (Version A) | **Writing into an EHR** or two-way clinical-system integration |

## The three functions that must never drift
1. **Note drafting** — MHRA named this as the pressure point ("clinical notes feed into patient management"). Transcript-only is the boundary, not a preference. **Needs an automated regression test.**
2. **Decision support / Ask Clinickly** — general, cited, never "for this patient". Ask Clinickly already behaves correctly (refuses out-of-library questions, cites everything). **The consultation decision-support panel currently breaches rule 4 and must be fixed.**
3. **EHR connectivity** — ⛔ **HARD GATE. Do not build without a fresh MHRA view.** They explicitly required "no crossover of information between the tools and EHR systems". Version A (copy-out, not the record) is what currently protects the whole position.

## Pre-release check — all must pass
- [ ] Run the standard transcript test → does the note contain **anything not said**?
- [ ] Does any output name or imply **a specific patient's management**? ("this patient", "required", "urgent" tied to the presentation)
- [ ] Has anything begun **writing to a clinical system**?
- [ ] Do **all** AI outputs carry the correct framing (general · cited · clinician decides)?
- [ ] Is the **intended-purpose statement** unchanged and consistent across app, site, terms?

**Any ❌ → do not ship.**

## Language discipline
- **Never say** "MHRA approved / cleared us." It was guidance, not a determination.
- **Do say:** *"We sought MHRA's view; on the intended purpose as described, they indicated the functionality appears to fall outside the medical device definition."*
- Keep the **intended-purpose statement identical** everywhere. Inconsistency between what you claim and what the software does is exactly how the position is lost.

## If something changes
Re-open the MHRA question **before building** if you plan to: integrate with an EHR · triage or prioritise patients · generate patient-specific recommendations · analyse patient data to predict or detect anything · give the AI the last word on anything a clinician currently signs.
