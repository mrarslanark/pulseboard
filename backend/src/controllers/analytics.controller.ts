import { FastifyRequest, FastifyReply } from "fastify";
import { analyticsService } from "../services/analytics.service";
import { insightsService } from "../services/insights.service";
import { insightsQueue } from "../lib/queues";
import { prisma } from "../lib/prisma";
import {
  InsightParams,
  CrashBody,
  SessionBody,
  ScreenViewBody,
  ApiCallBody,
  ProjectParams,
} from "../schemas/analytics";

class AnalyticsController {
  // ─── Ingest endpoints ───────────────────────────────────────────────

  async trackCrash(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as CrashBody;
    const project = await prisma.project.findUnique({
      where: { apiKey: body.apiKey },
    });

    if (!project) {
      return reply
        .status(401)
        .send({ success: false, message: "Invalid API key" });
    }

    const crashGroup = await analyticsService.trackCrash(project.id, {
      errorName: body.errorName,
      errorMessage: body.errorMessage,
      stackTrace: body.stackTrace,
      isFatal: body.isFatal,
      sessionId: body.sessionId,
      context: body.context,
    });

    // Trigger immediate insight generation for critical crashes
    if (body.isFatal) {
      await insightsQueue.add(
        "generate-project",
        { projectId: project.id },
        { jobId: `insights-${project.id}`, removeOnComplete: true },
      );
    }

    return reply
      .status(201)
      .send({ success: true, data: { crashGroupId: crashGroup.id } });
  }

  async trackSession(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as SessionBody;
    const project = await prisma.project.findUnique({
      where: { apiKey: body.apiKey },
    });

    if (!project) {
      return reply
        .status(401)
        .send({ success: false, message: "Invalid API key" });
    }

    await analyticsService.trackSession(project.id, {
      sessionId: body.sessionId,
      startedAt: body.startedAt,
      endedAt: body.endedAt,
      duration: body.duration,
      crashed: body.crashed,
      context: body.context,
    });

    return reply.status(201).send({ success: true });
  }

  async trackScreenView(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as ScreenViewBody;
    const project = await prisma.project.findUnique({
      where: { apiKey: body.apiKey },
    });

    if (!project) {
      return reply
        .status(401)
        .send({ success: false, message: "Invalid API key" });
    }

    await analyticsService.trackScreenView(project.id, {
      screenName: body.screenName,
      loadTime: body.loadTime,
      timeSpent: body.timeSpent,
      sessionId: body.sessionId,
      context: body.context,
    });

    return reply.status(201).send({ success: true });
  }

  async trackApiCall(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as ApiCallBody;
    const project = await prisma.project.findUnique({
      where: { apiKey: body.apiKey },
    });

    if (!project) {
      return reply
        .status(401)
        .send({ success: false, message: "Invalid API key" });
    }

    await analyticsService.trackApiCall(project.id, {
      endpoint: body.endpoint,
      httpMethod: body.httpMethod,
      statusCode: body.statusCode,
      duration: body.duration,
      payloadSize: body.payloadSize,
      sessionId: body.sessionId,
      context: body.context,
    });

    return reply.status(201).send({ success: true });
  }

  // ─── Dashboard endpoints ─────────────────────────────────────────────

  async getCrashRate(request: FastifyRequest, reply: FastifyReply) {
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

    const [
      crashRate,
      topCrashes,
      crashesByVersion,
      crashesByDevice,
      apiPerformance,
      screenPerformance,
    ] = await Promise.all([
      analyticsService.getCrashRate(projectId),
      analyticsService.getTopCrashGroups(projectId),
      analyticsService.getCrashRateByVersion(projectId),
      analyticsService.getCrashRateByDevice(projectId),
      analyticsService.getApiPerformance(projectId),
      analyticsService.getScreenPerformance(projectId),
    ]);

    return reply.send({
      success: true,
      data: {
        crashRate,
        topCrashes,
        crashesByVersion,
        crashesByDevice,
        apiPerformance,
        screenPerformance,
      },
    });
  }

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

  async triggerInsights(request: FastifyRequest, reply: FastifyReply) {
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

    await insightsQueue.add(
      "generate-project",
      { projectId },
      { jobId: `insights-${projectId}-manual`, removeOnComplete: true },
    );

    return reply.send({ success: true, message: "Insight generation queued" });
  }
}

export const analyticsController = new AnalyticsController();
