import { FastifyInstance, RouteShorthandOptions } from "fastify";

export const PostProjectOptions = (
  app: FastifyInstance,
): RouteShorthandOptions => ({
  onRequest: [app.authenticate],
  schema: {
    body: {
      type: "object",
      required: ["name"],
      properties: {
        name: { type: "string", minLength: 1 },
      },
    },
  },
});
