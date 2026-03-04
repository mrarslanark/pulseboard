import { FastifyInstance } from "fastify";
import { MarkInsightReadSchema, TrackCrashSchema } from "../schemas/analytics";
import { analyticsController } from "../controllers/analytics.controller";

export default async function analyticsRoutes(app: FastifyInstance) {
  // ─── Ingest (API Key auth, no Bearer token) ──────────────────────────
  app.post(
    "/analytics/crash",
    { schema: TrackCrashSchema },
    analyticsController.trackCrash.bind(analyticsController),
  );
  app.post(
    "/analytics/session",
    analyticsController.trackSession.bind(analyticsController),
  );
  app.post(
    "/analytics/screen-view",
    analyticsController.trackScreenView.bind(analyticsController),
  );
  app.post(
    "/analytics/api-call",
    analyticsController.trackApiCall.bind(analyticsController),
  );

  // ─── Dashboard (Bearer token auth) ─────────────────────────────────
  app.get(
    "/projects/:projectId/analytics",
    { preHandler: [app.authenticate] },
    analyticsController.getCrashRate.bind(analyticsController),
  );

  app.get(
    "/projects/:projectId/insights",
    { preHandler: [app.authenticate] },
    analyticsController.getInsights.bind(analyticsController),
  );

  app.post(
    "/projects/:projectId/insights/trigger",
    { preHandler: [app.authenticate] },
    analyticsController.triggerInsights.bind(analyticsController),
  );

  app.patch(
    "/projects/:projectId/insights/:insightId/read",
    { schema: MarkInsightReadSchema, onRequest: [app.authenticate] },
    analyticsController.markInsightRead.bind(analyticsController),
  );
}
