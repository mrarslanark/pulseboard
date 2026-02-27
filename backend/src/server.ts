import "dotenv/config";

import app from "./app";

// Routes
import authRoutes from "./routes/auth";
import ingestRoutes from "./routes/ingest";
import projectRoutes from "./routes/projects";

// Libraries
import { connectRedis } from "./lib/redis";

// Schedulers
import { startScheduler } from "./lib/scheduler";

// Workers
import "./workers/alert.worker";
import "./workers/digest.worker";
import "./workers/retention.worker";
import { createServer } from "http";
import { createSocketServer } from "./lib/socket";

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "0.0.0.0";

app.register(authRoutes);
app.register(projectRoutes);
app.register(ingestRoutes);

const start = async () => {
  try {
    await connectRedis();
    await startScheduler();

    // Build the Fastify app and get the underlying HTTP server
    await app.ready();

    // Attach Socket.IO to the same HTTP server
    createSocketServer(app.server);

    app.listen(
      { port: PORT, host: HOST },
      (_: Error | null, address: string) => {
        app.log.info(`Server listening at ${address}`);
      },
    );
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
