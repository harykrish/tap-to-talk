# Appa Speaks — Demo Record

> A communication app that lets a man who **cannot speak** talk to his family and
> his doctors again — in **his own voice**, in **Tamil and English**.

---

## The heart of it

Every year millions of people land in hospitals unable to **talk** — a ventilator,
a tracheostomy, an injury — or unable to be **understood**, because they and the
staff caring for them don't share a language. Both are common, and both are
dangerous.

**Appa Speaks gives them a voice and a way to communicate.** Tap a button and it
speaks for you, out loud, in the language the listener needs — bilingual today
(English + தமிழ்), and built to scale to **any language → any language**.

It's named for my father, who lost his voice to a spinal cord injury and a
tracheostomy. We even cloned *his* voice from old family videos, so the board
speaks as him — a genuinely moving touch. But the voice is a **feature, not the
point**. The point is simple: **people who can't make themselves understood,
finally can.**

---

## What it does

- **Tap-to-speak board** — large, lying-down-friendly buttons for needs, medical,
  feelings, family, and a 1–10 pain scale. Every phrase is bilingual
  (**English + தமிழ்**).
- **His real voice** — all button phrases are pre-rendered in Appa's cloned voice.
- **Type to speak** & **write-with-finger** — for anything not on a button; an AI
  reads his shaky handwriting aloud, also in his voice.
- **Listen mode** — when family speaks, the app suggests replies he can tap.
- **Works offline** — the app and his voice are cached on the device, so it keeps
  working even if the hospital Wi-Fi drops.

---

## Demo script (≈ 1 minute, for a screen/voice recording)

> Lead with the problem and its scale; the app is the answer. Pause at each ▶ so the
> voice plays. Stats are sourced at the bottom of this doc.

**[0:00 — title card or the app on screen]**
"Around the world, millions of people are in hospitals unable to **speak** — a tube,
a ventilator, an injury takes their voice. Study after study finds it's the *worst*
part of being there: **nine out of ten** rank it above pain and thirst. In the U.S.
alone that's **2.7 million people a year** — and that's just one country."

**[0:13]**
"And whenever a patient and the people caring for them **don't share a language** —
migrants, multilingual countries, families far from home — care gets dangerous:
longer stays, and **twice the medication errors**. Often **a third** of attempts to
explain *pain* simply fail."

**▶ [0:28 — tap Water, the red HELP ME, a pain number]**
"This is **Appa Speaks**. It gives them a voice. One tap speaks — out loud, clearly
— for needs, for pain, for 'call the doctor now.'"

**▶ [0:40 — switch to தமிழ், tap the same idea]**
"In their **own language** for family… and in **English** for the medical team. The
same thought, understood by everyone in the room."

**[0:50 — close]**
"It can even speak in the patient's **own cloned voice** — a nice touch. But the real
idea is bigger: **any language, to any language.** Someone who can't talk… talking
to anyone. That's Appa Speaks."

---

## Why it matters (the numbers)

**Being voiceless is one of the most distressing parts of intensive care — everywhere.**
- Patients in ICUs are routinely **unable to speak** due to artificial airways and
  ventilation, and **49%** face *extreme* difficulty communicating. In the **U.S.
  alone** that's **2.7M+ patients a year** — one country's slice of a global total. [[1]]
- **90%** of ventilated patients rate **being unable to speak** as their single
  greatest discomfort — ahead of thirst (87%) and suctioning pain (82%); **82%**
  report moderate-to-high distress. (A clinical finding, not country-specific.) [[2]]
- Over **one-third (37.7%)** of patients' attempts to communicate **about pain**
  fail. Better communication directly lowers fear and anger. [[3]]

**Voice is identity — not a luxury.** This is the same principle ALS/MND patients
use when they "voice bank":
- Generic synthetic voices are perceived as **impersonal** and fail to capture the
  person. Preserving one's *own* voice preserves **identity**, is a way of
  "fighting back," and gives real **psychological benefit** — while improving
  listener comprehension and the patient's autonomy. [[4]]
- The difference for us: ALS patients record *before* they lose speech. Appa
  already had. So we cloned his voice **from existing recordings** — a path open
  to anyone with old videos of a loved one.

---

## The bilingual / translation opportunity (where this gets big)

Appa's case shows why language is the whole game: he needs **Tamil** for the
intimacy of family and **English** for the precision of medical staff. That mismatch
happens everywhere — through migration, in multilingual countries, and wherever
people are treated far from home:

- **~281 million** people live **outside their country of birth** (UN) — many treated
  by clinicians who don't speak their language. Multilingual nations multiply this:
  India alone has **22 official languages**. [[7]]
- Where patient and caregiver don't share a language, outcomes measurably worsen —
  **longer hospital stays, higher readmissions, lower satisfaction**, and
  **medication-dosing errors twice as often**. (e.g. ~26M with limited English in
  the U.S. alone.) [[5]]
- **Tamil alone** has **~91 million** native speakers (17th most-spoken language),
  official in Sri Lanka, Singapore, Tamil Nadu & Puducherry, with large diaspora
  communities in Canada, the U.S., the U.K., Australia, Malaysia and Mauritius. [[6]]

**The unlock:** a cloned voice is **language-agnostic** — one clone of Appa can
speak **70+ languages**. So the same patient could answer a **Tamil**-speaking
daughter, an **English**-speaking surgeon, and a **Hindi**-speaking nurse — *all in
his own voice*. Pair that with live translation of what's said *to* him, and you
have a two-way, identity-preserving translator for anyone who has lost their
speech in a language not their own.

That turns a personal project for one father into a template for **millions** of
voiceless, multilingual patients.

---

## How it was built (technical record)

- **Frontend:** single-page app (`public/index.html`) — responsive board, bilingual
  buttons, canvas handwriting, speech-recognition "listen" mode.
- **Voice:** ElevenLabs **Instant Voice Clone** ("Appa (Naru)") from ~4.5 min of
  cleaned family-video audio (`ffmpeg` denoise/normalize). Model
  `eleven_multilingual_v2`, tuned (stability 0.75 / similarity 0.9) so short urgent
  phrases stay calm, not shouty. One clone → English **and** Tamil.
- **Pre-rendering:** `scripts/generate-voice.mjs` renders all 106 fixed phrases
  (EN + TA) to `public/voice/*.mp3` + a manifest the app looks up.
- **Live speech:** server `/api/tts` proxies ElevenLabs for typed/handwritten text;
  browser speech as the offline fallback.
- **Offline:** service worker (`public/sw.js`) precaches the app + all voice clips.
- **Backend:** Node/Express (`server.js`), deployed on Render.

### Honest limitations
- Source recordings are all **Tamil**, so his **Tamil sounds like him**; **English**
  carries a mild generic accent (no English of his to learn from). Fixable later
  with even ~1 minute of him speaking English.

---

## Roadmap

- Two-way **live translation** (speech-to-speech) so visitors in any language can
  talk with him.
- **Voice-bank onboarding** for other families: upload videos → get a board in
  your loved one's voice.
- Larger phrase set + caregiver-customizable buttons.

---

### Sources
[1]: https://pmc.ncbi.nlm.nih.gov/articles/PMC11969292/
[2]: https://www.researchgate.net/publication/51762874_Communication_Difficulties_and_Psychoemotional_Distress_in_Patients_Receiving_Mechanical_Ventilation
[3]: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3222584/
[4]: https://www.nature.com/articles/s41598-024-84728-y
[5]: https://pmc.ncbi.nlm.nih.gov/articles/PMC10855368/
[6]: https://en.wikipedia.org/wiki/List_of_countries_and_territories_where_Tamil_is_an_official_language
[7]: https://www.un.org/en/global-issues/migration

1. Communication difficulties in mechanically ventilated voiceless ICU patients (2.7M/yr unable to speak; 49% extreme difficulty) — *Nursing in Critical Care*, 2025.
2. Communication Difficulties and Psychoemotional Distress in Patients Receiving Mechanical Ventilation (90% / 82%).
3. Nurse–Patient Communication Interactions in the ICU (37.7% of pain communications unsuccessful) — PMC.
4. AI-empowered voice generation for ALS patients; voice-banking identity research — *Scientific Reports*, 2024 & RCSLT.
5. Impact of Limited English Proficiency on Healthcare Access and Outcomes (~26M LEP; 2× dosing errors; longer stays) — PMC scoping review.
6. Tamil speakers & official status (~91M native speakers) — worlddata.info & Wikipedia.
7. International migrants worldwide (~281M, 2020) — UN, Global Issues: Migration.
