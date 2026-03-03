import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants/colors';

export const Footer: React.FC = () => {
  return (
    <View style={styles.footer}>
      <Text style={styles.footerText}>
        Events are batched and flushed every 5 seconds.{'\n'}
        Errors are flushed immediately.{'\n'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    marginTop: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
  },
  footerText: {
    fontSize: 12,
    color: Colors.muted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
