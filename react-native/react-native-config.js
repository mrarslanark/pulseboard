module.exports = {
  dependency: {
    platforms: {
      ios: {
        podspecPath: "./PulseBoardSDK.podspec",
      },
      android: {
        sourceDir: "./android",
        packageImportPath: "import com.pulseboard.PulseBoardPackage;",
      },
    },
  },
};
