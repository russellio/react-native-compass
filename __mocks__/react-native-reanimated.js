// Mock for react-native-reanimated in Jest tests
const React = require('react');

// Store for SharedValues to ensure stable references
const sharedValueStore = new WeakMap();

const mockUseSharedValue = (initialValue) => {
  // For testing, we use a simple object that mimics SharedValue
  const sharedValue = {
    value: initialValue,
  };
  return sharedValue;
};

const mockWithSpring = (toValue, config) => {
  // In tests, withSpring immediately returns the target value
  return toValue;
};

const mockWithTiming = (toValue, config) => {
  return toValue;
};

const mockUseAnimatedStyle = (styleCallback) => {
  // Return the result of the style callback for testing
  return styleCallback();
};

const mockUseDerivedValue = (callback) => {
  return mockUseSharedValue(callback());
};

// Mock createAnimatedComponent
const mockCreateAnimatedComponent = (Component) => {
  return React.forwardRef((props, ref) => {
    return React.createElement(Component, { ...props, ref });
  });
};

// Animated components namespace
const Animated = {
  View: mockCreateAnimatedComponent('View'),
  Text: mockCreateAnimatedComponent('Text'),
  Image: mockCreateAnimatedComponent('Image'),
  ScrollView: mockCreateAnimatedComponent('ScrollView'),
  createAnimatedComponent: mockCreateAnimatedComponent,
};

module.exports = {
  useSharedValue: mockUseSharedValue,
  withSpring: mockWithSpring,
  withTiming: mockWithTiming,
  useAnimatedStyle: mockUseAnimatedStyle,
  useDerivedValue: mockUseDerivedValue,
  createAnimatedComponent: mockCreateAnimatedComponent,
  default: Animated,
  ...Animated,
};
