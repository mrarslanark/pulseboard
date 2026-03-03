import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants';
import { EnrichedContext } from '@pulseboard/react-native';
import { Section } from './Section';
import { InfoRow } from './InfoRow';

type Props = {
  loading: boolean;
  context: EnrichedContext | null;
};

export const ContextCards: React.FC<Props> = ({ loading, context }) => {
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={Colors.green} />
        <Text>Collecting device context...</Text>
      </View>
    );
  }

  if (!context) {
    return <Text style={styles.errorText}>Failed to collect context</Text>;
  }

  return (
    <>
      {/* Device */}
      <Section title="Device" color={Colors.green}>
        <InfoRow label="Platform" value={context.device.platform} />
        <InfoRow label="OS" value={context.device.os} />
        <InfoRow label="OS Version" value={context.device.osVersion} />
        <InfoRow label="Model" value={context.device.model} />
        <InfoRow label="Manufacturer" value={context.device.manufacturer} />
        <InfoRow label="Brand" value={context.device.brand} />
        <InfoRow label="Is Tablet" value={context.device.isTablet} />
        <InfoRow label="Is Emulator" value={context.device.isEmulator} />
        <InfoRow
          label="Screen"
          value={`${context.device.screenWidth} × ${context.device.screenHeight}`}
        />
        <InfoRow label="Font Scale" value={context.device.fontScale} />
        <InfoRow label="Language" value={context.device.language} />
        <InfoRow label="Timezone" value={context.device.timezone} />
      </Section>

      {/* App */}
      <Section title="App" color={Colors.purple}>
        <InfoRow label="Version" value={context.device.appVersion} />
        <InfoRow label="Build Number" value={context.device.buildNumber} />
        <InfoRow label="Bundle ID" value={context.device.bundleId} />
        <InfoRow
          label="Environment"
          value={context.app.environment ?? 'unknown'}
        />
      </Section>

      {/* Network */}
      <Section title="Network" color={Colors.blue}>
        <InfoRow label="Type" value={context.network.type} />
        <InfoRow label="Connected" value={context.network.isConnected} />
        <InfoRow label="WiFi" value={context.network.isWifiEnabled} />
        <InfoRow label="Carrier" value={context.network.carrier} />
        <InfoRow label="IP Address" value={context.network.ipAddress} />
      </Section>

      {/* Session */}
      <Section title="Session" color={Colors.yellow}>
        <InfoRow label="Session ID" value={context.session.sessionId} />
        <InfoRow
          label="Started At"
          value={new Date(context.session.startedAt).toLocaleTimeString()}
        />
      </Section>

      {/* User */}
      <Section title="User" color={Colors.orange}>
        <InfoRow label="User ID" value={context.user.userId ?? 'not set'} />
        <InfoRow label="Email" value={context.user.email ?? 'not set'} />
        <InfoRow label="Username" value={context.user.username ?? 'not set'} />
      </Section>
    </>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    color: Colors.muted,
  },
  errorText: {
    fontSize: 13,
    color: Colors.red,
    textAlign: 'center',
    padding: 24,
  },
});
