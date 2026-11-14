const CACHE = 'sizzle-story-v3';
const FILES = ['./','index.html','style.css','app.js','recipes.js','manifest.webmanifest','icon-192.png','icon-512.png',
 'img/cafe_bg.jpg','img/mina_happy.jpg','img/mina_shy.jpg','img/mina_happy_cut.webp','img/mina_shy_cut.webp','img/mina_delighted.jpg','img/pancakes.jpg',
 'img/friedrice.jpg','img/pasta.jpg','img/omelet.jpg','img/onigiri.jpg','img/cookies.jpg'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', e => { if (e.request.method !== 'GET') return; e.respondWith(caches.match(e.request).then(r => r || fetch(e.request))); });
