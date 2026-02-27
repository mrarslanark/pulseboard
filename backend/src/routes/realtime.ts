import { FastifyInstance } from "fastify";
import { RealtimeSchema } from "../schemas/realtime";
import { realtimeController } from "../controllers/realtime.controller";

export default async function realtimeRoutes(app: FastifyInstance) {
  // SSE - GET http://localhost:3000/realtime/:projectId/sse
  app.get(
    "/realtime/:projectId/sse",
    {
      schema: RealtimeSchema,
      onRequest: [app.authenticate],
    },
    (req, reply) => realtimeController.sse(req, reply),
  );
}
