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

---

*(screens added as we review them)*
