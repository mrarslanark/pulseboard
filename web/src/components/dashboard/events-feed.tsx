"use client";

import { PulseEvent } from "@/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Props = {
  events: PulseEvent[];
  connected: boolean;
};

const typeStyles: Record<string, string> = {
  error: "bg-red-500/10 text-red-400 border-red-500/20",
  event: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  metric: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
};

export function EventsFeed({ events, connected }: Props) {
  return (
    <div className="flex flex-col gap-2">
      {/* Connection status */}
      <div className="flex items-center gap-2 mb-2">
        <div
          className={cn(
            "w-2 h-2 rounded-full",
            connected ? "bg-emerald-400 animate-pulse" : "bg-slate-600",
          )}
        />
        <span className="text-xs font-mono text-slate-500">
          {connected ? "Live — receiving events" : "Disconnected"}
        </span>
      </div>

      {events.length === 0 && (
        <div className="text-center py-12 text-slate-600 text-sm">
          No events yet. Send your first event using the API.
        </div>
      )}

      {events.map((event) => (
        <div
          key={event.id}
          className="flex items-start gap-3 p-3 rounded-md bg-slate-900 border border-slate-800 animate-in fade-in slide-in-from-top-2 duration-300"
        >
          <Badge
            variant="outline"
            className={cn(
              "text-xs font-mono shrink-0 mt-0.5",
              typeStyles[event.type],
            )}
          >
            {event.type}
          </Badge>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {event.name}
            </p>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              {new Date(event.receivedAt).toLocaleTimeString()}
            </p>
          </div>
          <pre className="text-xs text-slate-500 max-w-xs truncate hidden md:block">
            {JSON.stringify(event.payload)}
          </pre>
        </div>
      ))}
    </div>
  );
}
