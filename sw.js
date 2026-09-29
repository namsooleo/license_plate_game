// Network-first: always try for the latest files, fall back to the cache when offline
const CACHE = "license-plate-game";
const APP_FILES = [
    "./",
    "index.html",
    "style.css",
    "app.js",
    "manifest.webmanifest",
    "img/icon-192.png",
    "img/icon-512.png",
    "img/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
    event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(APP_FILES)));
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
    // Google Fonts isn't cached; offline falls back to a system font
    if (event.request.method !== "GET" || new URL(event.request.url).origin !== location.origin) return;
    event.respondWith(
        // no-cache: GitHub Pages sends max-age=600, so skip the browser cache and check for a newer version
        fetch(event.request, { cache: "no-cache" })
            .then((response) => {
                if (response.ok) {
                    const copy = response.clone();
                    caches.open(CACHE).then((cache) => cache.put(event.request, copy));
                }
                return response;
            })
            .catch(() => caches.match(event.request))
    );
});
