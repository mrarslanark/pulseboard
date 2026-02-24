import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

// Publisher - used to publish events on ingest
export const publisher = new Redis(REDIS_URL, {
  lazyConnect: true,
  maxRetriesPerRequest: 3,
});

// Subscriber - used to subscribe to channels
// Redis requires a dedicated connection for pub/sub
export const subscriber = new Redis(REDIS_URL, {
  lazyConnect: true,
  maxRetriesPerRequest: 3,
});

publisher.on("error", (err) => console.error("[Redis Publisher Error]", err));
subscriber.on("error", (err) => console.error("[Redis Subscriber Error]", err));

export async function connectRedis() {
  await publisher.connect();
  await subscriber.connect();
  console.log("✅ Redis connected");
}

// Channel naming convention - one channel per project
export const getProjectChannel = (projectId: string) => {
  return `project:${projectId}:events`;
};
