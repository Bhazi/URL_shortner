import createShortUrlService from "../services/shortURLServices.js";

const MAX_BODY_SIZE = 1024 * 1024;

function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
  });

  res.end(JSON.stringify(data));
}

export default async function createShortUrlController(req, res) {
  let body = "";

  req.on("data", (chunk) => {
    body += chunk;

    // Protect against oversized payloads
    if (body.length > MAX_BODY_SIZE) {
      req.destroy();
    }
  });

  req.on("end", async () => {
    try {
      if (!body.trim()) {
        return sendJSON(res, 400, {
          success: false,
          message: "Request body is required",
        });
      }

      const { longUrl } = JSON.parse(body);

      if (!longUrl) {
        return sendJSON(res, 400, {
          success: false,
          message: "longUrl is required",
        });
      }

      const shortUrl = await createShortUrlService(longUrl);

      return sendJSON(res, 201, {
        success: true,
        data: shortUrl,
      });
    } catch (error) {
      console.error(error);

      return sendJSON(res, 500, {
        success: false,
        message: "Internal server error",
      });
    }
  });

  req.on("error", (error) => {
    console.error("Request failed:", error);
  });
}
