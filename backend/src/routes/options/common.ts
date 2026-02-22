import { FastifyInstance, RouteShorthandOptions } from "fastify";

export const Authenticate = (app: FastifyInstance): RouteShorthandOptions => ({
  onRequest: [app.authenticate],
});
