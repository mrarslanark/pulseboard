import type { TurboModule } from "react-native";
import { TurboModuleRegistry } from "react-native";

export type NetowrkInfo = {
  type: string;
  isConnected: boolean;
  isWifiEnabled: boolean;
  carrier: string;
  ipAddress: string;
};

export interface Spec extends TurboModule {
  getNetworkInfo(): Promise<NetowrkInfo>;
}

export default TurboModuleRegistry.getEnforcing<Spec>("PulseBoardNetwork");
