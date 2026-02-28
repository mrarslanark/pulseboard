import {
  SDKConfig,
  TrackOptions,
  CaptureErrorOptions,
  PulseEvent,
  UserContext,
} from "./types";
import { PulseBoardClient } from "./client";
import { EventQueue } from "./queue";
import { AutoCapture } from "./auto-capture";
import { ContextCollector } from "./context";

class PulseBoardSDK {
  private config: SDKConfig | null = null;
  private client: PulseBoardClient | null = null;
  private queue: EventQueue | null = null;
  private autoCapture: AutoCapture | null = null;
  private contextCollector: ContextCollector | null = null;
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private initialized: boolean = false;

  init(config: SDKConfig): void {
    if (this.initialized) {
      this.log("SDK already initialized — skipping");
      return;
    }

    this.config = {
      autoCapture: true,
      debug: false,
      flushInterval: 5000,
      maxQueueSize: 100,
      ...config,
    };

    this.client = new PulseBoardClient(this.config.host, this.config.debug);
    this.queue = new EventQueue(this.config.maxQueueSize);
    this.contextCollector = new ContextCollector(this.config.app ?? {});

    this.flushTimer = setInterval(
      () => this.flush(),
      this.config.flushInterval,
    );

    if (this.config.autoCapture) {
      this.autoCapture = new AutoCapture((name, error, context) => {
        this.captureError(error, { payload: context });
      });
      this.autoCapture.attach();
    }

    this.initialized = true;
    this.log(`Initialized — host: ${this.config.host}`);
  }

  identify(user: UserContext): void {
    this.assertInitialized("identify");
    this.contextCollector!.identify(user);
    this.log(`User identified: ${JSON.stringify(user)}`);
  }

  clearUser(): void {
    this.assertInitialized("clearUser");
    this.contextCollector!.clearUser();
  }

  track(name: string, options: TrackOptions = {}): void {
    this.assertInitialized("track");
    this.buildAndEnqueue(
      "event",
      name,
      options.payload ?? {},
      options.timestamp,
    );
  }

  metric(name: string, value: number, options: TrackOptions = {}): void {
    this.assertInitialized("metric");
    this.buildAndEnqueue(
      "metric",
      name,
      { value, ...options.payload },
      options.timestamp,
    );
  }

  captureError(error: Error, options: CaptureErrorOptions = {}): void {
    this.assertInitialized("captureError");
    this.buildAndEnqueue("error", error.name ?? "UnknownError", {
      message: error.message,
      stack: error.stack,
      ...options.payload,
    });
  }

  async flush(): Promise<void> {
    if (!this.queue || this.queue.isEmpty) return;
    if (!this.client) return;

    const events = this.queue.dequeue(10);
    this.log(`Flushing ${events.length} event(s)`);
    await this.client.sendBatch(events);
  }

  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }

    this.autoCapture?.detach();
    this.queue?.clear();

    this.initialized = false;
    this.config = null;
    this.client = null;
    this.queue = null;
    this.contextCollector = null;

    this.log("SDK destroyed");
  }

  // ─── Private ──────────────────────────────────────────────────────

  private buildAndEnqueue(
    type: "event" | "metric" | "error",
    name: string,
    payload: Record<string, unknown>,
    timestamp?: string,
  ): void {
    // Collect context async then enqueue — don't block the caller
    this.contextCollector!.collect()
      .then((context) => {
        const event: PulseEvent = {
          apiKey: this.config!.apiKey,
          type,
          name,
          payload,
          timestamp: timestamp ?? new Date().toISOString(),
          context,
        };

        this.queue!.enqueue(event);
        this.log(`Queued: ${type} — ${name}`);

        // Flush errors immediately
        if (type === "error") {
          this.flush();
        }
      })
      .catch((err) => {
        this.log(`Failed to collect context: ${err}`);
      });
  }

  private assertInitialized(method: string): void {
    if (!this.initialized) {
      throw new Error(`PulseBoard.${method}() called before PulseBoard.init()`);
    }
  }

  private log(message: string): void {
    if (this.config?.debug) {
      console.log(`[PulseBoard] ${message}`);
    }
  }
}

export const PulseBoard = new PulseBoardSDK();

export type {
  SDKConfig,
  TrackOptions,
  CaptureErrorOptions,
  PulseEvent,
  EventType,
  UserContext,
  AppContext,
  DeviceContext,
  NetworkContext,
  SessionContext,
  EnrichedContext,
} from "./types";
