import fastifyCookie from "@fastify/cookie";
import fastifyCors from "@fastify/cors";
import fastifyJwt from "@fastify/jwt";
import fastifyWebsocket from "@fastify/websocket";
import Fastify, { FastifyReply, FastifyRequest } from "fastify";

const app = Fastify({
  logger: {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
      },
    },
  },
});

app.register(fastifyCors, {
  origin: process.env.CORS_ORIGIN || "http://localhost:3001",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
});

// Cookies
app.register(fastifyCookie);

// Socket connection
app.register(fastifyWebsocket);

// JWT
app.register(fastifyJwt, {
  secret: process.env.JWT_ACCESS_SECRET as string,
  sign: {
    expiresIn: process.env.JWT_ACCESS_EXPIRES as string,
  },
});

// Auth decorator - call this on any route you want to protect
app.decorate(
  "authenticate",
  async function (request: FastifyRequest, reply: FastifyReply) {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ success: false, message: "Unauthorized" });
    }
  },
);

export default app;
