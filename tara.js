/* Türkan İdrak Tefekkür — kaynak tarayıcı
   GitHub'ın sunucusunda saatte bir çalışır. Ürettikleri:
     akis.json          bütün yazılar (orijinal dilleriyle; çeviriyi okur kendi cihazında ister)
     y/<kod>/index.html her yazının paylaşım sayfası (önizleme kartı + İdrak'a yönlendirme)
     sitemap.xml, robots.txt, .nojekyll, tefekkur.json (yoksa)
   Hiçbir dış bağımlılığı yok, kurulum gerektirmez. */

const fs = require("fs");
const crypto = require("crypto");

const KAYNAKLAR = [
  /* ===================== DÜŞÜNCE KURULUŞLARI =====================
     ✓ = besleme adresi kurumun kendi sitesinden veya RSS dizininden doğrulandı
     G = kurum besleme vermiyor, Google Haberler üzerinden                      */

  // -- Kuzey Amerika --
  { ad:"RAND", ulke:"ABD",               tur:"kurum", ulke:"ABD", kimlik:"bağımsız", url:"https://www.rand.org/pubs/new.xml" },                        // ✓
  { ad:"FPRI", ulke:"ABD",               tur:"kurum", ulke:"ABD", kimlik:"bağımsız", url:"https://news.google.com/rss/search?q=site:fpri.org+when:120d&hl=en-US&gl=US&ceid=US:en" },                               // ✓
  { ad:"War on the Rocks", ulke:"ABD",   tur:"kurum", ulke:"ABD", kimlik:"bağımsız", url:"https://warontherocks.com/feed/" },                          // ✓
  { ad:"National Interest", ulke:"ABD",  tur:"kurum", ulke:"ABD", kimlik:"bağımsız", url:"https://nationalinterest.org/feed",
    yedek:"https://news.google.com/rss/search?q=site:nationalinterest.org+when:120d&hl=en-US&gl=US&ceid=US:en" },   // ✓ kendi beslemesi zaman zaman 403 veriyor; o zaman yedek yol
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
  // Berlin Policy Journal 2020'de kapandı; DGAP yerine Internationale Politik Quarterly'yi çıkarıyor
  { ad:"IPQ Berlin", ulke:"Almanya", tur:"dergi", ulke:"Almanya", kimlik:"bağımsız", url:"https://news.google.com/rss/search?q=site:ip-quarterly.com+when:120d&hl=en-US&gl=US&ceid=US:en" },   // G
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
const TARAYICI = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

/* ---------- site adresi ----------
   Özel alan adı bağlanınca GitHub depoya CNAME dosyası koyar. O andan
   itibaren bütün paylaşım bağlantıları kendiliğinden yeni adrese geçer. */
const PAGES_ADRESI = "https://zgrcsknkmngl.github.io/turkan-idrak/";
function tabanAdres() {
  try {
    const c = fs.readFileSync("CNAME", "utf8").trim().replace(/^https?:\/\//, "").replace(/\/+$/, "");
    if (c) return "https://" + c + "/";
  } catch (e) { /* CNAME yok: GitHub adresi */ }
  return PAGES_ADRESI;
}
const TABAN = tabanAdres();
const AD = "Türkan İdrak Tefekkür";

/* Paylaşım kodu: yazının bağlantısından türetilen 12 haneli sabit kod.
   Aynı yazı her taramada aynı kodu alır; paylaşılan bağlantı hiç değişmez. */
function payKodu(y) {
  return crypto.createHash("sha1").update(String(y.link || y.baslik || y.id)).digest("hex").slice(0, 12);
}
const zaman = y => { const d = tarihOku(y.tarih); return d ? d.getTime() : 0; };
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

/* Kaynağın kendi adresi düşerse (403 vb.) yedek adresi dene */
async function cekYedekli(k) {
  try {
    return { yazilar: await cek(k), yol: "asıl" };
  } catch (e) {
    if (!k.yedek) throw e;
    try {
      return { yazilar: await cek({ ...k, url: k.yedek }), yol: "yedek" };
    } catch (e2) {
      throw new Error(e.message + " · yedek yol: " + e2.message);
    }
  }
}

/* ---------- paylaşım sayfaları ----------
   Bluesky, WhatsApp, X, Telegram gibi uygulamalar bir bağlantının önizleme
   kartını çıkarırken sayfadaki uygulamayı çalıştırmaz, sadece sayfanın
   başındaki etiketleri okur. Bu yüzden her yazının kendine ait küçük bir
   sayfası var: etiketler kartı bizim adımızla doldurur, sayfaya gelen insan
   ise anında İdrak'a, o yazının üstüne yönlenir. Sayfalar silinmez; yazı
   akıştan düşse de paylaşılmış bağlantı çalışmaya devam eder. */
function kacis(x) {
  return String(x || "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function kisalt(x, n) {
  x = String(x || "").replace(/\s+/g, " ").trim();
  if (x.length <= n) return x;
  return x.slice(0, n - 1).replace(/\s+\S*$/, "") + "…";
}

function paylasimSayfasi(y, bilgi) {
  const baslik = y.baslik;
  const ozet = y.ozet || "";
  const adres = TABAN + "y/" + y.pay + "/";
  const kimlikSatiri = [bilgi.ulke, bilgi.nitelik || bilgi.kimlik].filter(Boolean).join(" · ");
  const aciklama = kisalt(y.kaynak + " · " + AD + (ozet ? " — " + ozet : ""), 200);
  // Yazi akistan dustugunde de uygulamanin gosterebilmesi icin kisa kopya
  const kopya = { id: y.id, pay: y.pay, kaynak: y.kaynak, baslik: y.baslik, ozet: ozet, yazar: y.yazar || "",
                  gorsel: y.gorsel || "", link: y.link, tarih: y.tarih || "", kb: bilgi };
  const veri = JSON.stringify(kopya).replace(/</g, "\\u003c");
  return `<!DOCTYPE html>
<html><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${kacis(baslik)} · ${kacis(y.kaynak)} · ${AD}</title>
<meta name="robots" content="noindex, follow">
<link rel="canonical" href="${adres}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="${AD}">
<meta property="og:title" content="${kacis(baslik)}">
<meta property="og:description" content="${kacis(aciklama)}">
<meta property="og:url" content="${adres}">
<meta property="og:image" content="${TABAN}paylas.png">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#0B1420">
<style>body{margin:0;background:#0B1420;color:#E9E1D0;font:17px/1.5 Georgia,serif}main{max-width:640px;margin:0 auto;padding:44px 22px}p{margin:0 0 12px}.k{font:600 12px sans-serif;letter-spacing:.06em;color:#E0343A}h1{font-weight:500;font-size:24px;line-height:1.3;margin:0 0 20px}a{color:#3F91E4}</style>
</head><body><main>
<p class="k">${kacis(y.kaynak)}${kimlikSatiri ? " · " + kacis(kimlikSatiri) : ""}</p>
<h1>${kacis(baslik)}</h1>
<p><a href="../../?y=${y.pay}">${AD} ↗</a> &nbsp; <a href="${kacis(y.link)}" rel="noopener">${kacis(y.kaynak)} ↗</a></p>
</main>
<script type="application/json" id="veri">${veri}</script>
<script>try{sessionStorage.setItem("ti.paylasilan",document.getElementById("veri").textContent)}catch(e){}location.replace("../../?y=${y.pay}")</script>
</body></html>
`;
}

function paylasimSayfalariniYaz(sonuc) {
  let yeni = 0, guncel = 0;
  for (const k of Object.values(sonuc.kaynaklar)) {
    const bilgi = { ulke: k.ulke || "", nitelik: k.nitelik || "", kimlik: k.kimlik || "", tur: k.tur || "" };
    for (const y of k.yazilar) {
      if (!y.pay || !y.link) continue;
      const klasor = "y/" + y.pay;
      const dosya = klasor + "/index.html";
      const icerik = paylasimSayfasi(y, bilgi);
      let eski = null;
      try { eski = fs.readFileSync(dosya, "utf8"); } catch (e) { /* yeni */ }
      if (eski === icerik) continue;
      fs.mkdirSync(klasor, { recursive: true });
      fs.writeFileSync(dosya, icerik);
      if (eski === null) yeni++; else guncel++;
    }
  }
  console.log(`paylaşım sayfaları: ${yeni} yeni, ${guncel} güncellendi`);
}

/* ---------- site dosyaları ---------- */
function degistiyseYaz(dosya, icerik) {
  let eski = null;
  try { eski = fs.readFileSync(dosya, "utf8"); } catch (e) { /* yok */ }
  if (eski !== icerik) { fs.writeFileSync(dosya, icerik); return true; }
  return false;
}

function siteDosyalari(oncekiTaban) {
  // GitHub Pages dosyaları olduğu gibi yayımlasın (.well-known klasörü için de şart)
  if (!fs.existsSync(".nojekyll")) fs.writeFileSync(".nojekyll", "");
  if (!fs.existsSync("tefekkur.json")) fs.writeFileSync("tefekkur.json", "[]\n");

  // Adres değiştiyse sayfalardaki tam adresleri yeni adrese çevir
  for (const dosya of ["index.html", "hakkinda.html", "gizlilik.html"]) {
    let m;
    try { m = fs.readFileSync(dosya, "utf8"); } catch (e) { continue; }
    let y = m;
    for (const eski of new Set([oncekiTaban, PAGES_ADRESI])) {
      if (eski && eski !== TABAN) y = y.split(eski).join(TABAN);
    }
    if (y !== m) { fs.writeFileSync(dosya, y); console.log(`${dosya}: adresler ${TABAN} olarak güncellendi`); }
  }

  // Site haritası: ana sayfa, Hakkında, Gizlilik ve Tefekkür yazıları
  let tef = [];
  try { tef = JSON.parse(fs.readFileSync("tefekkur.json", "utf8")); } catch (e) { tef = []; }
  const bugun = new Date().toISOString().slice(0, 10);
  const adresler = [[TABAN, bugun], [TABAN + "hakkinda.html", ""], [TABAN + "gizlilik.html", ""]]
    .concat((Array.isArray(tef) ? tef : []).filter(t => t && t.yol)
      .map(t => [TABAN + String(t.yol).replace(/^\/+/, ""), String(t.tarih || "").slice(0, 10)]));
  degistiyseYaz("sitemap.xml",
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    + adresler.map(([u, l]) => `  <url><loc>${kacis(u)}</loc>${l ? `<lastmod>${l}</lastmod>` : ""}</url>`).join("\n")
    + "\n</urlset>\n");
  degistiyseYaz("robots.txt", `User-agent: *\nAllow: /\n\nSitemap: ${TABAN}sitemap.xml\n`);
}

/* ---------- ana akış ---------- */

(async () => {
  let onceki = { kaynaklar: {} };
  try {
    onceki = JSON.parse(fs.readFileSync("akis.json", "utf8"));
    if (!onceki.kaynaklar) onceki = { kaynaklar: {} };
  } catch (e) { /* ilk çalışma */ }

  const sonuc = { guncellendi: new Date().toISOString(), taban: TABAN, kaynaklar: {} };

  async function tek(k){
    const eskiKayit = onceki.kaynaklar[k.ad] || { yazilar: [] };
    const kimlikBilgisi = { tur: k.tur, ulke: k.ulke || "", nitelik: k.nitelik || "", kimlik: k.kimlik || "" };
    try {
      const { yazilar: yeni, yol } = await cekYedekli(k);

      // onceki taramada bulunan gorseli tasi
      const eskiler = new Map(eskiKayit.yazilar.map(y => [y.id, y]));
      for (const y of yeni) {
        const e = eskiler.get(y.id);
        if (!e) continue;
        if (!y.gorsel && e.gorsel) y.gorsel = e.gorsel;
      }

      // beslemede gorsel yoksa makalenin kendi sayfasindan dene
      const eksik = yeni.filter(y => !y.gorsel && y.link).slice(0, 12);
      if (eksik.length) {
        for (let i = 0; i < eksik.length; i += 4) {
          await Promise.all(eksik.slice(i, i + 4).map(async y => {
            y.gorsel = await sayfadanGorsel(y.link);
          }));
        }
      }

      // ayni yazi hem kendi adresinden hem yedek yoldan gelmisse tek kalsin
      const gelenler = new Set(yeni.map(y => y.id));
      const basliklar = new Set(yeni.map(y => y.baslik.toLocaleLowerCase("tr")));
      const birlesik = yeni.concat(eskiKayit.yazilar.filter(y =>
        !gelenler.has(y.id) && !basliklar.has(String(y.baslik).toLocaleLowerCase("tr"))));
      for (const y of birlesik) if (!y.pay) y.pay = payKodu(y);
      const gorulen = new Set();
      const tekil = birlesik.filter(y => (gorulen.has(y.pay) ? false : (gorulen.add(y.pay), true)));
      birlesik.length = 0; birlesik.push(...tekil);

      sonuc.kaynaklar[k.ad] = Object.assign({
        yazilar: birlesik.slice(0, ARSIV_SINIRI),
        tarandi: new Date().toISOString(),
        durum: "tamam"
      }, yol === "yedek" ? { yol: "yedek" } : {}, kimlikBilgisi);
      console.log(`✓ ${k.ad} — ${yeni.length} yeni, toplam ${birlesik.length}${yol === "yedek" ? " (yedek yoldan)" : ""}`);
    } catch (e) {
      for (const y of eskiKayit.yazilar) if (!y.pay) y.pay = payKodu(y);
      const gorulen = new Set();
      sonuc.kaynaklar[k.ad] = Object.assign({
        yazilar: eskiKayit.yazilar.filter(y => (gorulen.has(y.pay) ? false : (gorulen.add(y.pay), true))),
        tarandi: eskiKayit.tarandi || null,
        durum: "hata: " + e.message
      }, kimlikBilgisi);
      console.log(`✗ ${k.ad} — ${e.message} (${eskiKayit.yazilar.length} eski yazi korundu)`);
    }
  }

  for (let i = 0; i < KAYNAKLAR.length; i += 8) {
    await Promise.all(KAYNAKLAR.slice(i, i + 8).map(tek));
  }

  // Yazilar orijinal dilinde kalir; onceki bir surumden kalan ceviri alanlari varsa temizle
  for (const k of Object.values(sonuc.kaynaklar))
    for (const y of k.yazilar) { delete y.baslikTr; delete y.ozetTr; delete y.dil; }

  fs.writeFileSync("akis.json", JSON.stringify(sonuc));
  const toplam = Object.values(sonuc.kaynaklar).reduce((n, k) => n + k.yazilar.length, 0);
  console.log(`\nakis.json yazıldı — ${toplam} yazı`);

  paylasimSayfalariniYaz(sonuc);
  siteDosyalari(onceki.taban || PAGES_ADRESI);
})();
