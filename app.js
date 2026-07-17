import handleUrlRoutes from "./routes/routes.js";

const app = (req, res) => {
  const handled = handleUrlRoutes(req, res);

  if (!handled) {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Not Found the page" }));
  }
};

export default app;
