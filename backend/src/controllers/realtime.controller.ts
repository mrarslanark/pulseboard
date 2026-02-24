import { FastifyReply, FastifyRequest } from "fastify";
import { RealtimeParams } from "../schemas/realtime";
import { realtimeService } from "../services/realtime.service";
import { WebSocket } from "@fastify/websocket";

class RealtimeController {
  // WebSocket handler - live event stream
  async websocket(socket: WebSocket, request: FastifyRequest) {
    const { projectId } = request.params as RealtimeParams;
    const { id: userId } = request.user;

    const hasAccess = await realtimeService.validateProjectAccess(
      projectId,
      userId,
    );

    if (!hasAccess) {
      socket.send(JSON.stringify({ error: "Unauthorized" }));
      socket.close();
      return;
    }

    // Send a connected confirmation
    socket.send(JSON.stringify({ type: "connected", projectId }));

    // Start streaming events
    await realtimeService.subscribe(projectId, (data) => {
      if (socket.readyState === socket.OPEN) {
        socket.send(data);
      }
    });

    // Cleanup on disconnect
    socket.on("close", async () => {
      await realtimeService.unsubscribe(projectId);
    });

    socket.on("error", async () => {
      await realtimeService.unsubscribe(projectId);
    });
  }

  // SSE handler - fallback for environments where WebSocket is blocked
  async sse(request: FastifyRequest, reply: FastifyReply) {
    const { projectId } = request.params as RealtimeParams;
    const { id: userId } = request.user;

    const hasAccess = await realtimeService.validateProjectAccess(
      projectId,
      userId,
    );

    if (!hasAccess) {
      reply.status(401).send({ success: false, message: "Unauthorized" });
      return;
    }

    // Set SSE headers
    reply.raw.setHeader("Content-Type", "text/event-stream");
    reply.raw.setHeader("Cache-Control", "no-cache");
    reply.raw.setHeader("Connection", "keep-alive");
    reply.raw.setHeader("Access-Control-Allow-Origin", "*");
    reply.raw.flushHeaders();

    // Send a connected event
    reply.raw.write(
      `data: ${JSON.stringify({ type: "connected", projectId })}\n\n`,
    );

    // Stream events
    await realtimeService.subscribe(projectId, (data) => {
      reply.raw.write(`data: ${data}\n\n`);
    });

    // Cleanup on client disconnect
    request.raw.on("close", async () => {
      await realtimeService.unsubscribe(projectId);
    });
  }
}

export const realtimeController = new RealtimeController();
