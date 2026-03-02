import { io, Socket } from "socket.io-client";
import { tokenUtils } from "./api";

class SocketManager {
  private socket: Socket | null = null;

  // ─── Connection ───────────────────────────────────────────────────

  connect(): void {
    const token = tokenUtils.get();
    if (!token) {
      console.warn("[SocketManager] No token available — skipping connection");
      return;
    }
    if (this.socket?.connected) return;

    this.socket = io(process.env.NEXT_PUBLIC_API_URL!, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      extraHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    this.socket.connect();
  }

  disconnect(): void {
    if (!this.socket) return;
    this.socket.disconnect();
    this.socket = null;
  }

  get isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  // ─── Subscriptions ────────────────────────────────────────────────

  subscribeToProject(projectId: string): void {
    this.socket?.emit("subscribe", projectId);
  }

  unsubscribeFromProject(projectId: string): void {
    this.socket?.emit("unsubscribe", projectId);
  }

  // ─── Event Listeners ──────────────────────────────────────────────

  on<T>(event: string, handler: (data: T) => void): void {
    this.socket?.on(event, handler);
  }

  off<T>(event: string, handler: (data: T) => void): void {
    this.socket?.off(event, handler);
  }

  // ─── Event Listeners ──────────────────────────────────────────────
  updateToken(): void {
    if (this.socket) {
      this.socket.auth = { token: tokenUtils.get() };
    }
  }
}

// Export a singleton instance
export const socketManager = new SocketManager();
