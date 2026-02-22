import { FastifyRequest, FastifyReply } from "fastify";
import { ingestService } from "../services/ingest.service";
import { GetEventsQuery, IngestBody } from "../schemas/ingest";

class IngestController {
  async ingest(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = request.body as IngestBody;
      const event = await ingestService.ingest(body);

      request.log.info({ eventId: event.id }, "Event persisted");

      return reply.status(201).send({
        success: true,
        message: "Event ingested",
        data: event,
      });
    } catch (err: any) {
      if (err.message === "INVALID_API_KEY") {
        return reply
          .status(401)
          .send({ success: false, message: "Invalid API key" });
      }
      throw err;
    }
  }

  async getEvents(request: FastifyRequest, reply: FastifyReply) {
    const { apiKey } = request.query as GetEventsQuery;

    try {
      const events = await ingestService.getEventsByApiKey(apiKey);
      return reply.send({ success: true, data: events });
    } catch (err: any) {
      if (err.message === "INVALID_API_KEY") {
        return reply
          .status(401)
          .send({ success: false, message: "Invalid API key" });
      }
      throw err;
    }
  }
}

export const ingestController = new IngestController();
