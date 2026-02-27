"use client";

import { useProject } from "@/hooks/useProjects";
import { useRealtimeEvents } from "@/hooks/useRealtimeEvents";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Copy, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { EventsFeed } from "@/components/dashboard/events-feed";

export default function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);

  const { data: project, isLoading } = useProject(id);
  const { events, connected, clearEvents } = useRealtimeEvents(id);
  const [copied, setCopied] = useState(false);

  const copyApiKey = () => {
    if (!project) return;
    navigator.clipboard.writeText(project.apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64 bg-slate-800" />
        <Skeleton className="h-24 bg-slate-800" />
        <Skeleton className="h-96 bg-slate-800" />
      </div>
    );
  }

  if (!project) {
    return <div className="text-slate-400">Project not found.</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{project.name}</h1>
          <p className="text-slate-400 mt-1">
            {project._count?.events ?? 0} total events
          </p>
        </div>
        <Badge
          variant="outline"
          className="text-emerald-400 border-emerald-400/30"
        >
          Active
        </Badge>
      </div>

      {/* API Key */}
      <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
        <p className="text-sm font-medium text-slate-400 mb-2">API Key</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 text-sm font-mono text-white bg-slate-800 px-3 py-2 rounded-md truncate">
            {project.apiKey}
          </code>
          <Button
            variant="outline"
            size="icon"
            className="border-slate-700 text-slate-400 hover:text-white shrink-0"
            onClick={copyApiKey}
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>
        {copied && (
          <p className="text-xs text-emerald-400 mt-2">Copied to clipboard!</p>
        )}
      </div>

      {/* Live Events Feed */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Live Events</h2>
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-white"
            onClick={clearEvents}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear
          </Button>
        </div>
        <EventsFeed events={events} connected={connected} />
      </div>
    </div>
  );
}
