-- ============================================================
-- Migration: categories + branded thumbnails + expanded catalogue
-- Run once in Supabase → SQL Editor. Safe to re-run.
-- ============================================================

-- 1. Category column.
alter table public.videos add column if not exists category text;

-- 2. Categorise the existing videos + attach their thumbnails.
update public.videos set category='clinical', thumbnail_url='/library/thumbs/ip-consult.svg',       thumb_g1='#1F6B4F', thumb_g2='#0F3D2C', sort_order=10 where id='ip-consult';
update public.videos set category='clinical', thumbnail_url='/library/thumbs/adhd-primer.svg',       thumb_g1='#248062', thumb_g2='#103D2E', sort_order=20 where id='adhd-primer';
update public.videos set category='clinical', thumbnail_url='/library/thumbs/bp-measurement.svg',    thumb_g1='#2C7A55', thumb_g2='#133F2A', sort_order=30 where id='bp-measurement';
update public.videos set category='clinical', thumbnail_url='/library/thumbs/ear-eye.svg',           thumb_g1='#1B6147', thumb_g2='#0C3826', sort_order=40 where id='ear-eye';
update public.videos set category='business', thumbnail_url='/library/thumbs/pharmacy-contract.svg', thumb_g1='#8A6A2E', thumb_g2='#3A2C12', sort_order=50 where id='pharmacy-contract';
update public.videos set category='business', thumbnail_url='/library/thumbs/cqc-docs.svg',          thumb_g1='#7E5F2A', thumb_g2='#342610', sort_order=60 where id='cqc-docs';

-- 3. New placeholder videos (Business + Mentoring) — all "coming soon".
insert into public.videos
  (id, title, blurb, price_pence, bunny_video_id, bunny_library_id, duration_seconds,
   thumbnail_url, thumb_g1, thumb_g2, category, published, coming_soon, sort_order)
values
  ('buying-a-pharmacy',
   'Buying Your First Pharmacy: Due Diligence & Deal Structure',
   'How to evaluate a pharmacy before you buy — financials, NHS contract value, dispensing trends, and structuring the deal so it pays off.',
   3500, 'REPLACE_WITH_BUNNY_GUID', 'REPLACE_WITH_BUNNY_LIBRARY_ID', 2640,
   '/library/thumbs/buying-a-pharmacy.svg', '#96762F', '#40300F', 'business', true, true, 70),
  ('prescriber-roadmap',
   'From Pharmacist to Independent Prescriber: A Roadmap',
   'The full path to independent prescriber — choosing a scope, finding a DPP, building competence, and what to do after annotation.',
   1900, 'REPLACE_WITH_BUNNY_GUID', 'REPLACE_WITH_BUNNY_LIBRARY_ID', 1680,
   '/library/thumbs/prescriber-roadmap.svg', '#2D5B73', '#16313F', 'mentoring', true, true, 80),
  ('portfolio-hired',
   'Building a Portfolio That Gets You Hired',
   'Turn your experience into a portfolio that stands out — evidence, reflection, and the gaps recruiters and panels look for.',
   1400, 'REPLACE_WITH_BUNNY_GUID', 'REPLACE_WITH_BUNNY_LIBRARY_ID', 1320,
   '/library/thumbs/portfolio-hired.svg', '#34637C', '#1A3340', 'mentoring', true, true, 90),
  ('career-pivot',
   'Career Pivots in Pharmacy: Finding Your Niche',
   'Feeling stuck? How to find a niche in pharmacy that fits you — from clinical roles to enterprise — and make the move with confidence.',
   1600, 'REPLACE_WITH_BUNNY_GUID', 'REPLACE_WITH_BUNNY_LIBRARY_ID', 1440,
   '/library/thumbs/career-pivot.svg', '#3A5570', '#1E2C3A', 'mentoring', true, true, 100)
on conflict (id) do nothing;
