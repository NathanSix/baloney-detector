// Service worker: lets the app open and work with no internet connection.
// When you change any app file, bump VERSION so phones pick up the new copy.
const VERSION = "v1";
const CACHE = `baloney-${VERSION}`;

const APP_FILES = [
  "./",
  "./index.html",
  "./css/style.css",
  "./js/app.js",
  "./js/flags.js",
  "./js/scan.js",
  "./js/examples.js",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png",
];

// Save the app's own files when it's first installed
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(APP_FILES)));
  self.skipWaiting();
});

// Throw away caches from older versions
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// App files: serve the saved copy, fall back to the network.
// Fonts: use the network when online and keep a copy for offline use.
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  if (url.origin === self.location.origin) {
    event.respondWith(caches.match(request).then((hit) => hit || fetch(request)));
  } else if (url.hostname.endsWith("fonts.googleapis.com") || url.hostname.endsWith("fonts.gstatic.com")) {
    event.respondWith(
      caches.open(CACHE).then(async (cache) => {
        try {
          const res = await fetch(request);
          cache.put(request, res.clone());
          return res;
        } catch {
          return (await cache.match(request)) || Response.error();
        }
      })
    );
  }
});
