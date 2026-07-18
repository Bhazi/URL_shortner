import http from "http";
import app from "./app.js";
import { connectRedis } from "./src/redis/redisClient.js";

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await connectRedis();

    const server = http.createServer(app);

    server.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start application:", err);
    process.exit(1);
  }
}

start();
