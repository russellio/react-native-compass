import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';
import type { CompassNeedleProps } from '../types';

/**
 * CompassNeedle - Static center triangle indicator
 * Points downward to indicate the current heading on the tape
 */
export function CompassNeedle({ needleColor, height }: CompassNeedleProps) {
  const needleSize = 20;

  return (
    <View style={[styles.container, { height }]} pointerEvents="none">
      <View style={styles.needleWrapper}>
        <Svg height={needleSize} width={needleSize}>
          <Polygon
            points={`${needleSize / 2},${needleSize} 0,0 ${needleSize},0`}
            fill={needleColor}
          />
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 50,
    zIndex: 5,
  },
  needleWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
