export type EventType = "error" | "event" | "metric";

export type PulseEvent = {
  apiKey: string;
  type: EventType;
  name: string;
  payload: Record<string, unknown>;
  timestamp: string;
};

export type SDKConfig = {
  apiKey: string;
  host: string;
  autoCapture?: boolean; // capture uncaught errors automatically (default: true)
  debug?: boolean; // log SDK activity to console (default: false)
  flushInterval?: number; // how often to flush the queue in ms (default: 5000)
  maxQueueSize?: number; // max events to buffer offline (default: 100)
};

export type TrackOptions = {
  payload?: Record<string, unknown>;
  timestamp?: string;
};

export type CaptureErrorOptions = {
  payload?: Record<string, unknown>;
};
