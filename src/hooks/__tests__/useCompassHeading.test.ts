import { renderHook, waitFor, act } from '@testing-library/react-native';
import { Magnetometer } from 'expo-sensors';
import { useCompassHeading } from '../useCompassHeading';

// Mock expo-sensors with factory function to bypass Jest's auto-mocking
jest.mock('expo-sensors', () => jest.requireActual('../../../__mocks__/expo-sensors'));

// Import test helpers from the mock module
const { __magnetometerTestHelpers } = require('expo-sensors');

// Get the mocked Magnetometer
const mockedMagnetometer = Magnetometer as jest.Mocked<typeof Magnetometer>;

describe('useCompassHeading', () => {
  beforeEach(() => {
    __magnetometerTestHelpers.reset();
  });

  it('should initialize magnetometer on mount', async () => {
    const onHeadingChange = jest.fn();

    renderHook(() =>
      useCompassHeading(0.2, 16, onHeadingChange)
    );

    await waitFor(() => {
      expect(Magnetometer.isAvailableAsync).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(Magnetometer.addListener).toHaveBeenCalled();
    });
  });

  it('should call onHeadingChange callback when magnetometer updates', async () => {
    const onHeadingChange = jest.fn();

    renderHook(() =>
      useCompassHeading(0.2, 16, onHeadingChange)
    );

    // Wait for initialization to complete
    await waitFor(() => {
      expect(Magnetometer.addListener).toHaveBeenCalled();
    });

    // Simulate magnetometer reading (North) - wrapped in act for state updates
    await act(async () => {
      __magnetometerTestHelpers.simulateReading({ x: 0, y: -1, z: 0 });
    });

    expect(onHeadingChange).toHaveBeenCalled();
    expect(typeof onHeadingChange.mock.calls[0][0]).toBe('number');
  });

  it('should handle 60 rapid magnetometer updates without errors', async () => {
    const onHeadingChange = jest.fn();
    const onError = jest.fn();

    renderHook(() =>
      useCompassHeading(0.2, 16, onHeadingChange, undefined, onError)
    );

    await waitFor(() => {
      expect(Magnetometer.addListener).toHaveBeenCalled();
    });

    // Simulate 60 rapid magnetometer readings (1 second at 60Hz)
    await act(async () => {
      for (let i = 0; i < 60; i++) {
        const angle = (i * 6) * (Math.PI / 180); // 6° per update, full rotation
        __magnetometerTestHelpers.simulateReading({
          x: Math.cos(angle),
          y: -Math.sin(angle),
          z: 0,
        });
      }
    });

    // Should have 60 callback invocations
    expect(onHeadingChange).toHaveBeenCalledTimes(60);
    // No errors should have occurred
    expect(onError).not.toHaveBeenCalled();
  });

  it('should not cause React re-renders (stateless hook)', async () => {
    const onHeadingChange = jest.fn();
    let renderCount = 0;

    renderHook(() => {
      renderCount++;
      return useCompassHeading(0.2, 16, onHeadingChange);
    });

    await waitFor(() => {
      expect(Magnetometer.addListener).toHaveBeenCalled();
    });

    const initialRenderCount = renderCount;

    // Simulate 30 magnetometer readings
    await act(async () => {
      for (let i = 0; i < 30; i++) {
        __magnetometerTestHelpers.simulateReading({
          x: Math.cos(i * 0.1),
          y: -Math.sin(i * 0.1),
          z: 0,
        });
      }
    });

    // Hook should not have triggered any additional renders
    // (callbacks are fired but no internal state updates)
    expect(renderCount).toBe(initialRenderCount);
  });

  it('should call onError and onAvailabilityChange when sensor unavailable', async () => {
    __magnetometerTestHelpers.setAvailable(false);

    const onError = jest.fn();
    const onAvailabilityChange = jest.fn();

    renderHook(() =>
      useCompassHeading(0.2, 16, undefined, undefined, onError, onAvailabilityChange)
    );

    // Wait for the error callback to be called
    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
    });

    expect(onError).toHaveBeenCalledWith('Magnetometer sensor is not available on this device');
    expect(onAvailabilityChange).toHaveBeenCalledWith(false);
  });

  it('should call onAvailabilityChange(true) when sensor is available', async () => {
    const onAvailabilityChange = jest.fn();

    renderHook(() =>
      useCompassHeading(0.2, 16, undefined, undefined, undefined, onAvailabilityChange)
    );

    await waitFor(() => {
      expect(onAvailabilityChange).toHaveBeenCalledWith(true);
    });
  });

  it('should handle 0°/360° boundary crossing without producing NaN', async () => {
    const headings: number[] = [];
    const onHeadingChange = jest.fn((heading: number) => {
      headings.push(heading);
    });

    renderHook(() =>
      useCompassHeading(0.2, 16, onHeadingChange)
    );

    await waitFor(() => {
      expect(Magnetometer.addListener).toHaveBeenCalled();
    });

    // Oscillate between 1° and 359° (crossing boundary)
    await act(async () => {
      for (let i = 0; i < 20; i++) {
        const isOdd = i % 2 === 1;
        __magnetometerTestHelpers.simulateReading({
          x: isOdd ? 0.02 : -0.02,
          y: -1,
          z: 0,
        });
      }
    });

    // Verify callbacks were called
    expect(headings.length).toBe(20);

    // All headings should be valid numbers (not NaN, not Infinity)
    headings.forEach((heading) => {
      expect(Number.isFinite(heading)).toBe(true);
      expect(Number.isNaN(heading)).toBe(false);
    });
  });

  it('should use the latest callback version (ref stability)', async () => {
    const firstCallback = jest.fn();
    const secondCallback = jest.fn();

    const { rerender } = renderHook(
      ({ callback }) => useCompassHeading(0.2, 16, callback),
      { initialProps: { callback: firstCallback } }
    );

    await waitFor(() => {
      expect(Magnetometer.addListener).toHaveBeenCalled();
    });

    // First reading with first callback
    await act(async () => {
      __magnetometerTestHelpers.simulateReading({ x: 0, y: -1, z: 0 });
    });
    expect(firstCallback).toHaveBeenCalledTimes(1);
    expect(secondCallback).not.toHaveBeenCalled();

    // Change callback
    rerender({ callback: secondCallback });

    // Second reading should call the new callback
    await act(async () => {
      __magnetometerTestHelpers.simulateReading({ x: 1, y: 0, z: 0 });
    });
    expect(firstCallback).toHaveBeenCalledTimes(1); // No additional calls
    expect(secondCallback).toHaveBeenCalledTimes(1); // New callback called
  });

  it('should call onAccuracyChange callback', async () => {
    const onAccuracyChange = jest.fn();

    renderHook(() =>
      useCompassHeading(0.2, 16, undefined, onAccuracyChange)
    );

    await waitFor(() => {
      expect(Magnetometer.addListener).toHaveBeenCalled();
    });

    // Simulate reading
    await act(async () => {
      __magnetometerTestHelpers.simulateReading({ x: 0, y: -1, z: 0 });
    });

    expect(onAccuracyChange).toHaveBeenCalled();
  });

  it('should cleanup subscription on unmount', async () => {
    const onHeadingChange = jest.fn();

    const { unmount } = renderHook(() =>
      useCompassHeading(0.2, 16, onHeadingChange)
    );

    await waitFor(() => {
      expect(Magnetometer.addListener).toHaveBeenCalled();
    });

    // Get callback count before unmount
    await act(async () => {
      __magnetometerTestHelpers.simulateReading({ x: 0, y: -1, z: 0 });
    });
    const callCountBeforeUnmount = onHeadingChange.mock.calls.length;

    // Unmount
    unmount();

    // Simulate more readings after unmount (no act needed since component is unmounted)
    __magnetometerTestHelpers.simulateReading({ x: 1, y: 0, z: 0 });
    __magnetometerTestHelpers.simulateReading({ x: 0, y: 1, z: 0 });

    // Callback count should not increase after unmount
    expect(onHeadingChange.mock.calls.length).toBe(callCountBeforeUnmount);
  });
});
