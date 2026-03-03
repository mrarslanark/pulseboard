#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(PulseBoardNetwork, NSObject)

RCT_EXTERN_METHOD(
  getNetworkInfo: (RCTPromiseResolveBlock)resolve
  rejecter: (RCTPromiseRejectBlock)reject
)

@end