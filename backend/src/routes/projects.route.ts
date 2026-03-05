import { FastifyInstance } from "fastify";
import { projectsController } from "../controllers/projects.controller";
import {
  CreateProjectSchema,
  DeleteProjectEventsSchema,
  DeleteProjectSchema,
  GetProjectSchema,
  ListProjectsSchema,
} from "../schemas/projects";

export default async function projectRoutes(app: FastifyInstance) {
  // Create a project
  app.post(
    "/projects",
    { schema: CreateProjectSchema, onRequest: [app.authenticate] },
    projectsController.create.bind(projectsController),
  );

  // List projects
  app.get(
    "/projects",
    { schema: ListProjectsSchema, onRequest: [app.authenticate] },
    projectsController.findAll.bind(projectsController),
  );

  // Get a single project
  app.get(
    "/projects/:id",
    { schema: GetProjectSchema, onRequest: [app.authenticate] },
    projectsController.findOne.bind(projectsController),
  );

  // Delete a project
  app.delete(
    "/projects/:id",
    { schema: DeleteProjectSchema, onRequest: [app.authenticate] },
    projectsController.remove.bind(projectsController),
  );

  // Delete all events related to a project
  app.delete(
    "/projects/:id/events",
    { schema: DeleteProjectEventsSchema, onRequest: [app.authenticate] },
    projectsController.removeAllEvents.bind(projectsController),
  );
}
