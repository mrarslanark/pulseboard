import { RouteShorthandOptions } from "fastify";

export const IngestOptions: RouteShorthandOptions = {
  schema: {
    body: {
      type: "object",
      required: ["apiKey", "type", "name", "payload"],
      properties: {
        apiKey: { type: "string" },
        type: { type: "string", enum: ["error", "event", "metric"] },
        name: { type: "string" },
        payload: { type: "object" },
        timestamp: { type: "string" },
      },
    },
  },
};

export const GetEventsOptions: RouteShorthandOptions = {
  schema: {
    querystring: {
      type: "object",
      required: ["apiKey"],
      properties: {
        apiKey: { type: "string" },
      },
    },
  },
};
