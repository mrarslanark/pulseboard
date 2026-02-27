# @pulseboard/sdk

> Dead-simple event tracking and error monitoring for any JavaScript application.

## Installation

```bash
npm install @pulseboard/sdk
```

## Usage

```typescript
import { PulseBoard } from "@pulseboard/sdk";

// Initialize once at app startup
PulseBoard.init({
  apiKey: "your-project-api-key",
  host: "https://your-pulseboard-instance.com",
});

// Track custom events
PulseBoard.track("user_signed_up", {
  payload: { plan: "pro", source: "landing_page" },
});

// Track metrics
PulseBoard.metric("api_response_time", 142, {
  payload: { endpoint: "/api/feed" },
});

// Capture errors manually
try {
  await fetchData();
} catch (error) {
  PulseBoard.captureError(error as Error, {
    payload: { screen: "HomeScreen" },
  });
}
```

## Configuration

| Option          | Type      | Default  | Description                  |
| --------------- | --------- | -------- | ---------------------------- |
| `apiKey`        | `string`  | required | Your project API key         |
| `host`          | `string`  | required | Your PulseBoard instance URL |
| `autoCapture`   | `boolean` | `true`   | Auto-capture uncaught errors |
| `debug`         | `boolean` | `false`  | Log SDK activity to console  |
| `flushInterval` | `number`  | `5000`   | Queue flush interval in ms   |
| `maxQueueSize`  | `number`  | `100`    | Max events to buffer offline |

## API

### `PulseBoard.init(config)`

Initialize the SDK. Call once at application startup.

### `PulseBoard.track(name, options?)`

Track a custom event.

### `PulseBoard.metric(name, value, options?)`

Track a numeric metric.

### `PulseBoard.captureError(error, options?)`

Manually capture an error.

### `PulseBoard.flush()`

Manually flush the event queue.

### `PulseBoard.destroy()`

Tear down the SDK and clear all state.
