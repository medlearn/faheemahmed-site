# Clinickly Co-pilot — Legal & Compliance Brief (for our solicitor)

**Purpose:** a plain-English brief to give our solicitor so they can advise on — and draft — the legal documents Clinickly needs before pilot and launch. This is a **founder's summary of facts + questions**; it is **not legal advice** and is not itself a legal document.

**Status:** early-stage product; a working prototype exists; we intend a **closed pilot on synthetic/anonymised data** before any real patient data.

---

## 1. What Clinickly Co-pilot is (plain English)
A software tool for **independent prescribers and private clinics** (pharmacists, nurses, and other prescribers), with two parts:
1. **AI co-pilot** — during/around a consultation it transcribes, **drafts a structured clinical note** (a documentation aid), and **surfaces the relevant clinical guidance** for the clinician to read and apply. It does **not** diagnose, prescribe, or give patient-specific instructions.
2. **Human MDT** — an expert panel (GP, psychiatrist, dermatologist, chair) the clinician submits **anonymised** cases to for **teaching, training, peer discussion and CPD** (case-based education), and meets with. It is an **educational/reflective** activity — not a clinical advisory service on live patients.

**The golden rule, built into the product:** *the tool supports the clinician's judgement; it never decides.* Every note and prompt is reviewed and signed by the treating clinician, who **remains the decision-maker and remains accountable.**

---

## 2. What we're asking you (solicitor) to help with
- **Terms & Conditions** for clinician/clinic users (and later, patients).
- **Privacy Policy + Data Processing Agreement (DPA)** — UK GDPR.
- **User-facing disclaimers** — the "decision support, not a directive" framing and limits of liability.
- **MDT panel-member agreements** — advisory scope, professional indemnity, remuneration, confidentiality.
- **IP / content-licensing position** — our own authored clinical content + use of third-party sources (see §5 — the key new area).
- **Regulatory advice / signposting** — medical-device status (MHRA), clinical-safety standards, professional-advertising claims (see §7).
- **Clinical-photography consent wording** (see §6).

---

## 3. Key facts you need to know

**3.1 Data model — "Version A" (materially reduces data exposure).**
For the pilot, Clinickly is an **anonymised assistant, not the patient record.** Only **anonymised/minimal** information is entered (age range, reason, and a **clinician-controlled reference** such as initials) — **never** name, DOB or NHS number. The clinician **copies the drafted note into their own record system**, which remains the source of truth. Clinickly is not the medical record.

**3.2 Roles.** Three roles only for the pilot: **clinician · MDT panel member · admin**. **No patient portal / patient login** in the pilot (deferred).

**3.3 Guidance + documentation — the clinician decides.** The tool **offers clinical guidance/reference** and **drafts documentation**; the clinician **reads, applies, edits and signs**. It does not diagnose, prescribe, or issue patient-specific instructions. **Accountability stays with the treating clinician.** Every action is audit-logged. *(We are deliberately positioning Clinickly as a guidance/reference + documentation tool, not patient-specific decision-support software — see §7.)*

**3.4 The MDT is an anonymised educational / CPD activity.** The MDT exists for **teaching, training, peer discussion and CPD/reflection**, using **anonymised cases only** (no identifiers). It is **case-based education** — **not** a clinical advisory service on live patients, and not patient care. Panel input is **educational/reflective**, **not** a transfer of clinical responsibility; the treating clinician remains solely responsible for any decision about their own patient. We need panel agreements covering educational scope, indemnity, remuneration and confidentiality.

*(This educational framing further supports the position in §7 that Clinickly is not a medical device.)*

**3.5 AI use.** AI drafts content and notes; **a human verifies before anything is relied on or published.** API keys are server-side. No real patient data during the pilot.

---

## 4. The clinical content / guidelines approach ← **please advise carefully here**

This is central and has the clearest IP/liability implications.

**4.1 We author our OWN content.** We create **original, clinician-friendly guidance** in our own words (a synthesis), **referenced to sources** — we do **not** reproduce the text of NICE, UpToDate, etc. (This is analogous to how UpToDate/BMJ Best Practice created their own content.)

**4.2 How it's produced (and made defensible):**
- AI **drafts from retrieved source text** (not from memory), and **each recommendation is cited to a named source** (e.g. NICE CKS, British Association of Dermatologists).
- A **clinician verifies each recommendation against its cited source** and **signs it off** before publication — with an **audit trail** (who verified what, against which source, when) and **versioning**.
- Content shows **"decision support, not a directive · verify at source"** and links to the live source.

**4.3 Prescribing specifics come from the BNF.** We author the treatment **approach**; **doses, cautions, interactions and monitoring are taken from the BNF** — never hand-authored or AI-generated. (This limits our exposure on the highest-risk data.)

**4.4 Copyright split (please confirm our position):**
- **NICE / CKS** — public-sector guidance; we intend to obtain a **NICE Syndication licence** for reuse, and in the interim to **link out / reference** and use our own summaries.
- **Commercial sources (UpToDate, DynaMed, BMJ Best Practice)** — **link-out only until licensed**; we do **not** copy or AI-summarise their content into our product.
- **Regulatory standards (GPhC, CQC, MHRA, NHS)** — public; used as reference.

**4.5 Interim (pre-licences).** Guidance retrieval is **restricted to official sources** and clearly labelled **"indicative — verify at source"**, within a **closed pilot**. We will not market content as "official NICE guidance" until licensed.

**Questions for you (§4):** Is our position on **AI-drafted, clinician-verified original content derived from public guidance** sound? What licences must be in place **before commercial scale** (NICE Syndication; commercial sources)? Any attribution/derivative-work risks to manage?

---

## 5. Clinical images (esp. dermatology)
Clinicians may attach **clinical photos** to MDT cases. Controls: **required consent** (patient consent to clinical photography + advisory sharing, logged); **EXIF/location metadata stripped**; **AI pre-check** flags potentially identifiable images; **encrypted UK/EU storage**; access limited to the submitting clinician + the routed panel member; auditable and deletable.
**Question:** consent wording + data-protection handling for clinical images (a facial photo is identifiable data).

---

## 6. CPD / revalidation
The tool records **CPD** and generates reflective material for **GPhC/GMC/NMC revalidation** (the MDT sessions double as peer discussion). No specific legal ask, but relevant to claims we make.

---

## 7. Regulatory flags — please advise / signpost specialists
- **Medical device status (MHRA) — please confirm.** Our position is that Clinickly is a **guidance/reference and documentation tool** (it offers guidance for the clinician to apply, and drafts notes) — **not** patient-specific clinical decision-support software — and so we do **not** consider it a medical device. But device status turns on **function, not labelling**: software that produces **patient-specific recommendations** can fall in scope. Please **confirm** we are out of scope given how the tool works, and flag anything (e.g. any patient-specific prompting) we should avoid or change to stay out of scope.
- **Clinical safety standards** — **DCB0129 / DCB0160** (clinical risk management for health IT); we intend to appoint a Clinical Safety Officer and keep a hazard log.
- **UK GDPR** — DPIA before any real patient data; data residency UK/EU.
- **Advertising / claims** — ensure marketing stays within "decision support," no overclaiming of clinical outcomes.

---

## 8. Commercial model (context)
Subscription for clinicians/clinics (Stripe); a **founding-clinic pilot**; an optional **premium MDT-review** tier; paid MDT panel members.

---

## 9. Summary — documents requested
1. T&Cs (users/clinics) · 2. Privacy Policy + DPA · 3. Disclaimers / limitation of liability · 4. MDT panel-member agreement (advisory + indemnity + remuneration) · 5. IP/content-licensing advice + NICE Syndication/commercial licensing steps · 6. Clinical-photography consent wording · 7. Advice on MHRA medical-device status + clinical-safety/GDPR obligations.

*Prepared as an instructing brief. Not legal advice.*
