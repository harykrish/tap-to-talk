// Pre-renders every fixed button phrase in the cloned voice (EN + TA)
// into public/voice/*.mp3, plus a manifest.json the app uses to look them up.
//
//   node --env-file=.env scripts/generate-voice.mjs
//
// Re-running skips files that already exist (safe to resume after an error).

import fs from 'fs';
import path from 'path';

const API_KEY  = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = process.env.VOICE_ID || '0SBJGt4w1Y9cGcDYRx10';
const MODEL    = 'eleven_multilingual_v2';
const SETTINGS = { stability: 0.75, similarity_boost: 0.9, style: 0.0, use_speaker_boost: true };

// Calmer delivery: exclamation marks make the model shout. Strip them for
// synthesis only — the button still DISPLAYS the original text (with "!").
const speakable = (t) => t.replace(/!+/g, '.');

if (!API_KEY) { console.error('ELEVENLABS_API_KEY not set (run with: node --env-file=.env scripts/generate-voice.mjs)'); process.exit(1); }

const OUT = path.join(process.cwd(), 'public', 'voice');
fs.mkdirSync(OUT, { recursive: true });

// ── The fixed phrases, mirrored from public/index.html ──────────────────
const phrases = [
  // NEEDS
  { en: 'Help me!', ta: 'உதவி செய்யுங்கள்!' },
  { en: 'I need water', ta: 'எனக்கு தண்ணீர் வேண்டும்' },
  { en: 'I need to urinate', ta: 'எனக்கு சிறுநீர் கழிக்க வேண்டும்' },
  { en: 'I need to pass motion', ta: 'எனக்கு மலம் கழிக்க வேண்டும்' },
  { en: 'I am in pain', ta: 'எனக்கு வலி இருக்கிறது' },
  { en: 'I want coffee', ta: 'எனக்கு காபி வேண்டும்' },
  { en: 'I want coconut water', ta: 'எனக்கு இளநீர் வேண்டும்' },
  { en: 'I want juice', ta: 'எனக்கு ஜூஸ் வேண்டும்' },
  { en: 'I am hungry', ta: 'எனக்கு பசிக்கிறது' },
  { en: 'Please adjust my position', ta: 'என் நிலையை சரிசெய்யுங்கள்' },
  // MEDICAL
  { en: 'Call the doctor now!', ta: 'இப்போதே டாக்டரை அழையுங்கள்!' },
  { en: 'Call the nurse please', ta: 'நர்ஸை அழையுங்கள்' },
  { en: 'Yes', ta: 'ஆமாம்' },
  { en: 'No', ta: 'இல்லை' },
  { en: 'I am okay', ta: 'நான் சரியாக இருக்கிறேன்' },
  { en: 'The tube is uncomfortable', ta: 'குழாய் வலிக்கிறது' },
  { en: 'My back hurts', ta: 'என் முதுகு வலிக்கிறது' },
  { en: 'I have pain in my neck', ta: 'என் கழுத்தில் வலி இருக்கிறது' },
  { en: 'I can feel sensation in my legs', ta: 'என் கால்களில் உணர்வு தெரிகிறது' },
  { en: 'I can feel sensation in my left leg', ta: 'என் இடது காலில் உணர்வு தெரிகிறது' },
  { en: 'I can feel sensation in my right leg', ta: 'என் வலது காலில் உணர்வு தெரிகிறது' },
  { en: 'I can feel sensation in my feet', ta: 'என் பாதங்களில் உணர்வு தெரிகிறது' },
  { en: 'I can feel tingling in my legs', ta: 'என் கால்களில் சிலிர்ப்பு தெரிகிறது' },
  // FEELINGS
  { en: 'I love you', ta: 'நான் உன்னை நேசிக்கிறேன்' },
  { en: 'Thank you', ta: 'நன்றி' },
  { en: 'I am feeling better today', ta: 'இன்று நான் நலமாக உணர்கிறேன்' },
  { en: 'I am happy', ta: 'நான் மகிழ்ச்சியாக இருக்கிறேன்' },
  { en: 'I am bored', ta: 'எனக்கு சலிப்பாக இருக்கிறது' },
  { en: 'I will be okay. Do not worry', ta: 'நான் சரியாவேன். கவலைப்படாதீர்கள்' },
  { en: 'I am proud of myself', ta: 'நான் வலிமையாக இருக்கிறேன்' },
  { en: 'God will help me', ta: 'இறைவன் உதவுவான்' },
  // FAMILY
  { en: 'Where is Hari?', ta: 'ஹரி எங்கே?' },
  { en: 'Where is Vimala?', ta: 'விமலா எங்கே?' },
  { en: 'Please hold my hand', ta: 'என் கையை பிடியுங்கள்' },
  { en: 'I want to see my family', ta: 'என் குடும்பத்தினரை பார்க்க வேண்டும்' },
  { en: 'Tell me good news', ta: 'நல்ல செய்தி சொல்லுங்கள்' },
  { en: 'I want to listen to music', ta: 'இசை கேட்க வேண்டும்' },
  { en: 'How is work going?', ta: 'வேலை எப்படி போகிறது?' },
  { en: 'Tell me more about cricket', ta: 'கிரிக்கெட் பத்தி சொல்லுங்கள்' },
  { en: 'How is everyone at home?', ta: 'வீட்டில் எல்லாரும் எப்படி இருக்கிறார்கள்?' },
  { en: 'I am getting better every day', ta: 'நான் ஒவ்வொரு நாளும் நலமடைகிறேன்' },
  { en: 'I love you all so much', ta: 'நான் உங்கள் அனைவரையும் மிகவும் நேசிக்கிறேன்' },
  // CANVAS / WRITE
  { en: 'I have written something. Please look at my screen.', ta: 'நான் ஏதோ எழுதியிருக்கிறேன். என் திரையை பாருங்கள்.' },
];

// PAIN SCALE 1..10
for (let i = 1; i <= 10; i++) {
  phrases.push({ en: `My pain level is ${i} out of 10`, ta: `என் வலி அளவு 10-ல் ${i}` });
}

// Comfort-care phrases (added when he could no longer swallow). Appended LAST so
// every existing clip keeps its file number — only these new ones get synthesized.
phrases.push(
  { en: 'There is secretion in my mouth', ta: 'என் வாயில் எச்சில் தேங்கியிருக்கிறது' },
  { en: 'Can you do suction', ta: 'சக்ஷன் செய்ய முடியுமா?' },
  { en: 'Please sit me up a little', ta: 'என்னை சற்று உட்கார வையுங்கள்' },
  { en: 'I feel warm', ta: 'எனக்கு வெப்பமாக இருக்கிறது' },
  { en: 'I feel cold', ta: 'எனக்கு குளிராக இருக்கிறது' },
);

// Flatten into per-language entries
const entries = [];
for (const p of phrases) {
  if (p.en) entries.push({ lang: 'en', text: p.en });
  if (p.ta) entries.push({ lang: 'ta', text: p.ta });
}

async function synth(text) {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
    method: 'POST',
    headers: { 'xi-api-key': API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: speakable(text), model_id: MODEL, voice_settings: SETTINGS }),
  });
  if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 150)}`);
  return Buffer.from(await res.arrayBuffer());
}

const manifest = [];
let n = 0, made = 0, skipped = 0;
for (const e of entries) {
  n++;
  const file = `${e.lang}_${String(n).padStart(4, '0')}.mp3`;
  const dest = path.join(OUT, file);
  if (fs.existsSync(dest) && fs.statSync(dest).size > 0) {
    manifest.push({ ...e, file }); skipped++; continue;
  }
  try {
    fs.writeFileSync(dest, await synth(e.text));
    manifest.push({ ...e, file }); made++;
    console.log(`ok  ${file}  ${e.lang}  ${e.text.slice(0, 42)}`);
  } catch (err) {
    console.error(`FAIL ${e.lang} "${e.text.slice(0, 30)}": ${err.message}`);
  }
}

fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest));
console.log(`\nDone. ${made} generated, ${skipped} already existed, ${manifest.length} in manifest.`);
