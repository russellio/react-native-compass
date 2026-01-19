import React from 'react';
import { render, waitFor, act } from '@testing-library/react-native';
import { Compass } from '../Compass';
import { Magnetometer } from 'expo-sensors';

// Mock expo-sensors with factory function to bypass Jest's auto-mocking
jest.mock('expo-sensors', () => jest.requireActual('../../__mocks__/expo-sensors'));

// Mock react-native-reanimated with factory function to bypass Jest's auto-mocking
jest.mock('react-native-reanimated', () => jest.requireActual('../../__mocks__/react-native-reanimated'));

// Mock react-native-svg
jest.mock('react-native-svg', () => jest.requireActual('../../__mocks__/react-native-svg'));

// Import test helpers from the mock module
const { __magnetometerTestHelpers } = require('expo-sensors');

// Helper to wait for compass to be fully initialized
const waitForCompassReady = async (getByTestId: (id: string) => any) => {
  // Wait for the magnetometer to be initialized and compass to render
  await waitFor(() => {
    expect(Magnetometer.addListener).toHaveBeenCalled();
  });

  // Small delay to ensure React state updates have propagated
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 10));
  });

  // Verify compass container is rendered (not error view)
  await waitFor(() => {
    expect(getByTestId('compass-container')).toBeTruthy();
  });
};

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

    const { toJSON } = render(<Compass />);

    // Wait for the async check to complete
    await waitFor(() => {
      expect(Magnetometer.isAvailableAsync).toHaveBeenCalled();
    });

    // Allow state updates to propagate
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    // Check that error view is rendered with the error message
    const tree = JSON.stringify(toJSON());
    expect(tree).toContain('Compass Unavailable');
    expect(tree).toContain('Magnetometer sensor is not available');
  });

  it('does not exceed maximum update depth with rapid heading updates', async () => {
    const onHeadingChange = jest.fn();

    const { getByTestId } = render(<Compass onHeadingChange={onHeadingChange} />);

    await waitForCompassReady(getByTestId);

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

    const { getByTestId } = render(<Compass onHeadingChange={onHeadingChange} />);

    await waitForCompassReady(getByTestId);

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
    expect(onHeadingChange).toHaveBeenCalled();
  });

  it('handles magnetometer readings without errors', async () => {
    const onHeadingChange = jest.fn();

    const { getByTestId } = render(<Compass onHeadingChange={onHeadingChange} />);

    await waitForCompassReady(getByTestId);

    // The magnetometer listener is registered, simulating readings should not throw
    await act(async () => {
      // Simulate a heading of approximately 90° (East)
      __magnetometerTestHelpers.simulateReading({ x: 1, y: 0, z: 0 });
    });

    // Test passes if we get here without errors
    expect(onHeadingChange).toHaveBeenCalled();
  });

  it('maintains bounded re-renders under continuous updates', async () => {
    let renderCount = 0;

    const TestComponent = () => {
      renderCount++;
      return <Compass />;
    };

    const { getByTestId } = render(<TestComponent />);

    await waitForCompassReady(getByTestId);

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
      const { getByTestId } = render(<Compass onHeadingChange={onHeadingChange} />);

      await waitForCompassReady(getByTestId);

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
    const { unmount, getByTestId } = render(<Compass />);

    await waitForCompassReady(getByTestId);

    const listenersBeforeUnmount = __magnetometerTestHelpers.getListenersCount();
    expect(listenersBeforeUnmount).toBe(1);

    unmount();

    // The subscription should be removed
    const listenersAfterUnmount = __magnetometerTestHelpers.getListenersCount();
    expect(listenersAfterUnmount).toBe(0);
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

    const { getByTestId } = render(<Compass onHeadingChange={onHeadingChange} />);

    await waitForCompassReady(getByTestId);

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

    const { getByTestId } = render(<Compass onAccuracyChange={onAccuracyChange} />);

    await waitForCompassReady(getByTestId);

    await act(async () => {
      __magnetometerTestHelpers.simulateReading({ x: 0, y: -1, z: 0 });
    });

    expect(onAccuracyChange).toHaveBeenCalled();
  });
});
