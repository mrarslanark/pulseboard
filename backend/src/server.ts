import "dotenv/config";

import app from "./app";

// Routes
import authRoutes from "./routes/auth";
import ingestRoutes from "./routes/ingest";
import projectRoutes from "./routes/projects";
import { connectRedis } from "./lib/redis";
import realtimeRoutes from "./routes/realtime";

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "0.0.0.0";

app.register(authRoutes);
app.register(projectRoutes);
app.register(ingestRoutes);
app.register(realtimeRoutes);

const start = async () => {
  try {
    await connectRedis();
    await app.listen({ port: PORT, host: HOST });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
