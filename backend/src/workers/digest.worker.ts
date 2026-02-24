import { Job, Worker } from "bullmq";
import { prisma } from "../lib/prisma";
import { emailService } from "../services/email.service";
import { bullmqConnection, QUEUE_NAMES } from "../lib/queues";

async function processDigestJob(job: Job) {
  console.log("📧 Running nightly digest job...");

  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

  // Get all users with their projects
  const users = await prisma.user.findMany({
    include: { projects: true },
  });

  for (const user of users) {
    if (user.projects.length === 0) continue;

    const projectSummaries = await Promise.all(
      user.projects.map(async (project) => {
        const [eventCount, errorCount] = await Promise.all([
          prisma.event.count({
            where: { projectId: project.id, timestamp: { gte: yesterday } },
          }),
          prisma.event.count({
            where: {
              projectId: project.id,
              type: "error",
              timestamp: { gte: yesterday },
            },
          }),
        ]);

        return { name: project.name, eventCount, errorCount };
      }),
    );

    await emailService.sendDigestEmail(user.email, user.name, projectSummaries);
    console.log(`📧 Digest sent to ${user.email}`);
  }
}

export const digestWorker = new Worker(QUEUE_NAMES.DIGSEST, processDigestJob, {
  connection: bullmqConnection,
});

digestWorker.on("completed", (job) =>
  console.log(`✅ Digest job ${job.id} completed`),
);

digestWorker.on("failed", (job, err) =>
  console.error(`❌ Digest job ${job?.id} failed:`, err),
);
