export type User = {
  id: string;
  name: string;
  email: string;
};

export type Project = {
  id: string;
  name: string;
  apiKey: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  _count?: { events: number };
};

export type EventType = "error" | "event" | "metric";

export type PulseEvent = {
  id: string;
  projectId: string;
  type: EventType;
  name: string;
  payload: Record<string, unknown>;
  timestamp: string;
  receivedAt: string;
};

export type AuthResponse = {
  success: boolean;
  data: {
    accessToken: string;
    user: User;
  };
};

export type ApiResponse<T> = {
  success: boolean;
  data: T;
};
