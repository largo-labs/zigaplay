/* ZigaPlay offline: keeps the console and every game on this device, so it opens with no connection. */
const CACHE='zigaplay-d69a9fe1e25c';
const FILES=["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png"];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES.map(f=>new Request(f,{cache:'reload'})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('zigaplay-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
  e.respondWith(caches.open(CACHE).then(async c=>{
    const hit=(await c.match(r,{ignoreSearch:true}))||(r.mode==='navigate'?await c.match('./index.html'):undefined);
    if(hit)return hit;
    try{const res=await fetch(r);if(res.ok)c.put(r,res.clone());return res}catch(err){return Response.error()}}))});
