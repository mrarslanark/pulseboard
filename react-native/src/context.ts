import { Dimensions, I18nManager, Platform } from "react-native";
import NativePulseBoardDevice from "./specs/NativePulseBoardDevice";
import NativePulseBoardNetwork from "./specs/NativePulseBoardNetwork";
import {
  AppContext,
  DeviceContext,
  EnrichedContext,
  NetworkContext,
  NetworkType,
  SessionContext,
  UserContext,
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
    const [deviceInfo, networkInfo] = await Promise.all([
      NativePulseBoardDevice.getDeviceInfo(),
      NativePulseBoardNetwork.getNetworkInfo(),
    ]);

    const { width, height } = Dimensions.get("window");

    const device: DeviceContext = {
      platform: Platform.OS === "ios" ? "ios" : "android",
      os: deviceInfo.os,
      osVersion: deviceInfo.osVersion,
      model: deviceInfo.model,
      manufacturer: deviceInfo.manufacturer,
      brand: deviceInfo.brand,
      isTablet: deviceInfo.isTablet,
      appVersion: this.appContext.appVersion ?? deviceInfo.appVersion,
      buildNumber: this.appContext.buildNumber ?? deviceInfo.buildNumber,
      bundleId: deviceInfo.bundleId,
      screenWidth: deviceInfo.screenWidth || width,
      screenHeight: deviceInfo.screenHeight || height,
      fontScale: Dimensions.get("window").fontScale ?? 1,
      isEmulator: deviceInfo.isEmulator,
      language: getLanguage(),
      timezone: getTimezone(),
    };

    const network: NetworkContext = {
      type: mapNetworkType(networkInfo.type),
      isConnected: networkInfo.isConnected,
      isWifiEnabled: networkInfo.isWifiEnabled,
      carrier: networkInfo.carrier,
      ipAddress: networkInfo.ipAddress,
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
