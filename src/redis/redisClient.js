import { createClient } from "redis";

export const client = createClient({
  url: `redis://localhost:${process.env.REDIS_PORT}`,
});

client.on("error", (err) => {
  console.log("Redis Error:", err);
});

client.on("connect", () => {
  console.log("Redis Connected");
});

export async function connectRedis() {
  if (!client.isOpen) {
    await client.connect();
  }
}
