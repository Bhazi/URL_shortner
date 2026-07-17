import createShortUrl from "../controller/shortUrl.js";

async function handleUrlRoutes(req, res) {
  if (req.method === "POST" && req.url === "/api/v1/data/shorten") {
    await createShortUrl(req, res);
    return true;
  }
  return false;
}

export default handleUrlRoutes;
