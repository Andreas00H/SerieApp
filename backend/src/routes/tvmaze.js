const router = require("express").Router();
const { authRequired } = require("../middleware/auth");

router.use(authRequired);

const cache = new Map();
const TTL_MS = 10 * 60 * 1000;
const MAX_ENTRIES = 100;

function stripHtml(html) {
  return html.replace(/<[^>]*>/g, "").trim();
}

router.get("/search", async (req, res, next) => {
  try {
    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
    if (!q) {
      return res.status(400).json({ error: "Sökfråga krävs" });
    }
    const key = q.toLowerCase();
    const cached = cache.get(key);
    if (cached && Date.now() - cached.at < TTL_MS) {
      return res.json({ results: cached.results, source: "cache" });
    }
    const response = await fetch(
      `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(q)}`,
      { headers: { "User-Agent": "SerieApp/1.0 (skolprojekt)" } }
    );
    if (!response.ok) {
      return res.status(502).json({ error: "Kunde inte nå TVmaze" });
    }
    const data = await response.json();
    const results = data.map(({ show }) => ({
      externalId: show.id,
      name: show.name,
      genres: Array.isArray(show.genres) ? show.genres : [],
      runtimeMinutes: show.runtime || show.averageRuntime || null,
      imageUrl: show.image ? show.image.medium : null,
      premiered: show.premiered || null,
      summary: show.summary ? stripHtml(show.summary) : null
    }));
    if (cache.size >= MAX_ENTRIES) {
      cache.delete(cache.keys().next().value);
    }
    cache.set(key, { at: Date.now(), results });
    res.json({ results, source: "tvmaze" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
