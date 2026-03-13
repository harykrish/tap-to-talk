# Appa Speaks

Bilingual (Tamil/English) AAC communication app for tracheostomy patients.
Also includes Walk With Me — a motor imagery walking game for spinal rehab.

## Routes
- `/` — Appa Speaks communication app
- `/walk` — Walk With Me rhythm game

## Deploy to Railway
1. Push this folder to a GitHub repo
2. Go to railway.app → New Project → Deploy from GitHub
3. Select the repo → Railway auto-detects Node.js
4. Done — you get a URL like `https://appa-speaks.up.railway.app`

## Deploy to Render
1. Push to GitHub
2. Go to render.com → New Web Service
3. Connect repo, set:
   - Build Command: `npm install`
   - Start Command: `node server.js`
4. Deploy

## Offline usage
Works fully offline for all buttons and voice output.
The AI-enhanced suggestions need internet but fall back to
built-in smart responses automatically when offline.

## Local usage (no deployment)
```
npm install
node server.js
```
Then open http://localhost:3000 on any device on the same WiFi.
