/* Türkan İdrak — kaynak tarayıcı
   GitHub'ın sunucusunda saatte bir çalışır, akis.json üretir.
   Hiçbir dış bağımlılığı yok, kurulum gerektirmez. */

const fs = require("fs");

const KAYNAKLAR = [
  /* ===================== DÜŞÜNCE KURULUŞLARI =====================
     ✓ = besleme adresi kurumun kendi sitesinden veya RSS dizininden doğrulandı
     G = kurum besleme vermiyor, Google Haberler üzerinden                      */

  // -- Kuzey Amerika --
  { ad:"RAND", ulke:"ABD",               tur:"kurum", ulke:"ABD", kimlik:"bağımsız", url:"https://www.rand.org/pubs/new.xml" },                        // ✓
  { ad:"FPRI", ulke:"ABD",               tur:"kurum", ulke:"ABD", kimlik:"bağımsız", url:"https://news.google.com/rss/search?q=site:fpri.org+when:120d&hl=en-US&gl=US&ceid=US:en" },                               // ✓
  { ad:"War on the Rocks", ulke:"ABD",   tur:"kurum", ulke:"ABD", kimlik:"bağımsız", url:"https://warontherocks.com/feed/" },                          // ✓
  { ad:"National Interest", ulke:"ABD",  tur:"kurum", ulke:"ABD", kimlik:"bağımsız", url:"https://nationalinterest.org/feed" },                        // ✓
  { ad:"Long War Journal", ulke:"ABD",   tur:"kurum", ulke:"ABD", kimlik:"bağımsız", url:"https://www.longwarjournal.org/feed" },                      // ✓
  { ad:"Cipher Brief", ulke:"ABD",       tur:"kurum", ulke:"ABD", kimlik:"bağımsız", url:"https://www.thecipherbrief.com/feeds/feed.rss" },            // ✓
  { ad:"Foreign Policy In Focus", ulke:"ABD", tur:"kurum", ulke:"ABD", kimlik:"bağımsız", url:"https://fpif.org/feed/" },                              // ✓
  { ad:"Brookings", ulke:"ABD",          tur:"kurum", ulke:"ABD", kimlik:"bağımsız", url:"https://news.google.com/rss/search?q=site:brookings.edu+when:120d&hl=en-US&gl=US&ceid=US:en" },                                    // G
  { ad:"AEI", ulke:"ABD",                tur:"kurum", ulke:"ABD", kimlik:"bağımsız", url:"https://news.google.com/rss/search?q=site:aei.org+when:120d&hl=en-US&gl=US&ceid=US:en" },                                          // G
  { ad:"Carnegie", ulke:"ABD",           tur:"kurum", ulke:"ABD", kimlik:"bağımsız", url:"https://news.google.com/rss/search?q=site:carnegieendowment.org+when:120d&hl=en-US&gl=US&ceid=US:en" },                            // G
  { ad:"CIPS Kanada", ulke:"Kanada",        tur:"kurum", ulke:"Kanada", kimlik:"üniversite", url:"https://www.cips-cepi.ca/feed/" },                           // ✓

  // -- Avrupa --
  { ad:"Chatham House", ulke:"İngiltere",      tur:"kurum", ulke:"İngiltere", kimlik:"bağımsız", url:"https://www.chathamhouse.org/path/whatsnew.xml" },           // ✓
  { ad:"Crisis Group", ulke:"Belçika",       tur:"kurum", ulke:"Belçika", kimlik:"bağımsız", url:"https://www.crisisgroup.org/rss" },                          // ✓
  { ad:"ECFR", ulke:"Avrupa",               tur:"kurum", ulke:"Avrupa", kimlik:"bağımsız", url:"https://news.google.com/rss/search?q=site:ecfr.eu+when:120d&hl=en-US&gl=US&ceid=US:en" },                                    // ✓
  { ad:"Foreign Policy Centre", ulke:"İngiltere", tur:"kurum", ulke:"İngiltere", kimlik:"bağımsız", url:"https://fpc.org.uk/feed/" },                              // ✓
  { ad:"Berlin Policy Journal", ulke:"Almanya", tur:"kurum", ulke:"Almanya", kimlik:"bağımsız", url:"https://news.google.com/rss/search?q=site:berlinpolicyjournal.com+when:120d&hl=en-US&gl=US&ceid=US:en" },                 // ✓
  { ad:"Bruegel", ulke:"Belçika",            tur:"kurum", ulke:"Belçika", kimlik:"bağımsız", url:"https://news.google.com/rss/search?q=site:bruegel.org+when:120d&hl=en-US&gl=US&ceid=US:en" },                                      // G
  { ad:"SWP Berlin", ulke:"Almanya", nitelik:"devlet fonlu",         tur:"kurum", ulke:"Almanya", kimlik:"devlet destekli", url:"https://news.google.com/rss/search?q=site:swp-berlin.org+when:120d&hl=en-US&gl=US&ceid=US:en" },                                   // G
  { ad:"Elcano", ulke:"İspanya",             tur:"kurum", ulke:"İspanya", kimlik:"bağımsız", url:"https://news.google.com/rss/search?q=site:realinstitutoelcano.org+when:120d&hl=en-US&gl=US&ceid=US:en" },                          // G

  // -- Türkiye --
  { ad:"SETA", ulke:"Türkiye",               tur:"kurum", ulke:"Türkiye", kimlik:"bağımsız", url:"https://news.google.com/rss/search?q=site:setav.org+when:120d&hl=tr&gl=TR&ceid=TR:tr" },                                  // G
  { ad:"ORSAM", ulke:"Türkiye",              tur:"kurum", ulke:"Türkiye", kimlik:"bağımsız", url:"https://news.google.com/rss/search?q=site:orsam.org.tr+when:120d&hl=tr&gl=TR&ceid=TR:tr" },                               // G
  { ad:"TRT World Rapor", ulke:"Türkiye", nitelik:"devlet",    tur:"kurum", ulke:"Türkiye", kimlik:"kamu yayıncısı", url:"https://researchcentre.trtworld.com/feed/" },

  // -- Rusya ve Avrasya --
  { ad:"RIAC", ulke:"Rusya", nitelik:"devlet bağlantılı",               tur:"kurum", ulke:"Rusya", kimlik:"devlet destekli", url:"https://news.google.com/rss/search?q=site:russiancouncil.ru+when:120d&hl=en-US&gl=US&ceid=US:en" },                                // G
  { ad:"Valdai", ulke:"Rusya", nitelik:"devlet bağlantılı",             tur:"kurum", ulke:"Rusya", kimlik:"devlet destekli", url:"https://news.google.com/rss/search?q=site:valdaiclub.com+when:120d&hl=en-US&gl=US&ceid=US:en" },                                   // G

  // -- Asya --
  { ad:"ORF Hindistan", ulke:"Hindistan",      tur:"kurum", ulke:"Hindistan", kimlik:"bağımsız", url:"https://news.google.com/rss/search?q=site:orfonline.org+when:120d&hl=en-US&gl=US&ceid=US:en" },                                    // G
  { ad:"East Asia Forum", ulke:"Avustralya",    tur:"kurum", ulke:"Avustralya", kimlik:"üniversite", url:"https://news.google.com/rss/search?q=site:eastasiaforum.org+when:120d&hl=en-US&gl=US&ceid=US:en" },                                // G

  // -- Ortadoğu --
  { ad:"El Cezire Etüd", ulke:"Katar", nitelik:"devlet fonlu",     tur:"kurum", ulke:"Katar", kimlik:"devlet destekli", url:"https://studies.aljazeera.net/en/rss.xml" },

  // -- Afrika --
  { ad:"SAIIA Güney Afrika", ulke:"Güney Afrika", tur:"kurum", ulke:"Güney Afrika", kimlik:"bağımsız", url:"https://saiia.org.za/thematic-area/foreign-policy/feed/" },  // ✓
  { ad:"ISS Afrika", ulke:"Güney Afrika",         tur:"kurum", ulke:"Güney Afrika", kimlik:"bağımsız", url:"https://news.google.com/rss/search?q=site:issafrica.org+when:120d&hl=en-US&gl=US&ceid=US:en" },                                    // G

  // -- Küresel --
  { ad:"Dünya Ekonomik Forumu", ulke:"İsviçre", tur:"kurum", ulke:"İsviçre", kimlik:"vakıf", url:"https://news.google.com/rss/search?q=site:weforum.org+when:120d&hl=en-US&gl=US&ceid=US:en" },                                   // G

  /* ===================== DERGİLER ===================== */
  { ad:"Foreign Affairs", ulke:"ABD",    tur:"dergi", ulke:"ABD", kimlik:"bağımsız", url:"https://www.foreignaffairs.com/rss.xml" },                   // ✓
  { ad:"Foreign Policy", ulke:"ABD",     tur:"dergi", ulke:"ABD", kimlik:"özel", url:"https://foreignpolicy.com/feed/" },                          // ✓
  { ad:"World Politics Review", ulke:"ABD", tur:"dergi", ulke:"ABD", kimlik:"özel", url:"https://www.worldpoliticsreview.com/feed/" },             // ✓
  { ad:"Der Spiegel", ulke:"Almanya",        tur:"dergi", ulke:"Almanya", kimlik:"özel", url:"https://www.spiegel.de/international/index.rss" },           // ✓
  { ad:"The Nation", ulke:"ABD",         tur:"dergi", ulke:"ABD", kimlik:"bağımsız", url:"https://www.thenation.com/subject/foreign-policy/feed/" },   // ✓
  { ad:"Rest of World", ulke:"ABD",      tur:"dergi", ulke:"ABD", kimlik:"vakıf", url:"https://restofworld.org/feed/latest/" },                     // ✓
  { ad:"MIT Teknoloji", ulke:"ABD",      tur:"dergi", ulke:"ABD", kimlik:"üniversite", url:"https://www.technologyreview.com/feed" },                    // ✓
  { ad:"Yale E360", ulke:"ABD",          tur:"dergi", ulke:"ABD", kimlik:"üniversite", url:"https://e360.yale.edu/feed.xml" },                           // ✓
  { ad:"Americas Quarterly", ulke:"ABD", tur:"dergi", ulke:"ABD", kimlik:"bağımsız", url:"https://news.google.com/rss/search?q=site:americasquarterly.org+when:120d&hl=en-US&gl=US&ceid=US:en" },                  // ✓
  { ad:"Asia Times", ulke:"Hong Kong",         tur:"dergi", ulke:"Hong Kong", kimlik:"özel", url:"https://asiatimes.com/category/world/feed/" },               // ✓
  { ad:"The Diplomat", ulke:"ABD",       tur:"dergi", ulke:"ABD", kimlik:"özel", url:"https://thediplomat.com/feed/" },
  { ad:"Jacobin", ulke:"ABD",            tur:"dergi", ulke:"ABD", kimlik:"bağımsız", url:"https://jacobin.com/feed" },
  { ad:"+972 Magazine", ulke:"Yafa",      tur:"dergi", ulke:"Yafa", kimlik:"bağımsız", url:"https://news.google.com/rss/search?q=site:972mag.com+when:120d&hl=en-US&gl=US&ceid=US:en" },
  { ad:"The Economist", ulke:"İngiltere",      tur:"dergi", ulke:"İngiltere", kimlik:"özel", url:"https://news.google.com/rss/search?q=site:economist.com+when:120d&hl=en-US&gl=US&ceid=US:en" },                                    // G
  { ad:"Le Monde Diplomatique", ulke:"Fransa", tur:"dergi", ulke:"Fransa", kimlik:"bağımsız", url:"https://news.google.com/rss/search?q=site:mondediplo.com+when:120d&hl=en-US&gl=US&ceid=US:en" },                                // G
  { ad:"Caixin", ulke:"Çin",             tur:"dergi", ulke:"Çin", kimlik:"özel", url:"https://news.google.com/rss/search?q=site:caixinglobal.com+when:120d&hl=en-US&gl=US&ceid=US:en" },                                 // G
  { ad:"Nikkei Asia", ulke:"Japonya",        tur:"dergi", ulke:"Japonya", kimlik:"özel", url:"https://news.google.com/rss/search?q=site:asia.nikkei.com+when:120d&hl=en-US&gl=US&ceid=US:en" },                                  // G

  /* ===================== HABER AJANSLARI ===================== */
  { ad:"El Cezire Dosya", ulke:"Katar", nitelik:"devlet fonlu",          tur:"ajans", ulke:"Katar", kimlik:"devlet destekli", url:"https://news.google.com/rss/search?q=site:aljazeera.com/features+when:120d&hl=en-US&gl=US&ceid=US:en" },                // ✓
  { ad:"BBC Dünya", ulke:"İngiltere", nitelik:"kamu",          tur:"ajans", ulke:"İngiltere", kimlik:"kamu yayıncısı", url:"https://feeds.bbci.co.uk/news/world/rss.xml" },              // ✓
  { ad:"Deutsche Welle", ulke:"Almanya", nitelik:"devlet",     tur:"ajans", ulke:"Almanya", kimlik:"kamu yayıncısı", url:"https://rss.dw.com/rdf/rss-en-top" },                        // ✓
  { ad:"France 24", ulke:"Fransa", nitelik:"devlet",          tur:"ajans", ulke:"Fransa", kimlik:"kamu yayıncısı", url:"https://www.france24.com/en/rss" },                          // ✓
  { ad:"Le Monde", ulke:"Fransa",           tur:"ajans", ulke:"Fransa", kimlik:"özel", url:"https://www.lemonde.fr/en/international/rss_full.xml" },     // ✓
  { ad:"The Guardian", ulke:"İngiltere",       tur:"ajans", ulke:"İngiltere", kimlik:"vakıf", url:"https://www.theguardian.com/world/rss" },                    // ✓
  { ad:"IPS Küresel Güney", ulke:"Küresel",  tur:"ajans", ulke:"Uluslararası", kimlik:"bağımsız", url:"https://www.ipsnews.net/news/regional-categories/global/feed/" }, // ✓
  { ad:"Telesur", ulke:"Venezuela", nitelik:"devlet",            tur:"ajans", ulke:"Venezuela", kimlik:"devlet", url:"https://news.google.com/rss/search?q=site:telesurenglish.net+when:120d&hl=en-US&gl=US&ceid=US:en" },                       // ✓
  { ad:"MercoPress", ulke:"Uruguay",         tur:"ajans", ulke:"Uruguay", kimlik:"özel", url:"https://en.mercopress.com/rss/" },                           // ✓
  { ad:"Colombia Reports", ulke:"Kolombiya",   tur:"ajans", ulke:"Kolombiya", kimlik:"bağımsız", url:"https://colombiareports.com/feed/" },                        // ✓
  { ad:"Daily Maverick", ulke:"Güney Afrika",     tur:"ajans", ulke:"Güney Afrika", kimlik:"bağımsız", url:"https://www.dailymaverick.co.za/rss" },                      // ✓
  { ad:"Morocco World News", ulke:"Fas", tur:"ajans", ulke:"Fas", kimlik:"özel", url:"https://news.google.com/rss/search?q=site:moroccoworldnews.com+when:120d&hl=en-US&gl=US&ceid=US:en" },     // ✓
  { ad:"Arab News", ulke:"Suudi Arabistan", nitelik:"devlet yakını",          tur:"ajans", ulke:"Suudi Arabistan", kimlik:"özel", url:"https://www.arabnews.com/rss.xml" },                         // ✓
  { ad:"SCMP", ulke:"Hong Kong",               tur:"ajans", ulke:"Hong Kong", kimlik:"özel", url:"https://www.scmp.com/rss/91/feed/" },                        // ✓
  { ad:"The Hindu", ulke:"Hindistan",          tur:"ajans", ulke:"Hindistan", kimlik:"özel", url:"https://www.thehindu.com/news/international/feeder/default.rss" }, // ✓
  { ad:"ThePrint", ulke:"Hindistan",           tur:"ajans", ulke:"Hindistan", kimlik:"özel", url:"https://theprint.in/category/world/feed/" },                 // ✓
  { ad:"Japan Times", ulke:"Japonya",        tur:"ajans", ulke:"Japonya", kimlik:"özel", url:"https://www.japantimes.co.jp/feed/" },                       // ✓
  { ad:"Balkan Insight", ulke:"Balkanlar",     tur:"ajans", ulke:"Balkanlar", kimlik:"bağımsız", url:"https://balkaninsight.com/feed/" },                          // ✓
  { ad:"Euractiv", ulke:"Avrupa",           tur:"ajans", ulke:"Belçika", kimlik:"özel", url:"https://news.google.com/rss/search?q=site:euractiv.com+when:120d&hl=en-US&gl=US&ceid=US:en" },                            // ✓
  { ad:"RT", ulke:"Rusya", nitelik:"devlet",                 tur:"ajans", ulke:"Rusya", kimlik:"devlet", url:"https://www.rt.com/rss/news/" },                             // ✓
  { ad:"ProPublica", ulke:"ABD",         tur:"ajans", ulke:"ABD", kimlik:"vakıf", url:"https://www.propublica.org/feeds/propublica/main" },         // ✓
  { ad:"Christian Sci. Monitor", ulke:"ABD", tur:"ajans", ulke:"ABD", kimlik:"bağımsız", url:"https://rss.csmonitor.com/feeds/world" },                // ✓
  { ad:"Mongabay", ulke:"ABD",           tur:"ajans", ulke:"ABD", kimlik:"vakıf", url:"https://news.mongabay.com/feed" },                           // ✓
  { ad:"Gazete Oksijen", ulke:"Türkiye",                tur:"ajans", url:"https://news.google.com/rss/search?q=site:gazeteoksijen.com+when:120d&hl=tr&gl=TR&ceid=TR:tr" },
  { ad:"Haaretz",        ulke:"Yafa",                  tur:"ajans", url:"https://news.google.com/rss/search?q=site:haaretz.com+when:120d&hl=en-US&gl=US&ceid=US:en" },
  { ad:"AA Analiz", ulke:"Türkiye", nitelik:"devlet",          tur:"ajans", ulke:"Türkiye", kimlik:"kamu", url:"https://www.aa.com.tr/tr/rss/default?cat=analiz" }
];

const ARSIV_SINIRI = 70;
const EN_ESKI_GUN  = 900;   // ~2,5 yildan eski yazi alinmaz

/* RSS tarihleri "Mon, 15 Mar 2010 10:00:00 +0000" (RFC 822) ya da
   "2026-10-11T08:00:00Z" (ISO) olabilir; ikisini de dogru oku. */
function tarihOku(x) {
  if (!x) return null;
  let d = new Date(x);
  if (!isNaN(d)) return d;
  d = new Date(String(x).trim().replace(" ", "T"));
  return isNaN(d) ? null : d;
}

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

/* Kisa haber, canli blog, video, galeri gibi icerikler akisa girmesin;
   bize makale ve arastirma dosyasi lazim. */
const ELENEN_YOLLAR = /\/(liveblog|live-?updates?|live|videos?|galler(y|ies)|in-pictures|pictures|podcasts?|programme?s?|audio|sports?|weather|news-?feed|briefing|minute-by-minute)(\/|$|\?)/i;

function yolElendi(link){
  if(!link) return false;
  try { return ELENEN_YOLLAR.test(new URL(link).pathname); }
  catch(e){ return ELENEN_YOLLAR.test(link); }
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
  if (!/\.(jpe?g|png|webp|gif|avif)(\?|$)/i.test(u)
      && !/image|img|photo|media|cdn|thumb|asset|upload|static/i.test(u)) return "";
  return u.length > 400 ? "" : u;
}

function ayikla(xml, kaynakAd) {
  let bloklar = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) || [];
  if (!bloklar.length) bloklar = xml.match(/<entry[\s>][\s\S]*?<\/entry>/gi) || [];
  if (!bloklar.length) throw new Error("beslemede yazı yok");

  return bloklar.slice(0, 20).map(b => {
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
  }).filter(y => {
    if (!y.baslik) return false;
    if (yolElendi(y.link)) return false;              // kisa haber / canli / video
    if (!y.tarih) return true;                       // tarihi yoksa eleme
    const d = tarihOku(y.tarih);
    if (!d) return true;
    const gun = (Date.now() - d.getTime()) / 86400000;
    return gun <= EN_ESKI_GUN && gun > -2;            // gelecek tarihli de alma
  });
}

async function sayfadanGorsel(url) {
  if (!url) return "";
  try {
    const c = await fetch(url, {
      signal: AbortSignal.timeout(9000),
      redirect: "follow",
      headers: {
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        "accept": "text/html,application/xhtml+xml"
      }
    });
    if (!c.ok) return "";
    const bas = (await c.text()).slice(0, 80000);      // head bolumu yeter
    const kaliplar = [
      /<meta[^>]+property=["']og:image(?::url)?["'][^>]*content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]*property=["']og:image(?::url)?["']/i,
      /<meta[^>]+name=["']twitter:image(?::src)?["'][^>]*content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]*name=["']twitter:image/i,
      /<link[^>]+rel=["']image_src["'][^>]*href=["']([^"']+)["']/i
    ];
    for (const r of kaliplar) {
      const m = bas.match(r);
      if (m && m[1]) { const u = temizUrl(m[1]); if (u) return u; }
    }
    return "";
  } catch (e) { return ""; }
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

      // beslemede gorsel yoksa makalenin kendi sayfasindan dene
      const eksik = yeni.filter(y => !y.gorsel && y.link).slice(0, 12);
      if (eksik.length) {
        for (let i = 0; i < eksik.length; i += 4) {
          await Promise.all(eksik.slice(i, i + 4).map(async y => {
            y.gorsel = await sayfadanGorsel(y.link);
          }));
        }
      }

      const gelenler = new Set(yeni.map(y => y.id));
      const birlesik = yeni.concat(eskiKayit.yazilar.filter(y => !gelenler.has(y.id)));
      sonuc.kaynaklar[k.ad] = {
        yazilar: birlesik.slice(0, ARSIV_SINIRI),
        tarandi: new Date().toISOString(),
        durum: "tamam",
        tur: k.tur, ulke: k.ulke || "", nitelik: k.nitelik || "", ulke: k.ulke, kimlik: k.kimlik
      };
      console.log(`✓ ${k.ad} — ${yeni.length} yeni, toplam ${birlesik.length}`);
    } catch (e) {
      sonuc.kaynaklar[k.ad] = {
        yazilar: eskiKayit.yazilar,
        tarandi: eskiKayit.tarandi || null,
        durum: "hata: " + e.message,
        tur: k.tur, ulke: k.ulke || "", nitelik: k.nitelik || "", ulke: k.ulke, kimlik: k.kimlik
      };
      console.log(`✗ ${k.ad} — ${e.message} (${eskiKayit.yazilar.length} eski yazi korundu)`);
    }
  }

  for (let i = 0; i < KAYNAKLAR.length; i += 8) {
    await Promise.all(KAYNAKLAR.slice(i, i + 8).map(tek));
  }

  fs.writeFileSync("akis.json", JSON.stringify(sonuc));
  const toplam = Object.values(sonuc.kaynaklar).reduce((n, k) => n + k.yazilar.length, 0);
  console.log(`\nakis.json yazıldı — ${toplam} yazı`);
})();
