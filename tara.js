/* Türkan İdrak — kaynak tarayıcı
   GitHub'ın sunucusunda saatte bir çalışır, akis.json üretir.
   Hiçbir dış bağımlılığı yok, kurulum gerektirmez. */

const fs = require("fs");

const KAYNAKLAR = [
  // --- Kuzey Amerika ---
  { ad: "RAND",            url: "https://www.rand.org/pubs/new.xml" },
  { ad: "Foreign Affairs", url: "https://www.foreignaffairs.com/rss.xml" },
  { ad: "Foreign Policy",  url: "https://foreignpolicy.com/feed/" },
  { ad: "Brookings",       url: "https://news.google.com/rss/search?q=site:brookings.edu&hl=en-US&gl=US&ceid=US:en" },
  { ad: "AEI",             url: "https://news.google.com/rss/search?q=site:aei.org&hl=en-US&gl=US&ceid=US:en" },
  { ad: "New America",     url: "https://news.google.com/rss/search?q=site:newamerica.org&hl=en-US&gl=US&ceid=US:en" },

  // --- Avrupa ---
  { ad: "Chatham House",   url: "https://www.chathamhouse.org/path/whatsnew.xml" },
  { ad: "Crisis Group",    url: "https://www.crisisgroup.org/rss.xml" },
  { ad: "ECFR",            url: "https://ecfr.eu/feed" },
  { ad: "Bruegel",         url: "https://www.bruegel.org/rss?type=all" },
  { ad: "SWP Berlin",      url: "https://news.google.com/rss/search?q=site:swp-berlin.org&hl=en-US&gl=US&ceid=US:en" },
  { ad: "Elcano",          url: "https://news.google.com/rss/search?q=site:realinstitutoelcano.org&hl=en-US&gl=US&ceid=US:en" },

  // --- Türkiye ---
  { ad: "SETA",            url: "https://news.google.com/rss/search?q=site:setav.org&hl=tr&gl=TR&ceid=TR:tr" },
  { ad: "ORSAM",           url: "https://news.google.com/rss/search?q=site:orsam.org.tr&hl=tr&gl=TR&ceid=TR:tr" },
  { ad: "TRT World Rapor", url: "https://researchcentre.trtworld.com/feed/" },

  // --- Rusya ve Avrasya ---
  { ad: "RIAC",            url: "https://news.google.com/rss/search?q=site:russiancouncil.ru&hl=en-US&gl=US&ceid=US:en" },
  { ad: "Valdai",          url: "https://news.google.com/rss/search?q=site:valdaiclub.com&hl=en-US&gl=US&ceid=US:en" },

  // --- Çin ve Asya ---
  { ad: "CGTN",            url: "https://www.cgtn.com/subscribe/rss/section/world.xml" },
  { ad: "ORF Hindistan",   url: "https://news.google.com/rss/search?q=site:orfonline.org&hl=en-US&gl=US&ceid=US:en" },
  { ad: "East Asia Forum", url: "https://news.google.com/rss/search?q=site:eastasiaforum.org&hl=en-US&gl=US&ceid=US:en" },

  // --- Ortadoğu ---
  { ad: "Carnegie Ortadoğu", url: "https://news.google.com/rss/search?q=site:carnegieendowment.org&hl=en-US&gl=US&ceid=US:en" },
  { ad: "El Cezire Etüd",  url: "https://studies.aljazeera.net/en/rss.xml" },
  { ad: "Tahran Times",    url: "https://www.tehrantimes.com/rss" },

  // --- Latin Amerika ---
  { ad: "Telesur",         url: "https://news.google.com/rss/search?q=site:telesurenglish.net&hl=en-US&gl=US&ceid=US:en" },
  { ad: "Prensa Latina",   url: "https://www.plenglish.com/feed/" },

  // --- Afrika ---
  { ad: "ISS Afrika",      url: "https://news.google.com/rss/search?q=site:issafrica.org&hl=en-US&gl=US&ceid=US:en" },

  // --- Küresel kurumlar ---
  { ad: "Dünya Ekonomik Forumu", url: "https://news.google.com/rss/search?q=site:weforum.org&hl=en-US&gl=US&ceid=US:en" }
];

const ARSIV_SINIRI = 200;   // kaynak başına saklanan yazı

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

  return bloklar.slice(0, 25).map(b => {
    const baslik = temiz(etiket(b, "title"));
    const link = baglanti(b);
    const ozetHam = temiz(
      etiket(b, "description") || etiket(b, "summary") || etiket(b, "content")
    );
    return {
      id: kimlik(link || baslik),
      kaynak: kaynakAd,
      baslik,
      ozet: ozetHam.length > 190 ? ozetHam.slice(0, 190) + "…" : ozetHam,
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

  async function tek(k){
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
      console.log(`✗ ${k.ad} — ${e.message} (${eskiKayit.yazilar.length} eski yazi korundu)`);
    }
  }

  for (let i = 0; i < KAYNAKLAR.length; i += 5) {
    await Promise.all(KAYNAKLAR.slice(i, i + 5).map(tek));
  }

  fs.writeFileSync("akis.json", JSON.stringify(sonuc));
  const toplam = Object.values(sonuc.kaynaklar).reduce((n, k) => n + k.yazilar.length, 0);
  console.log(`\nakis.json yazıldı — ${toplam} yazı`);
})();
