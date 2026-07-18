import pool from "../src/db/postgres.js";
import { client as redisClient } from "../src/redis/redisClient.js";

export default async function findLongUrlByShortUrl(shortUrl) {
  try {
    const cachedUrl = await redisClient.get(shortUrl);

    if (cachedUrl) {
      return cachedUrl;
    }
  } catch (error) {
    console.log("Redis unavailable:", error.message);
  }

  const { rows } = await pool.query(
    `
      SELECT long_url
      FROM url_table
      WHERE short_url = $1
    `,
    [shortUrl]
  );

  const longUrl = rows[0]?.long_url;

  try {
    if (longUrl) {
      await redisClient.set(shortUrl, longUrl, {
        EX: 120,
      });
    }
  } catch (error) {
    console.log("Redis cache write failed:", error.message);
  }

  return longUrl ?? null;
}
