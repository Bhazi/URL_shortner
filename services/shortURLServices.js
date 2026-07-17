import pool from "../db/db.js";

export default async function createShortUrlService(longUrl) {
  if (!longUrl) {
    throw new Error("URL is required");
  }

  const normalizedUrl = new URL(longUrl).toString();

  try {
    // Check whether URL already exists
    const existingUrl = await pool.query(
      `
      SELECT short_url
      FROM url_table
      WHERE long_url = $1
      `,
      [normalizedUrl]
    );

    if (existingUrl.rows.length > 0) {
      return existingUrl.rows[0].short_url;
    }

    // Generate unique numeric ID
    const id = Date.now();

    // Convert ID into short code
    const shortCode = base62Encode(BigInt(id));

    // Store URL information in database
    const result = await pool.query(
      `
      INSERT INTO url_table
      (
        id,
        short_url,
        long_url
      )
      VALUES
      ($1, $2, $3)
      RETURNING short_url
      `,
      [id, shortCode, normalizedUrl]
    );

    return result.rows[0].short_url;
  } catch (error) {
    console.error("Create short URL failed:", error);
    throw error;
  }
}

function base62Encode(number) {
  const characters =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

  let result = "";

  while (number > 0n) {
    const remainder = number % 62n;

    result = characters[remainder] + result;

    number = number / 62n;
  }

  return result;
}
