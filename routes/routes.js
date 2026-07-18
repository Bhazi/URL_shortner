import createShortUrlController from "../controller/shortUrl.controller.js";
import redirectForShortUrl from "../controller/redirectUrl.controller.js";

function handleUrlRoutes(req, res) {
  if (req.method === "POST" && req.url === "/api/v1/data/shorten") {
    createShortUrlController(req, res);
    return true;
  } else if (req.method === "GET" && req.url === "/api/v1/shortUrl") {
    redirectForShortUrl(req, res);

    return true;
  }
  return false;
}

export default handleUrlRoutes;
