import { PulseBoard } from '@pulseboard/react-native';
import {
  View,
  Text,
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { usePulseBoard } from '../hooks/usePulseBoard';

type DemoButton = {
  label: string;
  description: string;
  variant: 'default' | 'metric' | 'error' | 'user';
  onPress: () => void;
};

type DemoSection = {
  title: string;
  buttons: DemoButton[];
};

export function HomeScreen() {
  const { track, metric, captureError } = usePulseBoard({
    screenName: 'HomeScreen',
  });

  const sections: DemoSection[] = [
    {
      title: 'Events',
      buttons: [
        {
          label: 'Track Button Press',
          description: "PulseBoard.track('button_pressed', { ... })",
          variant: 'default',
          onPress: () => {
            track('button_pressed', {
              button: 'Track Button Press',
              screen: 'HomeScreen',
            });
            Alert.alert('✅ Event Tracked', 'Check your PulseBoard dashboard');
          },
        },
        {
          label: 'Track Screen View',
          description: "PulseBoard.track('screen_view', { ... })",
          variant: 'default',
          onPress: () => {
            track('screen_view', { screen: 'HomeScreen' });
            Alert.alert(
              '✅ Screen View Tracked',
              'Check your PulseBoard dashboard',
            );
          },
        },
      ],
    },
    {
      title: 'Metrics',
      buttons: [
        {
          label: 'Track API Response Time',
          description: "PulseBoard.metric('api_response_time', 142, { ... })",
          variant: 'metric',
          onPress: () => {
            const value = Math.floor(Math.random() * 500) + 50;
            metric('api_response_time', value, {
              endpoint: '/api/feed',
              screen: 'HomeScreen',
            });
            Alert.alert('✅ Metric Tracked', `Response time: ${value}ms`);
          },
        },
        {
          label: 'Track Screen Load Time',
          description: "PulseBoard.metric('screen_load_time', 320, { ... })",
          variant: 'metric',
          onPress: () => {
            const value = Math.floor(Math.random() * 1000) + 100;
            metric('screen_load_time', value, {
              screen: 'HomeScreen',
              unit: 'ms',
            });
            Alert.alert('✅ Metric Tracked', `Load time: ${value}ms`);
          },
        },
      ],
    },
    {
      title: 'Errors',
      buttons: [
        {
          label: 'Capture Manual Error',
          description: 'PulseBoard.captureError(error, { ... })',
          variant: 'error',
          onPress: () => {
            try {
              throw new Error('Payment gateway timeout');
            } catch (err) {
              captureError(err as Error, {
                screen: 'HomeScreen',
                action: 'payment_attempt',
                orderId: 'ord_12345',
              });
              Alert.alert(
                '✅ Error Captured',
                'Check your PulseBoard dashboard',
              );
            }
          },
        },
        {
          label: 'Capture Network Error',
          description: 'PulseBoard.captureError(error, { ... })',
          variant: 'error',
          onPress: () => {
            const err = new Error('Network request failed');
            err.name = 'NetworkError';
            captureError(err, {
              screen: 'HomeScreen',
              endpoint: '/api/feed',
              status: 503,
            });
            Alert.alert('✅ Error Captured', 'Check your PulseBoard dashboard');
          },
        },
      ],
    },
    {
      title: 'User Identity',
      buttons: [
        {
          label: 'Identify User',
          description: 'PulseBoard.identify({ userId, email })',
          variant: 'user',
          onPress: () => {
            PulseBoard.identify({
              userId: 'u_demo_001',
              email: 'demo@example.com',
              username: 'demouser',
            });
            Alert.alert(
              '✅ User Identified',
              'User context will now be attached to all future events',
            );
          },
        },
        {
          label: 'Clear User',
          description: 'PulseBoard.clearUser()',
          variant: 'user',
          onPress: () => {
            PulseBoard.clearUser();
            Alert.alert('✅ User Cleared', 'User context has been removed');
          },
        },
      ],
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.dot} />
        <Text style={styles.brand}>PulseBoard SDK</Text>
      </View>

      <Text style={styles.title}>React Native Example</Text>
      <Text style={styles.subtitle}>
        Tap the buttons below to send events to your PulseBoard dashboard in
        real time. Make sure your backend is running and your API key is
        configured.
      </Text>

      {/* Sections */}
      {sections.map(section => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          {section.buttons.map(button => (
            <TouchableOpacity
              key={button.label}
              style={[styles.button, styles[`button_${button.variant}`]]}
              onPress={button.onPress}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonLabel}>{button.label}</Text>
              <Text style={styles.buttonDescription}>{button.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Events are batched and flushed every 5 seconds.{'\n'}
          Errors are flushed immediately.{'\n'}
        </Text>
      </View>
    </ScrollView>
  );
}

const COLORS = {
  bg: '#0a0a0f',
  card: '#111118',
  border: '#1e1e2e',
  green: '#00e5a0',
  purple: '#7c6aff',
  red: '#ff6a6a',
  text: '#ffffff',
  muted: '#5a5a7a',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  content: {
    padding: 24,
    paddingBottom: 48,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.green,
  },
  brand: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: COLORS.green,
    letterSpacing: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.muted,
    lineHeight: 22,
    marginBottom: 32,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.muted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  button: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 16,
    marginBottom: 8,
  },
  button_default: {
    borderColor: COLORS.border,
  },
  button_metric: {
    borderColor: 'rgba(124, 106, 255, 0.4)',
  },
  button_error: {
    borderColor: 'rgba(255, 106, 106, 0.4)',
  },
  button_user: {
    borderColor: 'rgba(0, 229, 160, 0.4)',
  },
  buttonLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  buttonDescription: {
    fontSize: 11,
    color: COLORS.muted,
    fontFamily: 'monospace',
  },
  footer: {
    marginTop: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.muted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
