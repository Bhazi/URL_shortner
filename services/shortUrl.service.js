import pool from "../src/db/postgres.js";
import Snowflake from "../utils/snowflake.js";
import base62Encode from "../utils/base62Encode.js";

export default async function createShortUrlService(longUrl) {
  const validationResult = await validateLongUrl(longUrl);

  if (!validationResult.valid) {
    console.log(validationResult);
    return validationResult;
  }

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

    const snowflake = new Snowflake(process.env.WORKER_ID);

    const id = snowflake.generate();

    // Convert ID into short code
    const shortCode = base62Encode(id);

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

async function validateLongUrl(url) {
  let parsedUrl;

  try {
    parsedUrl = new URL(url);
  } catch {
    return {
      valid: false,
      message: "Invalid URL format.",
    };
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    return {
      valid: false,
      message: "Only HTTP and HTTPS URLs are allowed.",
    };
  }

  try {
    await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: AbortSignal.timeout(5000),
    });

    return {
      valid: true,
    };
  } catch (error) {
    return {
      valid: false,
      message: "Website cannot be reached.",
    };
  }
}
