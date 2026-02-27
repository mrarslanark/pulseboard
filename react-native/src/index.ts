import { AutoCapture } from "./auto-capture";
import { PulseBoardClient } from "./client";
import { EventQueue } from "./queue";
import {
  CaptureErrorOptions,
  PulseEvent,
  SDKConfig,
  TrackOptions,
} from "./types";

class PulseBoardSDK {
  private config: SDKConfig | null = null;
  private client: PulseBoardClient | null = null;
  private queue: EventQueue | null = null;
  private autoCapture: AutoCapture | null = null;
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private initialized: boolean = false;

  // ─── Public API ───────────────────────────────────────────────────

  init(config: SDKConfig): void {
    if (this.initialized) {
      this.log("SDK already initialized — skipping");
      return;
    }

    this.config = {
      autoCapture: true,
      debug: false,
      flushInterval: 5_000,
      maxQueueSize: 100,
      ...config,
    };

    this.client = new PulseBoardClient(this.config.host, this.config.debug);
    this.queue = new EventQueue(this.config.maxQueueSize);

    // Start the flush interval
    this.flushTimer = setInterval(
      () => this.flush(),
      this.config.flushInterval,
    );

    // Attach global error capture if enabled
    if (this.config.autoCapture) {
      this.autoCapture = new AutoCapture((name, error, context) => {
        this.captureError(error, { payload: context });
      });
      this.autoCapture.attach();
    }

    this.initialized = true;
    this.log(`Initialized — host: ${this.config.host}`);
  }

  track(name: string, options: TrackOptions = {}): void {
    this.assertInitialized("track");

    const event: PulseEvent = {
      apiKey: this.config!.apiKey,
      type: "event",
      name,
      payload: options.payload ?? {},
      timestamp: options.timestamp ?? new Date().toISOString(),
    };
  }

  metric(name: string, value: number, options: TrackOptions = {}): void {
    this.assertInitialized("metric");

    const event: PulseEvent = {
      apiKey: this.config!.apiKey,
      type: "metric",
      name,
      payload: { value, ...options.payload },
      timestamp: options.timestamp ?? new Date().toISOString(),
    };

    this.enqueue(event);
  }

  captureError(error: Error, options: CaptureErrorOptions = {}): void {
    this.assertInitialized("captureError");

    const event: PulseEvent = {
      apiKey: this.config!.apiKey,
      type: "error",
      name: error.name ?? "Unknown Error",
      payload: {
        message: error.message,
        stack: error.stack,
        ...options.payload,
      },
      timestamp: new Date().toISOString(),
    };

    this.enqueue(event);
  }

  async flush(): Promise<void> {
    if (!this.queue || this.queue.isEmpty) return;
    if (!this.client) return;

    const events = this.queue.dequeue(10); // flush up to 10 at a time
    this.log(`Flushing ${events.length} events(s)`);
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

    this.log("SDK destroyed");
  }

  // ─── Private helpers ──────────────────────────────────────────────

  private enqueue(event: PulseEvent): void {
    this.queue!.enqueue(event);
    this.log(`Queued: ${event.type} — ${event.name}`);

    // Immediately flush errors - don't wait for the interval
    if (event.type === "error") {
      this.flush();
    }
  }

  private log(message: string): void {
    if (this.config?.debug) {
      console.log(`[PulseBoard] ${message}`);
    }
  }

  private assertInitialized(method: string): void {
    if (!this.initialized) {
      throw new Error(`PulseBoard.${method}() called before PulseBoard.init()`);
    }
  }
}

// Export a singleton - same pattern as Sentry, Mixpanel, etc.
export const PulseBoard = new PulseBoardSDK();

// Named exports for types
export type {
  SDKConfig,
  TrackOptions,
  CaptureErrorOptions,
  PulseEvent,
  EventType,
} from "./types";
