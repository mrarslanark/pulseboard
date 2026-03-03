import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants';

type Props = {
  handleTrackEvent: () => void;
  handleTrackMetric: () => void;
  handleCaptureError: () => void;
  handleIdentify: () => void;
  handleClearUser: () => void;
};

export const Actions: React.FC<Props> = ({
  handleTrackEvent,
  handleTrackMetric,
  handleCaptureError,
  handleIdentify,
  handleClearUser,
}) => {
  return (
    <View style={styles.actionsSection}>
      <Text style={styles.sectionTitle}>SDK Actions</Text>

      <TouchableOpacity
        style={[styles.button, styles.buttonDefault]}
        onPress={handleTrackEvent}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonLabel}>Track Event</Text>
        <Text style={styles.buttonCode}>
          PulseBoard.track('button_pressed')
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.buttonMetric]}
        onPress={handleTrackMetric}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonLabel}>Track Metric</Text>
        <Text style={styles.buttonCode}>
          PulseBoard.metric('api_response_time', 142)
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.buttonError]}
        onPress={handleCaptureError}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonLabel}>Capture Error</Text>
        <Text style={styles.buttonCode}>PulseBoard.captureError(error)</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.buttonUser]}
        onPress={handleIdentify}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonLabel}>Identify User</Text>
        <Text style={styles.buttonCode}>
          PulseBoard.identify(&#123; userId, email &#125;)
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.buttonDefault]}
        onPress={handleClearUser}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonLabel}>Clear User</Text>
        <Text style={styles.buttonCode}>PulseBoard.clearUser()</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  actionsSection: {
    marginTop: 8,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.muted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  button: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderRadius: 10,
    padding: 16,
  },
  buttonDefault: { borderColor: Colors.border },
  buttonMetric: { borderColor: 'rgba(124, 106, 255, 0.4)' },
  buttonError: { borderColor: 'rgba(255, 106, 106, 0.4)' },
  buttonUser: { borderColor: 'rgba(0, 229, 160, 0.4)' },
  buttonLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  buttonCode: {
    fontSize: 11,
    color: Colors.muted,
    fontFamily: 'monospace',
  },
});
