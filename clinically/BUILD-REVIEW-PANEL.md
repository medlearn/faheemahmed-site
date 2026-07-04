# Clinickly Co-pilot — Build Review: MDT Panel-member Portal (Portal 2)

Screen-by-screen review of the **panel member's** experience, against [CLINICKLY-MASTER.md](CLINICKLY-MASTER.md) §4A (Portal 2) + §4B (panel operating model).
Companion files: [BUILD-REVIEW.md](BUILD-REVIEW.md) (clinician portal) · [BUILD-REVIEW-ADMIN.md](BUILD-REVIEW-ADMIN.md) · [DEVELOPER-FIX-LIST.md](DEVELOPER-FIX-LIST.md).
Legend: **✅ confirmed** · **🐛 fix** · **🛑 safety/governance** · **❓ confirm with developer**.

## What to look for (from spec)
- **Login as a panel member** → sees **only cases routed to their specialty** (Appendix B).
- **Case detail + write response** → persists to DB → **notifies the submitting clinician** (the ⭐ key Pillar-2 loop; currently 0 in DB).
- **Governance review queue** — content routed for the member to check (guideline/SOP sign-off; the `guideline-review.html` "matches source" workflow).
- **Two panels (§4B)** — Clinical MDT vs Governance MDT; task routing by verified tags; **claim-a-task**, **fixed admin-set price, no bidding**.
- **Session tools** (agenda/recordings) · **Profile** (specialties, verified qualification tags).
- Responses framed as **teaching/discussion points — advisory only, clinician stays responsible**.

---

## P1. My assigned cases (panel inbox + write response) — ✅ loop exists both ends; 🛑 routing broken

**Working / matches spec**
- ✅ **The answering loop has a real UI both ends** — assigned cases → **Write response** → Save → shows "Answered" back to clinician. Core Pillar-2 mechanism is built as a UI.
- ✅ **Response framing is best-in-class** — textarea placeholder: *"Teaching/discussion points for the submitting clinician — cite the guidance to verify against; no patient-specific directives, no doses"* + advisory footer. Actively steers panel away from patient-specific instructions. Keep exactly.
- ✅ **Panel dashboard tiles** — Awaiting your response (this cycle) · Answered (last 3 months) · **Content to review · governance** (the governance sign-off queue surfacing).
- ✅ **Logged-in panel role shown** (top-right: "Panel: Governance/ethics (Chair)").
- ✅ Awaiting vs Answered states both render.

**🛑 Routing is broken (headline)**
- Logged in as **Governance/ethics Chair**, yet assigned **C-237 (Psychiatry/mental health)** and **C-236 (Dermatology)** — clinical cases a governance Chair should not answer. Routing-by-specialty (Appendix B) isn't working; looks like everything funnels to the Chair.
- Same mismatch as §10 from the other side: C-236 mis-tagged Dermatology (actually ADHD/psychiatry) **and** assigned to the wrong recipient.
- Per §4B two-panel model: a **Governance MDT** member shouldn't receive **clinical** cases at all. Clinical cases → Clinical MDT; governance/SOP → Governance MDT.

**Other**
- 🛑 **Anonymisation leak recurs** — C-236 still shows "J.M." to the panel member (ties to BUILD-REVIEW §10 anonymiser fix).
- 🐛 **Test junk data** — "hadche", "33 year old has head Q: what is the ans", "vvknkn…" response (manual keystrokes; prototype seed).
- ✅/❓ **Loop round-trips end-to-end (in-session) — confirmed by live test.** Faheem submitted C-237 as clinician → answered "yes" as panel → shows **Answered on BOTH sides** (clinician "My cases" + panel "assigned"), same timestamp/attribution + advisory caveat. The mechanism functions.
  - **BUT not yet proven: true server-side persistence + cross-user notification.** Submit + answer happened in the **same browser** → could be local/session state (earlier DB = 0 cases). **Acceptance test:** submit as clinician on one device/login → answer as panel on a *different* device/login → confirm it appears **and** the clinician is **notified**. Until that passes, treat the loop as local-state, not DB-wired.

## P2. Governance review (content sign-off) — ✅ **KEYSTONE SCREEN, excellent**

The verification workflow underpinning the entire "governed/defensible content" value prop. `guideline-review.html` realised in-portal.

**Working / matches spec (strong)**
- ✅ **Side-by-side recommendation ⟷ exact source passage** — each AI-drafted line next to the literal cited text (e.g. "no single mandated first-line" ⟷ CKS "consider topical ivermectin, metronidazole, or azelaic acid"). Per-statement verification.
- ✅ **Hard gate** — "0 of 6 verified", "Sign review" **disabled** until all ticked; "Nothing publishes until every item is confirmed."
- ✅ **"Flag / request change" per item** (bounce a bad line back).
- ✅ **Real governance state + named reviewer** (DRAFT V0.1 · AWAITING REVIEW SIGN-OFF · Dr A. Demo).
- ✅ **Honest prototype note** — source passages "illustrative… in the live product they are the actual retrieved text from the cited source" (= where RAG/grounding plugs in).
- ✅ **Content honours §5.6** — "no single mandated first-line" (no invented preference); "Doses and cautions from the BNF, not this summary" (defers doses, doesn't reproduce BNF).

**🛑 P0 — source passages have NO LINK (Faheem's catch: "you're checking AI against AI")**
- The reviewer compares the recommendation to a **quoted "source passage"** — but **nothing proves the quote itself is real.** If the AI generated both the recommendation *and* the passage, "Matches source" checks **one AI claim against another** → the quote could be **hallucinated**. Reading it verifies nothing about provenance. **The gate is theatre without a link.**
- **Fix:** every source passage carries a **deep link to the exact cited location** (specific section/anchor, not the homepage). Reviewer **clicks through → confirms the quote is real, current, in context → then** ticks "Matches source." Ideally **gate the tick on opening the link** (can't rubber-stamp).
- **Snapshot for audit:** on retrieval, store **retrieved text + source URL + retrieval date** (hash/snapshot) → audit trail ("verified against *this* text at *this* URL on *this* date") + powers "what did guidance say at the time."
- Concept already exists — the published Rosacea page has "Verify at source" (§6); needs to be **on every passage here**, as a real deep link.

**💡 Shrinks the §6 per-statement-citation gap**
- The per-statement **source mapping already exists** (used here at review time). Fix isn't "build citations" — it's **"carry this mapping through to the published clinician page as inline chips."** Smaller job.

**🛑 Flag — content-review routing to wrong panel (mirrors case-routing bug)**
- A **clinical** guideline (Rosacea/dermatology) is in the **Governance/ethics Chair's** queue. Per §4B: **clinical content accuracy → Clinical MDT** (the dermatologist, Dr R. Kaur); **Governance MDT → SOPs/policies/regulatory.** Route content-review by content type.

**❓ Confirm**
- Gate interaction wired (tick → 6/6 → button enables; flag sends back).
- **Second step exists** — "Sign review → send for **publish sign-off**" implies a final publish gate (clinical lead/admin). Verify in admin console.

---

*(screens added as we review them)*
