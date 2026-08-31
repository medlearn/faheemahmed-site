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

**🐛 Cosmetic — "Panel members" tile subtitle overflows**
- Subtitle "Chair · General · Psychiatry · Dermatology" is too long → squished/clipped vs other tiles' short subtitles ("across clinics", "governance"). **Fix:** short label like **"across 4 specialties"** (match other tiles); full specialty list on hover/tooltip or the Panel-management page.

---

## A2. Governance sign-off (detail + recently published) — ✅ strong; 🛑 who may sign clinical content

**Excellent**
- ✅ **Named, dated, versioned sign-off** — "Consent SOP v2 · **signed by Faheem Ahmed** · 4 Jul 2026 18:53 · live in the clinician library"; NG87 on **v3**. Real audit trail.
- ✅ **Full published provenance** + footer: "Every step audit-logged (AI draft, reviewer, signer, when). Signing is a named, dated clinical-lead action — nothing reaches clinicians without it."
- ✅ **Routing labels correct HERE** — Rosacea → Dermatology, deteriorating patient → General practice (softens A1 routing worry: inconsistent across screens, not simply broken).

**Softens A1 separation-of-duties**
- Published items **signed by Faheem Ahmed** ≠ the panel reviewers (Okafor/Bright/Demo) → reviewer ≠ signer *happening in practice*. Still **enforce in code**.

**🛑 New — signer qualification must match content type**
- "NICE NG87 (ADHD) — signed by Faheem Ahmed" = **clinical** guidance. If the signer is founder/admin but **not a registered clinician**, they shouldn't *clinically* sign clinical content. **Rule:** clinical content → **clinically-qualified lead** signs; governance/admin content (SOPs/policies) → admin/governance lead OK. System should check signer role/qualification vs content type (ties to risk-tiering §8).

**🐛 Minor — state consistency across admin screens**
- Overview showed Consent/NG87/ADHD as "awaiting sign-off"; here they're "published" (likely signed between screenshots — OK). But Rosacea = "reviewed by Dr A. Demo" (overview) vs "Awaiting MDT review (Dermatology)" (here). Confirm both admin screens read the **same underlying state**.

**🐛 UX — "Recently published" reads as dead/confusing (Faheem flagged)**
- Two sections look identical (same card style) but top = actionable queue, bottom = **read-only history**. Nothing clickable in "Recently published" → feels like it "came from nowhere." **Fix:** make the history visually distinct (greyed/lighter, clear "History / audit log" heading) and make each item **clickable to VIEW the published version** (read-only) so it isn't dead. Clarify the flow: sign off in queue → item moves to "Recently published." (Some published items are seeded demo data → reinforces the confusion.)

---

## A3. Panel management — ✅ basics work; 🛑 "Add member" far too thin for a vetted panel

**Working**
- ✅ Member list + ACTIVE status + Add/Deactivate; routing-specialty dropdown matches Appendix B (incl. Pharmacy — available even though no pharmacist yet).
- ✅ **Case assignment override** — manual-assign a case to a member; footer: "the chair still sees everything… clearing returns to automatic specialty routing… audit-logged." *(Explains why chair got all cases = intentional oversight. But cases must still auto-route to the specialist — routing fix.)*

**🛑 "Add member" form too thin (Faheem) — needs a full credentialing record**
- Current form = **Name · Role · Routing specialty** only. §4B vetted pool needs a proper credentialing file, all in one place: **professional registration/PIN (verify against register) · CV upload · photo · signed contract + terms (fee/confidentiality/data-processing) · DBS · indemnity/insurance · verified qualification tags (gate claimable tasks) · active/inactive.** This record **is** the vetting gate.

**🐛 Count reconciliation (again)** — "No open cases — every submitted case has been answered" vs panel side "1 Awaiting your response" (C-237). Reconcile.

---

## A4. MDT schedule — ✅ strong (resolves the auto-advance question)

- ✅ **Auto-advancing date, correctly computed** — rule "Last Tuesday monthly · 19:00–20:30 · Virtual", next session **28 Jul 2026** = genuinely the last Tuesday of July 2026 (4 Jul is a Sat → Tuesdays 7/14/21/28). **Calculated from the rule, not hardcoded** (resolves §5.1; confirms dashboard/overview dates were real).
- ✅ **Auto-built agenda** — teaching slot (Chair-set) · case discussion (auto-pulled) · open reflection.
- ✅ **Controls + override** — Edit schedule / Set teaching slot; footer: "override applies to next session only and is audit-logged." Auto-advance + one-off override + audit. Correct.

**Confirm (softened from bug)** — "0 open cases (auto-pulled)": earlier 0-vs-1 flag is likely a **timing** thing (C-237 got answered between screenshots), so 0 is probably correct now. Still confirm counts are **live + consistent** across screens.

**Teaching-slot free text = OK (Faheem asked).** Rule: dropdown where text **drives tagging/routing/data**; **free text fine for open-ended human labels not analysed.** Teaching topic is an admin-set agenda *label* (open-ended, not routed, not analysed) → free text correct. **Add guardrail:** "General teaching topic — no patient identifiers" hint + light PII check on save (it's human-typed).

---

## A5. Content libraries (authoring hub) — ✅ strong; reconciles routing; names the core AI build gap

**Strong**
- ✅ **"New item → Create draft"** (TYPE · TITLE · **REVIEW SPECIALTY dropdown** · SUMMARY) = entry point to the §8 pipeline. Review-specialty dropdown = **routing set at creation** (correct mechanism + correct control type).
- ✅ **Footer states the model** — "AI-assisted… drafted from retrieved source text, per-statement citations. Nothing publishes until the MDT has verified it and the clinical lead signs off." Grounded generation + per-statement citations + two-step sign-off, at source.
- ✅ **"Request an SOP/template" from clinics arrives here as drafts** — joined up. Pipeline shows states (IN REVIEW/PUBLISHED) + specialty + version.

**💡 Reconciles the routing concern**
- Pipeline shows **Rosacea → Dermatology**, **NG87 → Psychiatry** → the review-specialty **data is correct** on the content. The panel-side issue was **display** (chair-sees-everything), not the tag. Fix is narrower: ensure the **right specialist also sees it** (Dr Kaur), not only default to chair.

**🛑 Core build gap named**
- "Create draft" currently makes an **empty shell** you type into. The **AI drafting from retrieved source + per-statement citations** is "live product" = **not built.** This is the SAME central piece behind guideline citations (§6) and SOP "Build with AI" (§7): **grounded, cited AI generation.** Treat as one big build item across all content types.

**Notes:** "xxxx" test item = prototype junk (but proves create→review works). TITLE/SUMMARY free text = fine (label + rationale, not analysed).

---

## A6. Regulatory standards (upload store) — ✅ clean; 🛑 currency/versioning

**Good**
- ✅ **The store that powers the SOP gap-check** (§5.7) — GPhC/CQC/MHRA/NHS as "Reference · used for AI gap-checks on SOPs." Joined up with the SOP model.
- ✅ Right four sources; Upload to add more; LOADED status.

**🛑 Currency (main flag)**
- "LOADED" shows **no version/date**. Standards change constantly — **MHRA Drug Safety Updates = monthly**, CQC framework changed, GPhC updates. A stale standard → AI gives **false compliance assurance**. Add **version + "last updated" + staleness flag** per standard; MHRA likely needs a **feed/refresh**, not one-off upload.

**❓ Confirm**
- Does "LOADED" = **actually ingested for RAG** (parsed→chunked→embedded, retrievable) or just a stored file? Gap-check only works if genuinely searchable.
- The consumer (SOP "Build with AI" gap-check) **isn't built yet** (§7) — standards ready, but the thing using them is pending. Dependency.

**Lower copyright risk** — internal reference (standards you must comply with, to check your own SOPs), not republished to users. Safer than the clinician-facing guidelines library. Keep authoritative/current.

**Who uploads (Faheem asked) — CENTRAL, not per-clinic.** Uploaded/maintained by **Clinickly admin/governance lead** (Governance MDT — ex-inspectors — natural owner/validator). **Restrict Upload to the central admin/governance role** (not clinic users/clinicians). Rationale = same as note templates: national standards → one authoritative current set for all clinics (per-clinic upload = fragmentation + duplicated maintenance). **Assign a named currency owner + review cadence** (MHRA monthly) or standards silently rot.

---

## A7. Users & clinics (roles/permissions) — ✅ roles work; 🛑 tenancy model conflated

**Good**
- ✅ Three roles assigned (CLINICIAN/MDT/ADMIN badges, §4); roles+specialties shown; Invite user present.
- ✅ Faheem = "Admin · Clinical lead" (signer identified).

**🛑 Tenancy conflation (architecture)** — everyone (incl. MDT panel) listed under "Clinickly Demo Clinic". Not everyone belongs to a clinic:
- **Clinicians** → clinic-scoped ✅.
- **MDT panel** → **central/platform** (serve all clinics: answer anonymised cases from any clinic, govern central content) — should NOT be a member of one clinic.
- **Clinickly admin (Faheem)** → **platform super-admin**, not a clinic user.
- Model needs two tiers: **clinic-scoped** (clinicians, clinic admins) vs **platform-scoped** (MDT panel, Clinickly super-admin). One-bucket breaks at clinic #2.

**🛑 Tenant isolation not demonstrated** — only one clinic, so can't see RLS `clinic_id` walls. Confirm multi-clinic: clinic admin sees ONLY their clinic; super-admin sees across; panel sits above clinics.

**Confirms**
- Faheem "Admin · Clinical lead": if signing **clinical** content but not a registered clinician → A2 qualification gap. Clarify **clinic-admin vs platform-admin** (he's platform).
- RBAC **enforcement** — confirm area-locking via **RLS** (not just UI hiding): clinician can't reach admin; MDT can't see other clinics' data.

**Login provisioning model (Faheem asked) — differs by role:**
- **Clinicians:** clinic onboarded → clinic admin clicks **Invite user** → email invite → set password → auto-scoped to that clinic.
- **MDT panel:** apply (panel-interest form) → **credential (PIN/CV/contract/DBS verified, §A3)** → THEN Clinickly provisions login. **Vetting gates the login** — login is the *last* step, never before vetting. ("logins provisioned separately.")
- **Admins:** clinic-admin at clinic onboarding; Clinickly super-admin = internal/platform.
- **Tech:** Supabase Auth (email/password or magic-link) + **MFA (expected — governance content + anonymised cases)**; role+clinic(+specialty/tags) set **at invite** so RLS scoping is correct from first login; **Deactivate** = offboarding (revoke + audit).

---

## A8. Reports & audit — ✅ audit trail = defensibility backbone; wire reports + harden log

**Excellent**
- ✅ **Real, comprehensive audit trail** — WHEN/ACTOR/ACTION/ITEM, newest first, covers "AI drafts, reviews, sign-offs, publishes, responses, roster + schedule changes." Shows "Signed off & published · Consent SOP v2 · Faheem Ahmed · timestamp." Exactly what an inspector wants.
- ✅ **Logs live** — test "xxxx" shows Created draft → Sent to MDT review at 17:06. Audit capture works real-time.
- ✅ Reporting charts from taxonomies (Consultations by clinical area [A]; MDT questions by type [C]); honestly labelled.

**🛑 Charts empty despite activity elsewhere**
- "No consultations recorded yet" / "No MDT cases submitted yet" — but dashboard showed a consultation/note and cases C-236/237 existed. Reports **not reading the same data** → wire analytics to real consultation/case data (persistence/consistency theme).

**❓ Specced but not seen here**
- **Search-gap analytics** ("top missed searches → add to authoring backlog") — the demand-signal report. Add.
- **CPD reporting** — header says "CPD" but not shown; §5.8 team-training completion = inspection evidence. Confirm exists.

**🛑 Audit trail must be**
- **Immutable / append-only** (tamper-evident) — an editable/deletable log isn't an audit log. Confirm.
- **Exportable** (PDF/CSV) for inspection/records. Add.

---

*(screens added as we review them)*
