import { Type, Static } from "@sinclair/typebox";
import { FastifySchema } from "fastify";

// ─── Params ───────────────────────────────────────────────────────────────────

const ProjectParamsSchema = Type.Object({
  projectId: Type.String(),
});

const InsightParamsSchema = Type.Object({
  projectId: Type.String(),
  insightId: Type.String(),
});

export type ProjectParams = Static<typeof ProjectParamsSchema>;
export type InsightParams = Static<typeof InsightParamsSchema>;

// ─── Ingest Bodies ────────────────────────────────────────────────────────────

const CrashBodySchema = Type.Object({
  apiKey: Type.String(),
  errorName: Type.String(),
  errorMessage: Type.String(),
  stackTrace: Type.String(),
  isFatal: Type.Boolean(),
  sessionId: Type.Optional(Type.String()),
  context: Type.Optional(Type.Any()),
});

const SessionBodySchema = Type.Object({
  apiKey: Type.String(),
  sessionId: Type.String(),
  startedAt: Type.String(),
  endedAt: Type.Optional(Type.String()),
  duration: Type.Optional(Type.Number()),
  crashed: Type.Optional(Type.Boolean()),
  context: Type.Optional(Type.Any()),
});

const ScreenViewBodySchema = Type.Object({
  apiKey: Type.String(),
  screenName: Type.String(),
  loadTime: Type.Optional(Type.Number()),
  timeSpent: Type.Optional(Type.Number()),
  sessionId: Type.Optional(Type.String()),
  context: Type.Optional(Type.Any()),
});

const ApiCallBodySchema = Type.Object({
  apiKey: Type.String(),
  endpoint: Type.String(),
  httpMethod: Type.String(),
  statusCode: Type.Number(),
  duration: Type.Number(),
  payloadSize: Type.Optional(Type.Number()),
  sessionId: Type.Optional(Type.String()),
  context: Type.Optional(Type.Any()),
});

export type CrashBody = Static<typeof CrashBodySchema>;
export type SessionBody = Static<typeof SessionBodySchema>;
export type ScreenViewBody = Static<typeof ScreenViewBodySchema>;
export type ApiCallBody = Static<typeof ApiCallBodySchema>;

// ─── Route Schemas ────────────────────────────────────────────────────────────

export const TrackCrashSchema: FastifySchema = {
  body: CrashBodySchema,
};

export const TrackSessionSchema: FastifySchema = {
  body: SessionBodySchema,
};

export const TrackScreenViewSchema: FastifySchema = {
  body: ScreenViewBodySchema,
};

export const TrackApiCallSchema: FastifySchema = {
  body: ApiCallBodySchema,
};

export const GetAnalyticsSchema: FastifySchema = {
  params: ProjectParamsSchema,
};

export const GetInsightsSchema: FastifySchema = {
  params: ProjectParamsSchema,
};

export const TriggerInsightsSchema: FastifySchema = {
  params: ProjectParamsSchema,
};

export const MarkInsightReadSchema: FastifySchema = {
  params: InsightParamsSchema,
};
