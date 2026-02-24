import { Job, Worker } from "bullmq";
import { prisma } from "../lib/prisma";
import { bullmqConnection, QUEUE_NAMES } from "../lib/queues";

async function processRetentionJob() {
  console.log("🧹 Running data retention job...");

  const retentionDays = Number(process.env.RETENTION_DAYS) || 30;
  const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

  const deleted = await prisma.event.deleteMany({
    where: { timestamp: { lt: cutoffDate } },
  });

  console.log(
    `🧹 Deleted ${deleted.count} events older than ${retentionDays} days`,
  );
}

export const retentionWorker = new Worker(
  QUEUE_NAMES.RETENTION,
  processRetentionJob,
  { connection: bullmqConnection },
);

retentionWorker.on("completed", (job) =>
  console.log(`✅ Retention job ${job.id} completed`),
);

retentionWorker.on("failed", (job, err) =>
  console.error(`❌ Retention job ${job?.id} failed:`, err),
);
