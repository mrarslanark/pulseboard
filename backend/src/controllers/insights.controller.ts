import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "../lib/prisma";
import { insightsService } from "../services/insights.service";
import { insightsQueue } from "../lib/queues";
import { ProjectParams, InsightParams } from "../schemas/analytics";
import { MANUAL_TRIGGER_COOLDOWN_MS } from "../schemas/ai-config";

class InsightsController {
  // ─── GET /projects/:projectId/insights ───────────────────────────────

  async getInsights(request: FastifyRequest, reply: FastifyReply) {
    const { projectId } = request.params as ProjectParams;
    const { id: userId } = request.user;

    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
    });

    if (!project) {
      return reply
        .status(404)
        .send({ success: false, message: "Project not found" });
    }

    const insights = await insightsService.getInsightsForProject(projectId);

    return reply.send({ success: true, data: insights });
  }

  // ─── PATCH /projects/:projectId/insights/:insightId/read ─────────────

  async markInsightRead(request: FastifyRequest, reply: FastifyReply) {
    const { projectId, insightId } = request.params as InsightParams;
    const { id: userId } = request.user;

    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
    });

    if (!project) {
      return reply
        .status(404)
        .send({ success: false, message: "Project not found" });
    }

    await insightsService.markInsightRead(insightId, projectId);

    return reply.send({ success: true });
  }

  // ─── POST /projects/:projectId/insights/trigger ───────────────────────

  async triggerInsights(request: FastifyRequest, reply: FastifyReply) {
    const { projectId } = request.params as ProjectParams;
    const { id: userId } = request.user;

    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
      include: { aiConfig: true },
    });

    if (!project) {
      return reply
        .status(404)
        .send({ success: false, message: "Project not found" });
    }

    // No AI config — prompt user to configure
    if (!project.aiConfig) {
      return reply.status(400).send({
        success: false,
        message:
          "No AI configuration found. Please configure your AI provider first.",
      });
    }

    // Enforce 1-hour soft rate limit
    if (project.aiConfig.lastTriggeredAt) {
      const elapsed = Date.now() - project.aiConfig.lastTriggeredAt.getTime();
      const remaining = MANUAL_TRIGGER_COOLDOWN_MS - elapsed;

      if (remaining > 0) {
        const minutesRemaining = Math.ceil(remaining / 1000 / 60);

        return reply.status(429).send({
          success: false,
          message: `Insights were recently generated. You can trigger again in ${minutesRemaining} minute${minutesRemaining === 1 ? "" : "s"}.`,
          data: {
            minutesRemaining,
            lastTriggeredAt: project.aiConfig.lastTriggeredAt,
          },
        });
      }
    }

    // Update lastTriggeredAt immediately to prevent double triggers
    await prisma.aIConfig.update({
      where: { projectId },
      data: { lastTriggeredAt: new Date() },
    });

    // Queue the job
    await insightsQueue.add(
      "generate-project",
      { projectId },
      {
        jobId: `insights-${projectId}-manual-${Date.now()}`,
        removeOnComplete: true,
      },
    );

    return reply.send({
      success: true,
      message: "Insight generation queued. Results will be available shortly.",
    });
  }
}

export const insightsController = new InsightsController();
