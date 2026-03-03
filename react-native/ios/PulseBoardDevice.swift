import Foundation
import UIKit
import Darwin

@objc(PulseBoardDevice)
class PulseBoardDevice: NSObject {

  @objc func getDeviceInfo(
    _ resolve: @escaping (Any?) -> Void,
    rejecter reject: @escaping (String?, String?, Error?) -> Void
  ) {
    DispatchQueue.main.async {
      let device      = UIDevice.current
      let screen      = UIScreen.main.bounds
      let bundle      = Bundle.main
      let info        = bundle.infoDictionary ?? [:]

      let appVersion  = info["CFBundleShortVersionString"] as? String ?? "unknown"
      let buildNumber = info["CFBundleVersion"] as? String ?? "unknown"
      let bundleId    = bundle.bundleIdentifier ?? "unknown"

      let result: [String: Any] = [
        "model":        self.getModel(),
        "manufacturer": "Apple",
        "brand":        "Apple",
        "os":           "iOS",
        "osVersion":    device.systemVersion,
        "appVersion":   appVersion,
        "buildNumber":  buildNumber,
        "bundleId":     bundleId,
        "screenWidth":  Double(screen.width),
        "screenHeight": Double(screen.height),
        "isTablet":     device.userInterfaceIdiom == .pad,
        "isEmulator":   self.isSimulator(),
      ]

      resolve(result)
    }
  }

  private func getModel() -> String {
    var systemInfo = utsname()
    uname(&systemInfo)
    let machineMirror = Mirror(reflecting: systemInfo.machine)
    return machineMirror.children.reduce("") { identifier, element in
      guard let value = element.value as? Int8, value != 0 else { return identifier }
      return identifier + String(UnicodeScalar(UInt8(value)))
    }
  }

  private func isSimulator() -> Bool {
    #if targetEnvironment(simulator)
      return true
    #else
      return false
    #endif
  }

  @objc static func requiresMainQueueSetup() -> Bool {
    return true
  }
}