import { useEffect, useRef } from 'react';
import { Magnetometer } from 'expo-sensors';
import { calculateHeading, applyEMA } from '../utils/headingMath';
import { DEFAULT_SMOOTHING, DEFAULT_UPDATE_INTERVAL } from '../constants';

/**
 * Custom hook for tracking device heading using magnetometer
 * Applies Exponential Moving Average (EMA) smoothing for stable readings
 *
 * This is a stateless hook that communicates via callbacks only.
 * It does not maintain internal React state to avoid cascading re-renders
 * when used with 60Hz magnetometer updates.
 *
 * @param smoothingFactor - EMA smoothing factor (0-1), default 0.2
 * @param updateInterval - Magnetometer update interval in ms, default 16ms (60Hz)
 * @param onHeadingChange - Callback fired at 60Hz with smoothed heading (0-359)
 * @param onAccuracyChange - Callback for accuracy changes
 * @param onError - Callback for error messages
 * @param onAvailabilityChange - Callback for sensor availability changes
 */
export function useCompassHeading(
  smoothingFactor: number = DEFAULT_SMOOTHING,
  updateInterval: number = DEFAULT_UPDATE_INTERVAL,
  onHeadingChange?: (heading: number) => void,
  onAccuracyChange?: (accuracy: number) => void,
  onError?: (error: string) => void,
  onAvailabilityChange?: (isAvailable: boolean) => void
): void {
  // Use ref to store previous heading for smoothing without causing re-renders
  const previousHeadingRef = useRef<number>(0);
  const isInitializedRef = useRef<boolean>(false);

  // Store callbacks in refs to avoid recreating the effect when they change
  const onHeadingChangeRef = useRef(onHeadingChange);
  const onAccuracyChangeRef = useRef(onAccuracyChange);
  const onErrorRef = useRef(onError);
  const onAvailabilityChangeRef = useRef(onAvailabilityChange);

  // Update refs when callbacks change
  useEffect(() => {
    onHeadingChangeRef.current = onHeadingChange;
    onAccuracyChangeRef.current = onAccuracyChange;
    onErrorRef.current = onError;
    onAvailabilityChangeRef.current = onAvailabilityChange;
  }, [onHeadingChange, onAccuracyChange, onError, onAvailabilityChange]);

  useEffect(() => {
    let subscription: { remove: () => void } | null = null;

    const initialize = async () => {
      try {
        // Check if magnetometer is available on this device
        const available = await Magnetometer.isAvailableAsync();

        if (!available) {
          onErrorRef.current?.('Magnetometer sensor is not available on this device');
          onAvailabilityChangeRef.current?.(false);
          return;
        }

        onAvailabilityChangeRef.current?.(true);

        // Request permissions (required on iOS)
        try {
          const { status } = await Magnetometer.requestPermissionsAsync();
          if (status !== 'granted') {
            onErrorRef.current?.('Location permission is required for magnetometer access on iOS');
            return;
          }
        } catch (permError) {
          // Permission API might not be available on all platforms
          // Continue anyway as it may not be required
        }

        // Set update interval
        Magnetometer.setUpdateInterval(updateInterval);

        // Subscribe to magnetometer updates
        subscription = Magnetometer.addListener((data) => {
          try {
            // Calculate raw heading from magnetometer data
            const rawHeading = calculateHeading(data);

            // Apply EMA smoothing
            let smoothedHeading: number;
            if (!isInitializedRef.current) {
              // First reading - no smoothing needed
              smoothedHeading = rawHeading;
              isInitializedRef.current = true;
            } else {
              // Apply exponential moving average
              smoothedHeading = applyEMA(
                rawHeading,
                previousHeadingRef.current,
                smoothingFactor
              );
            }

            // Update previous heading for next smoothing
            previousHeadingRef.current = smoothedHeading;

            // Call heading callback if provided
            onHeadingChangeRef.current?.(smoothedHeading);

            // Note: expo-sensors doesn't provide accuracy data directly
            // On Android, accuracy would come from magnetometer uncalibrated sensor
            // For now, we'll use a fixed value. This could be enhanced later.
            const currentAccuracy = 0;
            onAccuracyChangeRef.current?.(currentAccuracy);
          } catch (err) {
            onErrorRef.current?.(
              err instanceof Error ? err.message : 'Error processing magnetometer data'
            );
          }
        });
      } catch (err) {
        onErrorRef.current?.(
          err instanceof Error ? err.message : 'Failed to initialize magnetometer'
        );
        onAvailabilityChangeRef.current?.(false);
      }
    };

    initialize();

    // Cleanup function
    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [smoothingFactor, updateInterval]);
}
