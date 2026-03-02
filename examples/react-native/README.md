# PulseBoard — React Native Examples

Two examples demonstrating `@pulseboard/react-native` integration:

| Example      | Stack                                | Directory                    |
| ------------ | ------------------------------------ | ---------------------------- |
| CLI Example  | Bare React Native (React Native CLI) | [CLIExample](./CLIExample)   |
| Expo Example | Managed Expo workflow                | [ExpoExample](./ExpoExample) |

## Which one should I use?

**Use CLIExample if:**

- You are building a bare React Native app with full native control
- You are using the React Native CLI (`npx react-native init`)
- You need full access to native iOS/Android modules

**Use ExpoExample if:**

- You are building with Expo (`npx create-expo-app`)
- You want a faster setup with Expo Go or EAS Build
- You are prototyping or building a managed workflow app

## Shared Concepts

Both examples demonstrate the same SDK features:

- SDK initialization with app context
- Automatic screen view tracking
- Event, metric, and error tracking
- User identification
- Error boundary for automatic crash capture

The source files in `src/hooks`, `src/components`, and `src/screens`
are identical between both examples — only the entry point and config differ.
