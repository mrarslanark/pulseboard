import { getSocket } from "@/lib/socket";
import { PulseEvent } from "@/types";
import { useEffect, useState } from "react";

export function useRealtimeEvents(projectId: string, maxEvents = 50) {
  const [events, setEvents] = useState<PulseEvent[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!projectId) return;

    const socket = getSocket();

    // Connect if not already connected
    if (!socket.connected) {
      socket.connect();
    }

    socket.on("connect", () => {
      setConnected(true);
      // Subscribe to this project's event stream
      socket.emit("subscribe", projectId);
    });

    socket.on("subscribed", ({ projectId: pid }) => {
      console.log(`[Socket.IO] Subscribed to project: ${pid}`);
    });

    socket.on("event", (data: PulseEvent) => {
      setEvents((prev) => [data, ...prev].slice(0, maxEvents));
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    socket.on("connect_error", (err) => {
      console.error("[Socket.IO] Connection error:", err.message);
      setConnected(false);
    });

    // If already connected, subscribe immediately
    // if (socket.connected) {
    //   setConnected(true);
    //   socket.emit("subscribe", projectId);
    // }

    return () => {
      socket.emit("unsubscribe", projectId);
      socket.off("connect");
      socket.off("subscribed");
      socket.off("event");
      socket.off("disconnect");
      socket.off("connect_error");
    };
  }, [projectId, maxEvents]);

  const clearEvents = () => setEvents([]);

  return { events, connected, clearEvents };
}
