import { FastifyInstance } from "fastify";
import { analyticsController } from "../controllers/analytics.controller";
import {
  TrackCrashSchema,
  TrackSessionSchema,
  TrackScreenViewSchema,
  TrackApiCallSchema,
  GetAnalyticsSchema,
} from "../schemas/analytics";

export default async function analyticsRoutes(app: FastifyInstance) {
  // ─── Ingest (API key auth) ────────────────────────────────────────────
  app.post(
    "/analytics/crash",
    { schema: TrackCrashSchema },
    analyticsController.trackCrash.bind(analyticsController),
  );

  app.post(
    "/analytics/session",
    { schema: TrackSessionSchema },
    analyticsController.trackSession.bind(analyticsController),
  );

  app.post(
    "/analytics/screen-view",
    { schema: TrackScreenViewSchema },
    analyticsController.trackScreenView.bind(analyticsController),
  );

  app.post(
    "/analytics/api-call",
    { schema: TrackApiCallSchema },
    analyticsController.trackApiCall.bind(analyticsController),
  );

  // ─── Dashboard (Bearer token auth) ───────────────────────────────────
  app.get(
    "/projects/:projectId/analytics",
    { schema: GetAnalyticsSchema, onRequest: [app.authenticate] },
    analyticsController.getCrashRate.bind(analyticsController),
  );
}
