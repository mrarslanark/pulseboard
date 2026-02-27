type ErrorHandler = (
  name: string,
  error: Error,
  context?: Record<string, unknown>,
) => void;

export class AutoCapture {
  private handler: ErrorHandler;
  private attached: boolean = false;

  constructor(handler: ErrorHandler) {
    this.handler = handler;
  }

  attach(): void {
    if (this.attached) return;

    // Node.js / React Native
    if (typeof process !== "undefined") {
      process.on("uncaughtException", (error: Error) => {
        this.handler("uncaughtException", error, {
          fatal: true,
        });
      });

      process.on("unhandledRejection", (reason: unknown) => {
        const error =
          reason instanceof Error ? reason : new Error(String(reason));

        this.handler("unhandledRejection", error, {
          fatal: false,
        });
      });
    }

    // Browser
    if (typeof window !== "undefined") {
      window.addEventListener("error", (event: ErrorEvent) => {
        this.handler("uncaughtError", event.error ?? new Error(event.message), {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        });
      });

      window.addEventListener(
        "unhandledrejection",
        (event: PromiseRejectionEvent) => {
          const error =
            event.reason instanceof Error
              ? event.reason
              : new Error(String(event.reason));

          this.handler("unhandledrejection", error, {
            fatal: false,
          });
        },
      );
    }

    this.attached = true;
  }

  detach(): void {
    // Reset flag — listeners can't be removed without references
    // so call this only when tearing down completely
    this.attached = false;
  }
}
