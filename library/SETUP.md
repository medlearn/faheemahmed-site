# Pay-per-video library — setup & runbook

Everything is built and committed. To go from code → working, follow these
steps. Steps marked **[you]** need account access only you have; I've noted
exactly what to paste back to me and where.

---

## 1. Supabase project  **[you]**
1. Create a project at <https://supabase.com>.
2. **SQL Editor → New query** → paste all of [`supabase/schema.sql`](../supabase/schema.sql) → **Run**.
   Creates `videos` + `purchases`, RLS policies, and seeds 6 (unpublished) rows.
3. **Authentication → Providers → Email**: enable it, and turn ON
   "Email OTP" (a.k.a. confirm via 6-digit code). Turn OFF "Confirm email"
   magic-link if you want code-only.
4. **Settings → API** — copy three values:
   - Project URL  → `SUPABASE_URL`
   - `anon` public key → `SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (**secret**)

Put the two public values in [`library/config.js`](config.js). Put all three
in `.env` (see step 4).

## 2. Stripe (test mode)  **[you]**
1. <https://dashboard.stripe.com> → toggle **Test mode**.
2. **Developers → API keys** → copy the **Secret key** (`sk_test_…`) → `STRIPE_SECRET_KEY`.
3. Webhook secret comes from the Stripe CLI in step 5 (local) or the
   dashboard (production).

## 3. Bunny Stream (needed only to actually play a video)  **[you]**
1. <https://bunny.net> → **Stream** → create a library; note the **Library ID**.
2. Upload a test video; copy its **GUID**.
3. Library → **Embed** settings → enable **Token Authentication**; copy the
   **Token Authentication Key** → `BUNNY_TOKEN_AUTH_KEY` (**secret**).
4. Copy the CDN hostname (`vz-….b-cdn.net`) → `BUNNY_CDN_HOSTNAME`.
5. In Supabase, update a `videos` row: set `bunny_video_id` = the GUID,
   `bunny_library_id` = the Library ID, and `published = true`.

## 4. Local env file
```bash
cp .env.example .env       # then fill in the real values
```

## 5. Run it locally
```bash
# one-time
npm i -g netlify-cli
npm install            # installs function deps (stripe, supabase-js) from the root package.json

# terminal A
netlify dev                # serves the site + functions on http://localhost:8888

# terminal B — forward Stripe events to the local webhook
stripe listen --forward-to localhost:8888/.netlify/functions/stripe-webhook
# copy the printed whsec_… into .env as STRIPE_WEBHOOK_SECRET, restart netlify dev
```
Open <http://localhost:8888/library/>. Log in (the OTP code arrives by email),
buy a video with test card `4242 4242 4242 4242` (any future expiry / any CVC),
and after the webhook fires it flips to **Owned** and plays.

## 6. Production  **[you]**
1. Set every var from `.env` in **Netlify → Site settings → Environment variables**
   (and the two public ones in `library/config.js`, which is committed).
2. Deploy (push to `main`).
3. **Stripe → Developers → Webhooks → Add endpoint**:
   `https://faheemahmed.co.uk/.netlify/functions/stripe-webhook`, event
   `checkout.session.completed`. Copy its signing secret → update
   `STRIPE_WEBHOOK_SECRET` in Netlify.
4. Set `SITE_URL=https://faheemahmed.co.uk` in Netlify.
5. When ready for real money, swap Stripe test keys for live keys and
   re-create the webhook in live mode.

---

### What to send me to finish wiring
- The Supabase **Project URL** + **anon key** (I'll drop them into `config.js`).
- Confirmation the schema ran and Email OTP is enabled.
- (When you want playback) one Bunny GUID + Library ID so I can publish a row.

I'll keep all **secret** keys out of git and the frontend — they live only in
`.env` / Netlify env vars.
