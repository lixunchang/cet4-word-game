// service-worker.js
 
const audioCacheName = 'audio-letter-v1';
const audioFilesToCache = [
  '/letters/a.mp3',
  '/letters/b.mp3',
  '/letters/c.mp3',
  '/letters/d.mp3',
  '/letters/e.mp3',
  '/letters/f.mp3',
  '/letters/g.mp3',
  '/letters/h.mp3',
  '/letters/i.mp3',
  '/letters/j.mp3',
  '/letters/k.mp3',
  '/letters/l.mp3',
  '/letters/m.mp3',
  '/letters/n.mp3',
  '/letters/o.mp3',
  '/letters/p.mp3',
  '/letters/q.mp3',
  '/letters/r.mp3',
  '/letters/s.mp3',
  '/letters/t.mp3',
  '/letters/u.mp3',
  '/letters/v.mp3',
  '/letters/w.mp3',
  '/letters/x.mp3',
  '/letters/y.mp3',
  '/letters/z.mp3',
];
 
self.addEventListener('install', async () => {
  const cache = await caches.open(audioCacheName);
  await cache.addAll(audioFilesToCache);
});
 
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (audioFilesToCache.includes(url.pathname)) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request).then((networkResponse) => {
          caches.open(audioCacheName).then((cache) => {
            cache.put(event.request, networkResponse.clone());
          });
          return networkResponse;
        });
      })
    );
  }
});