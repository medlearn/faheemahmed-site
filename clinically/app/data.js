/* ============================================================
   Clinickly — demo data layer
   Everything here is mock/illustrative content used to make the
   front-end demo feel like a real clinical product. No data leaves
   the browser; "AI" output is pre-authored and template-driven.
   ============================================================ */

window.CA_DATA = (function () {
  "use strict";

  /* ---- The current (demo) clinician ---- */
  const clinician = {
    name: "Faheem Ahmed",
    role: "Pharmacist Independent Prescriber",
    initials: "FA",
    clinic: "The Pharmacy Guy — Private Clinic",
    gphc: "20•••••5"
  };

  /* ---- Dashboard headline metrics (illustrative) ---- */
  const metrics = [
    { key: "consults", label: "Consultations this month", value: 38, delta: "+12%", hint: "vs. last month" },
    { key: "notes",    label: "Notes drafted by co-pilot", value: 36, delta: "94%", hint: "of consultations" },
    { key: "hours",    label: "Admin hours saved",         value: "19.5", delta: "≈ 31 min/consult", hint: "estimated" },
    { key: "mdt",      label: "Open MDT cases",            value: 2,  delta: "1 awaiting you", hint: "this cycle" }
  ];

  /* ============================================================
     CONSULTATION SCENARIOS
     Each scenario carries: a transcript (played back line by line to
     simulate live ambient transcription), the SOAP note the co-pilot
     "generates", and the decision-support items it surfaces.
     ============================================================ */
  const scenarios = [
    {
      id: "adhd",
      label: "Adult ADHD — titration review",
      specialty: "Mental health",
      patient: { ref: "Pt-4471", age: 29, sex: "F", reason: "ADHD medication review (6-week titration)" },
      transcript: [
        { who: "Clinician", t: "Good to see you again. We're six weeks into the lisdexamfetamine, started at 30 milligrams. How have things been?" },
        { who: "Patient", t: "Honestly, better. I can actually sit and finish a task now. Mornings are the best part of the day." },
        { who: "Clinician", t: "That's encouraging. And the afternoons?" },
        { who: "Patient", t: "It wears off around three or four. I get a bit irritable and foggy again by the evening." },
        { who: "Clinician", t: "Any issues with appetite or sleep?" },
        { who: "Patient", t: "Appetite's down at lunch, I sort of forget to eat. Sleep's fine once I'm off, maybe a little later getting to sleep." },
        { who: "Clinician", t: "Let's check your observations. Blood pressure today is 124 over 78, heart rate 76 and regular. Weight is down about a kilo from baseline." },
        { who: "Clinician", t: "No chest pain, palpitations, or anything like that?" },
        { who: "Patient", t: "No, nothing like that." },
        { who: "Clinician", t: "Okay. I think we increase to 50 milligrams to cover the afternoon dip, keep an eye on appetite, and review again in four weeks." }
      ],
      note: {
        type: "SOAP — Medication Review",
        S: "29-year-old female, 6-week review of lisdexamfetamine 30 mg OD for adult ADHD (diagnosis confirmed prior). Reports clear improvement in task initiation and sustained attention, best effect in mornings. Notes wearing-off effect mid-afternoon (~15:00–16:00) with rebound irritability and reduced focus. Reduced appetite at midday (skipping lunch). Mild delay in sleep onset, sleep quality otherwise preserved. No cardiac symptoms — denies chest pain, palpitations, syncope.",
        O: "BP 124/78 mmHg, HR 76 bpm regular. Weight down ~1 kg from baseline. No signs of distress. Cardiovascular review unremarkable on history.",
        A: "Partial therapeutic response to lisdexamfetamine 30 mg with end-of-dose wearing-off. Tolerability acceptable; mild appetite suppression and minor sleep-onset delay, both common and manageable. Cardiovascular parameters within normal limits.",
        P: "1. Increase lisdexamfetamine to 50 mg OD.\n2. Dietary advice — protein-rich breakfast, planned afternoon snack to offset appetite suppression; monitor weight.\n3. Maintain consistent morning dosing to limit sleep-onset effects.\n4. Safety-net: advise to report chest pain, palpitations, marked mood change.\n5. Review in 4 weeks with repeat BP, HR and weight.",
        codes: ["ADHD (adult)", "Medication review", "Stimulant titration"]
      },
      support: [
        { level: "guide", title: "NICE NG87 — ADHD titration", body: "Titrate against symptom response and adverse effects; review wearing-off before adding doses. Dose increase is consistent with guidance for partial response with good tolerability.", ref: "NICE NG87 §1.7" },
        { level: "monitor", title: "Cardiovascular monitoring", body: "Record HR and BP before and after each dose change; current readings within normal range. Continue routine monitoring.", ref: "BNF — Lisdexamfetamine" },
        { level: "flag", title: "Appetite & weight", body: "Reduced midday appetite with 1 kg loss noted. Plan documents dietary mitigation and weight monitoring — appropriate, not yet a stop criterion.", ref: "NICE NG87 §1.7.13" }
      ]
    },
    {
      id: "derm",
      label: "Dermatology — facial rash",
      specialty: "Dermatology",
      patient: { ref: "Pt-2208", age: 34, sex: "M", reason: "Persistent facial redness and papules" },
      transcript: [
        { who: "Clinician", t: "Tell me about the rash — when did it start and where?" },
        { who: "Patient", t: "Few months now. It's across my cheeks and nose, goes really red, sometimes little bumps like spots." },
        { who: "Clinician", t: "Does anything set it off — heat, alcohol, spicy food, stress?" },
        { who: "Patient", t: "Yeah, definitely red wine and hot rooms. It flushes and burns." },
        { who: "Clinician", t: "Any blackheads or whiteheads, like teenage acne?" },
        { who: "Patient", t: "No, not really. No blackheads." },
        { who: "Clinician", t: "Any problems with your eyes — gritty, dry, irritated?" },
        { who: "Patient", t: "Now you mention it, they've been a bit gritty in the mornings." },
        { who: "Clinician", t: "On examination there's central facial erythema, papules and pustules across the cheeks and nose, some visible telangiectasia, and no comedones. Eyelid margins look slightly inflamed." }
      ],
      note: {
        type: "SOAP — New Presentation",
        S: "34-year-old male, several-month history of central facial erythema with papules and pustules across cheeks and nose. Flushing/burning triggered by alcohol (red wine) and heat. No comedones. Reports gritty eyes in the mornings.",
        O: "Central facial erythema. Inflammatory papules and pustules over cheeks and nose. Visible telangiectasia. No comedones. Eyelid margins mildly inflamed (suggestive of ocular involvement).",
        A: "Clinical features consistent with papulopustular rosacea with possible ocular rosacea. Differential considered and felt less likely: acne vulgaris (no comedones), seborrhoeic dermatitis, perioral dermatitis.",
        P: "1. General measures — trigger avoidance (alcohol, heat), daily SPF, gentle non-soap cleanser.\n2. Topical first-line for papulopustular rosacea (e.g. ivermectin or metronidazole) — confirm within scope/formulary.\n3. Lid hygiene for ocular symptoms; safety-net for worsening eye involvement.\n4. Consider referral/optometry if ocular symptoms persist or vision affected.\n5. Review in 6–8 weeks to assess response.",
        codes: ["Rosacea", "Papulopustular", "?Ocular rosacea"]
      },
      support: [
        { level: "guide", title: "NICE CKS — Rosacea", body: "Papulopustular rosacea: first-line topical ivermectin or metronidazole; oral options reserved for more severe/refractory disease. General measures and sun protection underpin all management.", ref: "NICE CKS Rosacea" },
        { level: "flag", title: "Ocular involvement", body: "Gritty eyes + lid-margin inflammation suggest ocular rosacea. Add lid hygiene and safety-net; low threshold for ophthalmology/optometry if persistent.", ref: "NICE CKS Rosacea — ocular" },
        { level: "scope", title: "Scope of practice", body: "Confirm chosen topical is within your competence and formulary. If diagnosis uncertain or not responding, this is a good MDT (dermatology) case.", ref: "GPhC — practising within competence" }
      ]
    },
    {
      id: "uti",
      label: "Acute — recurrent UTI",
      specialty: "General",
      patient: { ref: "Pt-9015", age: 41, sex: "F", reason: "Dysuria and urinary frequency, 3rd episode this year" },
      transcript: [
        { who: "Clinician", t: "What's been going on?" },
        { who: "Patient", t: "Burning when I wee, going all the time, started two days ago. It's the third time this year." },
        { who: "Clinician", t: "Any blood in the urine, fevers, or pain in your back or sides?" },
        { who: "Patient", t: "No blood, no fever. No back pain." },
        { who: "Clinician", t: "Any chance you could be pregnant?" },
        { who: "Patient", t: "No, definitely not." },
        { who: "Clinician", t: "Any new medications, allergies to antibiotics?" },
        { who: "Patient", t: "No allergies. Nothing new." },
        { who: "Clinician", t: "Urine dip shows leucocytes and nitrites positive, no blood. You're afebrile, no loin tenderness. This looks like an uncomplicated lower urinary tract infection, but the recurrence is worth addressing." }
      ],
      note: {
        type: "SOAP — Acute Presentation",
        S: "41-year-old female, 2-day history of dysuria and urinary frequency. Third episode this year. No haematuria, no fever, no loin/back pain. Pregnancy excluded. No antibiotic allergies, no new medication.",
        O: "Afebrile. No loin tenderness. Urinalysis: leucocytes +, nitrites +, blood negative.",
        A: "Uncomplicated lower urinary tract infection. Recurrent pattern (≥3 in 12 months) warrants review of contributory factors and self-care/prophylaxis discussion.",
        P: "1. First-line antibiotic per local guidance (nitrofurantoin if eGFR adequate) — check current local sensitivities.\n2. Send MSU for culture given recurrence.\n3. Self-care: hydration, analgesia; safety-net for loin pain, fever, rigors, vomiting → seek urgent review.\n4. Recurrent-UTI advice (post-coital voiding, hydration); consider prophylaxis/onward review if pattern continues.\n5. Review culture result and symptoms in 48–72h if not improving.",
        codes: ["UTI (lower)", "Recurrent UTI", "Urinalysis"]
      },
      support: [
        { level: "guide", title: "NICE NG109 — Lower UTI", body: "Treat with a short course of first-line antibiotic guided by local resistance data. Nitrofurantoin is commonly first-line where renal function allows.", ref: "NICE NG109" },
        { level: "monitor", title: "Recurrence pathway", body: "≥3 UTIs/year meets the definition of recurrent UTI — send culture this episode and discuss prevention/prophylaxis.", ref: "NICE NG112" },
        { level: "flag", title: "Red-flag safety-net", body: "Documented advice to seek urgent care for loin pain, fever or systemic symptoms (possible pyelonephritis). Appropriate.", ref: "NICE NG109 — safety-net" }
      ]
    }
  ];

  /* ============================================================
     SAVED NOTES (history)
     ============================================================ */
  const notes = [
    { id: "N-1042", date: "2026-06-22", patient: "Pt-4471", type: "Medication Review", title: "Adult ADHD — titration review", status: "Signed", excerpt: "Partial response to lisdexamfetamine 30 mg with end-of-dose wearing-off…" },
    { id: "N-1041", date: "2026-06-21", patient: "Pt-7730", type: "New Presentation", title: "Weight management — initial assessment", status: "Signed", excerpt: "BMI 34.2, no red flags, suitable for pharmacological support pathway…" },
    { id: "N-1039", date: "2026-06-19", patient: "Pt-2208", type: "New Presentation", title: "Dermatology — facial rash", status: "Signed", excerpt: "Features consistent with papulopustular rosacea with possible ocular…" },
    { id: "N-1036", date: "2026-06-18", patient: "Pt-9015", type: "Acute", title: "Recurrent UTI", status: "Signed", excerpt: "Uncomplicated lower UTI; recurrent pattern, culture sent…" },
    { id: "N-1033", date: "2026-06-16", patient: "Pt-5521", type: "Telephone", title: "Contraception follow-up", status: "Draft", excerpt: "No new symptoms, BP stable, continue current method…" }
  ];

  /* ============================================================
     GUIDELINES — searchable knowledge base
     ============================================================ */
  const guidelines = [
    { id: "NG87",  source: "NICE",  title: "Attention deficit hyperactivity disorder: diagnosis and management", updated: "2026-03", tags: ["adhd", "mental health", "stimulant", "titration"], summary: "Recommendations on recognition, diagnosis, medication choice and titration for ADHD across the lifespan." },
    { id: "NG109", source: "NICE",  title: "Urinary tract infection (lower): antimicrobial prescribing", updated: "2026-01", tags: ["uti", "antibiotic", "infection"], summary: "Antimicrobial prescribing strategy for non-pregnant women and men with uncomplicated lower UTI." },
    { id: "NG112", source: "NICE",  title: "Urinary tract infection (recurrent): antimicrobial prescribing", updated: "2025-11", tags: ["uti", "recurrent", "prophylaxis"], summary: "Managing and preventing recurrent UTI, including self-care and prophylaxis options." },
    { id: "CKS-ROS", source: "NICE", title: "Rosacea — Clinical Knowledge Summary", updated: "2026-02", tags: ["rosacea", "dermatology", "skin"], summary: "Diagnosis and stepwise management of rosacea subtypes, including ocular involvement." },
    { id: "GPhC-STD", source: "GPhC", title: "Standards for pharmacy professionals", updated: "2025-09", tags: ["governance", "scope", "consent", "professional"], summary: "The standards expected of pharmacy professionals, including practising within competence and person-centred care." },
    { id: "GMC-GP", source: "GMC",  title: "Good medical practice", updated: "2024-01", tags: ["governance", "professional", "ethics"], summary: "Professional values and behaviours expected of all doctors; widely referenced for prescribing conduct." },
    { id: "BNF-LDX", source: "BNF", title: "Lisdexamfetamine — drug monograph", updated: "2026-05", tags: ["adhd", "stimulant", "cardiovascular", "monitoring"], summary: "Indications, dosing, cautions, monitoring (HR/BP) and adverse effects for lisdexamfetamine." },
    { id: "MHRA-VAL", source: "MHRA", title: "Valproate — pregnancy prevention", updated: "2026-04", tags: ["safety", "valproate", "pregnancy", "alert"], summary: "Regulatory requirements for valproate use in people able to become pregnant." }
  ];

  /* ============================================================
     TEMPLATES & SOPs
     ============================================================ */
  const templates = [
    { id: "T-01", name: "New patient consultation", kind: "Note template", desc: "Structured SOAP shell with history, examination, ICE and safety-netting prompts.", updated: "2026-05" },
    { id: "T-02", name: "Medication review (structured)", kind: "Note template", desc: "Indication, effectiveness, safety, adherence and shared-decision fields.", updated: "2026-05" },
    { id: "T-03", name: "ADHD titration review", kind: "Note template", desc: "Symptom response, wearing-off, cardiovascular obs and weight tracking.", updated: "2026-04" },
    { id: "S-01", name: "Private prescribing SOP", kind: "SOP", desc: "End-to-end prescribing process, record-keeping and audit trail standards.", updated: "2026-03" },
    { id: "S-02", name: "Consent & confidentiality SOP", kind: "SOP", desc: "Capacity, consent and data-handling procedure for a private clinic.", updated: "2026-02" },
    { id: "S-03", name: "Safeguarding & escalation SOP", kind: "SOP", desc: "Recognising concerns, thresholds and referral routes with named leads.", updated: "2026-02" },
    { id: "G-01", name: "Clinic governance pack", kind: "Governance", desc: "Policy index, risk register template and incident-reporting form.", updated: "2026-01" },
    { id: "G-02", name: "Patient information leaflet builder", kind: "Patient-facing", desc: "Branded, plain-English leaflet shell for common conditions.", updated: "2026-04" }
  ];

  /* ============================================================
     TRAINING
     ============================================================ */
  const training = [
    { id: "TR-01", title: "Foundations of independent prescribing", mins: 45, level: "Core", progress: 100, desc: "Accountability, scope and the prescribing consultation." },
    { id: "TR-02", title: "Documentation that stands up to inspection", mins: 30, level: "Core", progress: 100, desc: "Writing defensible notes and building an audit trail." },
    { id: "TR-03", title: "ADHD in pharmacist-led clinics", mins: 60, level: "Specialty", progress: 60, desc: "Assessment, titration and shared care considerations." },
    { id: "TR-04", title: "Recognising the deteriorating patient", mins: 40, level: "Safety", progress: 25, desc: "Red flags, safety-netting and escalation." },
    { id: "TR-05", title: "Rosacea & common facial dermatoses", mins: 35, level: "Specialty", progress: 0, desc: "Pattern recognition and first-line management." },
    { id: "TR-06", title: "Reflective practice & revalidation", mins: 25, level: "Professional", progress: 0, desc: "Turning MDT discussions into CPD evidence." }
  ];

  /* ============================================================
     MDT — panel, schedule, sessions, cases
     ============================================================ */
  const panel = [
    { name: "Dr A. Okafor", role: "Chair / Clinical Lead", specialty: "Clinical governance", initials: "AO", focus: "Agenda, reflective discussion, session sign-off." },
    { name: "Dr S. Mehta", role: "GP", specialty: "General practice", initials: "SM", focus: "Comorbidity, red flags, referral thresholds." },
    { name: "Dr L. Bright", role: "Psychiatrist", specialty: "Psychiatry", initials: "LB", focus: "ADHD, mood and anxiety prescribing." },
    { name: "Dr R. Kaur", role: "Dermatologist", specialty: "Dermatology", initials: "RK", focus: "Skin presentations, escalation, safe prescribing." }
  ];

  const nextSession = {
    title: "Monthly MDT — June cycle",
    date: "2026-06-30",
    time: "19:00–20:30 BST",
    format: "Virtual",
    agenda: [
      "Teaching slot — end-of-dose wearing-off in stimulant titration",
      "Case discussion — 2 submitted cases",
      "Open reflection & questions"
    ]
  };

  // Cases the demo clinician has submitted to the MDT
  const cases = [
    {
      id: "C-228", title: "Uncertain rosacea vs. perioral dermatitis", specialty: "Dermatology",
      submitted: "2026-06-20", status: "Answered", responder: "Dr R. Kaur",
      summary: "34M, central facial erythema with papulopustules, no comedones, gritty eyes. Querying rosacea with ocular involvement vs. perioral dermatitis before committing to topical.",
      response: "Picture fits papulopustular rosacea with early ocular involvement rather than perioral dermatitis (distribution + telangiectasia + lid signs). Reasonable to start topical ivermectin with lid hygiene and review at 6–8 weeks; refer to optometry/ophthalmology if eyes worsen. Good documentation of trigger advice."
    },
    {
      id: "C-231", title: "Stimulant titration with afternoon rebound", specialty: "Psychiatry",
      submitted: "2026-06-22", status: "Awaiting panel", responder: "Dr L. Bright",
      summary: "29F, 6 weeks on lisdexamfetamine 30 mg. Good morning response, afternoon wearing-off with irritability, mild appetite suppression. Planning increase to 50 mg — sense-check before MDT.",
      response: null
    },
    {
      id: "C-219", title: "Recurrent UTI — when to consider prophylaxis", specialty: "General practice",
      submitted: "2026-06-12", status: "Answered", responder: "Dr S. Mehta",
      summary: "41F, third uncomplicated lower UTI this year. Treated acutely; asking at what point to move to prophylaxis vs. self-care and what to exclude first.",
      response: "Three culture-proven episodes in 12 months meets the recurrent threshold — send culture each episode, review post-void residual risk and modifiable factors first. Trial behavioural measures; if persisting, discuss standby or low-dose prophylaxis with the patient and document shared decision."
    }
  ];

  // Recorded session library
  const library = [
    { id: "L-09", title: "End-of-dose effects in ADHD titration", date: "2026-05-30", mins: 22, panel: "Dr L. Bright", tags: ["adhd", "psychiatry"] },
    { id: "L-08", title: "Facial rashes: rosacea, acne or something else", date: "2026-04-29", mins: 28, panel: "Dr R. Kaur", tags: ["dermatology"] },
    { id: "L-07", title: "Safety-netting that actually protects you", date: "2026-03-28", mins: 19, panel: "Dr S. Mehta", tags: ["safety", "governance"] },
    { id: "L-06", title: "Writing notes for the inspection you hope never comes", date: "2026-02-26", mins: 24, panel: "Dr A. Okafor", tags: ["governance", "documentation"] }
  ];

  /* ---- Dashboard activity feed ---- */
  const activity = [
    { icon: "note", text: "Co-pilot drafted note <b>N-1042</b> — Adult ADHD review", time: "2 days ago" },
    { icon: "mdt",  text: "MDT response received on case <b>C-228</b> from Dr R. Kaur", time: "4 days ago" },
    { icon: "guide", text: "NICE <b>NG87</b> updated — ADHD titration guidance", time: "1 week ago" },
    { icon: "train", text: "Completed module — <b>Documentation that stands up to inspection</b>", time: "1 week ago" }
  ];

  return {
    clinician, metrics, scenarios, notes, guidelines, templates,
    training, panel, nextSession, cases, library, activity
  };
})();
