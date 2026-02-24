import { Static, Type } from "@sinclair/typebox";
import { FastifySchema } from "fastify";

const RealtimeParamsSchema = Type.Object({
  projectId: Type.String(),
});

export type RealtimeParams = Static<typeof RealtimeParamsSchema>;

export const RealtimeSchema: FastifySchema = {
  params: RealtimeParamsSchema,
};
