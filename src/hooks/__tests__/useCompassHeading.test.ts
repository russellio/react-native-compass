import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useCompassHeading } from '../useCompassHeading';
import { Magnetometer } from 'expo-sensors';

// Mock expo-sensors with factory function to bypass Jest's auto-mocking
jest.mock('expo-sensors', () => jest.requireActual('../../../__mocks__/expo-sensors'));

// Import test helpers from the mock module
const { __magnetometerTestHelpers } = require('expo-sensors');

describe('useCompassHeading', () => {
  beforeEach(() => {
    __magnetometerTestHelpers.reset();
  });

  describe('initialization', () => {
    it('calls isAvailableAsync on mount', async () => {
      renderHook(() => useCompassHeading());

      await waitFor(() => {
        expect(Magnetometer.isAvailableAsync).toHaveBeenCalled();
      });
    });

    it('calls setUpdateInterval with default value', async () => {
      renderHook(() => useCompassHeading());

      await waitFor(() => {
        expect(Magnetometer.setUpdateInterval).toHaveBeenCalledWith(16);
      });
    });

    it('calls setUpdateInterval with custom value', async () => {
      renderHook(() => useCompassHeading(0.2, 32));

      await waitFor(() => {
        expect(Magnetometer.setUpdateInterval).toHaveBeenCalledWith(32);
      });
    });

    it('calls addListener when magnetometer is available', async () => {
      renderHook(() => useCompassHeading());

      await waitFor(() => {
        expect(Magnetometer.addListener).toHaveBeenCalled();
      });
    });

    it('does not call addListener when magnetometer is unavailable', async () => {
      __magnetometerTestHelpers.setAvailable(false);

      renderHook(() => useCompassHeading());

      await waitFor(() => {
        expect(Magnetometer.isAvailableAsync).toHaveBeenCalled();
      });

      // Give it a tick to ensure addListener wouldn't be called
      await act(async () => {
        await new Promise((r) => setTimeout(r, 10));
      });

      expect(Magnetometer.addListener).not.toHaveBeenCalled();
    });
  });

  describe('callbacks', () => {
    it('calls onHeadingChange with smoothed heading value', async () => {
      const onHeadingChange = jest.fn();

      renderHook(() => useCompassHeading(0.2, 16, onHeadingChange));

      await waitFor(() => {
        expect(Magnetometer.addListener).toHaveBeenCalled();
      });

      await act(async () => {
        __magnetometerTestHelpers.simulateReading({ x: 0, y: -1, z: 0 });
      });

      expect(onHeadingChange).toHaveBeenCalled();
      const heading = onHeadingChange.mock.calls[0][0];
      expect(heading).toBeGreaterThanOrEqual(0);
      expect(heading).toBeLessThan(360);
    });

    it('calls onAccuracyChange callback', async () => {
      const onAccuracyChange = jest.fn();

      renderHook(() => useCompassHeading(0.2, 16, undefined, onAccuracyChange));

      await waitFor(() => {
        expect(Magnetometer.addListener).toHaveBeenCalled();
      });

      await act(async () => {
        __magnetometerTestHelpers.simulateReading({ x: 1, y: 0, z: 0 });
      });

      expect(onAccuracyChange).toHaveBeenCalled();
    });

    it('calls onError when magnetometer is unavailable', async () => {
      __magnetometerTestHelpers.setAvailable(false);
      const onError = jest.fn();

      renderHook(() =>
        useCompassHeading(0.2, 16, undefined, undefined, onError)
      );

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(
          expect.stringContaining('not available')
        );
      });
    });

    it('calls onAvailabilityChange with true when available', async () => {
      const onAvailabilityChange = jest.fn();

      renderHook(() =>
        useCompassHeading(0.2, 16, undefined, undefined, undefined, onAvailabilityChange)
      );

      await waitFor(() => {
        expect(onAvailabilityChange).toHaveBeenCalledWith(true);
      });
    });

    it('calls onAvailabilityChange with false when unavailable', async () => {
      __magnetometerTestHelpers.setAvailable(false);
      const onAvailabilityChange = jest.fn();

      renderHook(() =>
        useCompassHeading(0.2, 16, undefined, undefined, undefined, onAvailabilityChange)
      );

      await waitFor(() => {
        expect(onAvailabilityChange).toHaveBeenCalledWith(false);
      });
    });
  });

  describe('smoothing', () => {
    it('first reading is raw (no smoothing applied)', async () => {
      const headings: number[] = [];
      const onHeadingChange = (heading: number) => headings.push(heading);

      renderHook(() => useCompassHeading(0.2, 16, onHeadingChange));

      await waitFor(() => {
        expect(Magnetometer.addListener).toHaveBeenCalled();
      });

      // First reading - should be raw
      await act(async () => {
        __magnetometerTestHelpers.simulateReading({ x: 1, y: 0, z: 0 }); // 0°
      });

      expect(headings.length).toBe(1);
      expect(headings[0]).toBeCloseTo(0, 0);
    });

    it('subsequent readings are EMA smoothed', async () => {
      const headings: number[] = [];
      const onHeadingChange = (heading: number) => headings.push(heading);

      // Using alpha=1 means no smoothing (current value used as-is)
      // Using alpha=0.5 means halfway between current and previous
      renderHook(() => useCompassHeading(0.5, 16, onHeadingChange));

      await waitFor(() => {
        expect(Magnetometer.addListener).toHaveBeenCalled();
      });

      await act(async () => {
        // First reading: 0°
        __magnetometerTestHelpers.simulateReading({ x: 1, y: 0, z: 0 });
        // Second reading: 90° - should be smoothed towards 0°
        __magnetometerTestHelpers.simulateReading({ x: 0, y: -1, z: 0 });
      });

      expect(headings.length).toBe(2);
      // First reading is raw
      expect(headings[0]).toBeCloseTo(0, 0);
      // Second reading should be smoothed: 0.5 * 90 + 0.5 * 0 = 45
      expect(headings[1]).toBeCloseTo(45, 0);
    });
  });

  describe('edge cases', () => {
    it('handles 0/360 boundary correctly', async () => {
      const headings: number[] = [];
      const onHeadingChange = (heading: number) => headings.push(heading);

      renderHook(() => useCompassHeading(0.5, 16, onHeadingChange));

      await waitFor(() => {
        expect(Magnetometer.addListener).toHaveBeenCalled();
      });

      await act(async () => {
        // Start near 350° (roughly x=-0.17, y=-0.985 in implementation coords)
        // Using x=1, y=0 for 0°, then x close to 1, y slightly negative for small angle
        __magnetometerTestHelpers.simulateReading({ x: 1, y: 0, z: 0 }); // 0°
        __magnetometerTestHelpers.simulateReading({ x: 1, y: 0.17, z: 0 }); // ~350° in impl coords
      });

      // All headings should be in valid 0-359 range
      headings.forEach((heading) => {
        expect(heading).toBeGreaterThanOrEqual(0);
        expect(heading).toBeLessThan(360);
      });
    });

    it('handles 60Hz rapid updates without errors', async () => {
      const onHeadingChange = jest.fn();

      renderHook(() => useCompassHeading(0.2, 16, onHeadingChange));

      await waitFor(() => {
        expect(Magnetometer.addListener).toHaveBeenCalled();
      });

      // Simulate 60 readings (1 second at 60Hz)
      await act(async () => {
        for (let i = 0; i < 60; i++) {
          const angle = (i * 6) * (Math.PI / 180);
          __magnetometerTestHelpers.simulateReading({
            x: Math.cos(angle),
            y: -Math.sin(angle),
            z: 0,
          });
        }
      });

      expect(onHeadingChange).toHaveBeenCalledTimes(60);
    });

    it('handles permission denied gracefully', async () => {
      __magnetometerTestHelpers.setPermissionStatus('denied');
      const onError = jest.fn();

      renderHook(() =>
        useCompassHeading(0.2, 16, undefined, undefined, onError)
      );

      await waitFor(() => {
        expect(Magnetometer.requestPermissionsAsync).toHaveBeenCalled();
      });

      // The hook should call onError when permissions are denied
      await waitFor(() => {
        expect(onError).toHaveBeenCalled();
      });
    });
  });

  describe('cleanup', () => {
    it('removes subscription on unmount', async () => {
      const { unmount } = renderHook(() => useCompassHeading());

      await waitFor(() => {
        expect(Magnetometer.addListener).toHaveBeenCalled();
      });

      const listenersBeforeUnmount = __magnetometerTestHelpers.getListenersCount();
      expect(listenersBeforeUnmount).toBe(1);

      unmount();

      const listenersAfterUnmount = __magnetometerTestHelpers.getListenersCount();
      expect(listenersAfterUnmount).toBe(0);
    });

    it('recreates subscription when smoothingFactor changes', async () => {
      const { rerender } = renderHook(
        ({ smoothingFactor }) => useCompassHeading(smoothingFactor),
        { initialProps: { smoothingFactor: 0.2 } }
      );

      await waitFor(() => {
        expect(Magnetometer.addListener).toHaveBeenCalledTimes(1);
      });

      // Change smoothing factor
      rerender({ smoothingFactor: 0.5 });

      await waitFor(() => {
        // Should create a new subscription
        expect(Magnetometer.addListener).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('stateless behavior', () => {
    it('uses callback refs to avoid recreating subscription on callback changes', async () => {
      const onHeadingChange1 = jest.fn();
      const onHeadingChange2 = jest.fn();

      const { rerender } = renderHook(
        ({ callback }) => useCompassHeading(0.2, 16, callback),
        { initialProps: { callback: onHeadingChange1 } }
      );

      await waitFor(() => {
        expect(Magnetometer.addListener).toHaveBeenCalledTimes(1);
      });

      // Change callback - should NOT recreate subscription
      rerender({ callback: onHeadingChange2 });

      // Wait a tick
      await act(async () => {
        await new Promise((r) => setTimeout(r, 10));
      });

      // Should still be only 1 addListener call (subscription not recreated)
      expect(Magnetometer.addListener).toHaveBeenCalledTimes(1);

      // But the new callback should be used
      await act(async () => {
        __magnetometerTestHelpers.simulateReading({ x: 1, y: 0, z: 0 });
      });

      expect(onHeadingChange2).toHaveBeenCalled();
    });
  });
});
