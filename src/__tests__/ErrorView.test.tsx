import React from 'react';
import { render } from '@testing-library/react-native';
import { ErrorView } from '../components/ErrorView';

describe('ErrorView', () => {
  const defaultProps = {
    message: 'Test error message',
    backgroundColor: '#1a2b4a',
    textColor: '#ffffff',
  };

  it('renders without crashing', () => {
    const { toJSON } = render(<ErrorView {...defaultProps} />);
    expect(toJSON()).toBeTruthy();
  });

  it('displays "Compass Unavailable" title', () => {
    const { toJSON } = render(<ErrorView {...defaultProps} />);
    const tree = toJSON();
    expect(JSON.stringify(tree)).toContain('Compass Unavailable');
  });

  it('displays the error message', () => {
    const { toJSON } = render(<ErrorView {...defaultProps} />);
    const tree = toJSON();
    expect(JSON.stringify(tree)).toContain('Test error message');
  });

  it('displays custom error message', () => {
    const { toJSON } = render(
      <ErrorView
        {...defaultProps}
        message="Magnetometer sensor is not available on this device"
      />
    );
    const tree = toJSON();
    expect(JSON.stringify(tree)).toContain(
      'Magnetometer sensor is not available on this device'
    );
  });

  it('applies backgroundColor to container', () => {
    const { toJSON } = render(
      <ErrorView {...defaultProps} backgroundColor="#000000" />
    );
    const tree = toJSON();
    expect(tree).toBeTruthy();
    // The container should have the background color applied
    if (tree && 'props' in tree) {
      expect(tree.props.style).toEqual(
        expect.objectContaining({ backgroundColor: '#000000' })
      );
    }
  });

  it('applies textColor to title and message', () => {
    const { toJSON } = render(
      <ErrorView {...defaultProps} textColor="#ff0000" />
    );
    const tree = toJSON();
    // The color should appear in the rendered tree
    expect(JSON.stringify(tree)).toContain('#ff0000');
  });

  it('handles long error messages', () => {
    const longMessage =
      'This is a very long error message that might wrap to multiple lines when displayed on the screen. It should still render correctly without any issues.';
    const { toJSON } = render(
      <ErrorView {...defaultProps} message={longMessage} />
    );
    const tree = toJSON();
    expect(JSON.stringify(tree)).toContain(longMessage);
  });

  it('handles empty message string', () => {
    const { toJSON } = render(<ErrorView {...defaultProps} message="" />);
    const tree = toJSON();
    // Title should still be present
    expect(JSON.stringify(tree)).toContain('Compass Unavailable');
    // Original message should not be present
    expect(JSON.stringify(tree)).not.toContain('Test error message');
  });

  it('renders with all props', () => {
    const { toJSON } = render(
      <ErrorView
        message="Custom error"
        backgroundColor="#123456"
        textColor="#abcdef"
      />
    );
    const tree = toJSON();
    expect(JSON.stringify(tree)).toContain('Custom error');
    expect(JSON.stringify(tree)).toContain('#123456');
    expect(JSON.stringify(tree)).toContain('#abcdef');
  });
});
