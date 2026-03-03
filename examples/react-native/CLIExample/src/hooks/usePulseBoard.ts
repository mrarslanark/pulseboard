import { PulseBoard } from '@pulseboard/react-native';
import { useCallback, useEffect, useRef } from 'react';

type Options = {
  screenName?: string;
};

export function usePulseBoard({ screenName }: Options = {}) {
  const screenLoadStart = useRef(Date.now());

  // Track screen view and load time on mount
  useEffect(() => {
    if (!screenName) return;

    try {
      const loadTime = Date.now() - screenLoadStart.current;

      PulseBoard.track('screen_view', {
        payload: { screen: screenName },
      });

      PulseBoard.metric('screen_load_time', loadTime, {
        payload: { screen: screenName, unit: 'ms' },
      });
    } catch (err) {
      console.warn('[usePulseBoard] SDK not initialized yet:', err);
    }
  }, [screenName]);

  const track = useCallback(
    (name: string, payload?: Record<string, unknown>) => {
      PulseBoard.track(name, { payload });
    },
    [],
  );

  const metric = useCallback(
    (name: string, value: number, payload?: Record<string, unknown>) => {
      PulseBoard.metric(name, value, { payload });
    },
    [],
  );

  const captureError = useCallback(
    (error: Error, payload?: Record<string, unknown>) => {
      PulseBoard.captureError(error, { payload });
    },
    [],
  );

  return { track, metric, captureError };
}
