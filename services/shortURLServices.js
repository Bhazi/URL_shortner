import pool from "../db/db.js";

export async function createShortURL(longURL) {
  const url = new URL(longURL);

  const finalURL = url.host + url.pathname + url.search;

  console.log(finalURL);

  try {
    const result = await pool.query(
      `SELECT *
      FROM url_table
      WHERE long_url = $1`,
      [finalURL]
    );
  } catch (error) {
    // if any error happened from the DB
    console.error(error);
    throw new Error(error);
  }

  if (result.rows.length != 0) {
    return result.rows[0].short_url;
  } else {
    // if there is no value in the DB, creating the shortUrl
    return helperToCreateShortUrl(finalURL);
  }
}

async function helperToCreateShortUrl(longUrl) {
  if (!longUrl) {
    throw new Error("longUrl is required");
  }

  const randomID = Date.now();
  const shortUrlId = base62Encode(randomID);

  // Example database insert for URL table
  const query = `
    INSERT INTO url_table
    VALUES ($1, $2, $3)
    RETURNING *;
  `;

  const values = [randomID, shortUrlId, longUrl];

  try {
    let dbResult = await pool.query(query, values);
    return dbResult.rows[0].short_url;
  } catch (error) {
    throw new Error(error);
  }
}

// creating the base62Encoded for the ID
function base62Encode(num) {
  const chars =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

  if (num === 0n) {
    return "0";
  }

  let result = "";

  while (num > 0) {
    const remainder = num % 62;
    result = chars[remainder] + result;
    num = Math.floor(num / 62);
  }

  return result;
}
