import { FastifyInstance } from "fastify";

interface IngestBody {
  projectId: string;
  type: "error" | "event" | "metric";
  name: string;
  payload: Record<string, unknown>;
  timestamp?: string;
}

export default async function ingestRoutes(app: FastifyInstance) {
  app.post<{ Body: IngestBody }>(
    "/ingest",
    {
      schema: {
        body: {
          type: "object",
          required: ["projectId", "type", "name", "payload"],
          properties: {
            projectId: { type: "string" },
            type: { type: "string", enum: ["error", "event", "metric"] },
            name: { type: "string" },
            payload: { type: "object" },
            timestamp: { type: "string" },
          },
        },
      },
    },
    async (request, reply) => {
      const body = request.body;
      const event = {
        ...body,
        timestamp: body.timestamp ?? new Date().toISOString(),
        receivedAt: new Date().toISOString(),
      };

      request.log.info({ event }, "Event received");

      return reply.status(200).send({
        success: true,
        message: "Event ingested successfully",
        data: event,
      });
    },
  );
}
