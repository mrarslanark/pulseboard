import { FastifySchema } from "fastify";
import { Type, Static } from "@sinclair/typebox";

const IngestBodySchema = Type.Object({
  apiKey: Type.String(),
  type: Type.Union([
    Type.Literal("error"),
    Type.Literal("event"),
    Type.Literal("metric"),
  ]),
  name: Type.String(),
  payload: Type.Record(Type.String(), Type.Unknown()),
  timestamp: Type.Optional(Type.String()),
});

const GetEventsQuerySchema = Type.Object({
  apiKey: Type.String(),
});

export type IngestBody = Static<typeof IngestBodySchema>;
export type GetEventsQuery = Static<typeof GetEventsQuerySchema>;

export const IngestSchema: FastifySchema = {
  body: IngestBodySchema,
  response: {
    201: Type.Object({
      success: Type.Boolean(),
      message: Type.String(),
      data: Type.Any(),
    }),
    401: Type.Object({ success: Type.Boolean(), message: Type.String() }),
  },
};

export const GetEventsSchema: FastifySchema = {
  querystring: GetEventsQuerySchema,
  response: {
    200: Type.Object({ success: Type.Boolean(), data: Type.Array(Type.Any()) }),
    401: Type.Object({ success: Type.Boolean(), message: Type.String() }),
  },
};
