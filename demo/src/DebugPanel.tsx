import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getCardinalDirection } from '@russellio/react-native-compass';

interface DebugPanelProps {
  heading: number;
  accuracy: number;
  smoothingFactor: number;
  visibleDegrees: number;
}

export function DebugPanel({
  heading,
  accuracy,
  smoothingFactor,
  visibleDegrees,
}: DebugPanelProps) {
  const [fps, setFps] = useState(0);
  const frameTimestamps = useRef<number[]>([]);
  const lastHeading = useRef(heading);

  useEffect(() => {
    // Only update FPS when heading changes (indicates a new frame)
    if (heading !== lastHeading.current) {
      const now = Date.now();
      frameTimestamps.current.push(now);

      // Keep only the last second of timestamps
      frameTimestamps.current = frameTimestamps.current.filter(
        (timestamp) => now - timestamp < 1000
      );

      // Calculate FPS
      setFps(frameTimestamps.current.length);
      lastHeading.current = heading;
    }
  }, [heading]);

  const cardinal = getCardinalDirection(heading);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Debug Info</Text>

      <View style={styles.grid}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Heading</Text>
          <Text style={styles.statValue}>{Math.round(heading)}°</Text>
        </View>

        <View style={styles.stat}>
          <Text style={styles.statLabel}>Direction</Text>
          <Text style={styles.statValue}>{cardinal}</Text>
        </View>

        <View style={styles.stat}>
          <Text style={styles.statLabel}>FPS</Text>
          <Text style={styles.statValue}>{fps}</Text>
        </View>

        <View style={styles.stat}>
          <Text style={styles.statLabel}>Accuracy</Text>
          <Text style={styles.statValue}>{accuracy}</Text>
        </View>

        <View style={styles.stat}>
          <Text style={styles.statLabel}>Smoothing</Text>
          <Text style={styles.statValue}>{smoothingFactor.toFixed(2)}</Text>
        </View>

        <View style={styles.stat}>
          <Text style={styles.statLabel}>View</Text>
          <Text style={styles.statValue}>{visibleDegrees}°</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#162a4a',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  stat: {
    width: '31%',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 11,
    color: '#8899aa',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff9f43',
  },
});
