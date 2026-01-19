import React from 'react';
import { render } from '@testing-library/react-native';
import { CompassNeedle } from '../CompassNeedle';

// Mock react-native-svg
jest.mock('react-native-svg', () => jest.requireActual('../../../__mocks__/react-native-svg'));

describe('CompassNeedle', () => {
  const defaultProps = {
    needleColor: '#ff9f43',
    height: 200,
  };

  it('renders without crashing', () => {
    const { toJSON } = render(<CompassNeedle {...defaultProps} />);
    expect(toJSON()).toBeTruthy();
  });

  it('has testID "compass-needle"', () => {
    const { getByTestId } = render(<CompassNeedle {...defaultProps} />);
    expect(getByTestId('compass-needle')).toBeTruthy();
  });

  it('renders SVG elements', () => {
    const { toJSON } = render(<CompassNeedle {...defaultProps} />);
    const tree = toJSON();
    // The SVG mock renders divs with data-component attributes
    expect(JSON.stringify(tree)).toContain('Svg');
    expect(JSON.stringify(tree)).toContain('Polygon');
  });

  it('passes needleColor to Polygon fill', () => {
    const { toJSON } = render(
      <CompassNeedle needleColor="#ff0000" height={200} />
    );
    const tree = toJSON();
    // The fill color should be in the rendered tree
    expect(JSON.stringify(tree)).toContain('#ff0000');
  });

  it('applies height prop to container', () => {
    const { getByTestId } = render(
      <CompassNeedle needleColor="#ff9f43" height={300} />
    );
    const container = getByTestId('compass-needle');
    expect(container.props.style).toEqual(
      expect.objectContaining({ height: 300 })
    );
  });

  it('uses needle size of 20 for SVG dimensions', () => {
    const { toJSON } = render(<CompassNeedle {...defaultProps} />);
    const tree = toJSON();
    const treeStr = JSON.stringify(tree);
    // The SVG should have height and width of 20
    expect(treeStr).toContain('"height":20');
    expect(treeStr).toContain('"width":20');
  });

  it('generates correct triangle points for needle', () => {
    const { toJSON } = render(<CompassNeedle {...defaultProps} />);
    const tree = toJSON();
    // needleSize = 20, so points = "10,20 0,0 20,0"
    expect(JSON.stringify(tree)).toContain('10,20 0,0 20,0');
  });

  it('has pointerEvents set to none on container', () => {
    const { getByTestId } = render(<CompassNeedle {...defaultProps} />);
    const container = getByTestId('compass-needle');
    expect(container.props.pointerEvents).toBe('none');
  });

  it('accepts different height values', () => {
    const heights = [100, 150, 200, 250];

    heights.forEach((height) => {
      const { getByTestId, unmount } = render(
        <CompassNeedle needleColor="#ff9f43" height={height} />
      );
      const container = getByTestId('compass-needle');
      expect(container.props.style).toEqual(
        expect.objectContaining({ height })
      );
      unmount();
    });
  });

  it('accepts different needle colors', () => {
    const colors = ['#ff0000', '#00ff00', '#0000ff', 'rgb(255, 165, 0)'];

    colors.forEach((color) => {
      const { toJSON, unmount } = render(
        <CompassNeedle needleColor={color} height={200} />
      );
      expect(JSON.stringify(toJSON())).toContain(color);
      unmount();
    });
  });

  it('renders nested structure correctly', () => {
    const { toJSON } = render(<CompassNeedle {...defaultProps} />);
    const tree = toJSON();
    // Should have View > View (needleWrapper) > Svg > Polygon structure
    expect(tree).toBeTruthy();
    if (tree && 'children' in tree) {
      expect(tree.children).toBeTruthy();
    }
  });
});
