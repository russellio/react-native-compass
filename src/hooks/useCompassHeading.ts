import { useState, useEffect, useRef } from 'react';
import { Magnetometer } from 'expo-sensors';
import type { UseCompassHeadingResult } from '../types';
import { calculateHeading, applyEMA } from '../utils/headingMath';
import { DEFAULT_SMOOTHING, DEFAULT_UPDATE_INTERVAL } from '../constants';

/**
 * Custom hook for tracking device heading using magnetometer
 * Applies Exponential Moving Average (EMA) smoothing for stable readings
 */
export function useCompassHeading(
  smoothingFactor: number = DEFAULT_SMOOTHING,
  updateInterval: number = DEFAULT_UPDATE_INTERVAL,
  onHeadingChange?: (heading: number) => void,
  onAccuracyChange?: (accuracy: number) => void
): UseCompassHeadingResult {
  const [heading, setHeading] = useState<number>(0);
  const [accuracy, setAccuracy] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState<boolean>(false);

  // Use ref to store previous heading for smoothing without causing re-renders
  const previousHeadingRef = useRef<number>(0);
  const isInitializedRef = useRef<boolean>(false);

  // Store callbacks in refs to avoid recreating the effect when they change
  const onHeadingChangeRef = useRef(onHeadingChange);
  const onAccuracyChangeRef = useRef(onAccuracyChange);

  // Update refs when callbacks change
  useEffect(() => {
    onHeadingChangeRef.current = onHeadingChange;
    onAccuracyChangeRef.current = onAccuracyChange;
  }, [onHeadingChange, onAccuracyChange]);

  useEffect(() => {
    let subscription: { remove: () => void } | null = null;

    const initialize = async () => {
      try {
        // Check if magnetometer is available on this device
        const available = await Magnetometer.isAvailableAsync();

        if (!available) {
          setError('Magnetometer sensor is not available on this device');
          setIsAvailable(false);
          return;
        }

        setIsAvailable(true);
        setError(null);

        // Request permissions (required on iOS)
        try {
          const { status } = await Magnetometer.requestPermissionsAsync();
          if (status !== 'granted') {
            setError('Location permission is required for magnetometer access on iOS');
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

            // Update state
            setHeading(smoothedHeading);

            // Call callback if provided
            if (onHeadingChangeRef.current) {
              onHeadingChangeRef.current(smoothedHeading);
            }

            // Note: expo-sensors doesn't provide accuracy data directly
            // On Android, accuracy would come from magnetometer uncalibrated sensor
            // For now, we'll use a fixed value. This could be enhanced later.
            const currentAccuracy = 0;
            setAccuracy(currentAccuracy);

            if (onAccuracyChangeRef.current) {
              onAccuracyChangeRef.current(currentAccuracy);
            }
          } catch (err) {
            setError(
              err instanceof Error ? err.message : 'Error processing magnetometer data'
            );
          }
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to initialize magnetometer'
        );
        setIsAvailable(false);
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

  return {
    heading,
    accuracy,
    error,
    isAvailable,
  };
}
