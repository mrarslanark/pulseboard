import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants';

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

const styles = StyleSheet.create({
  section: {
    marginBottom: 16,
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderLeftWidth: 3,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.muted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  sectionBody: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
});
