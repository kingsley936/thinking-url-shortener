const { Redis } = require("@upstash/redis");

const redis = Redis.fromEnv();

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { url, customCode } = req.body || {};

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    let target;
    try {
      target = new URL(url).toString();
    } catch {
      return res.status(400).json({ error: "Invalid URL" });
    }

    let code = customCode
      ? String(customCode).trim()
      : Math.random().toString(36).slice(2, 8);

    if (!/^[a-zA-Z0-9_-]{3,32}$/.test(code)) {
      return res.status(400).json({ error: "Invalid short code" });
    }

    const existing = await redis.get(`link:${code}`);

    if (existing) {
      return res.status(409).json({ error: "Short code already exists" });
    }

    await redis.set(`link:${code}`, {
      url: target,
      clicks: 0,
      createdAt: new Date().toISOString()
    });

    return res.status(200).json({
      code,
      shortUrl: `/` + code
    });
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
};
