export type EventType = "error" | "event" | "metric";

export type Platform = "ios" | "android" | "unknown";

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
  osVersion: string | number;
  model: string;
  manufacturer: string;
  brand: string;
  isTablet: boolean;
  appVersion: string;
  buildNumber: string;
  bundleId: string;
  screenWidth: number;
  screenHeight: number;
  fontScale: number;
  isEmulator: boolean;
  language: string;
  timezone: string;
};

export type NetworkContext = {
  type: NetworkType;
  isConnected: boolean;
  isWifiEnabled: boolean;
  carrier: string;
  ipAddress: string;
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
