const CACHE_NAME = "newpellet-pwa-v5";
const ASSETS = [
  "/",
  "index.html",
  "styles.css",
  "app.js",
  "manifest.webmanifest",
  "assets/icon-192.png",
  "assets/icon-512.png",
  "assets/richwood-abete-lettonia.png",
  "assets/hitze-pellet.png",
  "assets/timber-pellet-abete-bianco-tedesco.png"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});

self.addEventListener("push", event => {
  let data = { title:"Newpellet", body:"Nuova offerta disponibile", url:"/" };
  if(event.data){
    try { data = event.data.json(); } catch(e){ data.body = event.data.text(); }
  }
  
  const options = {
    body: data.body || "Nuova offerta disponibile",
    icon: "/assets/icon-192.png",
    badge: "/assets/icon-192.png",
    data: { url: data.url || "/" },
    vibrate: [200, 100, 200, 100, 200, 100, 200],
    requireInteraction: true
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || "Newpellet", options)
  );
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(clients.openWindow(url));
});
