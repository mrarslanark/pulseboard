import { prisma } from "../lib/prisma";
import { createHash } from "crypto";
import { Prisma } from "@prisma/client";

type CrashPayload = {
  errorName: string;
  errorMessage: string;
  stackTrace: string;
  isFatal: boolean;
  sessionId?: string;
  context?: Record<string, any>;
};

type SessionPayload = {
  sessionId: string;
  startedAt: string;
  endedAt?: string;
  duration?: number;
  crashed?: boolean;
  context?: Record<string, any>;
};

type ScreenViewPayload = {
  screenName: string;
  loadTime?: number;
  timeSpent?: number;
  sessionId?: string;
  context?: Record<string, any>;
};

type ApiCallPayload = {
  endpoint: string;
  httpMethod: string;
  statusCode: number;
  duration: number;
  payloadSize?: number;
  sessionId?: string;
  context?: Record<string, any>;
};

type MetricPayload = {
  name: string;
  value: number;
  unit?: string;
  sessionId?: string;
  context?: Record<string, any>;
};

export class AnalyticsService {
  // ─── Crash ──────────────────────────────────────────────────────────

  async trackCrash(projectId: string, payload: CrashPayload) {
    const fingerprint = this.generateFingerprint(
      payload.errorName,
      payload.stackTrace,
    );

    const context = payload.context ?? {};

    // Upsert crash group
    const crashGroup = await prisma.crashGroup.upsert({
      where: { projectId_fingerprint: { projectId, fingerprint } },
      create: {
        projectId,
        fingerprint,
        errorName: payload.errorName,
        errorMessage: payload.errorMessage,
        occurrences: 1,
        affectedUsers: context.userId ? 1 : 0,
        firstSeenAt: new Date(),
        lastSeenAt: new Date(),
      },
      update: {
        occurrences: { increment: 1 },
        lastSeenAt: new Date(),
        errorMessage: payload.errorMessage,
      },
    });

    // Create analytics event
    await prisma.analyticsEvent.create({
      data: {
        projectId,
        type: "crash",
        sessionId: payload.sessionId,
        timestamp: new Date(),
        platform: context.device?.platform,
        os: context.device?.os,
        osVersion: context.device?.osVersion,
        deviceModel: context.device?.model,
        manufacturer: context.device?.manufacturer,
        appVersion: context.device?.appVersion,
        buildNumber: context.device?.buildNumber,
        isEmulator: context.device?.isEmulator,
        networkType: context.network?.type,
        carrier: context.network?.carrier,
        userId: context.user?.userId,
        language: context.device?.language,
        timezone: context.device?.timezone,
        errorName: payload.errorName,
        errorMessage: payload.errorMessage,
        stackTrace: payload.stackTrace,
        isFatal: payload.isFatal,
        crashGroupId: crashGroup.id,
      },
    });

    // Mark session as crashed
    if (payload.sessionId) {
      await prisma.session.updateMany({
        where: { projectId, sessionId: payload.sessionId },
        data: { crashed: true },
      });
    }

    return crashGroup;
  }

  // ─── Session ────────────────────────────────────────────────────────

  async trackSession(projectId: string, payload: SessionPayload) {
    const context = payload.context ?? {};

    await prisma.session.upsert({
      where: {
        // Sessions are unique per project + sessionId
        id: await this.findSessionId(projectId, payload.sessionId),
      },
      create: {
        projectId,
        sessionId: payload.sessionId,
        userId: context.user?.userId,
        appVersion: context.device?.appVersion,
        platform: context.device?.platform,
        os: context.device?.os,
        osVersion: context.device?.osVersion,
        deviceModel: context.device?.model,
        startedAt: new Date(payload.startedAt),
        endedAt: payload.endedAt ? new Date(payload.endedAt) : undefined,
        duration: payload.duration,
        crashed: payload.crashed ?? false,
      },
      update: {
        endedAt: payload.endedAt ? new Date(payload.endedAt) : undefined,
        duration: payload.duration,
        crashed: payload.crashed ?? false,
      },
    });
  }

  // ─── Screen View ────────────────────────────────────────────────────

  async trackScreenView(projectId: string, payload: ScreenViewPayload) {
    const context = payload.context ?? {};

    await prisma.analyticsEvent.create({
      data: {
        projectId,
        type: "screen_view",
        sessionId: payload.sessionId,
        timestamp: new Date(),
        platform: context.device?.platform,
        os: context.device?.os,
        osVersion: context.device?.osVersion,
        deviceModel: context.device?.model,
        appVersion: context.device?.appVersion,
        networkType: context.network?.type,
        userId: context.user?.userId,
        screenName: payload.screenName,
        loadTime: payload.loadTime,
        timeSpent: payload.timeSpent,
      },
    });
  }

  // ─── API Call ───────────────────────────────────────────────────────

  async trackApiCall(projectId: string, payload: ApiCallPayload) {
    const context = payload.context ?? {};

    await prisma.analyticsEvent.create({
      data: {
        projectId,
        type: "api_call",
        sessionId: payload.sessionId,
        timestamp: new Date(),
        platform: context.device?.platform,
        os: context.device?.os,
        osVersion: context.device?.osVersion,
        deviceModel: context.device?.model,
        appVersion: context.device?.appVersion,
        networkType: context.network?.type,
        userId: context.user?.userId,
        endpoint: payload.endpoint,
        httpMethod: payload.httpMethod,
        statusCode: payload.statusCode,
        duration: payload.duration,
        payloadSize: payload.payloadSize,
      },
    });
  }

  // ─── Metric ─────────────────────────────────────────────────────────

  async trackMetric(projectId: string, payload: MetricPayload) {
    const context = payload.context ?? {};

    await prisma.analyticsEvent.create({
      data: {
        projectId,
        type: "metric",
        sessionId: payload.sessionId,
        timestamp: new Date(),
        platform: context.device?.platform,
        os: context.device?.os,
        osVersion: context.device?.osVersion,
        deviceModel: context.device?.model,
        appVersion: context.device?.appVersion,
        networkType: context.network?.type,
        userId: context.user?.userId,
        metricName: payload.name,
        metricValue: payload.value,
        metricUnit: payload.unit,
      },
    });
  }

  // ─── Aggregation queries ────────────────────────────────────────────

  async getCrashRate(projectId: string, days = 7) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [totalSessions, crashedSessions] = await Promise.all([
      prisma.session.count({
        where: { projectId, startedAt: { gte: since } },
      }),
      prisma.session.count({
        where: { projectId, startedAt: { gte: since }, crashed: true },
      }),
    ]);

    const crashRate = totalSessions > 0 ? crashedSessions / totalSessions : 0;
    const crashFreeUsers = 1 - crashRate;

    return {
      totalSessions,
      crashedSessions,
      crashRate: Number((crashRate * 100).toFixed(2)),
      crashFreeUsers: Number((crashFreeUsers * 100).toFixed(2)),
    };
  }

  async getTopCrashGroups(projectId: string, limit = 10) {
    return prisma.crashGroup.findMany({
      where: { projectId, resolved: false },
      orderBy: { occurrences: "desc" },
      take: limit,
    });
  }

  async getCrashRateByVersion(projectId: string, days = 30) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const results = await prisma.analyticsEvent.groupBy({
      by: ["appVersion"],
      where: { projectId, type: "crash", timestamp: { gte: since } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    });

    return results.map((r) => ({
      appVersion: r.appVersion ?? "unknown",
      crashes: r._count.id,
    }));
  }

  async getCrashRateByDevice(projectId: string, days = 30) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const results = await prisma.analyticsEvent.groupBy({
      by: ["deviceModel"],
      where: { projectId, type: "crash", timestamp: { gte: since } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    });

    return results.map((r) => ({
      deviceModel: r.deviceModel ?? "unknown",
      crashes: r._count.id,
    }));
  }

  async getApiPerformance(projectId: string, days = 7) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const results = await prisma.analyticsEvent.groupBy({
      by: ["endpoint"],
      where: { projectId, type: "api_call", timestamp: { gte: since } },
      _count: { id: true },
      _avg: { duration: true },
      orderBy: { _avg: { duration: "desc" } },
      take: 10,
    });

    return results.map((r) => ({
      endpoint: r.endpoint ?? "unknown",
      calls: r._count.id,
      avgDuration: Math.round(r._avg.duration ?? 0),
    }));
  }

  async getScreenPerformance(projectId: string, days = 7) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const results = await prisma.analyticsEvent.groupBy({
      by: ["screenName"],
      where: { projectId, type: "screen_view", timestamp: { gte: since } },
      _count: { id: true },
      _avg: { loadTime: true },
      orderBy: { _avg: { loadTime: "desc" } },
      take: 10,
    });

    return results.map((r) => ({
      screenName: r.screenName ?? "unknown",
      views: r._count.id,
      avgLoadTime: Math.round(r._avg.loadTime ?? 0),
    }));
  }

  // ─── Private helpers ────────────────────────────────────────────────

  private generateFingerprint(errorName: string, stackTrace: string): string {
    // Take first 3 lines of stack trace for fingerprinting
    const topFrames = stackTrace.split("\n").slice(0, 3).join("\n");

    return createHash("sha256")
      .update(`${errorName}:${topFrames}`)
      .digest("hex")
      .substring(0, 16);
  }

  private async findSessionId(
    projectId: string,
    sessionId: string,
  ): Promise<string> {
    const session = await prisma.session.findFirst({
      where: { projectId, sessionId },
    });
    return session?.id ?? "new";
  }
}

export const analyticsService = new AnalyticsService();
