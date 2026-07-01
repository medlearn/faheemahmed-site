# Clinickly Co-pilot — Page-by-Page Spec

**What this is:** a plain-English, screen-by-screen breakdown of the Co-pilot, built up with Faheem as we review the developer's current build. For each page: **Purpose** (what it's for), **What we have now** (current build), **To build / decide** (gaps + decisions).

**Companion docs:** [DEVELOPER-MASTER-PLAN.md](DEVELOPER-MASTER-PLAN.md) · [HANDOFF.md](HANDOFF.md) · [MASTER-PLAN.md](MASTER-PLAN.md)

**Overall status (from screen review):** the developer has built the full product — both pillars, with **real AI** (transcription + note drafting + decision support) and a **real database**. Cross-cutting gaps found so far:
- **MDT panel has no login** — panel members can't actually answer cases (responses appear to be sample text).
- **Roles aren't locked down** — a "patient" login could see the whole clinician co-pilot. Needs proper role permissions (clinician / patient / MDT panel / admin).
- **Payments not wired** — patient "Activate membership" does nothing.

**Cross-cutting data rule — structured tags, not free text.** Any field you'll ever want to count, filter, route or report on must be a **controlled dropdown** (consultation type, specialty, urgency, etc.) — never a free-text box. Free text is only for **clinical content** (the note body, case summaries). This is what makes the data trackable and taggable. See **Appendix A** for the consultation taxonomy.

**Foundational decision — Clinickly is an anonymised ASSISTANT (Version A), not the patient record.** For the pilot/launch: only **anonymised / minimal** info goes in (age range, reason, a clinician-controlled **patient reference** like initials — never name/DOB/NHS number). Clinickly **drafts and supports**; the clinician **copies/exports the note into their own record system**, which stays the source of truth. Chosen because Version B (Clinickly = the medical record) triggers the full weight of health-record/medical-device compliance and would massively delay launch. **Known trade-off:** clinicians use two tools + potential double cost — mitigated by one-click export now, **integration** next, and **Version B** later (which collapses it to one tool once compliance is in place).

---

## 1. Dashboard

**Purpose**
The home/overview screen — "your clinical day at a glance." A summary + quick shortcuts. Nothing critical happens here; it's a signpost.

**What we have now**
- Top banner: next **Monthly MDT** session with date/time.
- Four summary numbers: consultations this month (38), notes drafted (36), admin hours saved (19.5), open MDT cases (2).
- **Quick actions**: Start a consultation · Ask the MDT · Check guidance · Open a template.
- **Recent notes** list + an **Activity** feed.

**To build / decide**
- [ ] **The four numbers are sample figures** — not yet counting real usage. Make them calculate from the clinician's actual activity (real consult count, notes drafted, hours saved estimate, live open-case count).
- [ ] **The "Monthly MDT" date is hard-coded** and does not update. Decision: **auto-advance to the next session from a recurring rule** (e.g. last Tuesday monthly, 19:00), showing the next upcoming date, with an **admin override** for one-offs. Needs: a place to set the schedule (admin), and the banner to read the next date from it.
- [ ] Activity feed + recent notes should show **real** events, not demo entries.

---

## 2. Consultation (co-pilot) — the core

**Purpose**
Where the clinical work happens. It listens to the appointment, drafts the clinical note, and checks it against guidelines — all in one screen, while the clinician focuses on the patient. 3-column flow: **Live transcription → AI-drafted SOAP note → Decision support.**

**What we have now**
- Transcription uses the **browser's built-in speech service** (in-room microphone). Transcript is editable; "Play demo" plays a sample; **"Label speakers (AI)"** is a best-effort AI *guess* (not reliable).
- The **note is generated fresh by the AI** (Claude) from the transcript — real and working.
- **Decision support** flags issues against guidance — real AI (e.g. it caught "transcript says 5-year-old but note says Adult ADHD").
- **SNOMED/ICD codes are AI-suggested from memory** — not validated against a real code source.
- **Guidance comes from the AI's training memory**, NOT connected to live NICE/CKS (the Guidelines page still says "demo content").
- The **"Scenario" dropdown** (ADHD review, Dermatology query, etc.) is **demo examples only** — there is no scenario picker in real use; you just start a real consultation.

**Decisions — target state**
- **Transcription:** proper speech-to-text with **speaker separation (diarization)** and **remote/video-call** support.
  - Recommended: **Speechmatics** (🇬🇧 UK data residency) for transcription + **Recall.ai** meeting-bot to capture Zoom/Teams/Meet audio (both sides). In-person = good room mic → same service.
- **Codes:** **not AI-guessed.** AI proposes the clinical concept → validate the official code against the **NHS Terminology Server** (SNOMED CT, FHIR API) + **WHO ICD API**. Medicines via **dm+d**.
- **Guidance:** connect to **real, current NICE/CKS** via the **NICE Syndication API (licensed)**, ingested into our own **version-tracked index (RAG)** so the AI cites genuine references and we can evidence *"what guidance said on date X."*
- **Consultation type = structured, not free text.** Tag every consultation on **two required dropdowns — Clinical area × Encounter type** (see **Appendix A**). "Other" is allowed but **logged & reviewed monthly**. The current "Scenario" dropdown is **demo-only** — replace it with this real tagging. Drives reporting, auto-template selection, and MDT-specialty routing.
- Every decision-support item keeps **"Requires clinician judgement."**

**Interim (until approvals land) — agreed**
- Guidance via **web search restricted to OFFICIAL sources only** (`nice.org.uk`, `cks.nice.org.uk`, BNF) — **not** the open web. Label every result **"Indicative — verify at source"** with a link. Do **not** market as "official NICE guidance" until licensed.
- Run a **closed pilot to a selected few clinics** on **synthetic/anonymised data** (or with minimum compliance in place) while integrations + approvals proceed. *(Compliance floor applies per patient, not per user count — see MASTER-PLAN Gate B.)*

**Applications to START NOW (long lead time)**
- [ ] **NICE Syndication API** — licence/registration.
- [ ] **NHS Terminology Server** — access for SNOMED CT.
- [ ] Contract **STT provider (Speechmatics)** + **meeting-bot (Recall.ai)**.

**Data residency:** keep all audio + text processing in **UK/EU**.

---

## 3. Clinical notes

**Purpose**
The record-keeping hub — where drafted notes are stored, reviewed, edited, **signed**, searched, and turned into MDT cases. Holds the audit trail.

**What we have now**
- List of notes with **status (Draft / Signed)**; the live note from a consultation is real + saved to the database; the "Sample records" list is demo.
- Per note: **Edit draft · Mark as signed · Copy SOAP note · Create MDT case · Activity log**.
- Search is a **basic free-text box**.

**Decisions — target state**
- **Model = Version A** (see Foundational decision). Notes are drafted here and **copied/exported into the clinician's own record system**; Clinickly is not the system of record for the pilot. Each note carries a **clinician-controlled patient reference** (their code/initials), not identifiable data.
- **Standardised output.** The AI always produces the **same SOAP structure** regardless of how each clinician speaks or writes — governed by the clinic's chosen **note template** (Templates & SOPs). Consistent + inspection-ready; content reflects only what was said; clinician reviews & signs.
- **Flexible input.** Clinician can **transcribe live**, **type/paste** their own history, or a **mix** — the SOAP is generated from whatever's in the box, then remains **editable**. Not transcription-only.
- **Search = filters + keyword.** Filter by the **taxonomy tags** (Clinical area × Encounter type), **Status**, **Date**, **Patient reference**; plus a keyword box to find text *inside* notes. (Keyword *search* is fine; free-text *categorising* is not.)
- **Signing = lock.** Once **Signed**, the note is **locked/immutable** with a timestamped audit entry; changes after signing create an **addendum**, not an overwrite. (Defensibility.)
- **Export.** One-click copy now; **standard-format export / integration** later to remove double-entry (the "two tools" mitigation).

---

*(more pages added as we review them)*

---

## Appendix A — Consultation taxonomy (controlled lists · no free text)

Every consultation is tagged on **two required dropdowns**. This replaces the demo "Scenario" picker.

**Facet 1 — Clinical area**
1. ADHD
2. Autism (ASD)
3. Mental health
4. Weight management
5. Dermatology
6. Sexual & reproductive health
7. General & acute prescribing
8. Long-term condition
9. Travel health
10. Other *(logged & reviewed)*

**Facet 2 — Encounter type**
1. New / initial assessment
2. Medication review / titration
3. Routine / annual review
4. Follow-up / monitoring
5. Acute / minor illness
6. Prescribing query / second opinion
7. Shared-care review

**Rules**
- Both fields **required**, both **dropdowns** — never free text.
- **"Other"** allowed but **logged and reviewed monthly** — promote recurring ones to proper options.
- Clinical *content* (note body, case summary) stays free text — only the *tags* are structured.
- **Forward-looking:** map each tag to a **SNOMED CT** concept so the data is standards-based (not needed for pilot).
- Combining facets gives natural types (e.g. "ADHD × Titration") and lets you report by **either** dimension.
