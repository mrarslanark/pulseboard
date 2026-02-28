type ErrorHandler = (
  name: string,
  error: Error,
  context?: Record<string, unknown>,
) => void;

export class AutoCapture {
  private handler: ErrorHandler;
  private attached: boolean = false;
  private previousHandler: ((error: Error, isFatal?: boolean) => void) | null =
    null;

  constructor(handler: ErrorHandler) {
    this.handler = handler;
  }

  attach(): void {
    if (this.attached) return;

    // React Native's global error handler - catches all unhandled JS errors
    this.previousHandler = ErrorUtils.getGlobalHandler();

    ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
      this.handler("uncaughtException", error, { isFatal: isFatal ?? false });

      // Always call the previous handler (React Native's default crash reporter)
      if (this.previousHandler) {
        this.previousHandler(error, isFatal);
      }
    });

    // Unhandled promise rejections
    const tracking = require("promise/setimmediate/rejection-tracking");
    tracking.enable({
      allRejections: true,
      onUnhandled: (_id: number, error: unknown) => {
        const err = error instanceof Error ? error : new Error(String(error));
        this.handler("unhandledRejection", err, { fatal: false });
      },
    });

    this.attached = true;
  }

  detach(): void {
    if (!this.attached) return;

    // Restore the previous error handler
    if (this.previousHandler) {
      ErrorUtils.setGlobalHandler(this.previousHandler);
      this.previousHandler = null;
    }

    this.attached = false;
  }
}
