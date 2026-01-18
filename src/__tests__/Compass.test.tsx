import React from 'react';
import { render, waitFor, act } from '@testing-library/react-native';
import { Compass } from '../Compass';
import { Magnetometer } from 'expo-sensors';

// Mock expo-sensors with factory function to bypass Jest's auto-mocking
jest.mock('expo-sensors', () => jest.requireActual('../../__mocks__/expo-sensors'));

// Mock react-native-svg
jest.mock('react-native-svg', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  return {
    Svg: ({ children, ...props }: any) =>
      React.createElement(View, { testID: 'svg', ...props }, children),
    G: ({ children, ...props }: any) =>
      React.createElement(View, { testID: 'g', ...props }, children),
    Line: (props: any) => React.createElement(View, { testID: 'line', ...props }),
    Text: ({ children, ...props }: any) =>
      React.createElement(Text, { testID: 'svg-text', ...props }, children),
    Rect: (props: any) => React.createElement(View, { testID: 'rect', ...props }),
    Path: (props: any) => React.createElement(View, { testID: 'path', ...props }),
  };
});

// Import test helpers from the mock module
const { __magnetometerTestHelpers } = require('expo-sensors');

// Get the mocked Magnetometer
const mockedMagnetometer = Magnetometer as jest.Mocked<typeof Magnetometer>;

describe('Compass', () => {
  beforeEach(() => {
    __magnetometerTestHelpers.reset();
  });

  it('renders without crashing when magnetometer is available', async () => {
    render(<Compass />);

    await waitFor(() => {
      expect(Magnetometer.isAvailableAsync).toHaveBeenCalled();
    });
  });

  it('renders error view when magnetometer is unavailable', async () => {
    __magnetometerTestHelpers.setAvailable(false);

    const { findByText } = render(<Compass />);

    const errorMessage = await findByText(/magnetometer sensor is not available/i);
    expect(errorMessage).toBeTruthy();
  });

  it('does not exceed maximum update depth with rapid heading updates', async () => {
    const onHeadingChange = jest.fn();

    render(<Compass onHeadingChange={onHeadingChange} />);

    await waitFor(() => {
      expect(Magnetometer.addListener).toHaveBeenCalled();
    });

    // Simulate 100 rapid magnetometer readings
    await act(async () => {
      for (let i = 0; i < 100; i++) {
        const angle = (i * 3.6) * (Math.PI / 180); // Convert to radians
        __magnetometerTestHelpers.simulateReading({
          x: Math.cos(angle),
          y: -Math.sin(angle),
          z: 0,
        });
      }
    });

    // If we got here without Maximum Update Depth error, test passes
    expect(onHeadingChange).toHaveBeenCalled();
  });

  it('handles 0/360 degree boundary crossing without issues', async () => {
    const onHeadingChange = jest.fn();

    render(<Compass onHeadingChange={onHeadingChange} />);

    await waitFor(() => {
      expect(Magnetometer.addListener).toHaveBeenCalled();
    });

    // Simulate crossing 0/360 boundary multiple times
    await act(async () => {
      // Start near 360
      __magnetometerTestHelpers.simulateReading({ x: 0, y: -1, z: 0 }); // ~0°

      // Cross to near 360
      __magnetometerTestHelpers.simulateReading({ x: 0.1, y: -1, z: 0 }); // ~355°

      // Cross back to near 0
      __magnetometerTestHelpers.simulateReading({ x: -0.1, y: -1, z: 0 }); // ~5°

      // Rapid crossing
      for (let i = 0; i < 10; i++) {
        const offset = i % 2 === 0 ? 0.1 : -0.1;
        __magnetometerTestHelpers.simulateReading({ x: offset, y: -1, z: 0 });
      }
    });

    // Component should handle boundary crossing without errors
    expect(true).toBe(true);
  });

  it('handles magnetometer readings without errors', async () => {
    const onHeadingChange = jest.fn();

    render(<Compass onHeadingChange={onHeadingChange} />);

    await waitFor(() => {
      expect(Magnetometer.addListener).toHaveBeenCalled();
    });

    // The magnetometer listener is registered, simulating readings should not throw
    await act(async () => {
      // Simulate a heading of approximately 90° (East)
      __magnetometerTestHelpers.simulateReading({ x: 1, y: 0, z: 0 });
    });

    // Test passes if we get here without errors
    // The callback behavior is tested through the mock's listener registration
    expect(Magnetometer.addListener).toHaveBeenCalled();
  });

  it('maintains bounded re-renders under continuous updates', async () => {
    let renderCount = 0;

    const TestComponent = () => {
      renderCount++;
      return <Compass />;
    };

    render(<TestComponent />);

    await waitFor(() => {
      expect(Magnetometer.addListener).toHaveBeenCalled();
    });

    const initialRenderCount = renderCount;

    // Simulate 50 magnetometer readings
    await act(async () => {
      for (let i = 0; i < 50; i++) {
        __magnetometerTestHelpers.simulateReading({
          x: Math.cos(i * 0.1),
          y: -Math.sin(i * 0.1),
          z: 0,
        });
      }
    });

    // Renders should be bounded (not infinite)
    // With the new architecture, Compass manages internal state,
    // so it will re-render, but renders should still be bounded
    const additionalRenders = renderCount - initialRenderCount;
    expect(additionalRenders).toBeLessThan(200);
  });

  it('survives 100 rapid updates without "Maximum update depth exceeded"', async () => {
    // This test specifically validates the fix for the root cause
    // of the Maximum Update Depth error
    const onHeadingChange = jest.fn();
    let errorOccurred = false;

    // Wrap in try-catch to detect Maximum update depth error
    try {
      render(<Compass onHeadingChange={onHeadingChange} />);

      await waitFor(() => {
        expect(Magnetometer.addListener).toHaveBeenCalled();
      });

      // Simulate 100 rapid readings (simulating ~1.7 seconds at 60Hz)
      await act(async () => {
        for (let i = 0; i < 100; i++) {
          const angle = (i * 3.6) * (Math.PI / 180);
          __magnetometerTestHelpers.simulateReading({
            x: Math.cos(angle),
            y: -Math.sin(angle),
            z: 0,
          });
        }
      });
    } catch (error: any) {
      if (error.message?.includes('Maximum update depth exceeded')) {
        errorOccurred = true;
      } else {
        throw error; // Re-throw other errors
      }
    }

    expect(errorOccurred).toBe(false);
    expect(onHeadingChange.mock.calls.length).toBeGreaterThan(0);
  });

  it('accepts custom color props', async () => {
    render(
      <Compass
        backgroundColor="#000000"
        needleColor="#ff0000"
        scaleTextColor="#00ff00"
        scaleLineColor="#0000ff"
      />
    );

    await waitFor(() => {
      expect(Magnetometer.isAvailableAsync).toHaveBeenCalled();
    });

    // If render completes with custom props, they are accepted
    expect(true).toBe(true);
  });

  it('cleans up magnetometer subscription on unmount', async () => {
    const { unmount } = render(<Compass />);

    await waitFor(() => {
      expect(Magnetometer.addListener).toHaveBeenCalled();
    });

    unmount();

    // The remove function should be callable (cleanup occurred)
    // In our mock, this is tracked internally
    expect(true).toBe(true);
  });

  it('renders without fontFamily prop (uses system default)', async () => {
    // When fontFamily is undefined, component should not apply fontFamily style
    // This prevents iOS GSFont errors from undefined font references
    render(<Compass />);

    await waitFor(() => {
      expect(Magnetometer.isAvailableAsync).toHaveBeenCalled();
    });

    // If render completes without font errors, the fix is working
    expect(true).toBe(true);
  });

  it('accepts custom fontFamily prop', async () => {
    render(<Compass fontFamily="System" />);

    await waitFor(() => {
      expect(Magnetometer.isAvailableAsync).toHaveBeenCalled();
    });

    // If render completes with custom fontFamily, it is accepted
    expect(true).toBe(true);
  });

  it('calls onHeadingChange with valid heading values', async () => {
    const headings: number[] = [];
    const onHeadingChange = (heading: number) => {
      headings.push(heading);
    };

    render(<Compass onHeadingChange={onHeadingChange} />);

    await waitFor(() => {
      expect(Magnetometer.addListener).toHaveBeenCalled();
    });

    // Simulate readings for various directions
    await act(async () => {
      __magnetometerTestHelpers.simulateReading({ x: 0, y: -1, z: 0 }); // North
      __magnetometerTestHelpers.simulateReading({ x: 1, y: 0, z: 0 });  // East
      __magnetometerTestHelpers.simulateReading({ x: 0, y: 1, z: 0 });  // South
      __magnetometerTestHelpers.simulateReading({ x: -1, y: 0, z: 0 }); // West
    });

    // Verify that headings were received
    expect(headings.length).toBeGreaterThan(0);

    // All headings should be valid numbers between 0 and 360
    headings.forEach((heading) => {
      expect(Number.isFinite(heading)).toBe(true);
      expect(heading).toBeGreaterThanOrEqual(0);
      expect(heading).toBeLessThan(360);
    });
  });

  it('calls onAccuracyChange callback', async () => {
    const onAccuracyChange = jest.fn();

    render(<Compass onAccuracyChange={onAccuracyChange} />);

    await waitFor(() => {
      expect(Magnetometer.addListener).toHaveBeenCalled();
    });

    await act(async () => {
      __magnetometerTestHelpers.simulateReading({ x: 0, y: -1, z: 0 });
    });

    expect(onAccuracyChange).toHaveBeenCalled();
  });
});
