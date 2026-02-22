import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";
import { authService } from "../lib/auth";
import { RegisterOptions, LoginOptions } from "./schemas/auth";

interface RegisterBody {
  name: string;
  email: string;
  password: string;
}

interface LoginBody {
  email: string;
  password: string;
}

export default async function authRoutes(app: FastifyInstance) {
  // Register
  app.post<{ Body: RegisterBody }>(
    "/auth/register",
    RegisterOptions,
    async (
      request: FastifyRequest<{ Body: RegisterBody }>,
      reply: FastifyReply,
    ) => {
      const { name, email, password } = request.body;

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return reply
          .status(409)
          .send({ success: false, message: "Email already registered" });
      }

      const hashed = await bcrypt.hash(password, 12);

      const user = await prisma.user.create({
        data: { name, email, password: hashed },
      });

      const accessToken = authService.generateAccessToken(user.id, user.email);
      const refreshToken = await authService.generateRefreshToken(user.id);

      reply.setCookie("refreshToken", refreshToken, authService.cookieOptions);

      return reply.status(201).send({
        success: true,
        data: {
          accessToken,
          user: { id: user.id, name: user.name, email: user.email },
        },
      });
    },
  );

  // Login
  app.post<{ Body: LoginBody }>(
    "/auth/login",
    LoginOptions,
    async (
      request: FastifyRequest<{ Body: LoginBody }>,
      reply: FastifyReply,
    ) => {
      const { email, password } = request.body;

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return reply.status(401).send({
          success: false,
          message: "Invalid credentials",
        });
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return reply.status(401).send({
          success: false,
          message: "Invalid credentials",
        });
      }

      const accessToken = authService.generateAccessToken(user.id, user.email);
      const refreshToken = await authService.generateRefreshToken(user.id);

      reply.setCookie("refreshToken", refreshToken, authService.cookieOptions);

      return reply.send({
        success: true,
        data: {
          accessToken,
          user: { id: user.id, name: user.name, email: user.email },
        },
      });
    },
  );

  // Refresh Token
  app.post("/auth/refresh", async (request, reply) => {
    const token = request.cookies?.refreshToken;

    if (!token) {
      return reply
        .status(401)
        .send({ success: false, message: "No refresh token" });
    }

    try {
      const { accessToken, refreshToken, user } =
        await authService.rotateRefreshToken(token);

      reply.setCookie("refreshToken", refreshToken, authService.cookieOptions);

      return reply.send({
        success: true,
        data: {
          accessToken,
          user: { id: user.id, name: user.name, email: user.email },
        },
      });
    } catch (err) {
      return reply
        .status(401)
        .send({ success: false, message: "Invalid refresh token" });
    }
  });

  // Logout
  app.post("/auth/logout", async (request, reply) => {
    reply.clearCookie("refreshToken", { path: "/auth/refresh" });
    return reply.send({ success: true, message: "Logged out" });
  });
}
