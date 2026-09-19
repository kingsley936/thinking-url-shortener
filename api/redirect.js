const { Redis } = require("@upstash/redis");

const redis = Redis.fromEnv();

module.exports = async (req, res) => {
  const code = req.query.code;

  if (!code) {
    return res.status(400).send("Missing short code");
  }

  try {
    const link = await redis.get(`link:${code}`);

    if (!link) {
      return res.status(404).send("Short link not found");
    }

    await redis.incr(`clicks:${code}`);

    return res.redirect(302, link.url);
  } catch (error) {
    return res.status(500).send("Server error");
  }
};
