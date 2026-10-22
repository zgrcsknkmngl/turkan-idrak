/* Türkan İdrak Tefekkür — çevrimdışı katman
   Her istek önce ağa gider; ağ yoksa son kaydedilen kopya gösterilir.
   Böylece güncellemeler hemen gelir, internet kesilince uygulama boş açılmaz. */
const SURUM = "ti-1";
const CEKIRDEK = ["./", "manifest.json", "anka-192.png", "anka-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(SURUM).then(c => c.addAll(CEKIRDEK)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(adlar => Promise.all(adlar.filter(a => a !== SURUM).map(a => caches.delete(a))))
      .then(() => self.clients.claim())
  );
});

function anahtar(istek, adres) {
  // akis.json?t=… ve ?y=… gibi sorgular tek kopyada toplansın
  if (istek.mode === "navigate" || /\.json$/.test(adres.pathname)) return adres.origin + adres.pathname;
  return istek;
}

self.addEventListener("fetch", e => {
  const istek = e.request;
  if (istek.method !== "GET") return;
  const adres = new URL(istek.url);
  if (adres.origin !== self.location.origin) return;   // yayıncı görselleri, çeviri, yazı tipleri: dokunma
  if (/\.mp4$/i.test(adres.pathname)) return;           // açılış videosu: tarayıcının kendi önbelleği yönetsin

  e.respondWith((async () => {
    try {
      const yanit = await fetch(istek);
      if (yanit.ok && yanit.type === "basic") {
        const kopya = yanit.clone();
        caches.open(SURUM).then(c => c.put(anahtar(istek, adres), kopya)).catch(() => {});
      }
      return yanit;
    } catch (hata) {
      const depo = await caches.open(SURUM);
      const kayit = await depo.match(anahtar(istek, adres));
      if (kayit) return kayit;
      if (istek.mode === "navigate") {
        const ana = await depo.match(new URL("./", self.location.href).href);
        if (ana) return ana;
      }
      throw hata;
    }
  })());
});
