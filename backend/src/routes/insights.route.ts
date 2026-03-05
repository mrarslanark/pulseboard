import { FastifyInstance } from "fastify";
import { insightsController } from "../controllers/insights.controller";
import {
  GetInsightsSchema,
  MarkInsightReadSchema,
  TriggerInsightsSchema,
} from "../schemas/analytics";

export default async function insightsRoutes(app: FastifyInstance) {
  // GET /projects/:projectId/insights
  app.get(
    "/projects/:projectId/insights",
    { schema: GetInsightsSchema, onRequest: [app.authenticate] },
    insightsController.getInsights.bind(insightsController),
  );

  // PATCH /projects/:projectId/insights/:insightId/read
  app.patch(
    "/projects/:projectId/insights/:insightId/read",
    { schema: MarkInsightReadSchema, onRequest: [app.authenticate] },
    insightsController.markInsightRead.bind(insightsController),
  );

  // POST /projects/:projectId/insights/trigger
  app.post(
    "/projects/:projectId/insights/trigger",
    { schema: TriggerInsightsSchema, onRequest: [app.authenticate] },
    insightsController.triggerInsights.bind(insightsController),
  );
}
