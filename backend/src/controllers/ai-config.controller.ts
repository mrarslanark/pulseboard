import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "../lib/prisma";
import { encryptionService } from "../lib/encryption";
import { aiService } from "../services/ai.service";
import { insightsQueue } from "../lib/queues";
import {
  ProjectParams,
  UpsertAIConfigBody,
  MANUAL_TRIGGER_COOLDOWN_MS,
} from "../schemas/ai-config";
import type { AIProvider, AIModel } from "../adapters";

class AIConfigController {
  // ─── GET /projects/:projectId/ai-config ──────────────────────────────
  async getAIConfig(request: FastifyRequest, reply: FastifyReply) {
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

    if (!project.aiConfig) {
      return reply.send({ success: true, data: null });
    }

    // Never return the full API key — return hint only
    return reply.send({
      success: true,
      data: {
        provider: project.aiConfig.provider,
        model: project.aiConfig.model,
        keyHint: project.aiConfig.keyHint,
        cronSchedule: project.aiConfig.cronSchedule,
        lastTriggeredAt: project.aiConfig.lastTriggeredAt,
        createdAt: project.aiConfig.createdAt,
        updatedAt: project.aiConfig.updatedAt,
      },
    });
  }

  // ─── POST /projects/:projectId/ai-config ─────────────────────────────
  async upsertAIConfig(request: FastifyRequest, reply: FastifyReply) {
    const { projectId } = request.params as ProjectParams;
    const { id: userId } = request.user;
    const body = request.body as UpsertAIConfigBody;

    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
    });

    if (!project) {
      return reply
        .status(404)
        .send({ success: false, message: "Project not found" });
    }

    // Validate provider
    if (!aiService.isValidProvider(body.provider)) {
      return reply
        .status(400)
        .send({ success: false, message: "Invalid AI provider" });
    }

    // Validate model belongs to provider
    if (!aiService.isValidModel(body.provider as AIProvider, body.model)) {
      return reply.status(400).send({
        success: false,
        message: `Model ${body.model} is not available for provider ${body.provider}`,
      });
    }

    // Resolve cron schedule
    const cronSchedule = this.resolveCronSchedule(
      body.cronPreset,
      body.cronSchedule,
    );

    if (!cronSchedule) {
      return reply.status(400).send({
        success: false,
        message:
          "Custom cron schedule is required when preset is set to custom",
      });
    }

    // Validate custom cron expression
    if (body.cronPreset === "custom" && !this.isValidCron(cronSchedule)) {
      return reply.status(400).send({
        success: false,
        message: "Invalid cron expression",
      });
    }

    // Encrypt API key
    const encryptedKey = encryptionService.encrypt(body.apiKey);
    const keyHint = encryptionService.getKeyHint(body.apiKey);

    // Upsert AI config
    const aiConfig = await prisma.aIConfig.upsert({
      where: { projectId },
      create: {
        projectId,
        provider: body.provider,
        model: body.model,
        apiKey: encryptedKey,
        keyHint,
        cronSchedule,
      },
      update: {
        provider: body.provider,
        model: body.model,
        apiKey: encryptedKey,
        keyHint,
        cronSchedule,
      },
    });

    return reply.send({
      success: true,
      data: {
        provider: aiConfig.provider,
        model: aiConfig.model,
        keyHint: aiConfig.keyHint,
        cronSchedule: aiConfig.cronSchedule,
        createdAt: aiConfig.createdAt,
        updatedAt: aiConfig.updatedAt,
      },
    });
  }

  // ─── DELETE /projects/:projectId/ai-config ────────────────────────────
  async deleteAIConfig(request: FastifyRequest, reply: FastifyReply) {
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

    await prisma.aIConfig.deleteMany({ where: { projectId } });

    return reply.send({ success: true, message: "AI configuration removed" });
  }

  // ─── Private helpers ──────────────────────────────────────────────────
  private resolveCronSchedule(
    preset: string,
    customSchedule?: string,
  ): string | null {
    if (preset === "manual") return "manual";
    if (preset === "custom") return customSchedule ?? null;
    return preset;
  }

  private isValidCron(expression: string): boolean {
    // Basic cron validation — 5 fields separated by spaces
    const parts = expression.trim().split(/\s+/);

    if (parts.length !== 5) return false;

    const patterns = [
      /^(\*|([0-9]|[1-5][0-9])(-([0-9]|[1-5][0-9]))?(\/([0-9]|[1-5][0-9]))?(,([0-9]|[1-5][0-9])(-([0-9]|[1-5][0-9]))?)*)$/, // minute
      /^(\*|([0-9]|1[0-9]|2[0-3])(-([0-9]|1[0-9]|2[0-3]))?(\/([0-9]|1[0-9]|2[0-3]))?(,([0-9]|1[0-9]|2[0-3])(-([0-9]|1[0-9]|2[0-3]))?)*)$/, // hour
      /^(\*|([1-9]|[12][0-9]|3[01])(-([1-9]|[12][0-9]|3[01]))?(\/([1-9]|[12][0-9]|3[01]))?(,([1-9]|[12][0-9]|3[01])(-([1-9]|[12][0-9]|3[01]))?)*)$/, // day of month
      /^(\*|([1-9]|1[0-2])(-([1-9]|1[0-2]))?(\/([1-9]|1[0-2]))?(,([1-9]|1[0-2])(-([1-9]|1[0-2]))?)*)$/, // month
      /^(\*|([0-6])(-([0-6]))?(\/([0-6]))?(,([0-6])(-([0-6]))?)*)$/, // day of week
    ];

    return parts.every((part, index) => patterns[index].test(part));
  }
}

export const aiConfigController = new AIConfigController();
