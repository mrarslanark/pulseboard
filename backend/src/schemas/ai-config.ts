import { Type, Static } from "@sinclair/typebox";
import { FastifySchema } from "fastify";

// ─── Enums ────────────────────────────────────────────────────────────────────

const AIProviderEnum = Type.Union([
  Type.Literal("anthropic"),
  Type.Literal("openai"),
  Type.Literal("moonshot"),
  Type.Literal("google"),
]);

const AIModelEnum = Type.Union([
  Type.Literal("claude-sonnet-4-5"),
  Type.Literal("claude-haiku-4-5"),
  Type.Literal("gpt-4o"),
  Type.Literal("gpt-4o-mini"),
  Type.Literal("moonshot-v1-8k"),
  Type.Literal("moonshot-v1-32k"),
  Type.Literal("gemini-1.5-pro"),
  Type.Literal("gemini-1.5-flash"),
]);

const CronPresetEnum = Type.Union([
  Type.Literal("manual"), // no automatic schedule
  Type.Literal("0 9 * * *"), // once a day at 9am
  Type.Literal("0 9,21 * * *"), // twice a day
  Type.Literal("0 */12 * * *"), // every 12 hours
  Type.Literal("0 9 * * 1"), // weekly on Monday
  Type.Literal("custom"), // user-defined cron expression
]);

// ─── Params ───────────────────────────────────────────────────────────────────

const ProjectParamsSchema = Type.Object({
  projectId: Type.String(),
});

export type ProjectParams = Static<typeof ProjectParamsSchema>;

// ─── Bodies ───────────────────────────────────────────────────────────────────

const UpsertAIConfigBodySchema = Type.Object({
  provider: AIProviderEnum,
  model: AIModelEnum,
  apiKey: Type.String({ minLength: 1 }),
  cronPreset: CronPresetEnum,
  cronSchedule: Type.Optional(
    Type.String({ minLength: 9 }), // only required when cronPreset is 'custom'
  ),
});

export type UpsertAIConfigBody = Static<typeof UpsertAIConfigBodySchema>;

// ─── Route Schemas ────────────────────────────────────────────────────────────

export const GetAIConfigSchema: FastifySchema = {
  params: ProjectParamsSchema,
};

export const UpsertAIConfigSchema: FastifySchema = {
  params: ProjectParamsSchema,
  body: UpsertAIConfigBodySchema,
};

export const DeleteAIConfigSchema: FastifySchema = {
  params: ProjectParamsSchema,
};

export const TriggerInsightsSchema: FastifySchema = {
  params: ProjectParamsSchema,
};

// ─── Constants ────────────────────────────────────────────────────────────────

export const CRON_PRESET_LABELS: Record<string, string> = {
  manual: "Manual only",
  "0 9 * * *": "Once a day (9:00 AM)",
  "0 9,21 * * *": "Twice a day (9:00 AM & 9:00 PM)",
  "0 */12 * * *": "Every 12 hours",
  "0 9 * * 1": "Weekly (Monday 9:00 AM)",
  custom: "Custom schedule",
};

export const MANUAL_TRIGGER_COOLDOWN_MS = 60 * 60 * 1000; // 1 hour
