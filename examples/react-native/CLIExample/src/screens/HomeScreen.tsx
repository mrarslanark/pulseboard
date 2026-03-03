import { EnrichedContext, PulseBoard } from '@pulseboard/react-native';
import { useEffect, useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { Actions, ContextCards, Header, LastEventInfo } from '../components';
import { Footer } from '../components/Footer';
import { Colors } from '../constants';
import { usePulseBoard } from '../hooks/usePulseBoard';

export const HomeScreen: React.FC = () => {
  const { track, metric, captureError } = usePulseBoard({
    screenName: 'HomeScreen',
  });
  const [context, setContext] = useState<EnrichedContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastEvent, setLastEvent] = useState<string | null>(null);
  const loadStart = useRef(Date.now());

  useEffect(() => {
    PulseBoard.getContext().then(ctx => {
      setContext(ctx);
      setLoading(false);

      const loadTime = Date.now() - loadStart.current;
      metric('home_screen_load_time', loadTime, { payload: { unit: 'ms' } });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTrackEvent = () => {
    track('button_pressed', { button: 'Track Event', screen: 'HomeScreen' });
    setLastEvent('event → button_pressed');
    Alert.alert('✅ Event Tracked', 'Check your PulseBoard dashboard');
  };

  const handleTrackMetric = () => {
    const value = Math.floor(Math.random() * 500) + 50;
    metric('api_response_time', value, { endpoint: '/api/feed' });
    setLastEvent(`metric → api_response_time: ${value}ms`);
    Alert.alert('✅ Metric Tracked', `Response time: ${value}ms`);
  };

  const handleCaptureError = () => {
    try {
      throw new Error('Payment gateway timeout');
    } catch (err) {
      captureError(err as Error, {
        screen: 'HomeScreen',
        action: 'payment_attempt',
      });
      setLastEvent('error → Payment gateway timeout');
      Alert.alert('✅ Error Captured', 'Check your PulseBoard dashboard');
    }
  };

  const handleIdentify = () => {
    PulseBoard.identify({
      userId: 'u_demo_001',
      email: 'demo@example.com',
      username: 'demouser',
    });
    setLastEvent('identify → u_demo_001');
    Alert.alert(
      '✅ User Identified',
      'User context attached to all future events',
    );
  };

  const handleClearUser = () => {
    PulseBoard.clearUser();
    setLastEvent('clearUser');
    Alert.alert('✅ User Cleared');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <Header />

      {/* Context Cards */}
      <ContextCards loading={loading} context={context} />

      {/* Last Event */}
      <LastEventInfo lastEvent={lastEvent} />

      {/* Actions */}
      <Actions
        handleTrackEvent={handleTrackEvent}
        handleTrackMetric={handleTrackMetric}
        handleCaptureError={handleCaptureError}
        handleIdentify={handleIdentify}
        handleClearUser={handleClearUser}
      />

      {/* Footer */}
      <Footer />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  content: {
    padding: 24,
    paddingBottom: 48,
  },
});
