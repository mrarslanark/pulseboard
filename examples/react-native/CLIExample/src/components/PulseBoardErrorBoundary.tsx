import { PulseBoard } from '@pulseboard/react-native';
import { Component, ErrorInfo, ReactNode } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';

type Props = {
  children: React.ReactNode;
  screenName?: string;
};

type State = {
  hasError: boolean;
  error: Error | null;
};

export class PulseBoardErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    PulseBoard.captureError(error, {
      payload: {
        componentStack: info.componentStack,
        screen: this.props.screenName || 'unknown',
      },
    });
  }

  handleReset = () => this.setState({ hasError: false, error: null });

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            {this.state.error?.message ?? 'An unexpected error occured'}
          </Text>
          <TouchableOpacity onPress={this.handleReset} style={styles.button}>
            <Text style={styles.buttonText}>Try again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#0a0a0f',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#5a5a7a',
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#00e5a0',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: '#000000',
    fontWeight: '600',
    fontSize: 14,
  },
});
