import { useEffect, useRef } from 'react';
import { useSharedValue, withSpring } from 'react-native-reanimated';
import type { UseHeadingAnimationResult } from '../types';
import { SPRING_CONFIG } from '../constants';
import { shortestAngularDistance } from '../utils/headingMath';

/**
 * Custom hook for animating heading changes with Reanimated
 * Handles smooth spring animations and 0°/360° wrapping
 */
export function useHeadingAnimation(heading: number): UseHeadingAnimationResult {
  // Shared value for the animated heading (UI thread)
  const animatedHeading = useSharedValue(heading);

  // Track the previous heading to detect wrapping
  const previousHeadingRef = useRef(heading);

  useEffect(() => {
    const prev = previousHeadingRef.current;
    const current = heading;

    // Calculate the shortest angular distance to prevent backwards spinning
    const angularDistance = shortestAngularDistance(prev, current);

    // Calculate target position for the animation
    // We add the angular distance to the current animated position
    // to ensure smooth wrapping at 0°/360° boundary
    const targetHeading = animatedHeading.value + angularDistance;

    // Apply spring animation to the shared value
    animatedHeading.value = withSpring(targetHeading, {
      damping: SPRING_CONFIG.damping,
      stiffness: SPRING_CONFIG.stiffness,
      mass: SPRING_CONFIG.mass,
    });

    // Update previous heading
    previousHeadingRef.current = current;
  }, [heading, animatedHeading]);

  return {
    animatedHeading,
  };
}
