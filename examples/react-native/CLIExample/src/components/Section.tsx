import { StyleSheet, Text, View } from 'react-native';

type Props = {
  title: string;
  color: string;
} & React.PropsWithChildren;

export const Section: React.FC<Props> = ({ title, color, children }) => {
  return (
    <View style={styles.section}>
      <View style={[styles.sectionHeader, { borderLeftColor: color }]}>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
};

const COLORS = {
  card: '#111118',
  border: '#1e1e2e',
  muted: '#5a5a7a',
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 16,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderLeftWidth: 3,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.muted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  sectionBody: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
});
