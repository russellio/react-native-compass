// Mock for react-native in Jest tests

const React = require('react');

const View = ({ children, style, testID, ...props }) =>
  React.createElement('View', { style, 'data-testid': testID, ...props }, children);

const Text = ({ children, style, testID, ...props }) =>
  React.createElement('Text', { style, 'data-testid': testID, ...props }, children);

const StyleSheet = {
  create: (styles) => styles,
  flatten: (style) => {
    if (Array.isArray(style)) {
      return Object.assign({}, ...style);
    }
    return style || {};
  },
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
