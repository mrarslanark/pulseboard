/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { SafeAreaView } from 'react-native-safe-area-context';
import { PulseBoardErrorBoundary } from './src/components/PulseBoardErrorBoundary';
import { initPulseBoard } from './src/config/pulseboard';
import { HomeScreen } from './src/screens/HomeScreen';
import { StatusBar, StyleSheet } from 'react-native';

initPulseBoard();

function App() {
  return (
    <>
      <StatusBar
        barStyle={'light-content'}
        translucent
        backgroundColor={'#0a0a0f'}
      />
      <SafeAreaView edges={['top', 'bottom']} style={styles.safeAreView}>
        <PulseBoardErrorBoundary screenName="App">
          <HomeScreen />
        </PulseBoardErrorBoundary>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeAreView: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
});

export default App;
