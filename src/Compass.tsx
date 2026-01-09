import React from 'react';
import { View, StyleSheet } from 'react-native';
import type { CompassProps } from './types';
import { useCompassHeading } from './hooks/useCompassHeading';
import { useHeadingAnimation } from './hooks/useHeadingAnimation';
import { CompassTape } from './components/CompassTape';
import { HeadingDisplay } from './components/HeadingDisplay';
import { CompassNeedle } from './components/CompassNeedle';
import { ErrorView } from './components/ErrorView';
import {
  DEFAULT_COLORS,
  DEFAULT_VISIBLE_DEGREES,
  DEFAULT_HEIGHT,
  DEFAULT_SMOOTHING,
  DEFAULT_UPDATE_INTERVAL,
} from './constants';

/**
 * Compass - Main component that orchestrates the horizontal scrolling compass
 *
 * Features:
 * - Real-time magnetometer integration
 * - Smooth 60fps animation with spring physics
 * - Seamless 0°/360° wrapping
 * - Fully customizable appearance
 *
 * @example
 * ```tsx
 * <Compass
 *   backgroundColor="#1a2b4a"
 *   visibleDegrees={120}
 *   onHeadingChange={(heading) => console.log(heading)}
 * />
 * ```
 */
export function Compass({
  // Visual props
  backgroundColor = DEFAULT_COLORS.background,
  headingLabelColor = DEFAULT_COLORS.headingLabel,
  headingValueColor = DEFAULT_COLORS.headingValue,
  scaleTextColor = DEFAULT_COLORS.scaleText,
  scaleLineColor = DEFAULT_COLORS.scaleLines,
  needleColor = DEFAULT_COLORS.needle,
  fontFamily,

  // Layout props
  visibleDegrees = DEFAULT_VISIBLE_DEGREES,
  height = DEFAULT_HEIGHT,

  // Behavior props
  showNumericLabels = true,
  smoothingFactor = DEFAULT_SMOOTHING,
  updateInterval = DEFAULT_UPDATE_INTERVAL,

  // Callbacks
  onHeadingChange,
  onAccuracyChange,

  // Style
  style,
}: CompassProps) {
  // Get heading from magnetometer with EMA smoothing
  const { heading, accuracy, error, isAvailable } = useCompassHeading(
    smoothingFactor,
    updateInterval,
    onHeadingChange,
    onAccuracyChange
  );

  // Apply spring animation to heading changes
  const { animatedHeading } = useHeadingAnimation(heading);

  // Show error view if magnetometer is not available or there's an error
  if (!isAvailable || error) {
    return (
      <View style={[styles.container, { backgroundColor, height }, style]}>
        <ErrorView
          message={error || 'Magnetometer sensor is not available'}
          backgroundColor={backgroundColor}
          textColor={scaleTextColor}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor, height }, style]}>
      {/* Heading display overlay */}
      <HeadingDisplay
        animatedHeading={animatedHeading}
        headingLabelColor={headingLabelColor}
        headingValueColor={headingValueColor}
        fontFamily={fontFamily}
      />

      {/* Compass tape with tick marks */}
      <CompassTape
        animatedHeading={animatedHeading}
        visibleDegrees={visibleDegrees}
        scaleTextColor={scaleTextColor}
        scaleLineColor={scaleLineColor}
        fontFamily={fontFamily}
        showNumericLabels={showNumericLabels}
        height={height}
      />

      {/* Center needle indicator */}
      <CompassNeedle needleColor={needleColor} height={height} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
    overflow: 'hidden',
  },
});
