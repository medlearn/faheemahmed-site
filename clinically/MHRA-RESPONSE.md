# MHRA response — device status (received 21 Jul 2026)

Response to the borderline enquiry ([MHRA-BORDERLINE-EMAIL.md](MHRA-BORDERLINE-EMAIL.md)). **Guidance, not a formal determination.**

## What they said
> *"the current functionality appears closer to a **documentation, transcription, summarisation or administrative support, and educational function** rather than software with a specific medical purpose under the UK MDR 2002."*

Accepted on the basis that the software **does not diagnose · monitor · predict · treat disease · provide patient-specific recommendations.**

**⚠️ Not a clearance.** Their words: *"a final determination can only be made when there is a defined intended purpose/use that has a medical purpose."* Accurate external phrasing: *"We sought MHRA's view; on the intended purpose as described, they indicated the functionality appears to fall outside the medical device definition."* **Never** "MHRA has cleared us."

## The three conditions they named
1. **Note-drafting is the flagged pressure point.** *"'helping clinicians produce their own consultation records more efficiently'… could be considered part of the clinical treatment pathway as information in clinical notes can also feed into patient management and treatment."*
   → **The transcript-only rule is the device boundary, not just a safety rule.** AI-added clinical content in a note that drives patient management = device territory. The R2/R3 P0 fix is what holds this line; it must never regress.
2. **No crossover with EHR/clinical systems.** *"managed appropriately to ensure there is no crossover of information, documentation etc between the tools and… EHR systems that could impact the use, healthcare professional and/or patient(s)."*
   → **Version A (draft here, copy out, we are not the record) is protective.** The specced future "integration later (removes double-entry)" **must be re-assessed with MHRA before it is built** — it changes the analysis.
3. **Anything that triages, prioritises or "otherwise influences patient management" crosses the line** → at least Class I or IIa.
   → **The consultation decision-support panel is now a device-risk item, not just a positioning drift** (see R3.4). Cards reasoned from this patient's age/symptoms/duration that state assessment is *"required"* influence patient management. Must become general guidance.

## What is explicitly safe
- **Coding** — they cite *"billing/record-keeping codes based on clinician-reviewed text"* as administrative. Safe **provided it stays clinician-reviewed** (the attestation gate ensures this).
- General, source-cited reference material · anonymised case-based education/CPD · documentation support.

## Guidance they pointed to (read these)
- MHRA software flowchart — **slide 10 specifically**: `assets.publishing.service.gov.uk/media/64a7d22d7a4c230013bba33c/Medical_device_stand-alone_software_including_apps__including_IVDMDs_.pdf`
- *Crafting an intended purpose in the context of SaMD* — `gov.uk/government/publications/crafting-an-intended-purpose-in-the-context-of-software-as-a-medical-device-samd`
- The Medical Devices Regulations 2002 — `legislation.gov.uk/uksi/2002/618/contents`

## Actions
1. **Fix the decision-support panel** — general guidance only, no patient-specific "required" statements (already P0 from R3.4; now device-relevant).
2. **Hold the transcript-only rule permanently** — add a regression test; any change to note generation needs sign-off against this response.
3. **Flag EHR integration** in the spec as requiring a **fresh MHRA view before build**.
4. **Refine the intended-purpose statement** using MHRA's own language and the "Crafting an intended purpose" guidance.
5. **Give this response to the solicitor** with the device-risk brief.
