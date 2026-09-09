import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');

assert.match(html, /<textarea[^>]+id="custom-input"/, 'typing uses a textarea');
assert.match(html, /onclick="speakCustomOnly\(\)">🔊 Speak Only</, 'speech without saving is available');
assert.match(html, /onclick="speakAndSaveCustom\(\)">🔊＋📝 Speak &amp; Save</, 'speech with saving is available');
assert.match(html, /onclick="saveCustomNote\(\)">📝 Save Only</, 'silent save is available');
assert.match(
  html,
  /function speakAndSaveCustom\(\)[\s\S]*?addTypedNote\(t, 'spoken'\);[\s\S]*?tap\(t, t\);/,
  'deliberate typed speech is recorded as a note'
);
assert.match(
  html,
  /function speakCustomOnly\(\)[\s\S]*?tap\(t, t\);[\s\S]*?Spoken only — not saved/,
  'speak-only does not record a note'
);
assert.doesNotMatch(
  html,
  /addEventListener\(['"]keydown['"][\s\S]{0,240}(speakCustomOnly|speakAndSaveCustom)/,
  'keyboard input must never trigger speech'
);
assert.match(html, /const TYPED_NOTES_KEY = 'appa_typed_notes_v1'/, 'notes use durable local storage');
assert.match(html, /id="notes-panel"/, 'saved notes can be reviewed');

console.log('Notes safety checks passed');
