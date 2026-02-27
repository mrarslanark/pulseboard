import { tokenUtils } from "@/lib/api";
import { PulseEvent } from "@/types";
import { useEffect, useRef, useState } from "react";

export function useRealtimeEvents(projectId: string, maxEvents = 50) {
  const [events, setEvents] = useState<PulseEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!projectId) return;

    const token = tokenUtils.get();
    if (!token) return;

    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}/realtime/${projectId}`;
    const ws = new WebSocket(wsUrl, ["Bearer", token]);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);

      if (data.type === "connected") return;

      setEvents((prev) => {
        const updated = [data as PulseEvent, ...prev];
        return updated.slice(0, maxEvents);
      });
    };

    ws.onclose = () => setConnected(false);
    ws.onerror = () => setConnected(false);

    return () => ws.close();
  }, [projectId, maxEvents]);

  const clearEvents = () => setEvents([]);

  return { events, connected, clearEvents };
}
