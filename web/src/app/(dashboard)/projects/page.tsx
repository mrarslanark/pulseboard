"use client";

import { useState } from "react";
import Link from "next/link";
import {
  useProjects,
  useCreateProject,
  useDeleteProject,
} from "@/hooks/useProjects";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Trash2, ArrowRight, FolderKanban } from "lucide-react";

export default function ProjectsPage() {
  const { data: projects, isLoading } = useProjects();
  const createProject = useCreateProject();
  const deleteProject = useDeleteProject();
  const [newProjectName, setNewProjectName] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCreate = async () => {
    if (!newProjectName.trim()) return;
    await createProject.mutateAsync(newProjectName.trim());
    setNewProjectName("");
    setDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    await deleteProject.mutateAsync(id);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48 bg-slate-800" />
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32 bg-slate-800" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-slate-400 mt-1">
            {projects?.length ?? 0} project{projects?.length !== 1 ? "s" : ""}
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold">
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-800">
            <DialogHeader>
              <DialogTitle className="text-white">
                Create a new project
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <Input
                placeholder="My Mobile App"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                autoFocus
              />
              <Button
                onClick={handleCreate}
                disabled={!newProjectName.trim() || createProject.isPending}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-semibold"
              >
                {createProject.isPending ? "Creating..." : "Create Project"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Empty state */}
      {projects?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <FolderKanban className="w-12 h-12 text-slate-700 mb-4" />
          <p className="text-slate-400 font-medium">No projects yet</p>
          <p className="text-slate-600 text-sm mt-1">
            Create your first project to start ingesting events
          </p>
        </div>
      )}

      {/* Projects grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects?.map((project) => (
          <Card
            key={project.id}
            className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors"
          >
            <CardHeader className="flex flex-row items-start justify-between pb-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <CardTitle className="text-white text-base">
                  {project.name}
                </CardTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-600 hover:text-red-400 -mt-1 -mr-2"
                onClick={() => handleDelete(project.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge
                  variant="outline"
                  className="text-slate-400 border-slate-700 font-mono text-xs"
                >
                  {project._count?.events ?? 0} events
                </Badge>
              </div>

              <code className="block text-xs font-mono text-slate-600 truncate">
                {project.apiKey}
              </code>

              <Link href={`/projects/${project.id}`}>
                <Button
                  variant="outline"
                  className="w-full border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 mt-2"
                >
                  View Project
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
