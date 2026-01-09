import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { ErrorViewProps } from '../types';

/**
 * ErrorView - Displays error messages when compass is unavailable
 * Shows when magnetometer is not supported or permissions are denied
 */
export function ErrorView({
  message,
  backgroundColor,
  textColor,
}: ErrorViewProps) {
  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={[styles.title, { color: textColor }]}>
        Compass Unavailable
      </Text>
      <Text style={[styles.message, { color: textColor }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
