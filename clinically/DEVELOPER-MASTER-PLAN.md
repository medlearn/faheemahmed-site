# Clinickly Co-pilot — Developer Master Plan (Build Manual)

**Audience:** the developer building the production product.
**Promise of this doc:** follow it top to bottom and you can take the current front-end demo to a working, AI-powered, multi-tenant product. No prior knowledge of this project assumed.

> Read order: this file (build steps) → [HANDOFF.md](HANDOFF.md) (architecture reference) → [MASTER-PLAN.md](MASTER-PLAN.md) (business phases & compliance).

---

## 0. TL;DR — what you're building

A web app with two halves:
1. **AI co-pilot** — clinician records a consultation → app transcribes it → an LLM drafts a structured clinical note (SOAP) and shows guideline-backed prompts → clinician edits, signs, saves.
2. **MDT portal** — clinician submits anonymised cases to a panel of senior clinicians and gets written answers; plus scheduled group sessions.

Today everything is a **front-end demo with fake AI** (hard-coded text). Your job: make the AI real, add login + a database, and build the MDT backend. **Do it in the phases below, in order.**

**Golden rule baked into the product:** the AI *supports*, it never decides. The clinician edits and signs every note. Never auto-prescribe. (This is also a legal requirement — see §11.)

---

## 1. Glossary (so nothing is ambiguous)

| Term | Means |
|------|------|
| **SPA** | Single-page app — one HTML page, JS swaps the content. The demo app is this. |
| **SOAP note** | Standard clinical note format: **S**ubjective, **O**bjective, **A**ssessment, **P**lan. |
| **MDT** | Multidisciplinary team — the human panel (GP, psychiatrist, dermatologist…). |
| **IP** | Independent Prescriber (the main user). |
| **LLM** | Large language model. We use **Claude** (Anthropic). |
| **Netlify Function** | A small server-side script (Node.js) that runs on Netlify. This is our "backend". Lives in `netlify/functions/`. Reached at `/api/<name>`. |
| **Supabase** | Hosted Postgres database + user login (auth). Already used elsewhere in this repo. |
| **STT** | Speech-to-text (transcription). |
| **RLS** | Row-Level Security — Postgres rule so a user can only read their own rows. |
| **Env var** | Secret setting (API keys) stored in Netlify, never in the code. |

---

## 2. How the current demo is built (read before changing anything)

```
clinically/
├── index.html        # Marketing/landing page (self-contained). Has the lead forms.
└── app/              # THE APP (what you'll turn into the product)
    ├── index.html    #   HTML shell: sidebar, top bar, icon set. No content here — JS fills it.
    ├── app.css       #   All styles. Design tokens (colours/fonts) are at the very top.
    ├── app.js        #   ALL the logic. ~650 lines, plain JavaScript, no framework.
    └── data.js       #   ALL the fake data. THIS is what you replace with real API calls.
```

**`app.js` in 60 seconds:**
- `CA_DATA` = the data (from `data.js`).
- `NAV` = the menu (which screens exist).
- `VIEWS` = an object of functions, **one per screen**. Each builds that screen's HTML.
- `route()` = reads the URL hash (`#consult`, `#dashboard`…) and runs the matching view function.
- `state` = the user's data during the session, saved to the browser's `localStorage` (key `clinically_demo_v1`).
- The consultation screen's `generateNote()` is where fake "AI" runs on a timer. **You will replace this with a real API call.**

**The single most important idea:** the app reads data from `data.js` and saves to `localStorage`. To make it real, you swap those two things for **API calls to Netlify Functions**, which talk to Claude + the database. The screens themselves barely change.

---

## 3. One-time setup (do this first)

**You need accounts:** Netlify (exists), Anthropic (for Claude), Supabase (exists in repo), and an STT provider (e.g. Deepgram) later.

```bash
# 1. Clone and install
git clone https://github.com/medlearn/faheemahmed-site.git
cd faheemahmed-site
npm install

# 2. Install the Netlify CLI (lets you run functions locally)
npm install -g netlify-cli

# 3. Copy env template and fill it in (see §10 for what each key is)
cp .env.example .env
#   open .env and paste your keys

# 4. Run the whole thing locally (serves site + functions at http://localhost:8888)
netlify dev
```
Open `http://localhost:8888/clinically/app/` — you'll see the demo.
**Definition of done for this step:** the demo loads locally and `netlify dev` shows no errors.

---

## 4. The build, phase by phase

> Do these IN ORDER. Each phase is independently shippable. After each, commit and push (auto-deploys).

### PHASE 1 — Real AI note drafting  ⭐ start here

**Goal:** when the consultation ends, a real Claude call writes the SOAP note (instead of the canned text).

**4.1 Add the Claude SDK**
```bash
npm install @anthropic-ai/sdk
```

**4.2 Create the function** `netlify/functions/notes.js`:
```js
const Anthropic = require("@anthropic-ai/sdk");
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Force structured JSON output via a tool definition
const NOTE_TOOL = {
  name: "clinical_note",
  description: "Return a structured SOAP clinical note.",
  input_schema: {
    type: "object",
    properties: {
      S: { type: "string", description: "Subjective" },
      O: { type: "string", description: "Objective" },
      A: { type: "string", description: "Assessment" },
      P: { type: "string", description: "Plan" },
      codes: { type: "array", items: { type: "string" } }
    },
    required: ["S", "O", "A", "P", "codes"]
  }
};

exports.handler = async (event) => {
  try {
    const { transcript, patient } = JSON.parse(event.body || "{}");
    if (!transcript) return { statusCode: 400, body: "Missing transcript" };

    const msg = await client.messages.create({
      model: "claude-sonnet-4-6",            // fast + cheap; use claude-opus-4-8 for hardest cases
      max_tokens: 1500,
      tools: [NOTE_TOOL],
      tool_choice: { type: "tool", name: "clinical_note" },
      system:
        "You are a clinical documentation assistant for a UK independent prescriber. " +
        "Draft a SOAP note ONLY from the transcript provided. Do NOT invent findings, " +
        "observations, or history that are not stated. Flag uncertainty explicitly. " +
        "You do not diagnose or prescribe — you draft for the clinician to review and sign.",
      messages: [{
        role: "user",
        content: `Patient (anonymised): ${JSON.stringify(patient)}\n\nTranscript:\n${transcript}`
      }]
    });

    const tool = msg.content.find(c => c.type === "tool_use");
    return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify(tool.input) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
```
*(The `/api/notes` → function mapping already exists in `netlify.toml`.)*

**4.3 Wire the front end.** In `app/app.js`, find `generateNote()` inside the consultation view. Replace the fake timer with:
```js
const res = await fetch("/api/notes", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ transcript: transcriptText, patient: current.patient })
});
const note = await res.json();   // { S, O, A, P, codes }
renderNote(note);                // existing function already renders this shape
```
*(`transcriptText` = join the transcript lines into one string. Keep the loading spinner that's already there.)*

**4.4 Test:** run a consultation in the app → a real, varied note appears.
**Done when:** notes are generated by Claude, vary per input, and never contain invented facts (spot-check 5).

---

### PHASE 2 — Real decision support

Same pattern. New function `netlify/functions/support.js` that takes the transcript/note and returns an array of `{ level, title, body, ref }`. Use a tool schema like Phase 1 but returning a list. Later, improve `ref` accuracy by retrieving from a real guideline store (RAG) — for v1, the model's general guidance with a "verify" disclaimer is acceptable. Wire it into the consultation view's `renderDs()`.

---

### PHASE 3 — Login & database (Supabase)

**Goal:** real users, real saved data (replace `localStorage`).

**3.1** In Supabase → SQL editor, run:
```sql
-- USERS handled by Supabase Auth. Profile + data tables:
create table clinics (id uuid primary key default gen_random_uuid(), name text, created_at timestamptz default now());
create table profiles (
  id uuid primary key references auth.users(id),
  role text check (role in ('clinician','panel','admin')) default 'clinician',
  full_name text, reg_number text, clinic_id uuid references clinics(id)
);
create table notes (
  id uuid primary key default gen_random_uuid(),
  clinician_id uuid references auth.users(id),
  patient_ref text, type text,
  s text, o text, a text, p text, codes text[],
  status text check (status in ('draft','signed')) default 'draft',
  created_at timestamptz default now(), signed_at timestamptz
);
create table mdt_cases (
  id uuid primary key default gen_random_uuid(),
  clinician_id uuid references auth.users(id),
  specialty text, title text, summary text,
  status text default 'awaiting', responder_id uuid, created_at timestamptz default now()
);
create table mdt_responses (
  id uuid primary key default gen_random_uuid(),
  case_id uuid references mdt_cases(id), panel_member_id uuid references auth.users(id),
  body text, created_at timestamptz default now()
);

-- LOCK IT DOWN: users only see their own rows
alter table notes enable row level security;
create policy "own notes" on notes for all using (auth.uid() = clinician_id);
alter table mdt_cases enable row level security;
create policy "own cases" on mdt_cases for all using (auth.uid() = clinician_id);
```

**3.2** Add Supabase login to the app (email magic-link is simplest). Use `@supabase/supabase-js` (already a dependency). Gate the app behind login; store the session.

**3.3** Replace the demo's `save()`/`load()` (localStorage) with Supabase reads/writes for notes and cases. The screens don't change — only where data comes from.

**Done when:** two different logins see different notes/cases, and data survives a refresh.

---

### PHASE 4 — Transcription (speech-to-text)

**Goal:** real consultation audio → text, live.

1. Pick a provider (Deepgram or AssemblyAI for live streaming; OpenAI Whisper for chunked). Choose one with **UK/EU data residency** (compliance).
2. Never put the STT key in the browser. Add `netlify/functions/transcribe-token.js` that returns a short-lived token.
3. In the consultation view, replace the scripted transcript playback with: mic capture → stream to provider → append returned text to the transcript box (the rendering already exists).

**Done when:** speaking into the mic fills the transcript live, then Phase 1 drafts a note from it.

---

### PHASE 5 — MDT backend

1. Case submit form → `POST /api/cases` → insert into `mdt_cases`.
2. Panel role: a view listing cases routed to them by `specialty`; `POST /api/cases/:id/response` writes to `mdt_responses` + notifies the clinician (email).
3. Scheduling + recorded session library (video can use Bunny, already in repo).

**Done when:** a clinician submits a case, a panel user answers it, the clinician sees the answer.

---

### PHASE 6 — Billing & launch polish

Stripe (already in repo) for clinic subscriptions. Remove `noindex` from the marketing page when ready. Add the custom domain (see HANDOFF §8 / MASTER-PLAN §7a).

---

## 5. How to run & test locally (cheat sheet)

```bash
netlify dev                      # run site + functions at :8888
# test a function directly:
curl -X POST localhost:8888/api/notes -H "Content-Type: application/json" \
  -d '{"transcript":"Patient reports...","patient":{"age":29}}'
```
Logs print in the `netlify dev` terminal. Front-end errors show in the browser console (F12).

---

## 6. Deployment (already automated)

Push to `main` on GitHub → Netlify auto-builds and deploys. No manual step. Functions deploy automatically from `netlify/functions/`. **Set env vars in Netlify → Site configuration → Environment variables** (NOT in the repo).

---

## 7. Environment variables (and where to get them)

| Variable | Where to get it | Used by |
|----------|-----------------|---------|
| `ANTHROPIC_API_KEY` | console.anthropic.com → API Keys | notes, support |
| `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Supabase project settings (already in repo) | auth, db |
| `DEEPGRAM_API_KEY` (or chosen STT) | provider dashboard | transcription |
| `STRIPE_SECRET_KEY` (+ webhook) | Stripe dashboard (already in repo) | billing |

⚠️ The **service role key** and all API keys are server-side only. Never ship them to the browser.

---

## 8. Definition of done (per phase) — copy into your tracker

- [ ] P1: real notes from Claude, no invented facts, loading state works
- [ ] P2: decision-support items render from a real call
- [ ] P3: login works; data is per-user and persists in Postgres; RLS on
- [ ] P4: mic → live transcript → note
- [ ] P5: case submit → panel answer → clinician sees it
- [ ] P6: Stripe live; domain live; noindex removed

---

## 9. Model choices (Claude)

- Default: **`claude-sonnet-4-6`** (fast, cheap) for note drafting and support.
- Use **`claude-opus-4-8`** for the hardest reasoning if quality needs it.
- Always use **structured output** (the tool approach in §4.2) so you get clean JSON, never free text you have to parse.
- See the repo's `claude-api` reference for params, streaming, pricing.

---

## 10. What you must NOT do (safety rails)

- ❌ No auto-prescribing. The app drafts; the clinician signs.
- ❌ No real patient-identifiable data until the compliance gate is cleared (MASTER-PLAN §3, Gate B): clinical-safety hazard log (DCB0129/0160), DPIA, data residency, audit logging.
- ❌ No API keys in client code.
- ✅ Log who saw/signed what, when (audit trail is a core selling point).
- ✅ Keep "supports, not decides" framing in the UI.

---

## 11. If you're stuck

The current `app.js` view functions are the **spec for intended behaviour**, and `data.js` shows the **exact data shapes** every screen expects. Match those shapes from your API and the UI "just works". Start with Phase 1 only — get one real Claude note on screen — before touching anything else.
