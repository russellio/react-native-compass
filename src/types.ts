import type { ViewStyle } from 'react-native';

/**
 * Main props for the Compass component
 */
export interface CompassProps {
  // Visual
  backgroundColor?: string;
  headingLabelColor?: string;
  headingValueColor?: string;
  scaleTextColor?: string;
  scaleLineColor?: string;
  needleColor?: string;
  fontFamily?: string;

  // Layout
  visibleDegrees?: number; // Default: 120
  height?: number; // Default: 200

  // Behavior
  showNumericLabels?: boolean; // Default: true
  smoothingFactor?: number; // Default: 0.2
  updateInterval?: number; // Default: 16ms

  // Callbacks
  /**
   * Called when heading changes (at 60Hz by default).
   *
   * WARNING: This callback fires at 60Hz (every 16ms) when the magnetometer is active.
   * To prevent excessive re-renders in your app:
   * - Use useCallback() to memoize your handler
   * - Consider throttling state updates (e.g., to 10Hz) if displaying in your UI
   * - Avoid triggering re-renders of large component trees from this callback
   *
   * @param heading - Smoothed heading value in degrees (0-359)
   */
  onHeadingChange?: (heading: number) => void;
  onAccuracyChange?: (accuracy: number) => void;

  // Style
  style?: ViewStyle;
}

/**
 * Tick mark type on the compass tape
 */
export type TickType = 'cardinal' | 'major' | 'minor';

/**
 * Individual tick mark on the compass
 */
export interface CompassTick {
  degree: number; // 0-359 or extended range for 3x360°
  type: TickType;
  label?: string; // Cardinal directions (N, NE, E, etc.) or numeric labels
  x: number; // Pre-calculated x position based on degree * DEGREE_WIDTH
}

/**
 * Magnetometer reading data
 */
export interface MagnetometerData {
  x: number;
  y: number;
  z: number;
}

/**
 * Heading information with accuracy
 */
export interface HeadingData {
  heading: number; // 0-359
  accuracy: number; // Magnetometer accuracy (-1 to 3 on Android, always 0 on iOS)
}

/**
 * Props for CompassTape component
 */
export interface CompassTapeProps {
  animatedHeading: any; // Reanimated SharedValue<number>
  visibleDegrees: number;
  scaleTextColor: string;
  scaleLineColor: string;
  fontFamily?: string;
  showNumericLabels: boolean;
  height: number;
}

/**
 * Props for HeadingDisplay component
 */
export interface HeadingDisplayProps {
  animatedHeading: any; // Reanimated SharedValue<number>
  headingLabelColor: string;
  headingValueColor: string;
  fontFamily?: string;
}

/**
 * Props for CompassNeedle component
 */
export interface CompassNeedleProps {
  needleColor: string;
  height: number;
}

/**
 * Props for ErrorView component
 */
export interface ErrorViewProps {
  message: string;
  backgroundColor: string;
  textColor: string;
}

/**
 * Hook return type for useHeadingAnimation
 */
export interface UseHeadingAnimationResult {
  animatedHeading: any; // Reanimated SharedValue<number>
}
