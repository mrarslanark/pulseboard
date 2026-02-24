import { Queue } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis(
  process.env.REDIS_URL || "redis://localhost:6379",
  {
    maxRetriesPerRequest: null,
  },
);

// Queue names as constants - avoids typo
export const QUEUE_NAMES = {
  ALERTS: "alerts",
  DIGSEST: "digest",
  RETENTION: "retention",
};

// Alert queue - triggered on every ingest, checks error rate
export const alertQueue = new Queue(QUEUE_NAMES.ALERTS, { connection });

// Digest queue - scheduled nightly
export const digestQueue = new Queue(QUEUE_NAMES.DIGSEST, { connection });

// Retention queue - scheduled nightly
export const retentionQueue = new Queue(QUEUE_NAMES.RETENTION, { connection });

export { connection as bullmqConnection };
