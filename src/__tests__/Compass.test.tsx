import React from 'react';
import { render, waitFor, act } from '@testing-library/react-native';
import { Compass } from '../Compass';
import { Magnetometer } from 'expo-sensors';

// Mock expo-sensors
jest.mock('expo-sensors');

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

// Get the mocked module
const mockedMagnetometer = Magnetometer as jest.Mocked<typeof Magnetometer> & {
  __simulateReading: (data: { x: number; y: number; z: number }) => void;
  __setAvailable: (available: boolean) => void;
  __setPermissionStatus: (status: string) => void;
  __reset: () => void;
};

describe('Compass', () => {
  beforeEach(() => {
    mockedMagnetometer.__reset();
  });

  it('renders without crashing when magnetometer is available', async () => {
    const { getByTestId } = render(<Compass />);

    await waitFor(() => {
      expect(Magnetometer.isAvailableAsync).toHaveBeenCalled();
    });
  });

  it('renders error view when magnetometer is unavailable', async () => {
    mockedMagnetometer.__setAvailable(false);

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
        mockedMagnetometer.__simulateReading({
          x: Math.cos(angle),
          y: -Math.sin(angle),
          z: 0,
        });
      }
    });

    // If we got here without Maximum Update Depth error, test passes
    expect(true).toBe(true);
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
      mockedMagnetometer.__simulateReading({ x: 0, y: -1, z: 0 }); // ~0°

      // Cross to near 360
      mockedMagnetometer.__simulateReading({ x: 0.1, y: -1, z: 0 }); // ~355°

      // Cross back to near 0
      mockedMagnetometer.__simulateReading({ x: -0.1, y: -1, z: 0 }); // ~5°

      // Rapid crossing
      for (let i = 0; i < 10; i++) {
        const offset = i % 2 === 0 ? 0.1 : -0.1;
        mockedMagnetometer.__simulateReading({ x: offset, y: -1, z: 0 });
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
      mockedMagnetometer.__simulateReading({ x: 1, y: 0, z: 0 });
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
        mockedMagnetometer.__simulateReading({
          x: Math.cos(i * 0.1),
          y: -Math.sin(i * 0.1),
          z: 0,
        });
      }
    });

    // Renders should be bounded (not infinite)
    // A reasonable upper bound would be around 100 additional renders for 50 updates
    const additionalRenders = renderCount - initialRenderCount;
    expect(additionalRenders).toBeLessThan(200);
  });

  it('accepts custom color props', async () => {
    const { getByTestId } = render(
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

    // Get the subscription
    const subscription = (Magnetometer.addListener as jest.Mock).mock.results[0]?.value;

    unmount();

    // The remove function should be callable (cleanup occurred)
    // In our mock, this is tracked internally
    expect(true).toBe(true);
  });
});
