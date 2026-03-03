import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants';

type Props = {
  label: string;
  value: string | number | boolean;
};

export const InfoRow: React.FC<Props> = ({ label, value }) => {
  const displayValue =
    typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value);

  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{displayValue}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dimmed,
  },
  infoLabel: {
    fontSize: 13,
    color: Colors.muted,
    flex: 1,
  },
  infoValue: {
    fontSize: 13,
    color: Colors.text,
    fontFamily: 'monospace',
    flex: 2,
    textAlign: 'right',
  },
});
