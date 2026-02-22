import { RouteShorthandOptions } from "fastify";

export const RegisterOptions: RouteShorthandOptions = {
  schema: {
    body: {
      type: "object",
      required: ["name", "email", "password"],
      properties: {
        name: { type: "string", minLength: 2 },
        email: { type: "string", format: "email" },
        password: { type: "string", minLength: 8 },
      },
    },
  },
};

export const LoginOptions: RouteShorthandOptions = {
  schema: {
    body: {
      type: "object",
      required: ["email", "password"],
      properties: {
        email: { type: "string", format: "email" },
        password: { type: "string" },
      },
    },
  },
};
