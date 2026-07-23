/* MAC Pocket Guide - offline cache */
const CACHE = "mac-pocket-guide-v9";
const ASSETS = [
  "./",
  "./index.html",
  "./css/styles.css",
  "./js/app.js",
  "./data/guide.json",
  "./manifest.json",
  "./icons/icon.svg",
  "./assets/union/parvinder.jpg",
  "./assets/union/garima.jpg",
  "./assets/union/rounak.jpg",
  "./assets/union/samriddhi.jpg",
  "./assets/union/yachita.jpg",
  "./assets/union/team.jpg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  event.respondWith(
    caches.match(request).then((cached) => {
      const fetched = fetch(request)
        .then((res) => {
          if (res && res.ok && new URL(request.url).origin === location.origin) {
            const clone = res.clone();
            caches.open(CACHE).then((cache) => cache.put(request, clone));
          }
          return res;
        })
        .catch(() => cached);
      return cached || fetched;
    })
  );
});
