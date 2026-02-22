import { FastifyRequest, FastifyReply } from "fastify";
import { projectsService } from "../services/projects.service";
import { CreateProjectBody, ProjectParams } from "../schemas/projects";

class ProjectsController {
  async create(request: FastifyRequest, reply: FastifyReply) {
    const { name } = request.body as CreateProjectBody;
    const { id: userId } = request.user;

    const project = await projectsService.create(name, userId);
    return reply.status(201).send({ success: true, data: project });
  }

  async findAll(request: FastifyRequest, reply: FastifyReply) {
    const { id: userId } = request.user;

    const projects = await projectsService.findAllByUser(userId);
    return reply.send({ success: true, data: projects });
  }

  async findOne(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as ProjectParams;
    const { id: userId } = request.user;

    const project = await projectsService.findOneByUser(id, userId);
    if (!project) {
      return reply
        .status(404)
        .send({ success: false, message: "Project not found" });
    }
    return reply.send({ success: true, data: project });
  }

  async remove(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as ProjectParams;
    const { id: userId } = request.user;

    try {
      await projectsService.delete(id, userId);
      return reply.send({ success: true, message: "Project deleted" });
    } catch (err: any) {
      if (err.message === "PROJECT_NOT_FOUND") {
        return reply
          .status(404)
          .send({ success: false, message: "Project not found" });
      }
      throw err;
    }
  }
}

export const projectsController = new ProjectsController();
