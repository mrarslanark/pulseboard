import { FastifyInstance } from "fastify";
import { ingestController } from "../controllers/ingest.controller";
import { GetEventsSchema, IngestSchema } from "../schemas/ingest";

export default async function ingestRoutes(app: FastifyInstance) {
  // Create an event
  app.post(
    "/ingest",
    { schema: IngestSchema },
    ingestController.ingest.bind(ingestController),
  );

  // Get events by API key
  app.get(
    "/events",
    { schema: GetEventsSchema },
    ingestController.getEvents.bind(ingestController),
  );
}
