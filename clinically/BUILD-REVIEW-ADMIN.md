# Clinickly Co-pilot — Build Review: Admin / Governance Console (Portal 3)

Screen-by-screen review of the **admin / governance** engine room, against [CLINICKLY-MASTER.md](CLINICKLY-MASTER.md) §4 + §4A (Portal 3) + §8 (governance pipeline).
Companion files: [BUILD-REVIEW.md](BUILD-REVIEW.md) (clinician portal) · [BUILD-REVIEW-PANEL.md](BUILD-REVIEW-PANEL.md) · [DEVELOPER-FIX-LIST.md](DEVELOPER-FIX-LIST.md).
Legend: **✅ confirmed** · **🐛 fix** · **🛑 safety/governance** · **❓ confirm with developer**.

## What to look for (from spec)
- **Panel management** — add/remove members, set specialties + **verified qualification tags**, manage logins (recruited via panel-interest form).
- **MDT scheduling** — recurring session rule + **auto-advancing dates** (+ admin override); agenda auto-pulls submitted cases + teaching slot.
- **Governance sign-off queues** — review & sign off guidelines / SOPs / note templates / training (the §8 pipeline; named signer + version).
- **Content libraries** — create/edit/**publish + version** all content; handle "Request an SOP/template" → authoring backlog.
- **Regulatory standards upload** — GPhC/CQC/MHRA/NHS (reference + AI gap-check that SOPs are checked against).
- **Users, clinics & permissions** — accounts, roles, **tenant isolation** (RLS `clinic_id`), role-locked areas.
- **Reporting & audit** — consultation types, MDT query types, CPD completion, full audit trails.
- **⭐ Search & content-gap analytics** — top missed searches → "Add to authoring backlog" (PII-safe).
- **Fee bands** — admin-set fixed pricing per task type × complexity (§4B; no bidding).
- **Note templates** — central/standard authoring (no per-clinic fork); **SOPs** — per-clinic, tenant-isolated.
- **Billing** — later (Stripe), incl. premium MDT-review add-on.

## A1. Admin Overview (engine room) — ✅ confirms two-step sign-off; 🛑 separation of duties

**Resolves the big open question**
- ✅ **Two-step sign-off is real end-to-end.** Governance sign-off queue shows items **already panel-reviewed** (by Dr Demo / Bright / Okafor) now awaiting **admin/clinical-lead "Sign off"** = the final publish gate. Full pipeline: AI draft → panel review (Portal 2) → admin/clinical-lead sign-off (Portal 3) → published/versioned. Footer states it: "AI-drafted → MDT-reviewed → human-signed → versioned."

**Strengths**
- ✅ **Content libraries with governed counts** — Guidelines (8 pub · 2 review), SOPs (8 · 3 pipeline), Training (6 · 2 review), **Regulatory standards (GPhC·CQC·MHRA·NHS)** = the uploaded standards the SOP-checker validates against.
- ✅ **"Reviewed by [named person]"** on each item = audit trail before signer signs.
- ✅ Healthy pipeline (items at review stage AND sign-off stage).

**🛑 Separation of duties (new, important)**
- "Consent & confidentiality SOP v2 — reviewed by Dr A. Okafor", and the final **Sign off** is done by admin/clinical-lead = **also Dr Okafor.** Same person reviews + signs → defeats the two-step gate. **Fix: enforce reviewer ≠ signer** (inspectors check "who checked whose work").

**🛑 Routing inconsistent (same theme)**
- NG87 ADHD → Dr Bright (psychiatry) ✅; Consent SOP → Dr Okafor (governance) ✅; **NICE CKS Rosacea → Dr A. Demo (governance) ❌ should be Dr Kaur (dermatology).** Routing works for some items, not all → logic needs fixing, not absent.

**❓ Reconcile counts**
- Admin "0 Open MDT cases" vs panel "1 Awaiting your response" (C-237). One open case should show here. Different definitions or persistence/counting gap — reconcile.

---

*(screens added as we review them)*
