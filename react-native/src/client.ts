import { PulseEvent } from "./types";

type AnalyticsType = "crash" | "session" | "screen-view" | "api-call";

export class PulseBoardClient {
  private host: string;
  private debug: boolean;

  constructor(host: string, debug = false) {
    this.host = host.replace(/\/$/, "");
    this.debug = debug;
  }

  // ─── Event Ingest ─────────────────────────────────────────────────

  async send(event: PulseEvent): Promise<boolean> {
    try {
      const response = await fetch(`${this.host}/ingest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
      });

      if (!response.ok) {
        this.log(
          `Failed to send event: ${response.status} ${response.statusText}`,
        );
        return false;
      }

      this.log(`Event sent: ${event.type} — ${event.name}`);
      return true;
    } catch (err) {
      this.log(`Network error sending event: ${err}`);
      return false;
    }
  }

  async sendBatch(events: PulseEvent[]): Promise<boolean> {
    const chunks = this.chunk(events, 5);

    for (const chunk of chunks) {
      await Promise.all(chunk.map((e) => this.send(e)));
    }

    return true;
  }

  // ─── Analytics Ingest ─────────────────────────────────────────────

  async sendAnalytics(
    type: AnalyticsType,
    payload: Record<string, unknown>,
  ): Promise<boolean> {
    try {
      const response = await fetch(`${this.host}/analytics/${type}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        this.log(
          `Failed to send analytics: ${response.status} ${response.statusText}`,
        );
        return false;
      }

      this.log(`Analytics sent: ${type}`);
      return true;
    } catch (err) {
      this.log(`Network error sending analytics: ${err}`);
      return false;
    }
  }

  // ─── Private ──────────────────────────────────────────────────────

  private chunk<T>(arr: T[], size: number): T[][] {
    return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
      arr.slice(i * size, i * size + size),
    );
  }

  private log(message: string): void {
    if (this.debug) {
      console.log(`[PulseBoard] ${message}`);
    }
  }
}
