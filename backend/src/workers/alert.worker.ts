import { Job, Worker } from "bullmq";
import { prisma } from "../lib/prisma";
import { emailService } from "../services/email.service";
import { bullmqConnection, QUEUE_NAMES } from "../lib/queues";

export type AlertJobData = {
  projectId: string;
};

async function processAlertJob(job: Job<AlertJobData>) {
  const { projectId } = job.data;
  const threshold = Number(process.env.ALERT_ERROR_THRESHOLD) || 10;

  // Count errors in the last minute
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000);

  const errorCount = await prisma.event.count({
    where: {
      projectId,
      type: "error",
      timestamp: { gte: oneMinuteAgo },
    },
  });

  if (errorCount >= threshold) {
    // Get project and owner details
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { user: true },
    });

    if (!project) return;

    await emailService.sendAlertEmail(
      project.user.email,
      project.name,
      errorCount,
    );

    console.log(
      `🚨 Alert sent for project ${project.name} — ${errorCount} errors/min`,
    );
  }
}

export const alertWorker = new Worker(QUEUE_NAMES.ALERTS, processAlertJob, {
  connection: bullmqConnection,
});

alertWorker.on("completed", (job) =>
  console.log(`✅ Alert job ${job.id} completed`),
);

alertWorker.on("failed", (job, err) =>
  console.error(`❌ Alert job ${job?.id} failed:`, err),
);
