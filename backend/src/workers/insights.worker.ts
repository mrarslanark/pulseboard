import { Job, Worker } from "bullmq";
import { insightsService } from "../services/insights.service";
import { bullmqConnection } from "../lib/queues";

export type InsightsJobData = {
  projectId?: string;
};

async function processInsightsJob(job: Job<InsightsJobData>) {
  console.log(`[InsightsWorker] Processing job: ${job.name}`);

  if (job.name === "generate-all") {
    await insightsService.generateInsightsForAllProjects();
  } else if (job.name === "generate-project") {
    const { projectId } = job.data;
    if (!projectId) {
      console.error("[InsightsWorker] Invalid job data: projectId is required");
      return;
    }
    await insightsService.generateInsightsForProject(projectId);
  }
}

export const insightsWorker = new Worker("insights", processInsightsJob, {
  connection: bullmqConnection,
  concurrency: 1,
});

insightsWorker.on("completed", (job) =>
  console.log(`✅ Insights job ${job.id} completed`),
);

insightsWorker.on("failed", (job, err) =>
  console.error(`❌ Insights job ${job?.id} failed:`, err),
);
