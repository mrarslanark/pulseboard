import { FastifySchema } from "fastify";
import { Type, Static } from "@sinclair/typebox";

// Schemas
const ProjectSchema = Type.Object({
  id: Type.String(),
  name: Type.String(),
  apiKey: Type.String(),
  userId: Type.String(),
  createdAt: Type.String(),
  updatedAt: Type.String(),
});

const CreateProjectBodySchema = Type.Object({
  name: Type.String({ minLength: 1 }),
});

const ProjectParamsSchema = Type.Object({
  id: Type.String(),
});

const ErrorResponseSchema = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
});

export type CreateProjectBody = Static<typeof CreateProjectBodySchema>;
export type ProjectParams = Static<typeof ProjectParamsSchema>;

// Fastify Schemas
export const CreateProjectSchema: FastifySchema = {
  body: CreateProjectBodySchema,
  response: {
    201: Type.Object({ success: Type.Boolean(), data: ProjectSchema }),
    401: ErrorResponseSchema,
  },
};

export const ListProjectsSchema: FastifySchema = {
  response: {
    200: Type.Object({
      success: Type.Boolean(),
      data: Type.Array(ProjectSchema),
    }),
  },
};

export const GetProjectSchema: FastifySchema = {
  params: ProjectParamsSchema,
  response: {
    200: Type.Object({ success: Type.Boolean(), data: ProjectSchema }),
    404: ErrorResponseSchema,
  },
};

export const DeleteProjectSchema: FastifySchema = {
  params: ProjectParamsSchema,
  response: {
    200: Type.Object({ success: Type.Boolean(), message: Type.String() }),
    404: ErrorResponseSchema,
  },
};

export const DeleteProjectEventsSchema: FastifySchema = {
  params: ProjectParamsSchema,
  response: {
    200: Type.Object({
      success: Type.Boolean(),
      message: Type.String(),
      data: Type.Object({
        deletedCount: Type.Number(),
      }),
    }),
    404: ErrorResponseSchema,
  },
};
