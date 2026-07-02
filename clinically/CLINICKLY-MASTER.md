# Clinickly Co-pilot — MASTER BUILD DOCUMENT

**The single source of truth for Clinickly Co-pilot — a standalone product.**
Read top to bottom. **Clinickly Co-pilot is built as its own independent project** — its own code repository, its own hosting, and its own domain. It is **not** part of, and must **not** depend on, reference, or have access to, any other website or codebase.

**Status:** a working prototype exists with real AI + a real database (see §2).

---

## 0. How to use this
- **Non-technical reader:** §1–§8 explain the product and every decision in plain English.
- **Developer:** §5–§12 are the build — page specs, integrations, governance pipeline, step-by-step code, build order, compliance.
- **Golden rule of the whole product:** the AI **supports**, it never decides. Every note/flag is reviewed and signed by a human. Never auto-prescribe. (Also a legal requirement — §11.)

---

## 1. What you're building (plain English)

A web app with **two pillars**:
1. **AI co-pilot (software)** — during/around a consultation it **transcribes → drafts a structured SOAP note → flags guideline-backed checks**; plus guidelines, templates/SOPs, training.
2. **Human MDT (people)** — an expert panel (GP, psychiatrist, dermatologist, chair) that clinicians **submit anonymised cases to** and **meet with**; the panel also **governs the clinical content**.

**Tagline:** *AI for the everyday, the MDT for the difficult.*
**Who it's for:** independent prescribers (pharmacists, nurses, physios, paramedics) and private clinics — established or just starting out.

---

## 2. Current status — built vs to-build (honest)

| Area | Now | To build |
|------|-----|----------|
| UI / all screens | ✅ Built | Refine per this spec |
| Transcription | ✅ Browser mic (in-person) | Proper STT: speaker separation + remote calls (§7) |
| Note drafting (SOAP) | ✅ Real Claude | Template/history structure (§5.2, §6) |
| Decision support | ✅ Real Claude | Ground in real guidance, not memory (§7) |
| Database | ✅ Real (notes persist) | Extend schema (§9) + confirm MDT cases persist |
| Guidelines / codes | ⚠️ Placeholder / AI-from-memory | Real sources (§7) |
| MDT case submit + tracking | ✅ Built | **Panel-answering loop (login → answer)** = key gap |
| Governance pipeline | ❌ | Standard build (§8) |
| Admin / Governance console | ❌ | Build (§4) |
| Roles / permissions | ⚠️ Loose (a "patient" saw everything) | Lock to 3 roles (§4) |
| Patient side | Built by dev | **Remove for pilot** (deferred) |

---

## 3. Foundational decisions (read before building)

1. **Version A — Clinickly is an anonymised ASSISTANT, not the patient record.** Only **anonymised/minimal** data goes in (age range, reason, a clinician-controlled **patient reference** like initials — never name/DOB/NHS number). It **drafts + supports**; the clinician **copies/exports into their own record system**, which stays the source of truth. *(Version B — Clinickly as the medical record — is a much bigger compliance build for later.)* Known trade-off: two tools + cost → mitigated by one-click export now, integration next.
2. **Three roles only for the pilot:** **Clinician · MDT panel member · Admin** (+ Chair/clinical lead). **No patient role** — the patient portal is **deferred to a later phase**.
3. **Structured tags, not free text.** Anything you'll count/filter/route is a **controlled dropdown** (consultation type, specialty, urgency, query type). Free text only for clinical *content* (note body, case summary). Taxonomies in §6.
4. **Closed pilot on synthetic/anonymised data** while integrations + approvals + compliance run. The compliance floor applies **per patient**, not per user count (§11).
5. **UK/EU data residency** for all audio + text processing.
6. **Everything is human-governed** — clinical content (guidelines, SOPs, templates, training) is AI-drafted but **MDT-reviewed and human-signed** before going live (§8).

---

## 4. The three roles + the Admin / Governance console

| Role | Works in |
|---|---|
| **Clinician** | The co-pilot (notes · cases · training) |
| **MDT panel member** | Answers cases + does governance sign-offs |
| **Admin (+ Chair/clinical lead)** | The Admin / Governance console (below) |

**Admin / Governance console — the "engine room"** (clinicians never see it):
- **Panel management** — add/remove MDT members, set specialties, manage logins (members recruited via a panel-interest / recruitment form).
- **MDT scheduling** — recurring session rule + dates (auto-advance + override); agenda auto-pulls submitted cases + a teaching slot.
- **Governance sign-off queues** — review & sign off guidelines, SOPs, note templates, training (the §8 pipeline).
- **Content libraries** — create/edit/publish all clinical content; handle "Request an SOP/template".
- **Regulatory standards** — upload GPhC/CQC/MHRA/NHS (reference + AI gap-check).
- **Users, clinics & permissions** — accounts, roles, and **locking each role to its own area**.
- **Reporting & audit** — consultation types, MDT query types, CPD completion, full audit trails.
- **Billing** — later (Stripe), incl. the premium MDT-review add-on.

---

## 4A. The three portals — front-end + back-end (build breakdown)

**One product, one codebase, three role-based portals.** Build the **shared foundation once**, then each portal is a set of screens (front-end) on top of shared APIs + data (back-end).

**Shared foundation (built once — powers all three):**
- **Auth + 3 roles + permissions** (RLS: each role sees only its own area/data).
- **Database** (Postgres/Supabase) · **API layer** (Netlify Functions, `/api/*`).
- **AI + integrations** (Claude, STT, guidance, codes — §7) · **audit log** · **hosting/deploy**.

### Portal 1 — Clinician
- **Front-end (screens):** Dashboard · Consultation · Clinical notes · Guidelines · Note-templates · Training · MDT overview · My cases (submit + track) · Session library · Ask Clinickly.
- **Back-end:** `/api/notes` (SOAP), `/api/support` (decision support), `/api/transcribe-token`, `/api/codes` (SNOMED/ICD validate), `/api/guidelines` (search), `/api/cases` (create/list), `/api/cpd`. **Data:** consultations, notes, note_addenda, mdt_cases (create), training/CPD. **Logic:** template auto-select by consultation type, anonymise-on-create, note sign/lock.

### Portal 2 — MDT panel member
- **Front-end (screens):** My assigned cases (routed by specialty) · Case detail + **write response** · **Governance review queue** (content to check) · Session tools (agenda/recordings) · Profile.
- **Back-end:** `/api/panel/cases` (list routed by specialty), `/api/panel/respond` (write → persist → **notify clinician**), `/api/governance/review` (submit review). **Data:** mdt_responses, governance review records. **Logic:** routing by specialty, notifications.

### Portal 3 — Admin / Governance console
- **Front-end (screens):** Panel management · MDT scheduling + agenda · **Governance sign-off queues** · Content libraries (create/edit/**publish** guidelines/SOPs/templates/training) · Regulatory-standards upload · Users/clinics/permissions · Reporting & audit · Billing (later).
- **Back-end:** `/api/admin/panel`, `/api/admin/schedule`, `/api/admin/content` (CRUD + **publish/version**), `/api/admin/standards` (upload), `/api/admin/users`, `/api/admin/reports`, governance **sign-off** endpoints. **Data:** guidelines/templates/sops/training (+ version, reviewer_id, signer_id, published_at), schedules, users, clinics, audit_log. **Logic:** the **governance pipeline** (§8), AI change-detection (fast-follow), reporting queries.

*Build order across portals: shared foundation → Clinician (core value) → MDT panel (answering loop) → Admin (governance). A minimal Admin ships with auth/DB; it grows into the full console. See §10.*

---

## 5. The product, page by page

### 5.1 Dashboard
Home/overview. Shows next-MDT banner, headline numbers, quick actions, recent notes, activity.
- **Build:** the four numbers must **count real usage** (not samples). The **MDT date auto-advances** on a recurring rule (+ admin override) — not hard-coded.

### 5.2 Consultation (the core)
3 columns: **Live transcription → AI-drafted SOAP note → Decision support.**
- **Input is flexible:** transcribe live, type/paste, or a mix → AI drafts → editable. Not transcription-only.
- **Standardised output** governed by the chosen **note template**; content reflects only what was said; clinician reviews & signs.
- **Note template = SOAP frame + clinical history structure *inside* Subjective**, scaled by consultation type:
  - *New/initial assessment* → PC · HPC · PMH · DH · FH · SH · Menstrual (if relevant) · ROS → Exam (Objective) · Impression (Assessment) · Plan.
  - *Follow-up/med review* → lighter (interval history, response, obs, plan).
  - Template also **flags gaps** ("no drug history captured") — a completeness/safety prompt.
- **Consultation type** = two required dropdowns (Appendix A), replacing the demo "Scenario" picker; auto-selects the template + MDT routing.
- **Codes, transcription, guidance** — see §7 (all need real integrations).

### 5.3 Clinical notes
Record-keeping hub — store, edit, **sign**, search, turn into MDT case; holds the audit trail.
- **Version A:** notes drafted here, **copied/exported** to the clinician's own system. Each note carries a **clinician-controlled patient reference**.
- **Sign = lock:** once signed, immutable + timestamped; later changes = **addendum**, not overwrite.
- **Search = filters + keyword:** filter by taxonomy tags (Clinical area × Encounter type), status, date, patient reference; plus keyword search inside notes.
- One-click **export** now → integration later (removes double-entry).

### 5.4 MDT case (create + track = "My cases")
Send an **anonymised** case to the panel; track Awaiting → Answered.
- **Two structured dropdowns:** Specialty (who answers — Appendix B) + **Query type** (for audit — Appendix C; AI auto-suggests). Keep Urgency dropdown.
- **Anonymise on create** (esp. from a note) — AI auto-anonymises + flags identifiers before submit.
- **Image upload (essential — esp. dermatology):** attach **1–5 clinical photos** per case, visible to the routed panel member. Rules: anonymisation guidance at upload (crop to lesion; avoid faces/tattoos/jewellery/backgrounds) · **AI pre-check** flags identifiable images before submit · **auto-strip EXIF** (GPS/timestamps) · **required consent checkbox** (patient consent for clinical photography + sharing, logged) · encrypted **UK/EU storage** (Supabase Storage), access limited to submitter + routed panel member, audited, deletable.
- **Filter/search cases** by specialty × query type × status × date (powers the MDT audit).
- **⭐ Key build — the answering loop:** panel-member **login** → case routed by specialty → panel writes response → **persists to DB** → clinician notified. (Currently responses are samples; "0 in DB".)

### 5.5 Saved records → **removed** (merged into Clinical notes / My cases). Delete the page. Remove "Release to patient" (Version A).

### 5.6 Guidelines
Searchable guidance library; also feeds the decision-support flags; underpins "what did guidance say at the time". Sources + interim/target in §7. Kept current via the **§8 governance pipeline**.

### 5.7 Templates & SOPs → **split**
- **Note templates** (move next to note-writing): the SOAP+history skeletons the AI fills. **Clinickly provides them, MDT-validated**; clinics may customise; new ones requested → governed.
- **SOPs / policies / governance docs** (own admin area): Clinickly provides **starter templates** → AI helps populate → **AI checks against uploaded GPhC/CQC/MHRA/NHS standards** → **clinic lead signs off (standard)** / **MDT review (premium)** → versioned/audited. **"Request an SOP"** button.
- **Patient-leaflet builder:** keep — it generates a document the clinician shares their own way (Version A).
- Taxonomy: Appendix D.

### 5.8 Training
Upskilling + CPD hub.
- **Embedded learning:** video (host on **Bunny** — recommended) + text + optional quiz. Completion → logs CPD + prompts reflection. *(Keep v1 simple; quizzes/certs = Phase 2.)*
- **CPD recording (standards-aligned):** *now* — structured record (what/date/hours/type + reflective account + standard link) → **export as CPD portfolio (PDF)** the clinician uploads to their body; works for **GPhC/GMC/NMC** (shared core). *Phase 2* — per-body exact formatting + any direct submission.
- **Content:** Clinickly-produced (your own educational content) + **MDT session recordings → modules**, all governance-signed.
- **Data-driven curriculum:** commonest MDT query types + decision-support flags → new modules.
- **Team training (admin):** assign modules to staff + track completion (inspection evidence).
- **MDT = peer discussion + reflection** → revalidation evidence as a by-product.

### 5.9 MDT overview
Front page of Pillar 2 — panel, next session + agenda, how it works, links to submit/library. Informational. Panel + scheduling + governance all managed in the **admin console** (§4).

### 5.10 Session library
Searchable recorded MDT sessions. **Consent + anonymisation required**; governance-signed before publishing; **tagged** for search; a session can be **promoted into a Training module** (Bunny video).

### 5.11 Ask Clinickly (AI chat)
Ask a clinical question → **guideline-backed answer**. **Grounded in the same restricted official sources** (not AI memory); **cites source + "verify at source"**; framed as **"decision support, not a decision"**; logged/audited; also answers "how do I use Clinickly?".

### 5.12 Patient portal → **deferred to a later phase.** Remove patient portal + patient login + membership/"Activate" for the pilot. Returns done properly later.

---

## 6. Taxonomies (controlled lists — no free text)

**A. Consultation** (two dropdowns):
- *Clinical area:* ADHD · Autism (ASD) · Mental health · Weight management · Dermatology · Sexual & reproductive health · General & acute prescribing · Long-term condition · Travel health · Other (logged).
- *Encounter type:* New/initial assessment · Medication review/titration · Routine/annual review · Follow-up/monitoring · Acute/minor illness · Prescribing query/second opinion · Shared-care review.

**B. MDT routing specialty (who answers):** General practice · Psychiatry/mental health · Dermatology · Pharmacy & prescribing · Weight management* · Women's/sexual & reproductive health* · Governance/ethics (Chair) · Unsure — triage to Chair. *(*as panel grows)*

**C. MDT query type (for audit; AI auto-suggests):** Diagnostic uncertainty · Treatment/management choice · Medication query · Escalation/referral threshold · Safety/risk · Scope of practice · Shared-care · Second opinion/sense-check · Complex/multi-morbidity · Other (logged).

**D. Templates & SOPs:**
- *Category:* Note template · SOP · Policy & governance · Patient-facing · Regulatory standard/reference.
- *SOP type:* Private prescribing · Consent & confidentiality · Safeguarding & escalation · Data protection/GDPR · Controlled drugs · Infection prevention & control · Complaints & incidents · Chaperoning · Record-keeping & audit · Business continuity · Premises & equipment · Other (request).

Rules: both facets required dropdowns; "Other" logged & reviewed; clinical content stays free text; forward-looking — map tags to **SNOMED**.

---

## 7. Integrations — interim (now) vs target (licensed)

| Capability | Interim (pilot, now) | Target | Start now |
|---|---|---|---|
| **Transcription** | Browser mic (in-person) | **Speechmatics** (UK, diarization) + **Recall.ai** (Zoom/Teams/Meet both sides) | Contract STT + bot |
| **Codes (SNOMED/ICD)** | AI-suggested, flagged "verify" | AI proposes concept → validate against **NHS Terminology Server** (SNOMED) + **WHO ICD API**; meds via **dm+d** | Apply: NHS Terminology Server |
| **Guidance + decision support** | **Restricted official-site search** (`nice.org.uk`, `cks.nice.org.uk`, BNF only) — reads current text, cites + "verify at source". Curated library = **AI draft → clinician check → link + date**. | **NICE Syndication API** (licensed) + own **version-tracked store** (RAG); + **BMJ Best Practice, UpToDate, DynaMed** | Apply: NICE Syndication (+ BMJ/UpToDate/DynaMed) |

**⚠️ Copyright split:** the curated DB / pipeline covers **NICE/CKS + your own summaries ONLY**. **UpToDate / DynaMed / BMJ are commercial — link-out only until licensed; never AI-clone them.** Regulatory standards (GPhC/CQC/MHRA/NHS) are public — safe to hold + gap-check.
**Updates handled by:** link + last-checked + **live-search for real decisions** + review cycle → automatic once APIs land.
**Never** use the open web or AI memory for clinical guidance. Keep all keys server-side.

---

## 8. The governance pipeline (STANDARD build)

Keeps all clinical content current + safe. **Reuses the MDT/roles/DB machinery.** Used for **guidelines, SOPs, note templates, training**.

1. **AI drafts** (a summary / update / new item).
2. **MDT reviews** — routed to the relevant specialty.
3. **Clinical lead signs off** — named, dated.
4. **Published** to users — **versioned**.
5. **Every step audit-logged** (AI draft, reviewer, signer, when).

- Run from the **Admin/Governance console**. Benefits: always-current + human-governed + defensible + strengthens clinical safety (DCB0129) + a trust story.
- **Fast-follow (not day-one):** AI **auto change-detection** (watches sources, flags "NG87 changed"). **Launch interim:** manual **"review due"** schedule (~3-monthly).

---

## 9. Technical build — step by step

**Recommended stack (set up fresh in your own new project — do NOT reuse any other site's codebase):** static front end (plain HTML/CSS/JS or a framework of your choice) · **Netlify Functions** (backend, `/api/*`) · **Supabase** (Postgres + Auth) · **Bunny** (video) · **Stripe** (billing, later) · **Claude** (`claude-sonnet-4-6` default, `claude-opus-4-8` for hardest).

**Setup (your own repo)**
```bash
mkdir clinickly && cd clinickly && npm init -y
npm install @anthropic-ai/sdk @supabase/supabase-js
npm install -g netlify-cli
# add your keys to .env (§12)
netlify dev            # runs the app + functions locally
```

**Phase 1 — real note drafting** (`netlify/functions/notes.js`): POST `{transcript, patient, template}` → Claude with a forced-JSON tool returning `{S,O,A,P,codes}`. System prompt: draft SOAP from transcript only, **do not invent findings**, flag uncertainty, follow the selected template, does not diagnose/prescribe. Wire into the consultation view's note generation (replace any mock).

**Phase 2 — decision support** (`/api/support`): grounded in the restricted official-site search (§7), returns `{level,title,body,ref}[]`, each cites source + "verify at source".

**Phase 3 — auth + database (Supabase).** Email login; gate the app; 3 roles + RLS. Core tables:
```sql
clinics(id, name, created_at)
profiles(id→auth.users, role[clinician|panel|admin], full_name, reg_number, clinic_id)
consultations(id, clinician_id, patient_ref, clinical_area, encounter_type, created_at)
notes(id, consultation_id, clinician_id, patient_ref, s,o,a,p, codes[], status[draft|signed], signed_at, created_at)
note_addenda(id, note_id, author_id, body, created_at)
mdt_cases(id, clinician_id, specialty, query_type, urgency, title, summary, status, responder_id, created_at)
mdt_responses(id, case_id, panel_member_id, body, created_at)
case_images(id, case_id, storage_path, consent_confirmed bool, exif_stripped bool, ai_identifiable_flag bool, uploaded_by, created_at)  -- encrypted bucket, UK/EU
mdt_sessions(id, date, agenda, recording_url, consented, published, created_at)
guidelines / templates / sops / training(... + status, version, reviewer_id, signer_id, published_at)  -- governance pipeline
audit_log(id, actor_id, action, entity, entity_id, at)
```
RLS: clinicians see only their own notes/cases; panel see cases routed to them; admin sees all. **No patient-identifiable data** in any table (patient_ref = clinician's own code).

**Phase 4 — transcription** (Speechmatics + Recall.ai; token brokered server-side).
**Phase 5 — MDT answering loop** (panel login → routed cases → responses persist → notify) **+ case image upload** (encrypted Supabase Storage bucket, EXIF strip on upload, AI identifiable-image pre-check, consent checkbox, access = submitter + routed panel member only).
**Phase 6 — governance pipeline + admin console** (§8, §4).
**Phase 7 — Training** (Bunny video embeds + CPD export).
**Phase 8 — billing** (Stripe) + custom domain.

**Deploy:** push to `main` on GitHub → Netlify auto-builds. Keys in **Netlify env vars**, never in code.

---

## 10. Build order (what first)

1. **Real note drafting** (Phase 1) — highest value, proves the core.
2. **Decision support grounded in official sources** (Phase 2 + §7 interim).
3. **Auth + DB + 3 roles** (Phase 3) — unlocks everything else; **remove the patient side here**.
4. **MDT answering loop** (Phase 5) — completes Pillar 2.
5. **Governance pipeline + admin console** (Phase 6) — turns on content governance.
6. **Transcription upgrade, Training/CPD, billing, domain** (Phases 4/7/8).
*Run the closed pilot on synthetic/anonymised data from Phase 3; do NOT touch real patient data until the compliance gate (§11) is cleared.*

---

## 11. Compliance & safety (do NOT skip)

- **Clinical safety:** UK **DCB0129 / DCB0160** apply to clinical decision-support software. Appoint a **Clinical Safety Officer**; keep a **hazard log**. (The §8 sign-off pipeline supports this.)
- **Data protection:** UK GDPR — **DPIA** before any real patient data; UK/EU residency; retention; subject access/erasure. (Version A minimises this by holding no identifiers.)
- **No auto-prescribe.** AI drafts; clinician signs. Keep **"supports, not decides"** in the UI + T&Cs.
- **Audit everything** — who saw/signed/published what, when. (Selling point *and* safety.)
- **Keys server-side only.** Never ship API keys to the browser.
- **MDT framing:** advisory peer input, not transfer of responsibility; sort indemnity/consent before launch.
- **Copyright:** §7 split — never republish commercial guidance without a licence.

---

## 12. Applications / accounts to START NOW (lead time)

- [ ] **NICE Syndication API** (licence) · **BMJ Best Practice / UpToDate / DynaMed** (commercial licences)
- [ ] **NHS Terminology Server** (SNOMED CT) · **WHO ICD API**
- [ ] **Speechmatics** (STT) + **Recall.ai** (meeting bot)
- [ ] **Anthropic** API key (Claude) · **Bunny** (video, already in stack) · **Stripe** (billing, later)
- [ ] **Clinical Safety Officer** appointed · **DPIA** started · solicitor for **T&Cs / DPA / indemnity**

---

*Env vars: `ANTHROPIC_API_KEY`, `SUPABASE_URL/ANON_KEY/SERVICE_ROLE_KEY`, `SPEECHMATICS_API_KEY`, `RECALL_API_KEY`, `NICE_SYNDICATION_KEY`, `NHS_TERMINOLOGY_*`, `BUNNY_*`, `STRIPE_*`. All server-side.*
