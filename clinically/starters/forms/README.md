# Governed forms

Forms and patient-facing documents supporting the policy library. Same standard as the policies: `[CONFIRM: …]` for every clinic-specific decision, no silent assumptions.

**Why these matter:** the single worst defect found in the source corpus was on a **form**, not a policy — a consent form that went into service reading *"…informed decision to undergo **XXXXX** procedure."* Forms are what staff and patients actually hold.

| Form | Supports | Patient-facing | Status |
|---|---|---|---|
| [F01 Consent to Treatment](F01-consent-form.md) | C05 | 🔴 **Yes** | ✅ **v1.0** |
| [F02 Complaints Information Leaflet](F02-complaints-leaflet.md) | C04 | 🔴 **Yes** | ✅ **v1.0** |
| [F03 Incident and Near Miss Report](F03-incident-report-form.md) | C017 | No | ✅ **v1.0** |
| [F04 Safeguarding Concern Record](F04-safeguarding-concern-form.md) | C08, C032 | No | ✅ **v1.0** |
| Complaint register | C04 | No | ⬜ |
| Chaperone notice | C01 | 🔴 Yes | ✅ *in C01 Appendix 1* |
| Staff safeguarding alert notice | C08 | No | ✅ *in C08 Appendix A* |
| Confidentiality agreement | C03 | No | ✅ *in C03 Appendix 1* |
| Duty of candour quick reference | C021 | No | ✅ *in C021 Appendix 1* |
| New patient registration (adult / child) | C039 | 🔴 Yes | ⬜ |
| Drugs disposal record | C07 | No | ⬜ |
| Decontamination certificate | C02 | No | ⬜ |
| Audit proposal / outcome | C033 | No | ⬜ |
| Business continuity Forms A–G | BCP | No | ⬜ *structure defined in BCP* |

## Rules for patient-facing forms

1. **No placeholder ever reaches print.** The completeness check blocks publication while any `[CONFIRM]` remains.
2. **Timescales must match the parent policy exactly.** F02 states three deadlines; all three must equal C04's table. The source C04 stated three *different* deadlines in one document.
3. **Never promise a route the clinic does not have.** F02's escalation section is the clearest case — a private patient has no Ombudsman, and independent adjudication requires scheme membership.
4. **Plain language.** Short sentences, no jargon, no legalese.
5. **No patient names on forms that travel** — F03 uses the record number only.
