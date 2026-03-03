import Foundation
import Network
import CoreTelephony
import SystemConfiguration

@objc(PulseBoardNetwork)
class PulseBoardNetwork: NSObject {

  @objc func getNetworkInfo(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    let monitor   = NWPathMonitor()
    let queue     = DispatchQueue(label: "com.pulseboard.network")

    monitor.pathUpdateHandler = { path in
      monitor.cancel()

      let isConnected   = path.status == .satisfied
      let isWifi        = path.usesInterfaceType(.wifi)
      let isCellular    = path.usesInterfaceType(.cellular)

      var carrier = "unknown"
      if #available(iOS 16.0, *) {
        // CTCarrier is deprecated in iOS 16 — use fallback
        carrier = "unknown"
      } else {
        let networkInfo = CTTelephonyNetworkInfo()
        if let providers = networkInfo.serviceSubscriberCellularProviders {
          carrier = providers.values.first?.carrierName ?? "unknown"
        }
      }

      let result: [String: Any] = [
        "type":          isWifi ? "wifi" : isCellular ? "cellular" : isConnected ? "unknown" : "offline",
        "isConnected":   isConnected,
        "isWifiEnabled": isWifi,
        "carrier":       carrier,
        "ipAddress":     self.getIPAddress() ?? "unknown",
      ]

      resolve(result)
    }

    monitor.start(queue: queue)
  }

  private func getIPAddress() -> String? {
    var address: String?
    var ifaddr: UnsafeMutablePointer<ifaddrs>?

    guard getifaddrs(&ifaddr) == 0 else { return nil }
    defer { freeifaddrs(ifaddr) }

    var ptr = ifaddr
    while ptr != nil {
      defer { ptr = ptr?.pointee.ifa_next }
      let interface = ptr?.pointee
      let addrFamily = interface?.ifa_addr.pointee.sa_family

      if addrFamily == UInt8(AF_INET) {
        let name = String(cString: (interface?.ifa_name)!)
        if name == "en0" {
          var hostname = [CChar](repeating: 0, count: Int(NI_MAXHOST))
          getnameinfo(
            interface?.ifa_addr,
            socklen_t((interface?.ifa_addr.pointee.sa_len)!),
            &hostname,
            socklen_t(hostname.count),
            nil,
            socklen_t(0),
            NI_NUMERICHOST
          )
          address = String(cString: hostname)
        }
      }
    }

    return address
  }

  @objc static func requiresMainQueueSetup() -> Bool {
    return false
  }
}