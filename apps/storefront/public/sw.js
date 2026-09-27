const CACHE_NAME = "artisan-static-v1";
self.addEventListener("install", (e) => self.skipWaiting());
self.addEventListener("activate", (e) => self.clients.claim());
self.addEventListener("fetch", (e) => {
  if (e.request.url.includes("/checkout") || e.request.url.includes("/api/")) {
    return e.respondWith(fetch(e.request).catch(() => caches.match("/offline.html")));
  }
  e.respondWith(caches.match(e.request).then((res) => res || fetch(e.request)));
});
