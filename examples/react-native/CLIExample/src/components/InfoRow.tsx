import { StyleSheet, Text, View } from 'react-native';

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

const COLORS = {
  text: '#ffffff',
  muted: '#5a5a7a',
  dimmed: '#2a2a3a',
};

const styles = StyleSheet.create({
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.dimmed,
  },
  infoLabel: {
    fontSize: 13,
    color: COLORS.muted,
    flex: 1,
  },
  infoValue: {
    fontSize: 13,
    color: COLORS.text,
    fontFamily: 'monospace',
    flex: 2,
    textAlign: 'right',
  },
});
