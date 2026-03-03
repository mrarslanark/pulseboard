import type { TurboModule } from "react-native";
import { TurboModuleRegistry } from "react-native";

export type DeviceInfo = {
  model: string;
  manufacturer: string;
  brand: string;
  os: string;
  osVersion: string;
  appVersion: string;
  buildNumber: string;
  bundleId: string;
  screenWidth: number;
  screenHeight: number;
  isTablet: boolean;
  isEmulator: boolean;
};

export interface Spec extends TurboModule {
  getDeviceInfo(): Promise<DeviceInfo>;
}

export default TurboModuleRegistry.getEnforcing<Spec>("PulseBoardDevice");
