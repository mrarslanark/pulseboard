import { digestQueue, retentionQueue } from "./queues";

export async function startScheduler() {
  // Remove existing scheduled jobs first to avoid duplicates on restart
  await digestQueue.obliterate({ force: true });
  await retentionQueue.obliterate({ force: true });

  // Nightly digest - runs every day at midnight
  await digestQueue.add(
    "nightly-digest",
    {},
    {
      repeat: { pattern: "0 0 * * *" }, // cron: midnight every day
    },
  );

  // Data retention - runs every day at 2 am
  await retentionQueue.add(
    "data-retention",
    {},
    {
      repeat: { pattern: "0 2 * * *" }, // cron: 2am every day
    },
  );

  console.log("⏰ Scheduler started — digest at midnight, retention at 2am");
}
