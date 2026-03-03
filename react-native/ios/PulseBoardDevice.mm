#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(PulseBoardDevice, NSObject)

RCT_EXTERN_METHOD(
  getDeviceInfo: (RCTPromiseResolveBlock)resolve
  rejecter: (RCTPromiseRejectBlock)reject
)

@end