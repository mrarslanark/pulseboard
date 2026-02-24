import { prisma } from "../lib/prisma";
import { getProjectChannel, subscriber } from "../lib/redis";

type EventCallback = (data: string) => void;

class RealtimeService {
  // Validate that a project exists and belongs to the user
  async validateProjectAccess(
    projectId: string,
    userId: string,
  ): Promise<boolean> {
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
    });
    return !!project;
  }

  // Subscribe to a project's event channel
  async subscribe(projectId: string, onEvent: EventCallback): Promise<void> {
    const channel = getProjectChannel(projectId);
    await subscriber.subscribe(channel);

    subscriber.on("message", (receivedChannel, message) => {
      if (receivedChannel === channel) {
        onEvent(message);
      }
    });
  }

  // Unsubscribe from a project's event channel
  async unsubscribe(projectId: string): Promise<void> {
    const channel = getProjectChannel(projectId);
    await subscriber.unsubscribe(channel);
  }
}

export const realtimeService = new RealtimeService();
