import { Platform, Dimensions, I18nManager } from "react-native";
import NativePulseBoardDevice from "./specs/NativePulseBoardDevice";
import NativePulseBoardNetwork from "./specs/NativePulseBoardNetwork";
import {
  Platform as PlatformType,
  NetworkType,
  DeviceContext,
  NetworkContext,
  SessionContext,
  AppContext,
  UserContext,
  EnrichedContext,
} from "./types";

function generateSessionId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `${timestamp}-${random}`;
}

function mapNetworkType(type: string): NetworkType {
  switch (type) {
    case "wifi":
      return "wifi";
    case "cellular":
      return "cellular";
    case "offline":
      return "offline";
    default:
      return "unknown";
  }
}

function getTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "unknown";
  }
}

function getLanguage(): string {
  try {
    return (
      I18nManager.getConstants?.()?.localeIdentifier?.replace("_", "-") ??
      Intl.DateTimeFormat().resolvedOptions().locale ??
      "unknown"
    );
  } catch {
    return "unknown";
  }
}

export class ContextCollector {
  private sessionContext: SessionContext;
  private appContext: AppContext;
  private userContext: UserContext = {};

  constructor(appContext: AppContext = {}) {
    this.appContext = appContext;
    this.sessionContext = {
      sessionId: generateSessionId(),
      startedAt: new Date().toISOString(),
    };
  }

  identify(user: UserContext): void {
    this.userContext = { ...this.userContext, ...user };
  }

  clearUser(): void {
    this.userContext = {};
  }

  async collect(): Promise<EnrichedContext> {
    const { width, height } = Dimensions.get("window");

    // Collect device info — fall back gracefully if native module unavailable
    let deviceInfo = null;
    let networkInfo = null;

    try {
      if (NativePulseBoardDevice) {
        deviceInfo = await NativePulseBoardDevice.getDeviceInfo();
      }
    } catch (e) {
      console.warn("[PulseBoard] Failed to collect device info:", e);
    }

    try {
      if (NativePulseBoardNetwork) {
        networkInfo = await NativePulseBoardNetwork.getNetworkInfo();
      }
    } catch (e) {
      console.warn("[PulseBoard] Failed to collect network info:", e);
    }

    const device: DeviceContext = {
      platform: Platform.OS === "ios" ? "ios" : "android",
      os: deviceInfo?.os ?? (Platform.OS === "ios" ? "iOS" : "Android"),
      osVersion:
        deviceInfo?.osVersion ?? Platform.Version?.toString() ?? "unknown",
      model: deviceInfo?.model ?? "unknown",
      manufacturer: deviceInfo?.manufacturer ?? "unknown",
      brand: deviceInfo?.brand ?? "unknown",
      isTablet: deviceInfo?.isTablet ?? false,
      appVersion:
        this.appContext.appVersion ?? deviceInfo?.appVersion ?? "unknown",
      buildNumber:
        this.appContext.buildNumber ?? deviceInfo?.buildNumber ?? "unknown",
      bundleId: deviceInfo?.bundleId ?? "unknown",
      screenWidth: deviceInfo?.screenWidth ?? width,
      screenHeight: deviceInfo?.screenHeight ?? height,
      fontScale: Dimensions.get("window").fontScale ?? 1,
      isEmulator: deviceInfo?.isEmulator ?? false,
      language: getLanguage(),
      timezone: getTimezone(),
    };

    const network: NetworkContext = {
      type: mapNetworkType(networkInfo?.type ?? "unknown"),
      isConnected: networkInfo?.isConnected ?? false,
      isWifiEnabled: networkInfo?.isWifiEnabled ?? false,
      carrier: networkInfo?.carrier ?? "unknown",
      ipAddress: networkInfo?.ipAddress ?? "unknown",
    };

    return {
      app: this.appContext,
      device,
      network,
      session: this.sessionContext,
      user: this.userContext,
    };
  }
}
