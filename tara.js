/* Türkan İdrak — kaynak tarayıcı
   GitHub'ın sunucusunda saatte bir çalışır, akis.json üretir.
   Hiçbir dış bağımlılığı yok, kurulum gerektirmez. */

const fs = require("fs");

const KAYNAKLAR = [
  { ad: "RAND",            url: "https://www.rand.org/pubs/new.xml" },
  { ad: "Crisis Group",    url: "https://www.crisisgroup.org/rss.xml" },
  { ad: "Chatham House",   url: "https://www.chathamhouse.org/path/whatsnew.xml" },
  { ad: "Brookings",       url: "https://www.brookings.edu/feed/" },
  { ad: "Foreign Affairs", url: "https://www.foreignaffairs.com/rss.xml" },
  { ad: "AEI",             url: "https://www.aei.org/feed/" }
];

const ARSIV_SINIRI = 800;   // kaynak başına saklanan yazı

/* ---------- yardımcılar ---------- */

const VARLIKLAR = {
  "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"',
  "&apos;": "'", "&#39;": "'", "&nbsp;": " ", "&#8217;": "’",
  "&#8216;": "‘", "&#8220;": "“", "&#8221;": "”", "&#8211;": "–", "&#8212;": "—"
};

function coz(x) {
  return (x || "")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
    .replace(/&[a-z]+;|&#\d+;/gi, m => VARLIKLAR[m.toLowerCase()] || " ");
}

function temiz(x) {
  return coz(x).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function etiket(blok, ad) {
  const m = blok.match(new RegExp("<" + ad + "(?:\\s[^>]*)?>([\\s\\S]*?)</" + ad + ">", "i"));
  return m ? m[1] : "";
}

function baglanti(blok) {
  const duz = temiz(etiket(blok, "link"));
  if (duz && /^https?:/i.test(duz)) return duz;
  const m = blok.match(/<link[^>]*\shref=["']([^"']+)["']/i);
  return m ? m[1] : "";
}

function kimlik(u) {
  let h = 0;
  for (const c of String(u || "")) h = ((h << 5) - h + c.charCodeAt(0)) | 0;
  return "a" + Math.abs(h).toString(36);
}

function ayikla(xml, kaynakAd) {
  let bloklar = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) || [];
  if (!bloklar.length) bloklar = xml.match(/<entry[\s>][\s\S]*?<\/entry>/gi) || [];
  if (!bloklar.length) throw new Error("beslemede yazı yok");

  return bloklar.slice(0, 40).map(b => {
    const baslik = temiz(etiket(b, "title"));
    const link = baglanti(b);
    const ozetHam = temiz(
      etiket(b, "description") || etiket(b, "summary") || etiket(b, "content")
    );
    return {
      id: kimlik(link || baslik),
      kaynak: kaynakAd,
      baslik,
      ozet: ozetHam.length > 260 ? ozetHam.slice(0, 260) + "…" : ozetHam,
      link,
      tarih: temiz(etiket(b, "pubDate") || etiket(b, "published") || etiket(b, "updated"))
    };
  }).filter(y => y.baslik);
}

async function cek(kaynak) {
  const dur = AbortSignal.timeout(25000);
  const c = await fetch(kaynak.url, {
    signal: dur,
    redirect: "follow",
    headers: {
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      "accept": "application/rss+xml, application/atom+xml, application/xml;q=0.9, text/xml;q=0.9, text/html;q=0.8, */*;q=0.7",
      "accept-language": "en-US,en;q=0.9,tr;q=0.8",
      "accept-encoding": "gzip, deflate, br",
      "cache-control": "no-cache",
      "sec-ch-ua": '"Chromium";v="131", "Not_A Brand";v="24"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"Windows"',
      "sec-fetch-dest": "document",
      "sec-fetch-mode": "navigate",
      "sec-fetch-site": "none",
      "upgrade-insecure-requests": "1"
    }
  });
  if (!c.ok) throw new Error("HTTP " + c.status);
  return ayikla(await c.text(), kaynak.ad);
}

/* ---------- ana akış ---------- */

(async () => {
  let onceki = { kaynaklar: {} };
  try {
    onceki = JSON.parse(fs.readFileSync("akis.json", "utf8"));
    if (!onceki.kaynaklar) onceki = { kaynaklar: {} };
  } catch (e) { /* ilk çalışma */ }

  const sonuc = { guncellendi: new Date().toISOString(), kaynaklar: {} };

  for (const k of KAYNAKLAR) {
    const eskiKayit = onceki.kaynaklar[k.ad] || { yazilar: [] };
    try {
      const yeni = await cek(k);
      const gelenler = new Set(yeni.map(y => y.id));
      const birlesik = yeni.concat(eskiKayit.yazilar.filter(y => !gelenler.has(y.id)));
      sonuc.kaynaklar[k.ad] = {
        yazilar: birlesik.slice(0, ARSIV_SINIRI),
        tarandi: new Date().toISOString(),
        durum: "tamam"
      };
      console.log(`✓ ${k.ad} — ${yeni.length} yeni, toplam ${birlesik.length}`);
    } catch (e) {
      sonuc.kaynaklar[k.ad] = {
        yazilar: eskiKayit.yazilar,
        tarandi: eskiKayit.tarandi || null,
        durum: "hata: " + e.message
      };
      console.log(`✗ ${k.ad} — ${e.message} (${eskiKayit.yazilar.length} eski yazı korundu)`);
    }
  }

  fs.writeFileSync("akis.json", JSON.stringify(sonuc));
  const toplam = Object.values(sonuc.kaynaklar).reduce((n, k) => n + k.yazilar.length, 0);
  console.log(`\nakis.json yazıldı — ${toplam} yazı`);
})();
