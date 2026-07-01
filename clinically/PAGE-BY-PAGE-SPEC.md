# Clinickly Co-pilot — Page-by-Page Spec

**What this is:** a plain-English, screen-by-screen breakdown of the Co-pilot, built up with Faheem as we review the developer's current build. For each page: **Purpose** (what it's for), **What we have now** (current build), **To build / decide** (gaps + decisions).

**Companion docs:** [DEVELOPER-MASTER-PLAN.md](DEVELOPER-MASTER-PLAN.md) · [HANDOFF.md](HANDOFF.md) · [MASTER-PLAN.md](MASTER-PLAN.md)

**Overall status (from screen review):** the developer has built the full product — both pillars, with **real AI** (transcription + note drafting + decision support) and a **real database**. Cross-cutting gaps found so far:
- **MDT panel has no login** — panel members can't actually answer cases (responses appear to be sample text).
- **Roles aren't locked down** — a "patient" login could see the whole clinician co-pilot. Needs proper role permissions (clinician / patient / MDT panel / admin).
- **Payments not wired** — patient "Activate membership" does nothing.

---

## 1. Dashboard

**Purpose**
The home/overview screen — "your clinical day at a glance." A summary + quick shortcuts. Nothing critical happens here; it's a signpost.

**What we have now**
- Top banner: next **Monthly MDT** session with date/time.
- Four summary numbers: consultations this month (38), notes drafted (36), admin hours saved (19.5), open MDT cases (2).
- **Quick actions**: Start a consultation · Ask the MDT · Check guidance · Open a template.
- **Recent notes** list + an **Activity** feed.

**To build / decide**
- [ ] **The four numbers are sample figures** — not yet counting real usage. Make them calculate from the clinician's actual activity (real consult count, notes drafted, hours saved estimate, live open-case count).
- [ ] **The "Monthly MDT" date is hard-coded** and does not update. Decision: **auto-advance to the next session from a recurring rule** (e.g. last Tuesday monthly, 19:00), showing the next upcoming date, with an **admin override** for one-offs. Needs: a place to set the schedule (admin), and the banner to read the next date from it.
- [ ] Activity feed + recent notes should show **real** events, not demo entries.

---

*(more pages added as we review them)*
