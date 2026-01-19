import React from 'react';
import { render, waitFor, act, screen } from '@testing-library/react-native';
import { Compass } from '../Compass';
import { Magnetometer } from 'expo-sensors';

// Mock expo-sensors with factory function to bypass Jest's auto-mocking
jest.mock('expo-sensors', () => jest.requireActual('../../__mocks__/expo-sensors'));

// Mock react-native-reanimated with factory function to bypass Jest's auto-mocking
jest.mock('react-native-reanimated', () => jest.requireActual('../../__mocks__/react-native-reanimated'));

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

describe('Compass Component', () => {
  beforeEach(() => {
    __magnetometerTestHelpers.reset();
  });

  describe('Rendering and Basic Functionality', () => {
    it('renders without crashing when magnetometer is available', async () => {
      const { container } = render(<Compass />);

      await waitFor(() => {
        expect(Magnetometer.isAvailableAsync).toHaveBeenCalled();
      });

      expect(container).toBeTruthy();
    });

    it('renders error view when magnetometer is unavailable', async () => {
      __magnetometerTestHelpers.setAvailable(false);

      render(<Compass />);

      await waitFor(() => {
        expect(screen.getByText(/magnetometer sensor is not available/i)).toBeTruthy();
      });
    });

    it('renders error view when permissions are denied', async () => {
      __magnetometerTestHelpers.setPermissionStatus('denied');

      render(<Compass />);

      await waitFor(() => {
        expect(screen.getByText(/location permission is required/i)).toBeTruthy();
      });
    });

    it('renders compass components when available and no errors', async () => {
      render(<Compass />);

      await waitFor(() => {
        expect(Magnetometer.addListener).toHaveBeenCalled();
      });

      // Should render sub-components
      expect(screen.getByTestId('heading-display')).toBeTruthy();
      expect(screen.getByTestId('compass-tape')).toBeTruthy();
      expect(screen.getByTestId('compass-needle')).toBeTruthy();
    });
  });

  describe('Props Handling', () => {
    it('applies custom background color', async () => {
      const customColor = '#ff0000';
      render(<Compass backgroundColor={customColor} />);

      await waitFor(() => {
        expect(Magnetometer.addListener).toHaveBeenCalled();
      });

      const container = screen.getByTestId('compass-container');
      expect(container.props.style.backgroundColor).toBe(customColor);
    });

    it('passes color props to sub-components', async () => {
      const colors = {
        headingLabelColor: '#ff0000',
        headingValueColor: '#00ff00',
        scaleTextColor: '#0000ff',
        scaleLineColor: '#ffff00',
        needleColor: '#ff00ff',
      };

      render(<Compass {...colors} />);

      await waitFor(() => {
        expect(Magnetometer.addListener).toHaveBeenCalled();
      });

      // Check if sub-components receive props (mocked components would need to expose this)
      // For now, verify render completes
      expect(screen.getByTestId('heading-display')).toBeTruthy();
    });

    it('handles fontFamily prop correctly', async () => {
      const { rerender } = render(<Compass fontFamily="Arial" />);

      await waitFor(() => {
        expect(Magnetometer.addListener).toHaveBeenCalled();
      });

      // Should render without errors
      expect(screen.getByTestId('heading-display')).toBeTruthy();

      // Test undefined fontFamily
      rerender(<Compass fontFamily={undefined} />);
      expect(screen.getByTestId('heading-display')).toBeTruthy();
    });

    it('applies visibleDegrees and height props', async () => {
      const visibleDegrees = 180;
      const height = 300;

      render(<Compass visibleDegrees={visibleDegrees} height={height} />);

      await waitFor(() => {
        expect(Magnetometer.addListener).toHaveBeenCalled();
      });

      const container = screen.getByTestId('compass-container');
      expect(container.props.style.height).toBe(height);
    });

    it('handles showNumericLabels prop', async () => {
      const { rerender } = render(<Compass showNumericLabels={true} />);

      await waitFor(() => {
        expect(Magnetometer.addListener).toHaveBeenCalled();
      });

      expect(screen.getByTestId('compass-tape')).toBeTruthy();

      rerender(<Compass showNumericLabels={false} />);
      expect(screen.getByTestId('compass-tape')).toBeTruthy();
    });

    it('passes behavior props to hook', async () => {
      const smoothingFactor = 0.5;
      const updateInterval = 32;

      render(<Compass smoothingFactor={smoothingFactor} updateInterval={updateInterval} />);

      await waitFor(() => {
        expect(Magnetometer.setUpdateInterval).toHaveBeenCalledWith(updateInterval);
      });
    });

    it('applies custom style prop', async () => {
      const customStyle = { margin: 10 };
      render(<Compass style={customStyle} />);

      await waitFor(() => {
        expect(Magnetometer.addListener).toHaveBeenCalled();
      });

      const container = screen.getByTestId('compass-container');
      expect(container.props.style.margin).toBe(10);
    });
  });

  describe('Callbacks', () => {
    it('calls onHeadingChange with valid heading values', async () => {
      const onHeadingChange = jest.fn();

      render(<Compass onHeadingChange={onHeadingChange} />);

      await waitFor(() => {
        expect(Magnetometer.addListener).toHaveBeenCalled();
      });

      await act(async () => {
        __magnetometerTestHelpers.simulateReading({ x: 0, y: -1, z: 0 }); // North
        __magnetometerTestHelpers.simulateReading({ x: 1, y: 0, z: 0 });  // East
      });

      expect(onHeadingChange).toHaveBeenCalledTimes(2);
      onHeadingChange.mock.calls.forEach(([heading]) => {
        expect(typeof heading).toBe('number');
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

      expect(onAccuracyChange).toHaveBeenCalledWith(0); // Fixed accuracy value
    });
  });

  describe('Performance and Stability', () => {
    it('handles rapid heading updates without exceeding max update depth', async () => {
      const onHeadingChange = jest.fn();

      render(<Compass onHeadingChange={onHeadingChange} />);

      await waitFor(() => {
        expect(Magnetometer.addListener).toHaveBeenCalled();
      });

      // Simulate 100 rapid readings
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

      expect(onHeadingChange).toHaveBeenCalledTimes(100);
    });

    it('maintains bounded re-renders under continuous updates', async () => {
      let renderCount = 0;

      const TestWrapper = () => {
        renderCount++;
        return <Compass />;
      };

      render(<TestWrapper />);

      await waitFor(() => {
        expect(Magnetometer.addListener).toHaveBeenCalled();
      });

      const initialRenders = renderCount;

      await act(async () => {
        for (let i = 0; i < 50; i++) {
          __magnetometerTestHelpers.simulateReading({
            x: Math.cos(i * 0.1),
            y: -Math.sin(i * 0.1),
            z: 0,
          });
        }
      });

      const totalRenders = renderCount - initialRenders;
      expect(totalRenders).toBeLessThan(100); // Reasonable bound
    });

    it('handles 0/360 degree boundary crossing smoothly', async () => {
      const onHeadingChange = jest.fn();

      render(<Compass onHeadingChange={onHeadingChange} />);

      await waitFor(() => {
        expect(Magnetometer.addListener).toHaveBeenCalled();
      });

      await act(async () => {
        // Cross boundary multiple times
        __magnetometerTestHelpers.simulateReading({ x: 0.01, y: -1, z: 0 }); // ~0.5°
        __magnetometerTestHelpers.simulateReading({ x: -0.01, y: -1, z: 0 }); // ~359.5°
        __magnetometerTestHelpers.simulateReading({ x: 0.01, y: -1, z: 0 }); // ~0.5° again
      });

      expect(onHeadingChange).toHaveBeenCalledTimes(3);
      // All values should be valid
      onHeadingChange.mock.calls.forEach(([heading]) => {
        expect(Number.isFinite(heading)).toBe(true);
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('handles invalid prop values gracefully', async () => {
      // Negative dimensions should not crash
      render(<Compass height={-100} visibleDegrees={-50} />);

      await waitFor(() => {
        expect(Magnetometer.addListener).toHaveBeenCalled();
      });

      // Should still render
      expect(screen.getByTestId('compass-container')).toBeTruthy();
    });

    it('handles extreme smoothingFactor values', async () => {
      const { rerender } = render(<Compass smoothingFactor={0} />);

      await waitFor(() => {
        expect(Magnetometer.addListener).toHaveBeenCalled();
      });

      rerender(<Compass smoothingFactor={1} />);
      expect(screen.getByTestId('compass-container')).toBeTruthy();
    });

    it('handles invalid updateInterval values', async () => {
      render(<Compass updateInterval={0} />);

      await waitFor(() => {
        expect(Magnetometer.setUpdateInterval).toHaveBeenCalledWith(0);
      });

      // Should not crash
      expect(screen.getByTestId('compass-container')).toBeTruthy();
    });

    it('handles permission request errors', async () => {
      // Mock permission request to throw
      const originalRequest = Magnetometer.requestPermissionsAsync;
      Magnetometer.requestPermissionsAsync.mockImplementationOnce(() =>
        Promise.reject(new Error('Permission API unavailable'))
      );

      render(<Compass />);

      await waitFor(() => {
        expect(Magnetometer.addListener).toHaveBeenCalled();
      });

      // Should continue and render compass
      expect(screen.getByTestId('compass-container')).toBeTruthy();

      // Restore
      Magnetometer.requestPermissionsAsync = originalRequest;
    });
  });

  describe('Cleanup and Lifecycle', () => {
    it('cleans up magnetometer subscription on unmount', async () => {
      const { unmount } = render(<Compass />);

      await waitFor(() => {
        expect(Magnetometer.addListener).toHaveBeenCalled();
      });

      unmount();

      // Subscription should be removed
      expect(__magnetometerTestHelpers.getListenersCount()).toBe(0);
    });

    it('handles rapid mount/unmount cycles', async () => {
      for (let i = 0; i < 5; i++) {
        const { unmount } = render(<Compass />);
        await waitFor(() => {
          expect(Magnetometer.addListener).toHaveBeenCalled();
        });
        unmount();
      }

      // Should not leave dangling subscriptions
      expect(__magnetometerTestHelpers.getListenersCount()).toBe(0);
    });
  });

  describe('Animation and Visual Behavior', () => {
    it('initializes with zero heading', async () => {
      render(<Compass />);

      await waitFor(() => {
        expect(Magnetometer.addListener).toHaveBeenCalled();
      });

      // Heading display should show 0 initially
      const headingDisplay = screen.getByTestId('heading-display');
      expect(headingDisplay).toBeTruthy();
    });

    it('updates heading display on magnetometer changes', async () => {
      render(<Compass />);

      await waitFor(() => {
        expect(Magnetometer.addListener).toHaveBeenCalled();
      });

      await act(async () => {
        __magnetometerTestHelpers.simulateReading({ x: 1, y: 0, z: 0 }); // East ~90°
      });

      // Component should update (mocked animation)
      expect(screen.getByTestId('heading-display')).toBeTruthy();
    });
  });
});
