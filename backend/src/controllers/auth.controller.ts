import { FastifyReply, FastifyRequest } from "fastify";
import { LoginBody, RegisterBody } from "../schemas/auth";
import { authService } from "../services/auth.service";

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/auth/refresh",
  maxAge: 60 * 60 * 24 * 7,
};

class AuthController {
  async register(request: FastifyRequest, reply: FastifyReply) {
    const { name, email, password } = request.body as RegisterBody;

    try {
      const { accessToken, refreshToken, user } = await authService.register(
        name,
        email,
        password,
      );

      reply.setCookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

      return reply.status(201).send({
        success: true,
        data: { accessToken, user },
      });
    } catch (err: any) {
      if (err.message == "EMAIL_TAKEN") {
        return reply.status(409).send({
          success: false,
          message: "Email already registered",
        });
      }
      throw err;
    }
  }

  async login(request: FastifyRequest, reply: FastifyReply) {
    const { email, password } = request.body as LoginBody;

    try {
      const { accessToken, refreshToken, user } = await authService.login(
        email,
        password,
      );

      reply.setCookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

      return reply.send({
        success: true,
        data: { accessToken, user },
      });
    } catch (err: any) {
      if (err.message === "INVALID_CREDENTIALS") {
        return reply
          .status(401)
          .send({ success: false, message: "Invalid credentials" });
      }
      throw err;
    }
  }

  async refresh(request: FastifyRequest, reply: FastifyReply) {
    const token = request.cookies?.refreshToken;

    if (!token) {
      return reply
        .status(401)
        .send({ success: false, message: "No refresh token" });
    }

    try {
      const { accessToken, refreshToken, user } =
        await authService.refresh(token);

      reply.setCookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

      return reply.send({
        success: true,
        data: { accessToken, user },
      });
    } catch (err: any) {
      if (err.message === "INVALID_REFRESH_TOKEN") {
        return reply.status(401).send({
          success: false,
          message: "Invalid or expired refresh token",
        });
      }
      throw err;
    }
  }

  async logout(request: FastifyRequest, reply: FastifyReply) {
    const token = request.cookies?.refreshToken;

    if (token) {
      await authService.logout(token);
    }

    reply.clearCookie("refreshToken", { path: "/auth/refresh" });

    return reply.send({ success: true, message: "Logged out" });
  }
}

export const authController = new AuthController();
