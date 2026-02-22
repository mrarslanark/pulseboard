import app from "./app";
import authRoutes from "./routes/auth";

// Routes
import ingestRoutes from "./routes/ingest";
import projectRoutes from "./routes/projects";

import "dotenv/config";

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "0.0.0.0";

app.register(authRoutes);
app.register(projectRoutes);
app.register(ingestRoutes);

const start = async () => {
  try {
    await app.listen({ port: PORT, host: HOST });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
