import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "../lib/prisma";
import { analyticsService } from "./analytics.service";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

type InsightResult = {
  title: string;
  description: string;
  severity: "critical" | "warning" | "info";
  category: "crash" | "performance" | "network" | "release" | "user_behaviour";
  metadata: Record<string, unknown>;
};

export class InsightsService {
  async generateInsightsForProject(projectId: string): Promise<void> {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) return;

    // Gather all analytics data
    const [
      crashRate,
      topCrashes,
      crashesByVersion,
      crashesByDevice,
      apiPerformance,
      screenPerformance,
    ] = await Promise.all([
      analyticsService.getCrashRate(projectId, 7),
      analyticsService.getTopCrashGroups(projectId, 5),
      analyticsService.getCrashRateByVersion(projectId, 30),
      analyticsService.getCrashRateByDevice(projectId, 30),
      analyticsService.getApiPerformance(projectId, 7),
      analyticsService.getScreenPerformance(projectId, 7),
    ]);

    // Build structured prompt
    const prompt = this.buildPrompt({
      projectName: project.name,
      crashRate,
      topCrashes,
      crashesByVersion,
      crashesByDevice,
      apiPerformance,
      screenPerformance,
    });

    // Call Claude
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
      system: `You are an expert mobile app observability analyst.
Your job is to analyse crash reports, performance metrics, and usage data
and generate clear, actionable insights for mobile developers.

Always respond with a valid JSON array of insights.
Each insight must have: title, description, severity, category, metadata.
severity: critical | warning | info
category: crash | performance | network | release | user_behaviour

Be specific and data-driven. Reference actual numbers from the data.
Prioritise insights that are actionable — things the developer can fix.
Maximum 5 insights per response. Only include insights that are meaningful.
If the data shows no issues, return an empty array.`,
    });

    // Parse response
    const content = response.content[0];
    if (content.type !== "text") return;

    let insights: InsightResult[] = [];

    try {
      const cleaned = content.text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      insights = JSON.parse(cleaned);
    } catch {
      console.error(
        "[InsightsService] Failed to parse AI response:",
        content.text,
      );
      return;
    }

    if (!Array.isArray(insights) || insights.length === 0) return;

    // Store insights — delete old unread insights first to avoid stale data
    await prisma.insight.deleteMany({
      where: { projectId, isRead: false },
    });

    await prisma.insight.createMany({
      data: insights.map((insight) => ({
        projectId,
        title: insight.title,
        description: insight.description,
        severity: insight.severity,
        category: insight.category,
        metadata: insight.metadata as any,
        generatedAt: new Date(),
      })),
    });

    console.log(
      `[InsightsService] Generated ${insights.length} insights for project ${projectId}`,
    );
  }

  async generateInsightsForAllProjects(): Promise<void> {
    // Only generate insights for projects with sufficient data
    const projects = await prisma.project.findMany({
      where: {
        analyticsEvents: {
          some: {
            timestamp: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
        },
      },
    });

    console.log(
      `[InsightsService] Generating insights for ${projects.length} projects`,
    );

    // Process sequentially to avoid API rate limits
    for (const project of projects) {
      try {
        await this.generateInsightsForProject(project.id);
        // Small delay between projects to respect rate limits
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (err) {
        console.error(
          `[InsightsService] Failed for project ${project.id}:`,
          err,
        );
      }
    }
  }

  async getInsightsForProject(projectId: string) {
    return prisma.insight.findMany({
      where: { projectId },
      orderBy: [
        { severity: "asc" }, // critical first
        { generatedAt: "desc" },
      ],
      take: 20,
    });
  }

  async markInsightRead(insightId: string, projectId: string) {
    return prisma.insight.updateMany({
      where: { id: insightId, projectId },
      data: { isRead: true },
    });
  }

  // ─── Prompt Builder ─────────────────────────────────────────────────

  private buildPrompt(data: {
    projectName: string;
    crashRate: Awaited<ReturnType<typeof analyticsService.getCrashRate>>;
    topCrashes: Awaited<ReturnType<typeof analyticsService.getTopCrashGroups>>;
    crashesByVersion: Awaited<
      ReturnType<typeof analyticsService.getCrashRateByVersion>
    >;
    crashesByDevice: Awaited<
      ReturnType<typeof analyticsService.getCrashRateByDevice>
    >;
    apiPerformance: Awaited<
      ReturnType<typeof analyticsService.getApiPerformance>
    >;
    screenPerformance: Awaited<
      ReturnType<typeof analyticsService.getScreenPerformance>
    >;
  }): string {
    return `
Analyse the following observability data for the mobile app "${data.projectName}" and generate actionable insights.

## Crash Analytics (Last 7 Days)
- Total Sessions: ${data.crashRate.totalSessions}
- Crashed Sessions: ${data.crashRate.crashedSessions}
- Crash Rate: ${data.crashRate.crashRate}%
- Crash-Free Users: ${data.crashRate.crashFreeUsers}%

## Top Crash Signatures
${
  data.topCrashes.length > 0
    ? data.topCrashes
        .map(
          (c) =>
            `- ${c.errorName}: "${c.errorMessage}" — ${c.occurrences} occurrences, first seen ${c.firstSeenAt.toISOString()}, last seen ${c.lastSeenAt.toISOString()}`,
        )
        .join("\n")
    : "- No crashes recorded"
}

## Crashes by App Version (Last 30 Days)
${
  data.crashesByVersion.length > 0
    ? data.crashesByVersion
        .map((v) => `- v${v.appVersion}: ${v.crashes} crashes`)
        .join("\n")
    : "- No version data available"
}

## Crashes by Device (Last 30 Days)
${
  data.crashesByDevice.length > 0
    ? data.crashesByDevice
        .map((d) => `- ${d.deviceModel}: ${d.crashes} crashes`)
        .join("\n")
    : "- No device data available"
}

## API Performance (Last 7 Days, sorted by slowest)
${
  data.apiPerformance.length > 0
    ? data.apiPerformance
        .map((a) => `- ${a.endpoint}: ${a.calls} calls, avg ${a.avgDuration}ms`)
        .join("\n")
    : "- No API call data available"
}

## Screen Load Performance (Last 7 Days, sorted by slowest)
${
  data.screenPerformance.length > 0
    ? data.screenPerformance
        .map(
          (s) =>
            `- ${s.screenName}: ${s.views} views, avg load ${s.avgLoadTime}ms`,
        )
        .join("\n")
    : "- No screen view data available"
}

Based on this data, generate a JSON array of insights. Return ONLY the JSON array, no other text.
`;
  }
}

export const insightsService = new InsightsService();
