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

---

*(screens added as we review them)*
