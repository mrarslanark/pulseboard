import { FastifyInstance } from "fastify";
import { authController } from "../controllers/auth.controller";
import {
  LoginSchema,
  LogoutSchema,
  RefreshSchema,
  RegisterSchema,
} from "../schemas/auth";

export default async function authRoutes(app: FastifyInstance) {
  // Register endpoint
  app.post(
    "/auth/register",
    { schema: RegisterSchema },
    authController.register.bind(authController),
  );

  // Login endpoint
  app.post(
    "/auth/login",
    { schema: LoginSchema },
    authController.login.bind(authController),
  );

  // Refresh token endpoint
  app.post(
    "/auth/refresh",
    { schema: RefreshSchema },
    authController.refresh.bind(authController),
  );

  // Logout endpoint
  app.post(
    "/auth/logout",
    { schema: LogoutSchema },
    authController.logout.bind(authController),
  );
}
