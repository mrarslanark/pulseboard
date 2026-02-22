import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import { EventType } from "@prisma/client";
import { request } from "node:http";

interface IngestBody {
  apiKey: string;
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
          required: ["apiKey", "type", "name", "payload"],
          properties: {
            apiKey: { type: "string" },
            type: { type: "string", enum: ["error", "event", "metric"] },
            name: { type: "string" },
            payload: { type: "object" },
            timestamp: { type: "string" },
          },
        },
      },
    },
    async (request, reply) => {
      const { apiKey, type, name, payload, timestamp } = request.body;

      const project = await prisma.project.findUnique({
        where: { apiKey },
      });

      if (!project) {
        return reply.status(401).send({
          success: false,
          message: "Invalid API key",
        });
      }

      const event = await prisma.event.create({
        data: {
          projectId: project.id,
          type: type as EventType,
          name,
          payload,
          timestamp: timestamp ? new Date(timestamp) : new Date(),
        },
      });

      request.log.info({ eventId: event.id }, "Event persisted");

      return reply.status(201).send({
        success: true,
        message: "Event ingested successfully",
        data: event,
      });
    },
  );

  app.get<{ Querystring: { apiKey: string } }>(
    "/events",
    {
      schema: {
        querystring: {
          type: "object",
          required: ["apiKey"],
          properties: {
            apiKey: { type: "string" },
          },
        },
      },
    },
    async (request, reply) => {
      const { apiKey } = request.query;

      const project = await prisma.project.findUnique({
        where: { apiKey },
        include: {
          events: {
            orderBy: { receivedAt: "desc" },
            take: 20,
          },
        },
      });

      if (!project) {
        return reply
          .status(401)
          .send({ success: false, message: "Invalid API key" });
      }

      return reply.send({
        success: true,
        data: project.events,
      });
    },
  );
}
