// Mock for react-native-svg in Jest tests

const React = require('react');

const createMockComponent = (name) => {
  return ({ children, testID, ...props }) =>
    React.createElement(name, { 'data-testid': testID || name.toLowerCase(), ...props }, children);
};

module.exports = {
  Svg: createMockComponent('Svg'),
  G: createMockComponent('G'),
  Line: createMockComponent('Line'),
  Text: createMockComponent('SvgText'),
  Rect: createMockComponent('Rect'),
  Path: createMockComponent('Path'),
  Circle: createMockComponent('Circle'),
  Polygon: createMockComponent('Polygon'),
  default: createMockComponent('Svg'),
};
