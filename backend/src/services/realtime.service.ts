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

    // name the handler so we can remove it on unsubscribe
    const handler = (receivedChannel: string, message: string) => {
      if (receivedChannel === channel) {
        onEvent(message);
      }
    };

    (subscriber as any)[`handler:${projectId}`] = handler;
    subscriber.on("message", handler);
  }

  // Unsubscribe from a project's event channel
  async unsubscribe(projectId: string): Promise<void> {
    const channel = getProjectChannel(projectId);
    await subscriber.unsubscribe(channel);

    // Remove the specific listener to prevent memory leaks
    const handler = (subscriber as any)[`handler:${projectId}`];
    if (handler) {
      subscriber.removeListener("message", handler);
      delete (subscriber as any)[`handler:${projectId}`];
    }
  }
}

export const realtimeService = new RealtimeService();
