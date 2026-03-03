require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name            = "PulseBoardSDK"
  s.version         = package["version"]
  s.summary         = package["description"]
  s.homepage        = "https://github.com/yourusername/pulseboard"
  s.license         = package["license"]
  s.authors         = { "PulseBoard" => "hello@pulseboard.dev" }
  s.platforms       = { :ios => "15.1" }
  s.source          = { :git => "https://github.com/yourusername/pulseboard.git", :tag => "#{s.version}" }
  s.source_files    = "ios/**/*.{swift,h,m,mm}"
  s.requires_arc    = true

  s.dependency "React-Core"
  s.dependency "ReactCommon/turbomodule/core"

  s.pod_target_xcconfig = {
    "SWIFT_VERSION"        => "5.9",
    "CLANG_ENABLE_MODULES" => "YES",
  }
end