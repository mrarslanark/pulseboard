import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import app from "../app";
import { prisma } from "./prisma";
import { subscriber } from "./redis";

export function createSocketServer(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || "http://localhost:3001",
      credentials: true,
    },
  });

  // Auth middleware - runs before every connection
  io.use(async (socket, next) => {
    try {
      const authHeader = socket.handshake.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(new Error("Unauthorized - no token"));
      }

      const token = authHeader.split(" ")[1];
      console.log(token);
      const decoded = app.jwt.verify(token) as { id: string; email: string };

      socket.data.id = decoded.id;
      socket.data.email = decoded.email;

      next();
    } catch {
      next(new Error("Unauthorized - invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.data.id;
    console.log(`[Socket.IO] Client connected - userId: ${userId}`);

    // Client subscribes to a project's event stream
    socket.on("subscribe", async (projectId: string) => {
      try {
        // Verify ownership
        const project = await prisma.project.findFirst({
          where: { id: projectId, userId },
        });

        if (!project) {
          socket.emit("error", {
            message: "Project not found or access denied",
          });
          return;
        }

        // Join a room named after the project
        socket.join(projectId);
        socket.emit("subscribed", { projectId });

        console.log(
          `[Socket.IO] userId: ${userId} subscribed to project: ${projectId}`,
        );
      } catch {
        socket.emit("error", { message: "Failed to subscribe" });
      }
    });

    // Client unsubscribes from a project
    socket.on("unsubscribe", (projectId: string) => {
      socket.leave(projectId);
      socket.emit("unsubscribed", { projectId });
      console.log(
        `[Socket.IO] userId: ${userId} unsubscribed from project: ${projectId}`,
      );
    });

    socket.on("disconnect", () => {
      console.log(`[Socket.IO] Client disconnected — userId: ${userId}`);
    });
  });

  // Forward Redis pub/sub messages to the correct Socket.IO room
  subscriber.on("pmessage", (_pattern, channel, message) => {
    // Channel format: project:${projectId}:events
    const parts = channel.split(":");
    const projectId = parts[1];

    if (projectId) {
      io.to(projectId).emit("event", JSON.parse(message));
    }
  });

  // Subscribe to all project channels via pattern
  subscriber.psubscribe("project:*:events");

  return io;
}
