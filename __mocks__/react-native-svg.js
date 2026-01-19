// Mock for react-native-svg in Jest tests
// Uses 'div' elements that react-test-renderer handles natively

const React = require('react');

const createMockComponent = (displayName) => {
  const Component = React.forwardRef(function({ children, testID, ...props }, ref) {
    return React.createElement('div', {
      ref,
      'data-testid': testID || displayName.toLowerCase(),
      'data-component': displayName,
      ...props
    }, children);
  });
  Component.displayName = displayName;
  return Component;
};

const Svg = createMockComponent('Svg');
const G = createMockComponent('G');
const Line = createMockComponent('Line');
const SvgText = createMockComponent('SvgText');
const Rect = createMockComponent('Rect');
const Path = createMockComponent('Path');
const Circle = createMockComponent('Circle');
const Polygon = createMockComponent('Polygon');

module.exports = {
  __esModule: true,
  Svg,
  G,
  Line,
  Text: SvgText,
  Rect,
  Path,
  Circle,
  Polygon,
  default: Svg,
};
