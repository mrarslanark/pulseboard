import { Static, Type } from "@sinclair/typebox";
import { FastifySchema } from "fastify";

const RegisterBodySchema = Type.Object({
  name: Type.String({ minLength: 2 }),
  email: Type.String({ format: "email" }),
  password: Type.String({ minLength: 8 }),
});

const LoginBodySchema = Type.Object({
  email: Type.String({ format: "email" }),
  password: Type.String(),
});

const AuthResponseSchema = Type.Object({
  success: Type.Boolean(),
  data: Type.Object({
    accessToken: Type.String(),
    user: Type.Object({
      id: Type.String(),
      name: Type.String(),
      email: Type.String(),
    }),
  }),
});

const ErrorResponseSchema = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
});

export type RegisterBody = Static<typeof RegisterBodySchema>;
export type LoginBody = Static<typeof LoginBodySchema>;

// Route Schemas
export const RegisterSchema: FastifySchema = {
  body: RegisterBodySchema,
  response: {
    201: AuthResponseSchema,
    409: ErrorResponseSchema,
  },
};

export const LoginSchema: FastifySchema = {
  body: LoginBodySchema,
  response: {
    200: AuthResponseSchema,
    401: ErrorResponseSchema,
  },
};

export const RefreshSchema: FastifySchema = {
  response: {
    200: AuthResponseSchema,
    401: ErrorResponseSchema,
  },
};

export const LogoutSchema: FastifySchema = {
  response: {
    200: Type.Boolean(),
    401: ErrorResponseSchema,
  },
};
