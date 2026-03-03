require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
    s.name            = "PulseBoardSDK"
    s.version         = package["version"]
    s.summary         = package["description"]
    s.homepage        = package["homepage"]
    s.license         = package["license"]
    s.author          = { "PulseBoard" => package["author"]["email"] }
    s.platforms       = { :ios => "15.1" }
    s.source          = { :git => package["author"]["url"], :tag => "v#{s.version}" }
    s.source_files    = "ios/**/*.{swift,h,m,mm}"
    s.requires_arc    = true

    s.dependency      "React-Core"
    s.dependency      "ReactCommon/turbomodule/core"

    e.pod_target_xcconfig = {
        "SWIFT_VERSION" => "5.9"
    }
end