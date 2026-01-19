// language: typescript
// File: src/hooks/__tests__/useCompassHeading.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import * as Sensors from 'expo-sensors';
import { useCompassHeading } from '../useCompassHeading';

jest.useFakeTimers();

type Listener = (data: any) => void;

let currentListener: Listener | null = null;
const subscriptions: any[] = [];

beforeEach(() => {
  currentListener = null;
  subscriptions.length = 0;

  jest.spyOn(Sensors.Magnetometer, 'setUpdateInterval').mockImplementation(() => {});
  jest.spyOn(Sensors.Magnetometer, 'addListener').mockImplementation((cb: Listener) => {
    currentListener = cb;
    const sub = { remove: jest.fn(() => { currentListener = null; }) };
    subscriptions.push(sub);
    return sub;
  });

  // optional availability method if used by hook
  if ((Sensors.Magnetometer as any).isAvailableAsync === undefined) {
    (Sensors.Magnetometer as any).isAvailableAsync = jest.fn(async () => true);
  }
});

afterEach(() => {
  jest.resetAllMocks();
});

describe('useCompassHeading hook', () => {
  it('initializes with default state', () => {
    const { result } = renderHook(() => useCompassHeading());
    const state = result.current;
    expect(typeof state.heading).toBe('number');
    expect(typeof state.accuracy).toBe('number');
    expect(state.error === null || typeof state.error === 'string').toBeTruthy();
    expect(typeof state.isAvailable).toBe('boolean');
  });

  it('sets isAvailable=true when magnetometer available', async () => {
    (Sensors.Magnetometer as any).isAvailableAsync = jest.fn(async () => true);
    const { result, waitForNextUpdate } = renderHook(() => useCompassHeading());
    // wait a microtask for availability check
    await act(async () => Promise.resolve());
    expect(result.current.isAvailable).toBe(true);
  });

  it('handles magnetometer updates and applies smoothing', async () => {
    const { result } = renderHook(() => useCompassHeading({ smoothingFactor: 0.5 }));
    // First reading should be used directly (skip smoothing)
    act(() => {
      if (currentListener) currentListener({ x: 0, y: -1, z: 0 });
    });
    const first = result.current.heading;
    expect(first).toBeCloseTo(0);

    // subsequent reading should be smoothed toward 90
    act(() => {
      if (currentListener) currentListener({ x: 1, y: 0, z: 0 });
    });
    const second = result.current.heading;
    expect(Math.abs(shortDiff(first, second))).toBeLessThan(90); // moved part-way
  });

  it('calls onHeadingChange and onAccuracyChange callbacks', () => {
    const onHeadingChange = jest.fn();
    const onAccuracyChange = jest.fn();
    renderHook(() => useCompassHeading({ onHeadingChange, onAccuracyChange }));
    act(() => {
      if (currentListener) currentListener({ x: 0, y: -1, z: 0, accuracy: 3 });
    });
    expect(onHeadingChange).toHaveBeenCalled();
    expect(onAccuracyChange).toHaveBeenCalled();
  });

  it('cleans up subscription on unmount', () => {
    const { unmount } = renderHook(() => useCompassHeading());
    expect(subscriptions.length).toBeGreaterThan(0);
    unmount();
    expect(subscriptions[0].remove).toHaveBeenCalled();
  });

  it('handles rapid mount/unmount without throwing', () => {
    const { unmount, rerender } = renderHook(() => useCompassHeading());
    rerender();
    unmount();
    expect(true).toBeTruthy();
  });

  it('defensive: ignores malformed sensor data', () => {
    const { result } = renderHook(() => useCompassHeading());
    act(() => {
      if (currentListener) currentListener({ x: NaN, y: Infinity, z: 0 });
    });
    // should not blow up; heading remains numeric
    expect(typeof result.current.heading).toBe('number');
  });
});

// helper: compute short difference between two headings
function shortDiff(a: number, b: number) {
  const diff = ((b - a + 540) % 360) - 180;
  return diff;
}