import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

// Weather API Proxy with Caching
const cache = new Map<string, { data: any, timestamp: number }>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

app.get("/api/weather", async (req, res) => {
  const { city } = req.query;
  const apiKey = process.env.VISUAL_CROSSING_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "API key is missing" });
  }

  if (!city || typeof city !== 'string') {
    return res.status(400).json({ error: "City is required" });
  }

  // Check cache
  const cached = cache.get(city);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return res.json(cached.data);
  }

  try {
    const response = await fetch(
      `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${city}?unitGroup=metric&key=${apiKey}&contentType=json&lang=hu`
    );
    
    if (response.status === 429) {
      // If we have stale cache, serve it even if expired to avoid 429 to user
      if (cached) {
        return res.json(cached.data);
      }
      return res.status(429).json({ error: "Az időjárás szolgáltató túlterhelt. Kérlek várj egy kicsit." });
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Weather API error (${response.status}):`, errorText);
      return res.status(response.status).json({ error: `Hiba az időjárás lekérésekor: ${response.status}` });
    }
    
    const data = await response.json();
    
    // Store in cache
    cache.set(city, { data, timestamp: Date.now() });
    
    res.json(data);
  } catch (error) {
    console.error("Weather API error:", error);
    // If request failed but we have cache, serve it
    if (cached) {
      return res.json(cached.data);
    }
    res.status(500).json({ error: "Nem sikerült kapcsolódni az időjárás szolgáltatóhoz." });
  }
});

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
