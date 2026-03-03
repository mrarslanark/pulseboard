const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

const sdkPath = path.resolve(__dirname, '../../../react-native');

const defaultConfig = getDefaultConfig(__dirname);

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  watchFolders: [sdkPath],
  resolver: {
    extraNodeModules: {
      '@pulseboard/react-native': sdkPath,
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
