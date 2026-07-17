import { createShortURL } from "../services/shortURLServices.js";

function createShortUrl(req, res) {
  let body = "";

  // collect data chunks
  req.on("data", (chunk) => {
    body += chunk.toString();
    if (body.length > 1e6) {
      // ~1MB
      req.destroy();
    }
  });

  req.on("end", async () => {
    console.log("Raw Body:", body);

    if (!body) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ success: false, message: "Empty body" }));
    }

    let parsed = {};

    try {
      parsed = JSON.parse(body);
    } catch (e) {
      console.log("Invalid JSON body:", e.message);
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({ success: false, message: "Invalid JSON" })
      );
    }
    // fetching from DB
    let shortUrl = await createShortURL(parsed.longUrl);

    res.writeHead(201, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({ message: "Created Successfully", data: shortUrl })
    );
  });

  req.on("error", (err) => {
    console.error("Request Error", err);
    res.writeHead(500);
    return res.end("Server error");
  });
}

export default createShortUrl;
