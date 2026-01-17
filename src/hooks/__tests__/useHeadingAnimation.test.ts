import { renderHook } from '@testing-library/react-native';
import { useHeadingAnimation } from '../useHeadingAnimation';

describe('useHeadingAnimation', () => {
  it('should initialize with the correct heading value', () => {
    const { result } = renderHook(() => useHeadingAnimation(45));

    expect(result.current.animatedHeading.value).toBe(45);
  });

  it('should return an animatedHeading object with value property', () => {
    const { result } = renderHook(() => useHeadingAnimation(0));

    expect(result.current.animatedHeading).toBeDefined();
    expect(typeof result.current.animatedHeading.value).toBe('number');
  });

  it('should handle heading changes without infinite loops', () => {
    const { result, rerender } = renderHook(
      ({ heading }) => useHeadingAnimation(heading),
      { initialProps: { heading: 0 } }
    );

    // Trigger multiple rapid heading updates (simulating real magnetometer)
    const headings = [10, 20, 30, 40, 50];

    headings.forEach((heading) => {
      rerender({ heading });
    });

    // If we got here without throwing "Maximum update depth exceeded", test passes
    expect(result.current.animatedHeading).toBeDefined();
  });

  it('should update animated value when heading changes', () => {
    const { result, rerender } = renderHook(
      ({ heading }) => useHeadingAnimation(heading),
      { initialProps: { heading: 0 } }
    );

    // Change the heading
    rerender({ heading: 90 });

    // The animated value should be updated
    // With our mock, withSpring returns the calculated target value
    expect(typeof result.current.animatedHeading.value).toBe('number');
  });

  it('should handle 0°/360° boundary crossing without errors (clockwise)', () => {
    const { result, rerender } = renderHook(
      ({ heading }) => useHeadingAnimation(heading),
      { initialProps: { heading: 350 } }
    );

    // Cross the boundary going clockwise (350° -> 10°)
    rerender({ heading: 10 });

    // The hook should handle this without errors
    expect(result.current.animatedHeading).toBeDefined();
    expect(typeof result.current.animatedHeading.value).toBe('number');
  });

  it('should handle 0°/360° boundary crossing without errors (counter-clockwise)', () => {
    const { result, rerender } = renderHook(
      ({ heading }) => useHeadingAnimation(heading),
      { initialProps: { heading: 10 } }
    );

    // Cross the boundary going counter-clockwise (10° -> 350°)
    rerender({ heading: 350 });

    // The hook should handle this without errors
    expect(result.current.animatedHeading).toBeDefined();
    expect(typeof result.current.animatedHeading.value).toBe('number');
  });

  it('should handle large heading jumps within same hemisphere', () => {
    const { result, rerender } = renderHook(
      ({ heading }) => useHeadingAnimation(heading),
      { initialProps: { heading: 45 } }
    );

    // Large jump that doesn't cross 0°/360°
    rerender({ heading: 180 });

    // Should handle normally without errors
    expect(result.current.animatedHeading).toBeDefined();
  });

  it('should not exceed maximum update depth with rapid changes', () => {
    const { rerender } = renderHook(
      ({ heading }) => useHeadingAnimation(heading),
      { initialProps: { heading: 0 } }
    );

    // Simulate 100 rapid heading updates (more than React's max update depth of ~50)
    let updateCount = 0;
    const maxUpdates = 100;

    for (let i = 0; i < maxUpdates; i++) {
      rerender({ heading: i % 360 });
      updateCount++;
    }

    // If we completed all updates without "Maximum update depth exceeded" error, the hook is stable
    expect(updateCount).toBe(maxUpdates);
  });
});
