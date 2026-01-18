import React from "react";
import { View, Text, TextInput, StyleSheet, TextInputProps } from "react-native";
import Animated, { useAnimatedProps } from "react-native-reanimated";
import type { HeadingDisplayProps } from "../types";
import { FONT_SIZES } from "../constants";

// Create an animated TextInput component
// TextInput has a 'text' prop that can be animated, unlike Text which only has children
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

/**
 * HeadingDisplay - Static overlay showing "HEADING" label and current degree value
 * Uses Reanimated to update the text content on the UI thread without re-renders
 *
 * Simplified to use a single animation layer to prevent micro-updates on Android
 * that can contribute to "Maximum update depth exceeded" errors.
 */
export function HeadingDisplay({
  animatedHeading,
  headingLabelColor,
  headingValueColor,
  fontFamily,
}: HeadingDisplayProps) {
  // Animated props for the TextInput - runs on UI thread
  // Single animation layer: directly format the string in useAnimatedProps
  // Type assertion needed because Reanimated's types don't include 'text' prop
  // which is a valid TextInput prop on both iOS and Android
  const animatedTextProps = useAnimatedProps<TextInputProps & { text?: string }>(() => {
    "worklet";
    // Normalize heading to 0-359 range and round to nearest degree
    const normalized = ((animatedHeading.value % 360) + 360) % 360;
    const roundedHeading = Math.round(normalized);
    return {
      text: `${roundedHeading}°`,
    };
  });

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.label,
          {
            color: headingLabelColor,
          },
          fontFamily ? { fontFamily } : undefined,
        ]}
      >
        HEADING
      </Text>
      <AnimatedTextInput
        style={[
          styles.value,
          {
            color: headingValueColor,
          },
          fontFamily ? { fontFamily } : undefined,
        ]}
        animatedProps={animatedTextProps}
        editable={false}
        caretHidden={true}
        // Prevent text selection
        selectTextOnFocus={false}
        contextMenuHidden={true}
        // Static placeholder for initial render (not animated)
        defaultValue="---°"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 20,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 10,
  },
  label: {
    fontSize: FONT_SIZES.headingLabel,
    fontWeight: "600",
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  value: {
    fontSize: FONT_SIZES.heading,
    fontWeight: "bold",
    // TextInput-specific styles to match Text appearance
    padding: 0,
    margin: 0,
    textAlign: "center",
    // Remove underline on Android
    borderBottomWidth: 0,
  },
});
