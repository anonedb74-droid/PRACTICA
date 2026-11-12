// Service worker pentru Practică — prezență.
// Rețeaua întâi (ca să vină mereu ultima versiune), apoi cache, ca aplicația să se deschidă și fără semnal.
const CACHE_NAME = 'practica-cache-v1';
const FILES_DE_CACHE = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './xlsx.full.min.js'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_DE_CACHE)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((nume) => Promise.all(nume.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))));
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  // Contul Google și baza de date (Firebase) nu trec prin cache
  const gazda = new URL(event.request.url).hostname;
  if ((gazda.endsWith('googleapis.com') && !gazda.startsWith('fonts.')) || gazda.endsWith('google.com') || gazda.endsWith('firebaseapp.com')) return;
  event.respondWith(
    fetch(event.request)
      .then((raspuns) => {
        const copie = raspuns.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copie));
        return raspuns;
      })
      .catch(() => caches.match(event.request, { ignoreSearch: event.request.mode === 'navigate' }).then((r) => {
        if (r) return r;
        return event.request.mode === 'navigate' ? caches.match('./index.html') : Response.error();
      }))
  );
});
