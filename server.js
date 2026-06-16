const express = require('express');
const path = require('path');
const fs = require('fs');

// Minimal .env loader (no dependency) — only fills vars not already set.
try {
  for (const line of fs.readFileSync(path.join(__dirname, '.env'), 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
} catch { /* no .env (e.g. on Railway, where vars come from the dashboard) */ }

const app = express();
const PORT = process.env.PORT || 3000;
const VOICE_ID = process.env.VOICE_ID || '0SBJGt4w1Y9cGcDYRx10';

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '10mb' }));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/walk', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'walk.html'));
});

// OCR proxy — keeps API key server-side
app.post('/api/ocr', async (req, res) => {
  const { imageBase64 } = req.body;
  if (!imageBase64) return res.status(400).json({ error: 'No image' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-opus-4-5-20251101',
        max_tokens: 200,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: 'image/png', data: imageBase64 }
            },
            {
              type: 'text',
              text: `This is a handwritten message from a 69-year-old patient in the ICU who cannot speak. He has a spinal cord injury and is using his finger to write on a touchscreen iPad — his handwriting will be shaky, slow, and may be incomplete or hard to read.

Please do your absolute best to read what he has written. Consider common things an ICU patient might want to communicate: pain, thirst, family members, questions, feelings.

Return ONLY the text you can read or your best interpretation — no explanation, no commentary, just the words. If you truly cannot make out anything at all, respond with exactly: UNCLEAR`
            }
          ]
        }]
      })
    });

    const data = await response.json();
    const text = data?.content?.[0]?.text?.trim() || 'UNCLEAR';
    res.json({ text });
  } catch (e) {
    console.error('OCR error:', e);
    res.status(500).json({ error: e.message });
  }
});

// Live TTS in the cloned voice — for typed text & handwriting (anything not pre-rendered)
app.post('/api/tts', async (req, res) => {
  const { text, lang } = req.body;
  if (!text || !text.trim()) return res.status(400).json({ error: 'No text' });

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'ElevenLabs key not configured' });

  try {
    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
      method: 'POST',
      headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: text.slice(0, 500).replace(/!+/g, '.'),
        model_id: 'eleven_multilingual_v2',
        voice_settings: { stability: 0.75, similarity_boost: 0.9, style: 0.0, use_speaker_boost: true }
      })
    });
    if (!r.ok) {
      const detail = (await r.text()).slice(0, 200);
      return res.status(502).json({ error: 'TTS failed', detail });
    }
    res.setHeader('Content-Type', 'audio/mpeg');
    res.send(Buffer.from(await r.arrayBuffer()));
  } catch (e) {
    console.error('TTS error:', e);
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`Appa Speaks running on port ${PORT}`);
});
