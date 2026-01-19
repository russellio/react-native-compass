// Mock for react-native-reanimated in Jest tests
const React = require('react');
// Import from the mocked react-native
const { View, Text, TextInput, Image, ScrollView } = require('./react-native');

const mockUseSharedValue = (initialValue) => {
  // For testing, we use a simple object that mimics SharedValue
  return {
    value: initialValue,
  };
};

const mockWithSpring = (toValue, _config) => {
  // In tests, withSpring immediately returns the target value
  return toValue;
};

const mockWithTiming = (toValue, _config) => {
  return toValue;
};

const mockUseAnimatedStyle = (styleCallback) => {
  // Return the result of the style callback for testing
  return styleCallback();
};

const mockUseDerivedValue = (callback) => {
  return mockUseSharedValue(callback());
};

const mockUseAnimatedProps = (propsCallback) => {
  // Return the result of the props callback for testing
  // This simulates the animated props being applied
  return propsCallback();
};

const mockUseAnimatedReaction = (_prepare, _react, _deps) => {
  // No-op for tests
};

const mockRunOnJS = (fn) => fn;

// Mock createAnimatedComponent - use actual React Native components
const mockCreateAnimatedComponent = (Component) => {
  return React.forwardRef((props, ref) => {
    // For TextInput with animatedProps, extract the text/defaultValue
    const { animatedProps, ...restProps } = props;
    const mergedProps = { ...restProps };

    // Apply animated props if present
    if (animatedProps) {
      if (animatedProps.text !== undefined) {
        mergedProps.value = animatedProps.text;
      }
      if (animatedProps.defaultValue !== undefined && !mergedProps.defaultValue) {
        mergedProps.defaultValue = animatedProps.defaultValue;
      }
    }

    return React.createElement(Component, { ...mergedProps, ref });
  });
};

// Animated components namespace - use actual RN components
const Animated = {
  View: mockCreateAnimatedComponent(View),
  Text: mockCreateAnimatedComponent(Text),
  TextInput: mockCreateAnimatedComponent(TextInput),
  Image: mockCreateAnimatedComponent(Image),
  ScrollView: mockCreateAnimatedComponent(ScrollView),
  createAnimatedComponent: mockCreateAnimatedComponent,
};

module.exports = {
  __esModule: true,
  useSharedValue: mockUseSharedValue,
  withSpring: mockWithSpring,
  withTiming: mockWithTiming,
  useAnimatedStyle: mockUseAnimatedStyle,
  useDerivedValue: mockUseDerivedValue,
  useAnimatedProps: mockUseAnimatedProps,
  useAnimatedReaction: mockUseAnimatedReaction,
  runOnJS: mockRunOnJS,
  createAnimatedComponent: mockCreateAnimatedComponent,
  default: Animated,
  ...Animated,
};
