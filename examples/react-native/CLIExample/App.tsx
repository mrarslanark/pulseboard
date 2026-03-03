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
import { StatusBar } from 'react-native';

initPulseBoard();

function App() {
  return (
    <>
      <StatusBar
        barStyle={'light-content'}
        translucent
        backgroundColor={'#0a0a0f'}
      />
      <SafeAreaView
        edges={['top', 'bottom']}
        style={{ flex: 1, backgroundColor: '#0a0a0f' }}
      >
        <PulseBoardErrorBoundary screenName="App">
          <HomeScreen />
        </PulseBoardErrorBoundary>
      </SafeAreaView>
    </>
  );
}

export default App;
