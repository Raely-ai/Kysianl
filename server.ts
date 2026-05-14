import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';

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
  lastFetch: 0,
  CACHE_TTL: 1000 * 60 * 5, // 5 dakika (5 dakika boyunca Firebase'e istek atılmaz)
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

  // Haberleri Getiren Endpoint (Cache Katmanlı)
  app.get("/api/news", async (req, res) => {
    const now = Date.now();
    
    // Eğer cache süresi geçmemişse ve data varsa cache'den dön (Maliyet tasarrufu!)
    if (memoryCache.news && (now - memoryCache.lastFetch < memoryCache.CACHE_TTL)) {
      return res.json({ source: "cache", data: memoryCache.news });
    }

    try {
      const newsRef = collection(db, 'news');
      // Sadece yayınlanmış haberleri getir, tarihe göre sırala
      const q = query(newsRef, where('status', '==', 'published'), orderBy('createdAt', 'desc'), limit(50));
      const snapshot = await getDocs(q);
      
      const latestNews = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Cache'i güncelle
      memoryCache.news = latestNews;
      memoryCache.lastFetch = now;

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
  // VITE & SEO MIDDLEWARE (Server-Side Meta Injection)
  // ==========================================
  if (process.env.NODE_ENV !== "production") {
    // Development Environment
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    
    // SEO Middleware (Dinamik Meta tag enjeksiyonu)
    app.use("*", async (req, res, next) => {
      try {
        const url = req.originalUrl;
        
        // Sadece API dışındaki istekler için index.html işle
        if (url.startsWith('/api/')) return next();

        // Template'i Vite'dan alıyoruz
        let template = fs.readFileSync(path.resolve(ROOT_DIR, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);

        // Başlıkları değiştirip SEO'yu güçlendirebiliriz
        if (url.includes('/haber/')) {
           template = template.replace(
             '<title>My Google AI Studio App</title>', 
             '<title>Kayserianlik Haber | Özel İçerik</title>'
           );
        } else {
           template = template.replace(
             '<title>My Google AI Studio App</title>', 
             '<title>Kayserianlik - Kayseri Haberleri, Son Dakika</title>'
           );
        }

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
    
    app.get('*', (req, res, next) => {
       const url = req.originalUrl;
       if (url.startsWith('/api/')) return next();
       
       let template = fs.readFileSync(path.join(distPath, 'index.html'), 'utf-8');
       
       // Sürdürülebilir SEO SEO enjeksiyonu
       if (url.includes('/haber/')) {
           template = template.replace(
             '<title>My Google AI Studio App</title>', 
             '<title>Kayserianlik Haber Detayı</title>' // Gerçek prod'da ID'ye göre DB'den un-cached title çekilebilir
           );
       } else {
           template = template.replace(
             '<title>My Google AI Studio App</title>', 
             '<title>Kayserianlik - Kayseri Haberleri, Son Dakika</title>'
           );
       }

       res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
