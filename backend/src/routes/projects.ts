import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../lib/prisma";
import { PostProjectOptions } from "./options/projects";
import { Authenticate } from "./options/common";

interface CreateProjectBody {
  name: string;
}

export default async function projectRoutes(app: FastifyInstance) {
  // Create a project
  app.post<{ Body: CreateProjectBody }>(
    "/projects",
    PostProjectOptions(app),
    async (
      request: FastifyRequest<{ Body: CreateProjectBody }>,
      reply: FastifyReply,
    ) => {
      const { name } = request.body;
      const userId = request.user.id;

      const project = await prisma.project.create({
        data: { name, userId },
      });

      return reply.status(201).send({
        success: true,
        data: project,
      });
    },
  );

  // List user's projects
  app.get("/projects", Authenticate(app), async (request, reply) => {
    const userId = request.user.id;

    const projects = await prisma.project.findMany({
      where: { userId },
      include: { _count: { select: { events: true } } },
      orderBy: { createdAt: "desc" },
    });

    return reply.send({ success: true, data: projects });
  });

  // Get a single project
  app.get<{ Params: { id: string } }>(
    "/projects/:id",
    Authenticate(app),
    async (request, reply) => {
      const { id } = request.params;
      const userId = request.user.id;

      const project = await prisma.project.findFirst({
        where: { id, userId }, // userId ensures ownership
        include: { _count: { select: { events: true } } },
      });

      if (!project) {
        return reply.status(404).send({
          success: false,
          message: "project not found",
        });
      }

      return reply.send({ success: true, data: project });
    },
  );

  // Delete a project
  app.delete<{ Params: { id: string } }>(
    "/projects/:id",
    Authenticate(app),
    async (request, reply) => {
      const { id } = request.params;
      const userId = request.user.id;

      const project = await prisma.project.findFirst({ where: { id, userId } });

      if (!project) {
        return reply.status(404).send({
          success: false,
          message: "Project not found",
        });
      }

      await prisma.project.delete({ where: { id } });
      return reply.send({
        success: true,
        message: "Project deleted successfully",
      });
    },
  );
}
