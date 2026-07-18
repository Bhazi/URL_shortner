import pool from "../db/db.js";

export default async function findLongUrlByShortUrl(shortUrl) {
  const { rows } = await pool.query(
    `
      SELECT long_url
      FROM url_table
      WHERE short_url = $1
    `,
    [shortUrl]
  );

  return rows[0]?.long_url ?? null;
}
