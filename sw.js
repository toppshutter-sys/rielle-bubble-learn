/* Offline support: serve the app from cache when there is no network.
   Pages are fetched network-first so updates show up right away. */
const CACHE = 'bubble-learn-v1';
const CORE = ['./', 'index.html', 'manifest.webmanifest', 'assets/icon.svg', 'assets/icon-192.png', 'assets/icon-512.png', 'assets/icon-1024.png', 'assets/play-store-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const put = res => { if (res.ok || res.type === 'opaque') { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return res; };
  if (req.mode === 'navigate') {
    // network first, fall back to the cached app
    e.respondWith(fetch(req).then(put).catch(() => caches.match(req).then(r => r || caches.match('index.html'))));
    return;
  }
  // everything else (icons, Fredoka font): cache first, refresh in the background
  e.respondWith(caches.match(req).then(hit => {
    const net = fetch(req).then(put).catch(() => hit);
    return hit || net;
  }));
});
