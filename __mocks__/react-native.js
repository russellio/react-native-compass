// Mock for react-native in Jest tests
// Uses functional components that work with react-test-renderer

const React = require('react');

// Helper to flatten style arrays (DOM expects object, not array)
const flattenStyleLocal = (style) => {
  if (!style) return undefined;
  if (Array.isArray(style)) {
    return style.reduce((acc, s) => {
      if (s) {
        return { ...acc, ...flattenStyleLocal(s) };
      }
      return acc;
    }, {});
  }
  return style;
};

// Create simple functional components that mimic RN components
// Using 'div' as base element since test-renderer handles it natively
const View = React.forwardRef(function View({ children, style, testID, ...props }, ref) {
  return React.createElement('div', {
    ref,
    style: flattenStyleLocal(style),
    'data-testid': testID,
    ...props
  }, children);
});
View.displayName = 'View';

const Text = React.forwardRef(function Text({ children, style, testID, ...props }, ref) {
  return React.createElement('span', {
    ref,
    style: flattenStyleLocal(style),
    'data-testid': testID,
    ...props
  }, children);
});
Text.displayName = 'Text';

const TextInput = React.forwardRef(function TextInput({ style, testID, value, defaultValue, text, ...props }, ref) {
  return React.createElement('input', {
    ref,
    style: flattenStyleLocal(style),
    'data-testid': testID,
    value: value || text || defaultValue || '',
    readOnly: true,
    ...props
  });
});
TextInput.displayName = 'TextInput';

const Image = React.forwardRef(function Image({ style, testID, source, ...props }, ref) {
  return React.createElement('img', {
    ref,
    style: flattenStyleLocal(style),
    'data-testid': testID,
    src: source?.uri || '',
    ...props
  });
});
Image.displayName = 'Image';

const ScrollView = React.forwardRef(function ScrollView({ children, style, testID, ...props }, ref) {
  return React.createElement('div', {
    ref,
    style: flattenStyleLocal(style),
    'data-testid': testID,
    ...props
  }, children);
});
ScrollView.displayName = 'ScrollView';

const StyleSheet = {
  create: (styles) => styles,
  flatten: flattenStyleLocal,
};

const Animated = {
  View,
  Text,
  Value: class AnimatedValue {
    constructor(value) {
      this._value = value;
    }
    setValue(value) {
      this._value = value;
    }
  },
  timing: () => ({
    start: (callback) => callback && callback({ finished: true }),
  }),
  spring: () => ({
    start: (callback) => callback && callback({ finished: true }),
  }),
  createAnimatedComponent: (Component) => Component,
};

const Platform = {
  OS: 'ios',
  select: (obj) => obj.ios || obj.default,
};

module.exports = {
  View,
  Text,
  TextInput,
  Image,
  ScrollView,
  StyleSheet,
  Animated,
  Platform,
  Dimensions: {
    get: () => ({ width: 375, height: 812 }),
  },
  PixelRatio: {
    get: () => 2,
  },
};
