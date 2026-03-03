import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants';

export const Header = () => {
  return (
    <>
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
    </>
  );
};

const styles = StyleSheet.create({
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
    backgroundColor: Colors.green,
  },
  brand: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: Colors.green,
    letterSpacing: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.muted,
    lineHeight: 22,
    marginBottom: 32,
  },
});
