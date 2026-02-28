import { NetInfoStateType } from "@react-native-community/netinfo";
import {
  AppContext,
  DeviceContext,
  EnrichedContext,
  NetworkContext,
  NetworkType,
  Platform as PlatformType,
  SessionContext,
  UserContext,
} from "./types";
import { Dimensions, I18nManager, NativeModules, Platform } from "react-native";
import DeviceInfo from "react-native-device-info";
import NetInfo from "@react-native-community/netinfo";

function generateSessionId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `${timestamp}-${random}`;
}

function detectPlatform(): PlatformType {
  switch (Platform.OS) {
    case "ios":
      return "ios";
    case "android":
      return "android";
    default:
      return "unknown";
  }
}

function mapNetworkType(type: NetInfoStateType): NetworkType {
  switch (type) {
    case NetInfoStateType.wifi:
      return "wifi";
    case NetInfoStateType.cellular:
      return "cellular";
    case NetInfoStateType.none:
      return "offline";
    default:
      return "unknown";
  }
}

function getTimezone(): string {
  try {
    // React Native exposes timezone via Intl or native modules
    if (typeof Intl !== "undefined") {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    }

    // Android fallback
    if (Platform.OS === "android") {
      return NativeModules.RNLocalize?.timeZone ?? "unknown";
    }

    return "unknown";
  } catch {
    return "unknown";
  }
}

function getLanguage(): string {
  try {
    // I18nManager is built into React Native
    const locale = I18nManager.getConstants?.()?.localeIdentifier;
    if (locale) {
      return locale.replace("_", "-");
    }

    if (typeof Intl !== "undefined") {
      return Intl.DateTimeFormat().resolvedOptions().locale;
    }

    return "unknown";
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
    const device = await this.collectDevice();
    const network = await this.collectNetwork();

    return {
      app: this.appContext,
      device,
      network,
      session: this.sessionContext,
      user: this.userContext,
    };
  }

  private async collectDevice(): Promise<DeviceContext> {
    const { width, height } = Dimensions.get("window");

    // These are all async but fast - device info is cached by the library
    const [
      model,
      manufacturer,
      brand,
      osVersion,
      appVersion,
      buildNumber,
      bundleId,
      isTablet,
      isEmulator,
    ] = await Promise.all([
      DeviceInfo.getModel(),
      DeviceInfo.getManufacturer(),
      DeviceInfo.getBrand(),
      Promise.resolve(DeviceInfo.getSystemVersion()),
      Promise.resolve(DeviceInfo.getVersion()),
      Promise.resolve(DeviceInfo.getBuildNumber()),
      Promise.resolve(DeviceInfo.getBundleId()),
      Promise.resolve(DeviceInfo.isTablet()),
      DeviceInfo.isEmulator(),
    ]);

    return {
      platform: detectPlatform(),
      os: Platform.OS === "ios" ? "iOS" : "Android",
      osVersion,
      model,
      manufacturer,
      brand,
      isTablet,
      appVersion: this.appContext.appVersion ?? appVersion,
      buildNumber: this.appContext.buildNumber ?? buildNumber,
      bundleId,
      screenWidth: width,
      screenHeight: height,
      fontScale: Dimensions.get("window").fontScale ?? 1,
      isEmulator,
      language: getLanguage(),
      timezone: getTimezone(),
    };
  }

  private async collectNetwork(): Promise<NetworkContext> {
    try {
      const state = await NetInfo.fetch();
      const details = state.details as any;

      return {
        type: mapNetworkType(state.type),
        isConnected: state.isConnected ?? false,
        isWifiEnabled: state.type === NetInfoStateType.wifi,
        carrier: details?.carrier ?? "unknown",
        ipAddress: details?.ipAddress ?? "unknown",
      };
    } catch {
      return {
        type: "unknown",
        isConnected: false,
        isWifiEnabled: false,
        carrier: "unknown",
        ipAddress: "unknown",
      };
    }
  }
}
