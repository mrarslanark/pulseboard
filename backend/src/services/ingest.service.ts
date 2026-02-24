import { prisma } from "../lib/prisma";
import { Event, EventType, Prisma } from "@prisma/client";
import { getProjectChannel, publisher } from "../lib/redis";

export type IngestPayload = {
  apiKey: string;
  type: EventType;
  name: string;
  payload: Record<string, unknown>;
  timestamp?: string;
};

class IngestService {
  async ingest(data: IngestPayload): Promise<Event> {
    const project = await prisma.project.findUnique({
      where: { apiKey: data.apiKey },
    });

    if (!project) throw new Error("INVALID_API_KEY");

    const event = await prisma.event.create({
      data: {
        projectId: project.id,
        type: data.type,
        name: data.name,
        payload: data.payload as Prisma.InputJsonValue,
        timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
      },
    });

    // Publish to Redis after persisting - fire and forget
    const channel = getProjectChannel(project.id);
    await publisher.publish(channel, JSON.stringify(event));

    return event;
  }

  async getEventsByApiKey(apiKey: string): Promise<Event[]> {
    const project = await prisma.project.findUnique({
      where: { apiKey },
      include: {
        events: {
          orderBy: { receivedAt: "desc" },
          take: 20,
        },
      },
    });

    if (!project) throw new Error("INVALID_API_KEY");

    return project.events;
  }
}

export const ingestService = new IngestService();
