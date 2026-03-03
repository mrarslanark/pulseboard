import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants';

type Props = {
  lastEvent: string | null;
};

export const LastEventInfo: React.FC<Props> = ({ lastEvent }) => {
  if (!lastEvent) {
    return null;
  }

  return (
    <View style={styles.lastEvent}>
      <Text style={styles.lastEventLabel}>Last action</Text>
      <Text style={styles.lastEventValue}>{lastEvent}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  lastEvent: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.green,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  lastEventLabel: {
    fontSize: 10,
    color: Colors.green,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  lastEventValue: {
    fontSize: 13,
    color: Colors.text,
    fontFamily: 'monospace',
  },
});
