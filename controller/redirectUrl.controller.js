import findLongUrlByShortUrl from "../services/getLongUrl.service.js";

const MAX_BODY_SIZE = 1024 * 1024; // 1 MB request limit
const MAX_SHORT_URL_LENGTH = 20;

function sendJSON(res, statusCode, message) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
  });

  res.end(
    JSON.stringify({
      success: statusCode < 400,
      message,
    })
  );
}

export default function redirectForShortUrl(req, res) {
  let body = "";

  // Prevent clients from sending excessively large payloads.
  req.on("data", (chunk) => {
    body += chunk.toString();

    if (body.length > MAX_BODY_SIZE) {
      sendJSON(res, 413, "Payload Too Large");
      req.destroy();
    }
  });

  req.on("end", async () => {
    try {
      if (!body) {
        return sendJSON(res, 400, "Request body is required.");
      }

      let parsed;

      try {
        parsed = JSON.parse(body);
      } catch {
        return sendJSON(res, 400, "Invalid JSON.");
      }

      const shortUrl = parsed.shortUrl?.trim();

      if (!shortUrl) {
        return sendJSON(res, 400, "Short URL is required.");
      }

      // Reject malformed short codes before querying the database.
      if (shortUrl.length > MAX_SHORT_URL_LENGTH) {
        return sendJSON(
          res,
          400,
          `Short URL cannot exceed ${MAX_SHORT_URL_LENGTH} characters.`
        );
      }

      if (!/^[A-Za-z0-9_-]+$/.test(shortUrl)) {
        return sendJSON(res, 400, "Short URL contains invalid characters.");
      }

      const longUrl = await findLongUrlByShortUrl(shortUrl);

      // The short code does not exist.
      if (!longUrl) {
        return sendJSON(res, 404, "Short URL not found.");
      }

      // Redirect the client to the original destination.
      res.writeHead(302, {
        Location: longUrl.startsWith("http") ? longUrl : `https://${longUrl}`,
      });

      res.end();
    } catch (error) {
      console.error("Redirect Error:", error);

      return sendJSON(res, 500, "Internal Server Error.");
    }
  });

  req.on("error", (error) => {
    console.error("Request Error:", error);

    sendJSON(res, 500, "Request Error.");
  });
}
