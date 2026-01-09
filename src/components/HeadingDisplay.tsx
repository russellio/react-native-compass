import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useAnimatedProps } from 'react-native-reanimated';
import type { HeadingDisplayProps } from '../types';
import { FONT_SIZES } from '../constants';
import { normalizeHeading } from '../utils/headingMath';

// Create an animated Text component
const AnimatedText = Animated.createAnimatedComponent(Text);

/**
 * HeadingDisplay - Static overlay showing "HEADING" label and current degree value
 * Uses Reanimated to update the text content on the UI thread
 */
export function HeadingDisplay({
  animatedHeading,
  headingLabelColor,
  headingValueColor,
  fontFamily,
}: HeadingDisplayProps) {
  // Animated props for the heading value text
  const animatedTextProps = useAnimatedProps(() => {
    // Normalize heading to 0-359 range and round to nearest degree
    const normalizedHeading = normalizeHeading(animatedHeading.value);
    const roundedHeading = Math.round(normalizedHeading);

    return {
      text: `${roundedHeading}°`,
    } as any;
  });

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.label,
          {
            color: headingLabelColor,
            fontFamily,
          },
        ]}
      >
        HEADING
      </Text>
      <AnimatedText
        style={[
          styles.value,
          {
            color: headingValueColor,
            fontFamily,
          },
        ]}
        animatedProps={animatedTextProps}
      >
        0°
      </AnimatedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  label: {
    fontSize: FONT_SIZES.headingLabel,
    fontWeight: '600',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  value: {
    fontSize: FONT_SIZES.heading,
    fontWeight: 'bold',
  },
});
