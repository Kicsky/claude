/* Calisthenics : cache hors ligne de l'application. */
const CACHE = 'gravite-v8';
const SHELL = ['./', './index.html', './css/styles.css', './js/data.js', './js/config.js', './js/vendor/supabase.js', './js/cloud.js', './js/push.js', './js/mascot.js', './js/tutos.js', './js/app.js', './manifest.webmanifest', './icons/icon.svg', './icons/icon-192.png', './icons/icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  // Seulement les fichiers du site : les appels à la base de données ne sont jamais mis en cache.
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(e.request).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match(e.request).then((r) => r || caches.match('./index.html')))
  );
});

/* Rappels de séance : affichage de la notification envoyée par scripts/rappels.mjs. */
self.addEventListener('push', (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (err) { d = { body: e.data ? e.data.text() : '' }; }
  e.waitUntil(self.registration.showNotification(d.title || 'Calisthenics', {
    body: d.body || 'C’est l’heure de ta séance !',
    icon: 'icons/icon-192.png?v=2',
    badge: 'icons/icon-192.png?v=2',
    tag: d.tag || 'rappel',
    renotify: true,
    data: { url: d.url || './#accueil' }
  }));
});
/* Toucher la notification ouvre l'appli (ou la ramène au premier plan). */
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const url = new URL((e.notification.data && e.notification.data.url) || './', self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
    const open = list.find((c) => c.url.startsWith(self.registration.scope));
    if (open) return open.focus();
    return self.clients.openWindow(url);
  }));
});
