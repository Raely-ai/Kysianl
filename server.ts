import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, getDoc, doc, query, where, orderBy, limit } from 'firebase/firestore';

const ROOT_DIR = process.cwd();

// Ensure you have the config (use relative path from where server runs, or dynamically parse)
const firebaseConfigRaw = fs.readFileSync(path.resolve(ROOT_DIR, 'firebase-applet-config.json'), 'utf-8');
const firebaseConfig = JSON.parse(firebaseConfigRaw);

const appFirebase = initializeApp(firebaseConfig);
const db = getFirestore(appFirebase, firebaseConfig.firestoreDatabaseId);

// BASİT IN-MEMORY CACHE MEKANİZMASI (Firebase read maliyetini minimize etmek için)
// İleride Redis eklenebilir, şimdilik RAM üzerinde tutacağız.
const memoryCache = {
  news: null as any,
  init: null as any,
  market: null as any,
  weather: null as any,
  lastFetch: {
     news: 0,
     init: 0,
     market: 0,
     weather: 0
  },
  CACHE_TTL: 1000 * 60 * 5, // Default 5 dakika
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // ==========================================
  // API ENDPOINTS (Public taraftan buraya istek atılacak)
  // ==========================================
  
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // INITIAL LOAD (Settings, Categories, Blocks, Ads)
  app.get("/api/init", async (req, res) => {
     const now = Date.now();
     if (memoryCache.init && (now - memoryCache.lastFetch.init < memoryCache.CACHE_TTL)) {
        return res.json({ source: "cache", data: memoryCache.init });
     }

     try {
       // Fetch Settings
       const s1 = await getDoc(doc(db, 'settings', 'general'));
       const s2 = await getDoc(doc(db, 'settings', 'seo'));
       const s3 = await getDoc(doc(db, 'settings', 'socialLinks'));
       const s4 = await getDoc(doc(db, 'settings', 'breakingSettings'));
       const footerDoc = await getDoc(doc(db, 'settings', 'footer'));
       
       const settings = {
          general: s1.exists() ? s1.data() : {},
          seo: s2.exists() ? s2.data() : {},
          social: s3.exists() ? s3.data() : {},
          breaking: s4.exists() ? s4.data() : { active: false, mode: 'auto', limit: 10 },
          footer: footerDoc.exists() ? footerDoc.data() : {},
       };

       // Fetch Layouts
       const publishedLayoutDoc = await getDoc(doc(db, 'homepageLayouts', 'published'));
       const headerLayoutDoc = await getDoc(doc(db, 'siteLayouts', 'header'));
       const sidebarLayoutDoc = await getDoc(doc(db, 'siteLayouts', 'sidebar'));
       
       const publishedLayout = publishedLayoutDoc.exists() ? publishedLayoutDoc.data() : null;
       const headerLayout = headerLayoutDoc.exists() ? headerLayoutDoc.data() : null;
       const sidebarLayout = sidebarLayoutDoc.exists() ? sidebarLayoutDoc.data() : null;

       // Fetch Categories
       const catSnap = await getDocs(query(collection(db, 'categories'), orderBy('order', 'asc')));
       const categories = catSnap.docs.map(d => ({id: d.id, ...d.data()}));

       // Fetch Blocks
       const blocksSnap = await getDocs(query(collection(db, 'homepageBlocks'), orderBy('order', 'asc')));
       const blocks = blocksSnap.docs.map(d => ({id: d.id, ...d.data()}));

       // Fetch Ads
       const adsSnap = await getDocs(query(collection(db, 'ads'), orderBy('order', 'asc')));
       const ads = adsSnap.docs.map(d => ({id: d.id, ...d.data()}));

       // Fetch Menu
       const menuSnap = await getDocs(query(collection(db, 'menuItems'), orderBy('order', 'asc')));
       const menuItems = menuSnap.docs.map(d => ({id: d.id, ...d.data()}));

       const activeBlocks = blocks.filter((b:any) => b.active);
       const activeAds = ads.filter((b:any) => b.active);
       const activeMenu = menuItems.filter((m:any) => m.active);

       const initData = { settings, categories, blocks: activeBlocks, ads: activeAds, menuItems: activeMenu, publishedLayout, headerLayout, sidebarLayout };
       
       memoryCache.init = initData;
       memoryCache.lastFetch.init = now;

       res.json({ source: "database", data: initData });
     } catch (e) {
       console.error("Init fetch error:", e);
       if (memoryCache.init) res.json({ source: "stale_cache", data: memoryCache.init });
       else res.status(500).json({ error: "Veritabanına bağlanılamadı" });
     }
  });

  // MARKET DATA
  app.get("/api/market-data", async (req, res) => {
     const now = Date.now();
     try {
        if (!memoryCache.market) {
           // check DB for settings
           const snap = await getDoc(doc(db, 'settings', 'marketSettings'));
           let setInfo: any = { active: true, cacheMinutes: 15 };
           if (snap.exists()) setInfo = snap.data();
           
           if (!setInfo.active) return res.json({ data: null });

           // Check TTL
           if (now - memoryCache.lastFetch.market < setInfo.cacheMinutes * 60 * 1000 && memoryCache.market) {
               return res.json({ source: "cache", data: memoryCache.market.data });
           }
        } else {
           // We have something in cache, if TTL is passed we should ideally fetch again, but for now we simplify
           if (now - memoryCache.lastFetch.market < 5 * 60 * 1000) { // minimum 5 mins anyway
               return res.json({ source: "cache", data: memoryCache.market.data });
           }
        }
        
        // Let's MOCK market data for now based on instructions
        const mockData = {
           bist100: { value: "10.456,23", change: "+1.2%" },
           usd: { value: "33.12", change: "-0.5%" },
           eur: { value: "36.45", change: "+0.1%" },
           gold: { value: "2.450", change: "-0.2%" },
           updatedAt: new Date().toISOString()
        };

        memoryCache.market = { data: mockData };
        memoryCache.lastFetch.market = now;

        res.json({ source: "api", data: mockData });
     } catch (e) {
        console.error("Market fetch error", e);
        if (memoryCache.market) res.json({ source: "stale_cache", data: memoryCache.market.data });
        else res.json({ data: null });
     }
  });

  // WEATHER DATA
  app.get("/api/weather", async (req, res) => {
     const now = Date.now();
     try {
        if (!memoryCache.weather) {
           // check DB for settings
           const snap = await getDoc(doc(db, 'settings', 'weatherSettings'));
           let setInfo: any = { active: true, cacheMinutes: 60, city: 'Kayseri' };
           if (snap.exists()) setInfo = snap.data();
           
           if (!setInfo.active) return res.json({ data: null });

           if (now - memoryCache.lastFetch.weather < setInfo.cacheMinutes * 60 * 1000 && memoryCache.weather) {
               return res.json({ source: "cache", data: memoryCache.weather.data });
           }
        } else {
           if (now - memoryCache.lastFetch.weather < 15 * 60 * 1000) { 
               return res.json({ source: "cache", data: memoryCache.weather.data });
           }
        }
        
        // Mock Weather for Kayseri
        const mockData = {
           city: "Kayseri",
           temp: "18",
           desc: "Parçalı Bulutlu",
           icon: "☁️", // Simplification
           updatedAt: new Date().toISOString()
        };

        memoryCache.weather = { data: mockData };
        memoryCache.lastFetch.weather = now;

        res.json({ source: "api", data: mockData });
     } catch (e) {
        console.error("Weather fetch error", e);
        if (memoryCache.weather) res.json({ source: "stale_cache", data: memoryCache.weather.data });
        else res.json({ data: null });
     }
  });

  // Haberleri Getiren Endpoint (Cache Katmanlı)
  app.get("/api/news", async (req, res) => {
    const now = Date.now();
    
    // Eğer cache süresi geçmemişse ve data varsa cache'den dön (Maliyet tasarrufu!)
    if (memoryCache.news && (now - memoryCache.lastFetch.news < memoryCache.CACHE_TTL)) {
      return res.json({ source: "cache", data: memoryCache.news });
    }

    try {
      const newsRef = collection(db, 'news');
      // Sadece yayınlanmış haberleri getir, tarihe göre sırala
      const q = query(newsRef, where('status', '==', 'published'), orderBy('createdAt', 'desc'), limit(150));
      const snapshot = await getDocs(q);
      
      const latestNews = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Cache'i güncelle
      memoryCache.news = latestNews;
      memoryCache.lastFetch.news = now;

      res.json({ source: "database", data: latestNews });
    } catch (error) {
      console.error("Firestore read error:", error);
      // Eğer hata alınırsa ve elimizde eski cache varsa, uygulamayı çökertmemek için cache'den dönebiliriz.
      if (memoryCache.news) {
         res.json({ source: "stale_cache", data: memoryCache.news });
      } else {
         res.status(500).json({ error: "Veritabanına bağlanılamadı." });
      }
    }
  });

  const newsDetailCache: Record<string, { data: any; lastFetch: number }> = {};

  app.get("/api/news/:slug", async (req, res) => {
     const slug = req.params.slug;
     const now = Date.now();
     
     if (newsDetailCache[slug] && (now - newsDetailCache[slug].lastFetch < memoryCache.CACHE_TTL)) {
       return res.json({ source: "cache", data: newsDetailCache[slug].data });
     }

     try {
        const newsRef = collection(db, 'news');
        const q = query(newsRef, where('slug', '==', slug), where('status', '==', 'published'), limit(1));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
           return res.status(404).json({ error: "Haber bulunamadı." });
        }

        const doc = snapshot.docs[0];
        const data = { id: doc.id, ...doc.data() };

        newsDetailCache[slug] = { data, lastFetch: now };

        res.json({ source: "database", data });
     } catch (error) {
        console.error("Firestore read error (detail):", error);
        if (newsDetailCache[slug]) {
           res.json({ source: "stale_cache", data: newsDetailCache[slug].data });
        } else {
           res.status(500).json({ error: "Veritabanına bağlanılamadı." });
        }
     }
  });

  // ==========================================
  // SITEMAP & SEO LOGIC
  // ==========================================

  app.get("/sitemap.xml", async (req, res) => {
     res.type('application/xml');
     const domain = "https://kayserianlik.com"; // Domain config'den de alınabilir
     
     let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">`;

     xml += `
  <url>
    <loc>${domain}/</loc>
    <changefreq>always</changefreq>
    <priority>1.0</priority>
  </url>`;

     try {
         const catSnap = await getDocs(collection(db, 'categories'));
         catSnap.forEach(docSnapshot => {
             const data = docSnapshot.data();
             if(data.slug) {
                 xml += `
  <url>
    <loc>${domain}/kategori/${data.slug}</loc>
    <changefreq>hourly</changefreq>
    <priority>0.8</priority>
  </url>`;
             }
         });

         const newsRef = collection(db, 'news');
         const q = query(newsRef, where('status', '==', 'published'), orderBy('createdAt', 'desc'), limit(1000));
         const snap = await getDocs(q);
         
         snap.forEach(docSnapshot => {
             const data = docSnapshot.data();
             if(data.slug) {
                 const date = new Date(data.createdAt).toISOString();
                 const safeTitle = data.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                 xml += `
  <url>
    <loc>${domain}/haber/${data.slug}</loc>
    <lastmod>${date}</lastmod>
    <news:news>
      <news:publication>
        <news:name>Kayserianlık</news:name>
        <news:language>tr</news:language>
      </news:publication>
      <news:publication_date>${date}</news:publication_date>
      <news:title>${safeTitle}</news:title>
    </news:news>
  </url>`;
             }
         });
     } catch(e) { console.error("Sitemap error", e); }

     xml += `\n</urlset>`;
     res.send(xml);
  });

  async function injectSEO(url: string, template: string): Promise<string> {
      let title = "Kayserianlık - Son Dakika Haberler";
      let desc = "Kayseri'nin en güncel haber portalı.";
      let image = "https://kayserianlik.com/default-share.jpg"; 
      let type = "website";
      let extraMeta = "";
      
      try {
          if (url.startsWith('/haber/')) {
              const slug = url.split('/')[2];
              const newsRef = collection(db, 'news');
              const q = query(newsRef, where('slug', '==', slug), where('status', '==', 'published'), limit(1));
              const snap = await getDocs(q);
              
              if (!snap.empty) {
                  const docData = snap.docs[0].data();
                  title = `${docData.title} - Kayserianlık`;
                  desc = docData.seoDescription || docData.summary || docData.title;
                  image = docData.imageUrl || image;
                  type = "article";
                  
                  const publishedStr = new Date(docData.createdAt).toISOString();
                  const modifiedStr = new Date(docData.updatedAt || docData.createdAt).toISOString();
                  const author = docData.author || "Editör";
                  const category = docData.category || "Genel";
                  
                  // Clean quotes for JSON-LD and tags
                  const safeQuoteDesc = desc.replace(/"/g, '&quot;');
                  const safeQuoteTitle = docData.title.replace(/"/g, '&quot;');
                  
                  extraMeta += `
    <meta property="article:published_time" content="${publishedStr}" />
    <meta property="article:modified_time" content="${modifiedStr}" />
    <meta property="article:author" content="${author}" />
    <meta property="article:section" content="${category}" />
    <link rel="canonical" href="https://kayserianlik.com/haber/${slug}" />
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "headline": "${safeQuoteTitle.replace(/\\/g, '\\\\')}",
      "image": [
        "${image}"
       ],
      "datePublished": "${publishedStr}",
      "dateModified": "${modifiedStr}",
      "author": [{
          "@type": "Person",
          "name": "${author}"
      }]
    }
    </script>
                  `;
                  desc = safeQuoteDesc;
                  title = safeQuoteTitle;
              }
          } else if (url.startsWith('/kategori/')) {
             const slug = url.split('/')[2];
             title = `${slug.toUpperCase().replace(/-/g, ' ')} Haberleri - Kayserianlık`;
             extraMeta += `<link rel="canonical" href="https://kayserianlik.com/kategori/${slug}" />`;
          }
      } catch(e) {
          console.error("SEO Inject error", e);
      }
      
      // Replace generic React tags
      template = template.replace(/<title>(.*?)<\/title>/, `<title>${title}</title>`);
      
      const seoTags = `
    <meta name="description" content="${desc}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${desc}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:type" content="${type}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${desc}" />
    <meta name="twitter:image" content="${image}" />
    ${extraMeta}
      `;
      
      template = template.replace("</head>", `${seoTags}</head>`);
      return template;
  }

  // ==========================================
  // VITE & SEO MIDDLEWARE (Server-Side Meta Injection)
  // ==========================================
  if (process.env.NODE_ENV !== "production") {
    // Development Environment
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });

    app.use(vite.middlewares);
    
    // SEO Middleware (Dinamik Meta tag enjeksiyonu)
    app.use("*", async (req, res, next) => {
      try {
        const url = req.originalUrl;
        
        // Sadece API dışındaki istekler için index.html işle
        if (url.startsWith('/api/') || url.startsWith('/admin')) {
           if(url.startsWith('/admin')) return next();
           return;
        }

        // Template'i Vite'dan alıyoruz
        let template = fs.readFileSync(path.resolve(ROOT_DIR, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        
        // SEO Meta Enjeksiyonu //
        template = await injectSEO(url, template);

        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });

  } else {
    // Production Environment
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, { index: false })); // index.html manuel işlenecek
    
    app.get('*', async (req, res, next) => {
       const url = req.originalUrl;
       if (url.startsWith('/api/')) return next();
       
       let template = fs.readFileSync(path.join(distPath, 'index.html'), 'utf-8');
       
       // SEO Meta Enjeksiyonu //
       template = await injectSEO(url, template);
       
       res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
