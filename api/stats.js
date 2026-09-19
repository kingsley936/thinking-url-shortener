const { Redis } = require("@upstash/redis");

const redis = Redis.fromEnv();

module.exports = async (req, res) => {
  const code = req.query.code;

  if (!code) {
    return res.status(400).json({ error: "Missing short code" });
  }

  try {
    const link = await redis.get(`link:${code}`);

    if (!link) {
      return res.status(404).json({ error: "Short link not found" });
    }

    const clicks = await redis.get(`clicks:${code}`) || 0;

    return res.status(200).json({
      code,
      url: link.url,
      clicks,
      createdAt: link.createdAt
    });
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
};
