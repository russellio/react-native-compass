import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';

interface DemoControlsProps {
  visibleDegrees: number;
  onVisibleDegreesChange: (value: number) => void;
  smoothingFactor: number;
  onSmoothingFactorChange: (value: number) => void;
  showNumericLabels: boolean;
  onShowNumericLabelsChange: (value: boolean) => void;
  onToggleCalibration: () => void;
}

export function DemoControls({
  visibleDegrees,
  onVisibleDegreesChange,
  smoothingFactor,
  onSmoothingFactorChange,
  showNumericLabels,
  onShowNumericLabelsChange,
  onToggleCalibration,
}: DemoControlsProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Controls</Text>

      {/* Visible Degrees Slider */}
      <View style={styles.control}>
        <Text style={styles.label}>
          Visible Degrees: {visibleDegrees}°
        </Text>
        <Slider
          style={styles.slider}
          minimumValue={60}
          maximumValue={180}
          step={10}
          value={visibleDegrees}
          onValueChange={onVisibleDegreesChange}
          minimumTrackTintColor="#ff9f43"
          maximumTrackTintColor="#8899aa"
          thumbTintColor="#ff9f43"
        />
        <Text style={styles.hint}>Adjust the compass width (60-180°)</Text>
      </View>

      {/* Smoothing Factor Slider */}
      <View style={styles.control}>
        <Text style={styles.label}>
          Smoothing: {smoothingFactor.toFixed(2)}
        </Text>
        <Slider
          style={styles.slider}
          minimumValue={0.05}
          maximumValue={1.0}
          step={0.05}
          value={smoothingFactor}
          onValueChange={onSmoothingFactorChange}
          minimumTrackTintColor="#ff9f43"
          maximumTrackTintColor="#8899aa"
          thumbTintColor="#ff9f43"
        />
        <Text style={styles.hint}>
          Lower = smoother, Higher = more responsive
        </Text>
      </View>

      {/* Show Numeric Labels Switch */}
      <View style={styles.control}>
        <View style={styles.switchRow}>
          <Text style={styles.label}>Show Numeric Labels</Text>
          <Switch
            value={showNumericLabels}
            onValueChange={onShowNumericLabelsChange}
            trackColor={{ false: '#8899aa', true: '#ff9f43' }}
            thumbColor="#ffffff"
          />
        </View>
        <Text style={styles.hint}>Toggle degree numbers on the tape</Text>
      </View>

      {/* Calibration Button */}
      <View style={styles.control}>
        <TouchableOpacity
          style={styles.button}
          onPress={onToggleCalibration}
        >
          <Text style={styles.buttonText}>Calibration Instructions</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#162a4a',
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  control: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  hint: {
    fontSize: 12,
    color: '#8899aa',
    marginTop: 4,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#ff9f43',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#0a1628',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
