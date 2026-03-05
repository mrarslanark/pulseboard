import { FastifyInstance } from "fastify";
import { aiConfigController } from "../controllers/ai-config.controller";
import {
  GetAIConfigSchema,
  UpsertAIConfigSchema,
  DeleteAIConfigSchema,
} from "../schemas/ai-config";

export default async function aiConfigRoutes(app: FastifyInstance) {
  // GET /projects/:projectId/ai-config
  app.get(
    "/projects/:projectId/ai-config",
    { schema: GetAIConfigSchema, onRequest: [app.authenticate] },
    aiConfigController.getAIConfig.bind(aiConfigController),
  );

  // POST /projects/:projectId/ai-config
  app.post(
    "/projects/:projectId/ai-config",
    { schema: UpsertAIConfigSchema, onRequest: [app.authenticate] },
    aiConfigController.upsertAIConfig.bind(aiConfigController),
  );

  // DELETE /projects/:projectId/ai-config
  app.delete(
    "/projects/:projectId/ai-config",
    { schema: DeleteAIConfigSchema, onRequest: [app.authenticate] },
    aiConfigController.deleteAIConfig.bind(aiConfigController),
  );
}
