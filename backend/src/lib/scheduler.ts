import {
  alertQueue,
  digestQueue,
  insightsQueue,
  retentionQueue,
} from "./queues";

export async function startScheduler() {
  // Clear existing scheduled jobs
  await Promise.all([
    alertQueue.obliterate({ force: true }),
    digestQueue.obliterate({ force: true }),
    retentionQueue.obliterate({ force: true }),
    insightsQueue.obliterate({ force: true }),
  ]);

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

  // AI insights - every 6 hours
  await insightsQueue.add(
    "generate-all",
    {},
    {
      repeat: { pattern: process.env.INSIGHTS_CRON || "0 */6 * * *" }, // default: every 6 hours
    },
  );

  console.log(
    "⏰ Scheduler started — digest at midnight, retention at 2am, ai insights every 6 hours",
  );
}
