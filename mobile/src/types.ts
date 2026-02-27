export type EventType = "error" | "event" | "metric";

export type Platform = "ios" | "android" | "browser" | "node" | "unknown";

export type NetworkType = "wifi" | "cellular" | "offline" | "unknown";

export type AppContext = {
  appVersion?: string;
  buildNumber?: string;
  environment?: "production" | "staging" | "development";
};

export type UserContext = {
  userId?: string;
  email?: string;
  username?: string;
};

export type DeviceContext = {
  platform: Platform;
  os: string;
  osVersion: string;
  model: string;
  manufacturer: string;
  screenWidth: number;
  screenHeight: number;
  deviceMemory: string;
  language: string;
  locale: string;
  timezone: string;
};

export type NetworkContext = {
  type: NetworkType;
  effectiveType: string;
  carrier: string;
  downlink: string;
};

export type SessionContext = {
  sessionId: string;
  startedAt: string;
};

export type EnrichedContext = {
  app: AppContext;
  device: DeviceContext;
  network: NetworkContext;
  session: SessionContext;
  user: UserContext;
};

export type PulseEvent = {
  apiKey: string;
  type: EventType;
  name: string;
  payload: Record<string, unknown>;
  timestamp: string;
  context?: EnrichedContext;
};

export type SDKConfig = {
  apiKey: string;
  host: string;
  app?: AppContext;
  autoCapture?: boolean;
  debug?: boolean;
  flushInterval?: number;
  maxQueueSize?: number;
};

export type TrackOptions = {
  payload?: Record<string, unknown>;
  timestamp?: string;
};

export type CaptureErrorOptions = {
  payload?: Record<string, unknown>;
};
