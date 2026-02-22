import { Project } from "@prisma/client";
import { prisma } from "../lib/prisma";

export type ProjectWithCount = Project & {
  _count: { events: number };
};

class ProjectsService {
  async create(name: string, userId: string): Promise<Project> {
    return prisma.project.create({
      data: { name, userId },
    });
  }

  async findAllByUser(userId: string): Promise<ProjectWithCount[]> {
    return prisma.project.findMany({
      where: { userId },
      include: { _count: { select: { events: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOneByUser(
    id: string,
    userId: string,
  ): Promise<ProjectWithCount | null> {
    return prisma.project.findFirst({
      where: { id, userId },
      include: { _count: { select: { events: true } } },
    });
  }

  async delete(id: string, userId: string): Promise<void> {
    const project = await prisma.project.findFirst({ where: { id, userId } });
    if (!project) throw new Error("PROJECT_NOT_FOUND");

    await prisma.project.delete({ where: { id } });
  }
}

export const projectsService = new ProjectsService();
