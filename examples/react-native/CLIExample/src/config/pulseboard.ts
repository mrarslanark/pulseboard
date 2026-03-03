import { PulseBoard } from '@pulseboard/react-native';

// For physical device testing, replace with your machine's local IP
// Run 'ipconfig getifaddr en0' on macOS to find it
const DEV_API_URL = 'http://localhost:3000';
const PROD_API_URL = 'https://pulseboard-production.up.railway.app';

export function initPulseBoard() {
  try {
    PulseBoard.init({
      apiKey: 'YOUR_API_KEY',
      host: __DEV__ ? DEV_API_URL : PROD_API_URL,
      debug: __DEV__,
      app: {
        appVersion: '1.0.0',
        buildNumber: '1',
        environment: __DEV__ ? 'development' : 'production',
      },
    });
  } catch (err) {
    console.error('Failed to initialize PulseBoard:', err);
  }
}
