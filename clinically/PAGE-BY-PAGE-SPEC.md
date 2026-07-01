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

## 4. MDT case (create + track)

**Purpose**
The front door to Pillar 2 (the human MDT). Send an **anonymised** difficult case to the expert panel and get written advice. Created from scratch or **pre-filled from a note**. Tracked in "My cases" (Awaiting → Answered).

**What we have now**
- Case form (Specialty, Urgency, Case title, Anonymised summary, Key question) + case list with status + panel responses marked *"Advisory only — the clinician decides."* — looks great.
- ⚠️ **Answering loop is the gap:** panel responses appear to be pre-written samples, and "Saved records" showed **"MDT cases: 0 in DB"** — submitted cases may not persist, and there is **no panel-member login to actually answer**. This is the main Pillar-2 build.

**Decisions — target state**
- **Two structured dropdowns (no free text for categories):**
  - **Specialty** — who answers; clean list, see **Appendix B** (fixes the messy "Dermatology pharmacy / Dermatology / Pharmacy" list).
  - **Query type** — what *kind* of question, for audit; see **Appendix C**. The **AI auto-suggests** it from the free text; clinician confirms.
- Keep **Urgency** as a dropdown; case title / summary / key question stay free text (content).
- **Anonymise on create.** When creating from a note, the summary must be stripped of identifiers — ideally the AI **auto-anonymises** and flags anything identifiable before submit.
- **Build the answering loop:** panel-member **login/role**, cases **persist to DB**, routed to the right specialty, panel writes the response, clinician notified.
- **Audit reporting:** report cases by **specialty × query type × urgency × status**; feed the commonest query types straight into **Training** (closes the MDT → training loop).

---

## 5. Saved records → **remove / merge away**

**Decision:** the separate "Saved records" page is **not needed** — it duplicates the notes list.
- Everything is persisted automatically, so **notes live only in Clinical notes** and **cases only in My cases** (both DB-backed). **One notes list, not two.** Delete the "Saved records" page.
- **Remove "Release to patient" for now.** Clinickly is the clinician's assistant (Version A). If a clinician wants to share something with a patient during the pilot, they do it **their own way** — email, or their own notes/patient system. Clinickly does **not** handle patient sharing yet.

**Patient portal = deferred to a later phase (not scrapped).** For the pilot, roles simplify to **clinician + MDT panel + admin** (this also removes the doctor/patient login confusion Faheem started with). The **full patient portal is built later**, and the **"share/release to patient" capability returns then**, done properly as part of it. *Revisit at the Patient portal page.*

---

## 6. Guidelines

**Purpose**
A searchable library of clinical guidance (NICE, CKS, GMC, GPhC, BNF, MHRA + licensed point-of-care sources). Same source that feeds the **decision-support flags** on the Consultation page, and underpins the *"what did guidance say at the time"* defensibility.

**What we have now**
- Searchable cards + source filters; opening a card shows a stub marked **"Demo content."** Not connected to real guidance yet.

**Sources — APIs applied for:** NICE (Syndication), **BMJ Best Practice**, **UpToDate**, **DynaMed**.

**Decisions — target state**
- **Two mechanisms, both grounded in official sources:**
  1. **Curated library:** AI **drafts** a plain-English summary → **clinician checks** it against the source → published with a **link to source + date-checked**.
  2. **Restricted official-site search:** for anything not curated, the AI searches **official domains only** (`nice.org.uk`, `cks.nice.org.uk`, BNF), reads the **current** text, and answers from that (with a link). This same engine grounds the **decision-support** flags (fixes the "AI-from-memory" weakness).
- **Guardrails:** human-checked before publish · always link + **"verify at source"** · official domains only · closed pilot while unlicensed.
- **⚠️ Copyright split (critical):** the curated DB / pipeline covers **NICE/CKS + your own clinical summaries ONLY**. Commercial sources (**UpToDate / DynaMed / BMJ Best Practice**) are copyrighted — **link-out only until their licence/API lands**; do **NOT** AI-clone them into the DB.

**Guideline governance pipeline — STANDARD build (not phased)**
The tool keeps guidance current through a governed workflow that **reuses the MDT / roles / DB machinery already being built**:
1. AI **drafts** an update/summary →
2. **MDT reviews** (routed to the relevant specialty) →
3. **Clinical lead signs off** (named, dated) →
4. **Published** to clinicians, **versioned** →
5. **Every step audit-logged** (AI draft, reviewer, signer, when).
- Run from an **Admin / Clinical Governance console** (the admin role's main job).
- **Benefits:** always-current + human-governed + defensible ("published on X, reviewed by Dr Y, signed by Z") + strengthens clinical-safety (DCB0129) + a trust story to sell.
- **Fast-follow (not day-one):** **AI auto change-detection** (watches sources, auto-flags "NG87 changed"). **Launch interim:** manual **"review due"** schedule (~every 3 months).

**Updates handled by:** link + last-checked + **live-search for real decisions** (never trust a stale cache) + review cycle → becomes **automatic** once the APIs land.

---

## 7. Templates & SOPs → **SPLIT into two**

**Decision:** this page currently mixes two unrelated jobs — split them.
- **Note templates** → move to sit **with note-writing** (Consultation / Clinical notes). Used *during* a consultation.
- **SOPs / policies / governance docs** → their own **Governance / Documents** area (admin-managed). Set up *once*.
- *(The demo's template list is **AI-drafted placeholder** content — real templates must be authored + MDT-validated.)*

### 7a. Note templates
- **What they are:** the skeleton (headings + prompts) the AI fills in when drafting a note — this is what **standardises** notes.
- **Who provides them:** **Clinickly** ships a standard, **MDT-validated** library. Clinics may optionally customise; new ones added by Clinickly or **requested** by clinics → governed (draft → review → sign-off → versioned).
- **Structure = SOAP frame + clinical history framework *inside* "Subjective", scaled by consultation type:**
  - **New / initial assessment** → full history: **Presenting complaint · HPC · PMH · DH · FH · SH · Menstrual (if relevant) · Review of systems** → + Examination (Objective) · Impression (Assessment) · Plan.
  - **Follow-up / medication review** → focused/lighter (interval history, response, obs, plan) — no full re-clerk.
  - The **consultation type (taxonomy) auto-selects** the right template.
- **Does two jobs (clinician still just talks/types — no rigid form):** (1) structures the AI's output; (2) **flags gaps** ("no drug history captured") = a completeness + safety prompt (great for newly-qualified prescribers).

### 7b. SOPs, policies & governance documents (own area, admin-managed)
**Lifecycle (reuses the governance pipeline):**
1. Clinickly provides **starter templates** per SOP type.
2. **AI helps populate/customise** for the clinic.
3. **AI checks the draft against uploaded regulatory standards** (GPhC / CQC / MHRA / NHS) → flags gaps = the cheap, automatic **safety net**.
4. **Sign-off, tiered:** *standard* = clinic's **named lead** signs off (versioned, audit-logged); *premium (paid)* = **MDT / expert review**.
5. **"Request an SOP"** button for missing ones (also tells you what clinics need).
- **Upload the public regulatory standards** (GPhC, CQC, MHRA, NHS) as read-only reference **and** for the AI gap-check. *(Public/regulatory — safe to hold, unlike commercial clinical content.)*
- **Patient-facing leaflet builder:** keep — it *generates a document* the clinician gives the patient their own way (fits Version A; not the patient portal).

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

---

## Appendix B — MDT routing specialty (who answers)

Dropdown, required. Maps to the panel.
1. General practice (GP)
2. Psychiatry / mental health
3. Dermatology
4. Pharmacy & prescribing
5. Weight management *(as panel grows)*
6. Women's / sexual & reproductive health *(as panel grows)*
7. Governance / ethics *(Chair)*
8. Unsure — triage to Chair

---

## Appendix C — MDT query type (what kind of question · for audit)

Dropdown, required. The **AI auto-suggests** from the free-text question; the clinician confirms. "Other" is logged & reviewed.
1. Diagnostic uncertainty
2. Treatment / management choice
3. Medication query (dose, choice, interaction, monitoring)
4. Escalation / referral threshold
5. Safety / risk (red flags, safety-netting)
6. Scope of practice / competence
7. Shared-care question
8. Second opinion / sense-check
9. Complex / multi-morbidity
10. Other *(logged & reviewed)*

**Audit value:** report by specialty × query type (e.g. "most Dermatology questions are diagnostic uncertainty; most Psychiatry ones are medication queries"), and use the commonest types to decide what to **teach**.

---

## Appendix D — Templates & SOPs taxonomy

**Facet 1 — Document category**
1. Note template *(drives AI note drafting)*
2. SOP *(operating procedure)*
3. Policy & governance *(risk register, incidents, complaints)*
4. Patient-facing document *(leaflets, consent forms)*
5. Regulatory standard / reference *(uploaded — GPhC, CQC, MHRA, NHS)*

**Facet 2 — SOP type**
Private prescribing · Consent & confidentiality · Safeguarding & escalation · Data protection / GDPR · Controlled drugs · Infection prevention & control · Complaints & incidents · Chaperoning · Record-keeping & audit · Business continuity · Premises & equipment · **Other (request)**
