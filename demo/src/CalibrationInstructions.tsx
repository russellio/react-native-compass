import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

interface CalibrationInstructionsProps {
  onClose: () => void;
}

export function CalibrationInstructions({
  onClose,
}: CalibrationInstructionsProps) {
  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <ScrollView style={styles.scrollView}>
          <Text style={styles.title}>Magnetometer Calibration</Text>

          <Text style={styles.sectionTitle}>Why Calibrate?</Text>
          <Text style={styles.text}>
            The magnetometer sensor can be affected by magnetic interference
            from metal objects, electronics, or magnetic cases. Calibration
            helps improve accuracy.
          </Text>

          <Text style={styles.sectionTitle}>iOS Calibration</Text>
          <Text style={styles.step}>1. Hold your device flat</Text>
          <Text style={styles.step}>
            2. Move it in a figure-8 pattern in the air
          </Text>
          <Text style={styles.step}>3. Repeat several times</Text>
          <Text style={styles.step}>
            4. If prompted by iOS, follow the on-screen instructions
          </Text>

          <Text style={styles.sectionTitle}>Android Calibration</Text>
          <Text style={styles.step}>1. Open device Settings</Text>
          <Text style={styles.step}>2. Go to Display</Text>
          <Text style={styles.step}>3. Enable Auto-rotate screen</Text>
          <Text style={styles.step}>
            4. Move your device in a figure-8 pattern
          </Text>
          <Text style={styles.step}>
            5. The calibration dialog should appear automatically
          </Text>

          <Text style={styles.sectionTitle}>Tips for Best Results</Text>
          <Text style={styles.tip}>
            • Move away from magnetic interference (speakers, magnets, metal)
          </Text>
          <Text style={styles.tip}>
            • Remove magnetic phone cases during calibration
          </Text>
          <Text style={styles.tip}>
            • Hold the device relatively flat for accurate readings
          </Text>
          <Text style={styles.tip}>
            • Recalibrate if you notice erratic behavior
          </Text>

          <Text style={styles.sectionTitle}>Location Permission (iOS)</Text>
          <Text style={styles.text}>
            iOS requires location permission to access the magnetometer. Make
            sure you've granted location access when prompted.
          </Text>
        </ScrollView>

        <TouchableOpacity style={styles.button} onPress={onClose}>
          <Text style={styles.buttonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#162a4a',
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
    width: '100%',
  },
  scrollView: {
    maxHeight: 500,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff9f43',
    marginTop: 16,
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    color: '#e0e0e0',
    lineHeight: 20,
    marginBottom: 8,
  },
  step: {
    fontSize: 14,
    color: '#e0e0e0',
    lineHeight: 22,
    marginLeft: 12,
  },
  tip: {
    fontSize: 14,
    color: '#e0e0e0',
    lineHeight: 22,
    marginLeft: 8,
  },
  button: {
    backgroundColor: '#ff9f43',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#0a1628',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
