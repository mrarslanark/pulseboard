module.exports = {
  dependency: {
    platforms: {
      ios: {
        podspecPath: "./PulseBoardSDK.podspec",
      },
      android: {
        sourceDir: "./android",
        manifestPath: "./android/src/main/AndroidManifest.xml",
        packageImportPath: "import com.pulseboard.PulseBoardPackage;",
        packageInstance: "new PulseBoardPackage()",
      },
    },
  },
};
