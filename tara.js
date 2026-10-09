/* Türkan İdrak — kaynak tarayıcı
   GitHub'ın sunucusunda saatte bir çalışır, akis.json üretir.
   Hiçbir dış bağımlılığı yok, kurulum gerektirmez. */

const fs = require("fs");

const KAYNAKLAR = [
  /* ========== DÜŞÜNCE KURULUŞLARI ========== */
  { ad:"RAND",              tur:"kurum", url:"https://www.rand.org/pubs/new.xml" },
  { ad:"Chatham House",     tur:"kurum", url:"https://www.chathamhouse.org/path/whatsnew.xml" },
  { ad:"Crisis Group",      tur:"kurum", url:"https://www.crisisgroup.org/rss.xml" },
  { ad:"Brookings",         tur:"kurum", url:"https://news.google.com/rss/search?q=site:brookings.edu&hl=en-US&gl=US&ceid=US:en" },
  { ad:"AEI",               tur:"kurum", url:"https://news.google.com/rss/search?q=site:aei.org&hl=en-US&gl=US&ceid=US:en" },
  { ad:"New America",       tur:"kurum", url:"https://news.google.com/rss/search?q=site:newamerica.org&hl=en-US&gl=US&ceid=US:en" },
  { ad:"ECFR",              tur:"kurum", url:"https://news.google.com/rss/search?q=site:ecfr.eu&hl=en-US&gl=US&ceid=US:en" },
  { ad:"Bruegel",           tur:"kurum", url:"https://news.google.com/rss/search?q=site:bruegel.org&hl=en-US&gl=US&ceid=US:en" },
  { ad:"SWP Berlin",        tur:"kurum", url:"https://news.google.com/rss/search?q=site:swp-berlin.org&hl=en-US&gl=US&ceid=US:en" },
  { ad:"Elcano",            tur:"kurum", url:"https://news.google.com/rss/search?q=site:realinstitutoelcano.org&hl=en-US&gl=US&ceid=US:en" },
  { ad:"SETA",              tur:"kurum", url:"https://news.google.com/rss/search?q=site:setav.org&hl=tr&gl=TR&ceid=TR:tr" },
  { ad:"ORSAM",             tur:"kurum", url:"https://news.google.com/rss/search?q=site:orsam.org.tr&hl=tr&gl=TR&ceid=TR:tr" },
  { ad:"TRT World Rapor",   tur:"kurum", url:"https://researchcentre.trtworld.com/feed/" },
  { ad:"RIAC",              tur:"kurum", url:"https://news.google.com/rss/search?q=site:russiancouncil.ru&hl=en-US&gl=US&ceid=US:en" },
  { ad:"Valdai",            tur:"kurum", url:"https://news.google.com/rss/search?q=site:valdaiclub.com&hl=en-US&gl=US&ceid=US:en" },
  { ad:"ORF Hindistan",     tur:"kurum", url:"https://news.google.com/rss/search?q=site:orfonline.org&hl=en-US&gl=US&ceid=US:en" },
  { ad:"East Asia Forum",   tur:"kurum", url:"https://news.google.com/rss/search?q=site:eastasiaforum.org&hl=en-US&gl=US&ceid=US:en" },
  { ad:"Carnegie Ortadoğu", tur:"kurum", url:"https://news.google.com/rss/search?q=site:carnegieendowment.org&hl=en-US&gl=US&ceid=US:en" },
  { ad:"El Cezire Etüd",    tur:"kurum", url:"https://studies.aljazeera.net/en/rss.xml" },
  { ad:"ISS Afrika",        tur:"kurum", url:"https://news.google.com/rss/search?q=site:issafrica.org&hl=en-US&gl=US&ceid=US:en" },
  { ad:"Dünya Ekonomik Forumu", tur:"kurum", url:"https://news.google.com/rss/search?q=site:weforum.org&hl=en-US&gl=US&ceid=US:en" },

  /* ========== DERGİLER ========== */
  { ad:"Foreign Affairs",   tur:"dergi", url:"https://www.foreignaffairs.com/rss.xml" },
  { ad:"Foreign Policy",    tur:"dergi", url:"https://foreignpolicy.com/feed/" },
  { ad:"The Economist",     tur:"dergi", url:"https://news.google.com/rss/search?q=site:economist.com&hl=en-US&gl=US&ceid=US:en" },
  { ad:"Le Monde Diplomatique", tur:"dergi", url:"https://news.google.com/rss/search?q=site:mondediplo.com&hl=en-US&gl=US&ceid=US:en" },
  { ad:"Der Spiegel",       tur:"dergi", url:"https://www.spiegel.de/international/index.rss" },
  { ad:"The Atlantic",      tur:"dergi", url:"https://www.theatlantic.com/feed/all/" },
  { ad:"New Statesman",     tur:"dergi", url:"https://news.google.com/rss/search?q=site:newstatesman.com&hl=en-US&gl=US&ceid=US:en" },
  { ad:"Jacobin",           tur:"dergi", url:"https://jacobin.com/feed" },
  { ad:"The Diplomat",      tur:"dergi", url:"https://thediplomat.com/feed/" },
  { ad:"Nikkei Asia",       tur:"dergi", url:"https://news.google.com/rss/search?q=site:asia.nikkei.com&hl=en-US&gl=US&ceid=US:en" },
  { ad:"Caixin",            tur:"dergi", url:"https://news.google.com/rss/search?q=site:caixinglobal.com&hl=en-US&gl=US&ceid=US:en" },
  { ad:"Rest of World",     tur:"dergi", url:"https://restofworld.org/feed/latest" },
  { ad:"Americas Quarterly", tur:"dergi", url:"https://news.google.com/rss/search?q=site:americasquarterly.org&hl=en-US&gl=US&ceid=US:en" },
  { ad:"The Africa Report", tur:"dergi", url:"https://news.google.com/rss/search?q=site:theafricareport.com&hl=en-US&gl=US&ceid=US:en" },
  { ad:"+972 Magazine",     tur:"dergi", url:"https://www.972mag.com/feed/" },
  { ad:"Mada Masr",         tur:"dergi", url:"https://news.google.com/rss/search?q=site:madamasr.com&hl=en-US&gl=US&ceid=US:en" },

  /* ========== HABER AJANSLARI (araştırma ve yorum) ========== */
  { ad:"Reuters Araştırma", tur:"ajans", url:"https://news.google.com/rss/search?q=site:reuters.com/investigates&hl=en-US&gl=US&ceid=US:en" },
  { ad:"AP Araştırma",      tur:"ajans", url:"https://news.google.com/rss/search?q=site:apnews.com/hub/ap-investigations&hl=en-US&gl=US&ceid=US:en" },
  { ad:"AFP",               tur:"ajans", url:"https://news.google.com/rss/search?q=site:afp.com&hl=en-US&gl=US&ceid=US:en" },
  { ad:"El Cezire Dosya",   tur:"ajans", url:"https://www.aljazeera.com/xml/rss/all.xml" },
  { ad:"BBC Derinlemesine", tur:"ajans", url:"https://news.google.com/rss/search?q=site:bbc.com/news/articles&hl=en-US&gl=US&ceid=US:en" },
  { ad:"AA Analiz",         tur:"ajans", url:"https://www.aa.com.tr/tr/rss/default?cat=analiz" },
  { ad:"IPS Küresel Güney", tur:"ajans", url:"https://www.ipsnews.net/feed/" },
  { ad:"TASS",              tur:"ajans", url:"https://news.google.com/rss/search?q=site:tass.com&hl=en-US&gl=US&ceid=US:en" }
];

const ARSIV_SINIRI = 120;   // kaynak başına saklanan yazı

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

function gorselBul(b) {
  const aday = [
    /<media:content[^>]+url=["']([^"']+)["']/i,
    /<media:thumbnail[^>]+url=["']([^"']+)["']/i,
    /<enclosure[^>]+url=["']([^"']+)["'][^>]*type=["']image/i,
    /<enclosure[^>]+type=["']image[^>]*url=["']([^"']+)["']/i,
    /<image[^>]*>\s*<url>([^<]+)<\/url>/i
  ];
  for (const r of aday) {
    const m = b.match(r);
    if (m && m[1]) { const u = temizUrl(m[1]); if (u) return u; }
  }
  const icerik = coz(etiket(b, "content:encoded") || etiket(b, "description") || etiket(b, "summary"));
  const img = icerik.match(/<img[^>]+src=["']([^"']+)["']/i);
  return img ? temizUrl(img[1]) : "";
}

function temizUrl(u) {
  u = coz(u).trim();
  if (!/^https:\/\//i.test(u)) return "";                  // karisik icerik olmasin
  if (/1x1|pixel|tracking|spacer|blank\.(gif|png)/i.test(u)) return "";
  if (!/\.(jpe?g|png|webp|gif|avif)(\?|$)/i.test(u) && !/image|img|photo|media/i.test(u)) return "";
  return u.length > 400 ? "" : u;
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
    let yazar = temiz(etiket(b, "dc:creator") || etiket(b, "author") || etiket(b, "creator")
                   || etiket(b, "itunes:author") || etiket(b, "media:credit"));
    const ad = yazar.match(/<name[^>]*>([\s\S]*?)<\/name>/i);   // Atom
    if (ad) yazar = temiz(ad[1]);
    yazar = yazar.replace(/\s*\([^)]*\)\s*$/, "").replace(/^[^@\s]+@[^\s]+\s*/, "").trim();
    if (yazar.length > 70) yazar = "";
    // Google Haberler basliga " - Yayin Adi" ekler; kaynak zaten gosterildigi icin temizle
    const kaynakEt = temiz(etiket(b, "source"));
    let bas = baslik;
    if (kaynakEt && bas.endsWith(" - " + kaynakEt)) bas = bas.slice(0, -(kaynakEt.length + 3)).trim();
    else bas = bas.replace(/\s+-\s+[^-]{2,40}$/, (m) => (/\d/.test(m) ? m : "")).trim() || baslik;

    return {
      id: kimlik(link || bas),
      kaynak: kaynakAd,
      baslik: bas,
      ozet: ozetHam.length > 190 ? ozetHam.slice(0, 190) + "…" : ozetHam,
      yazar,
      gorsel: gorselBul(b),
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
        durum: "tamam",
        tur: k.tur
      };
      console.log(`✓ ${k.ad} — ${yeni.length} yeni, toplam ${birlesik.length}`);
    } catch (e) {
      sonuc.kaynaklar[k.ad] = {
        yazilar: eskiKayit.yazilar,
        tarandi: eskiKayit.tarandi || null,
        durum: "hata: " + e.message,
        tur: k.tur
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
