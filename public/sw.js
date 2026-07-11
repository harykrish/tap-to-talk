// Appa Speaks service worker — makes the app + Appa's voice work offline.
// Bump CACHE when you change the app shell or want to force a full refresh.
const CACHE = 'appa-v5';
const CORE = ['/', '/index.html', '/voice/manifest.json'];

// ── Install: cache the shell + every voice clip listed in the manifest ──
self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(CORE).catch(() => {});
    try {
      const res = await fetch('/voice/manifest.json', { cache: 'no-cache' });
      const list = await res.json();
      const urls = [...new Set(list.map((e) => '/voice/' + e.file))];
      // Chunk so one failed file doesn't abort the whole precache.
      for (let i = 0; i < urls.length; i += 20) {
        await cache.addAll(urls.slice(i, i + 20)).catch(() => {});
      }
    } catch (e) { /* manifest unavailable — clips will cache on first play */ }
    self.skipWaiting();
  })());
});

// ── Activate: drop old caches ──
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

// ── Fetch routing ──
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;            // never intercept /api/* POSTs
  const url = new URL(req.url);

  // Voice clips & manifest, plus cross-origin (fonts): stale-while-revalidate
  if ((url.origin === location.origin && url.pathname.startsWith('/voice/')) ||
      url.origin !== location.origin) {
    event.respondWith(staleWhileRevalidate(req));
    return;
  }

  // Page navigations & other same-origin GETs: network-first, cache fallback
  event.respondWith(networkFirst(req));
});

async function staleWhileRevalidate(req) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(req);
  const fetching = fetch(req)
    .then((res) => { if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone()); return res; })
    .catch(() => null);
  return hit || (await fetching) || Response.error();
}

async function networkFirst(req) {
  const cache = await caches.open(CACHE);
  try {
    const res = await fetch(req);
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  } catch (e) {
    return (await cache.match(req)) || (await cache.match('/')) || Response.error();
  }
}
