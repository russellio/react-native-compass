import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View, StatusBar } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Compass } from "@russellio/react-native-compass";
import { DemoControls } from "./DemoControls";
import { DebugPanel } from "./DebugPanel";
import { CalibrationInstructions } from "./CalibrationInstructions";

export default function App() {
  const [visibleDegrees, setVisibleDegrees] = useState(120);
  const [smoothingFactor, setSmoothingFactor] = useState(0.2);
  const [showNumericLabels, setShowNumericLabels] = useState(true);
  const [currentHeading, setCurrentHeading] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [showCalibration, setShowCalibration] = useState(false);

  return (
    <SafeAreaProvider style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>React Native Compass</Text>
          <Text style={styles.subtitle}>Horizontal Scrolling Compass Demo</Text>
        </View>

        {/* Compass Component */}
        <View style={styles.compassContainer}>
          <Compass
            visibleDegrees={visibleDegrees}
            smoothingFactor={smoothingFactor}
            showNumericLabels={showNumericLabels}
            onHeadingChange={setCurrentHeading}
            onAccuracyChange={setAccuracy}
          />
        </View>

        {/* Debug Panel */}
        <DebugPanel
          heading={currentHeading}
          accuracy={accuracy}
          smoothingFactor={smoothingFactor}
          visibleDegrees={visibleDegrees}
        />

        {/* Demo Controls */}
        <DemoControls
          visibleDegrees={visibleDegrees}
          onVisibleDegreesChange={setVisibleDegrees}
          smoothingFactor={smoothingFactor}
          onSmoothingFactorChange={setSmoothingFactor}
          showNumericLabels={showNumericLabels}
          onShowNumericLabelsChange={setShowNumericLabels}
          onToggleCalibration={() => setShowCalibration(!showCalibration)}
        />

        {/* Calibration Instructions */}
        {showCalibration && (
          <CalibrationInstructions onClose={() => setShowCalibration(false)} />
        )}
      </ScrollView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a1628",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 10,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#8899aa",
  },
  compassContainer: {
    marginVertical: 20,
  },
});
