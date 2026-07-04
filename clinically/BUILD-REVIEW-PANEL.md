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

*(screens added as we review them)*
