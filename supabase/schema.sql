-- ============================================================
-- Pay-per-video member library — Supabase / Postgres schema
-- Run this in the Supabase SQL editor (Database → SQL → New query).
-- Safe to re-run: uses "if not exists" / "drop policy if exists".
-- ============================================================

-- gen_random_uuid() lives in pgcrypto (enabled by default on Supabase,
-- this is just belt-and-braces).
create extension if not exists pgcrypto;

-- ── videos ──────────────────────────────────────────────────
-- The catalogue. Anyone (even logged-out) may read PUBLISHED rows.
-- thumb_g1 / thumb_g2 are optional gradient colours so a row with no
-- thumbnail_url still renders the prototype's coloured thumbnail.
create table if not exists public.videos (
  id               text primary key,
  title            text not null,
  blurb            text,
  price_pence      integer not null,
  currency         text not null default 'gbp',
  bunny_video_id   text not null,            -- GUID from Bunny Stream
  bunny_library_id text not null,
  duration_seconds integer,
  thumbnail_url    text,
  thumb_g1         text,                     -- gradient start (optional)
  thumb_g2         text,                     -- gradient end   (optional)
  published        boolean not null default false,
  coming_soon      boolean not null default true,   -- true = teaser, shows "Coming soon" (not buyable)
  sort_order       integer default 0,
  created_at       timestamptz default now()
);

-- ── purchases ───────────────────────────────────────────────
-- One row == one entitlement. Written ONLY by the Stripe webhook
-- (service-role key, bypasses RLS). Nothing else grants access.
create table if not exists public.purchases (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  video_id          text not null references public.videos(id),
  stripe_session_id text unique,
  amount_pence      integer,
  currency          text,
  created_at        timestamptz default now(),
  unique (user_id, video_id)                 -- one purchase per user per video
);

create index if not exists purchases_user_idx on public.purchases (user_id);
create index if not exists videos_sort_idx     on public.videos (sort_order, created_at);

-- ── Row Level Security ──────────────────────────────────────
alter table public.videos    enable row level security;
alter table public.purchases enable row level security;

-- Public (incl. anon) may read only published videos.
drop policy if exists "public reads published videos" on public.videos;
create policy "public reads published videos"
  on public.videos for select
  using (published = true);

-- Authenticated users may read ONLY their own purchases.
drop policy if exists "users read own purchases" on public.purchases;
create policy "users read own purchases"
  on public.purchases for select
  using (auth.uid() = user_id);

-- NOTE: deliberately NO insert/update/delete policy on purchases.
-- With RLS on and no write policy, the anon/authenticated roles cannot
-- write. Only the service-role key (used by stripe-webhook) bypasses RLS.

-- ============================================================
-- Seed data — the six prototype videos, mapped to real columns.
-- published = false so nothing goes live until you've attached a real
-- Bunny video + price. Flip published = true (and fill bunny_video_id /
-- bunny_library_id) once a video is uploaded. Prices are in PENCE.
-- ============================================================
insert into public.videos
  (id, title, blurb, price_pence, bunny_video_id, bunny_library_id,
   duration_seconds, thumb_g1, thumb_g2, published, sort_order)
values
  ('ip-consult',
   'Independent Prescribing: Structuring a Safe Consultation',
   'A repeatable consultation model for new prescribers — history, examination, shared decision-making and safety-netting.',
   2400, 'REPLACE_WITH_BUNNY_GUID', 'REPLACE_WITH_BUNNY_LIBRARY_ID',
   1920, '#1F6B4F', '#0F3D2C', false, 10),
  ('adhd-primer',
   'Adult ADHD: A Prescriber''s Primer',
   'From screening to titration. How adult ADHD presents, what the assessment covers, and the principles behind safe initiation.',
   2900, 'REPLACE_WITH_BUNNY_GUID', 'REPLACE_WITH_BUNNY_LIBRARY_ID',
   2880, '#2D5B73', '#16313F', false, 20),
  ('pharmacy-contract',
   'Reading the 2026/27 Community Pharmacy Contract',
   'What actually changed this year, what it means for your bottom line, and where the new clinical service money sits.',
   1500, 'REPLACE_WITH_BUNNY_GUID', 'REPLACE_WITH_BUNNY_LIBRARY_ID',
   1560, '#6B5430', '#3A2C16', false, 30),
  ('bp-measurement',
   'OSCE Skills: Blood Pressure Measurement, Properly',
   'The technique examiners actually look for — cuff placement, common errors, and how to talk through it under pressure.',
   1200, 'REPLACE_WITH_BUNNY_GUID', 'REPLACE_WITH_BUNNY_LIBRARY_ID',
   1080, '#455A4E', '#26352C', false, 40),
  ('ear-eye',
   'Ear & Eye Examination for Pharmacists',
   'A practical walkthrough of otoscopy and the eye exam, with the red flags that should change your management.',
   1800, 'REPLACE_WITH_BUNNY_GUID', 'REPLACE_WITH_BUNNY_LIBRARY_ID',
   2460, '#5A4A6B', '#2F2540', false, 50),
  ('cqc-docs',
   'Clinical Documentation That Survives a CQC Inspection',
   'Build SOPs and governance records that hold up under scrutiny — structure, version control, and the gaps inspectors find.',
   2200, 'REPLACE_WITH_BUNNY_GUID', 'REPLACE_WITH_BUNNY_LIBRARY_ID',
   2100, '#3A5060', '#1E2C36', false, 60)
on conflict (id) do nothing;
