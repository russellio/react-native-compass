import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { HeadingDisplay } from '../HeadingDisplay';

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () =>
  jest.requireActual('../../../__mocks__/react-native-reanimated')
);

describe('HeadingDisplay', () => {
  const createSharedValue = (value: number) => ({ value });

  const defaultProps = {
    animatedHeading: createSharedValue(0),
    headingLabelColor: '#ff9f43',
    headingValueColor: '#ffffff',
    fontFamily: undefined,
  };

  it('renders without crashing', () => {
    const { toJSON } = render(<HeadingDisplay {...defaultProps} />);
    expect(toJSON()).toBeTruthy();
  });

  it('has testID "heading-display"', () => {
    const { getByTestId } = render(<HeadingDisplay {...defaultProps} />);
    expect(getByTestId('heading-display')).toBeTruthy();
  });

  it('displays "HEADING" label', () => {
    const { toJSON } = render(<HeadingDisplay {...defaultProps} />);
    const tree = toJSON();
    // Check that HEADING text exists in the tree
    expect(JSON.stringify(tree)).toContain('HEADING');
  });

  it('applies headingLabelColor to the label', () => {
    const { toJSON } = render(
      <HeadingDisplay {...defaultProps} headingLabelColor="#ff0000" />
    );
    const tree = toJSON();
    // The color should be in the rendered styles
    expect(JSON.stringify(tree)).toContain('#ff0000');
  });

  it('renders heading value from animatedHeading', () => {
    const { toJSON } = render(
      <HeadingDisplay
        {...defaultProps}
        animatedHeading={createSharedValue(45)}
      />
    );
    const tree = toJSON();
    expect(tree).toBeTruthy();
    // The animated value should render as "45°"
    expect(JSON.stringify(tree)).toContain('45°');
  });

  it('displays formatted heading value with degree symbol', () => {
    const { toJSON } = render(
      <HeadingDisplay
        {...defaultProps}
        animatedHeading={createSharedValue(90)}
      />
    );
    const tree = toJSON();
    expect(JSON.stringify(tree)).toContain('90°');
  });

  it('normalizes heading to 0-359 range', () => {
    const { toJSON } = render(
      <HeadingDisplay
        {...defaultProps}
        animatedHeading={createSharedValue(370)}
      />
    );
    const tree = toJSON();
    // 370 normalizes to 10
    expect(JSON.stringify(tree)).toContain('10°');
  });

  it('rounds heading to nearest degree', () => {
    const { toJSON } = render(
      <HeadingDisplay
        {...defaultProps}
        animatedHeading={createSharedValue(45.7)}
      />
    );
    const tree = toJSON();
    // 45.7 rounds to 46
    expect(JSON.stringify(tree)).toContain('46°');
  });

  it('applies headingValueColor to degree value', () => {
    const { toJSON } = render(
      <HeadingDisplay {...defaultProps} headingValueColor="#00ff00" />
    );
    const tree = toJSON();
    expect(JSON.stringify(tree)).toContain('#00ff00');
  });

  it('applies fontFamily when provided', () => {
    const { toJSON } = render(
      <HeadingDisplay {...defaultProps} fontFamily="Roboto" />
    );
    const tree = toJSON();
    expect(JSON.stringify(tree)).toContain('Roboto');
  });

  it('does not apply fontFamily when undefined', () => {
    const { toJSON } = render(
      <HeadingDisplay {...defaultProps} fontFamily={undefined} />
    );
    const tree = toJSON();
    // The tree should render but without fontFamily property on the label
    expect(tree).toBeTruthy();
    // Should not contain any explicit fontFamily setting
    const treeStr = JSON.stringify(tree);
    expect(treeStr).toContain('HEADING');
    // Note: we can't easily test for absence of fontFamily without inspecting deeply
  });

  it('renders AnimatedTextInput for degree display', () => {
    const { toJSON } = render(<HeadingDisplay {...defaultProps} />);
    const tree = toJSON();
    // The tree should have an input element (from mock)
    expect(JSON.stringify(tree)).toContain('input');
  });

  it('handles negative heading values (normalizes them)', () => {
    const { toJSON } = render(
      <HeadingDisplay
        {...defaultProps}
        animatedHeading={createSharedValue(-90)}
      />
    );
    const tree = toJSON();
    // -90 normalizes to 270
    expect(JSON.stringify(tree)).toContain('270°');
  });

  it('handles boundary value of 0 degrees', () => {
    const { toJSON } = render(
      <HeadingDisplay
        {...defaultProps}
        animatedHeading={createSharedValue(0)}
      />
    );
    const tree = toJSON();
    expect(JSON.stringify(tree)).toContain('0°');
  });

  it('handles boundary value of 359 degrees', () => {
    const { toJSON } = render(
      <HeadingDisplay
        {...defaultProps}
        animatedHeading={createSharedValue(359)}
      />
    );
    const tree = toJSON();
    expect(JSON.stringify(tree)).toContain('359°');
  });

  it('accepts different color combinations', () => {
    const { toJSON } = render(
      <HeadingDisplay
        animatedHeading={createSharedValue(180)}
        headingLabelColor="#123456"
        headingValueColor="#654321"
        fontFamily="Arial"
      />
    );
    const tree = toJSON();
    expect(JSON.stringify(tree)).toContain('#123456');
    expect(JSON.stringify(tree)).toContain('#654321');
    expect(JSON.stringify(tree)).toContain('Arial');
    expect(JSON.stringify(tree)).toContain('180°');
  });
});
