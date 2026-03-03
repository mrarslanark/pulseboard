# @pulseboard/react-native

> Official PulseBoard SDK for React Native. Built exclusively for iOS and Android using native React Native APIs.

## Installation

```bash
npm install @pulseboard/react-native
```

## iOS

```bash
npx pod-install
```

## Android Permissions

Add the following to your `AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.READ_PHONE_STATE" />
```

`READ_PHONE_STATE` is only required for carrier name detection.
If you prefer not to request it, carrier will return `"unknown"`.
