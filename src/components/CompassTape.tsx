import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import type { CompassTapeProps } from '../types';
import {
  COMPASS_TICKS,
  DEGREE_WIDTH,
  TICK_HEIGHTS,
  FONT_SIZES,
} from '../constants';

/**
 * CompassTape - The animated horizontal tape with tick marks
 * Renders a 3x360° extended tape that scrolls based on heading
 */
export function CompassTape({
  animatedHeading,
  visibleDegrees,
  scaleTextColor,
  scaleLineColor,
  fontFamily,
  showNumericLabels,
  height,
}: CompassTapeProps) {
  // Calculate the center offset for the visible window
  // The tape is centered at 0° (which is at the middle of our extended range)
  const centerOffset = visibleDegrees / 2;

  // Animated style for the tape translation
  const animatedStyle = useAnimatedStyle(() => {
    // Calculate translateX based on current heading
    // Negative because the tape moves opposite to heading direction
    // Center the tape by offsetting by half the visible degrees
    const translateX =
      -animatedHeading.value * DEGREE_WIDTH + centerOffset * DEGREE_WIDTH;

    return {
      transform: [{ translateX }],
    };
  });

  return (
    <View style={[styles.container, { height }]}>
      <Animated.View style={[styles.tape, animatedStyle]}>
        {COMPASS_TICKS.map((tick, index) => {
          const isCardinal = tick.type === 'cardinal';
          const isMajor = tick.type === 'major';
          const tickHeight = TICK_HEIGHTS[tick.type];

          return (
            <View
              key={`${tick.degree}-${index}`}
              style={[
                styles.tickContainer,
                {
                  left: tick.x,
                },
              ]}
            >
              {/* Tick mark line */}
              <View
                style={[
                  styles.tickLine,
                  {
                    height: tickHeight,
                    backgroundColor: scaleLineColor,
                    width: isCardinal ? 3 : isMajor ? 2 : 1,
                  },
                ]}
              />

              {/* Label (cardinal directions or numeric) */}
              {tick.label && (showNumericLabels || isCardinal) && (
                <Text
                  style={[
                    styles.label,
                    {
                      color: scaleTextColor,
                      fontSize: isCardinal
                        ? FONT_SIZES.cardinal
                        : FONT_SIZES.major,
                      fontFamily,
                      fontWeight: isCardinal ? 'bold' : 'normal',
                    },
                  ]}
                >
                  {tick.label}
                </Text>
              )}
            </View>
          );
        })}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    justifyContent: 'flex-end',
    paddingBottom: 10,
  },
  tape: {
    flexDirection: 'row',
    height: '100%',
  },
  tickContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'flex-end',
    bottom: 0,
  },
  tickLine: {
    marginBottom: 4,
  },
  label: {
    textAlign: 'center',
    marginTop: 4,
  },
});
