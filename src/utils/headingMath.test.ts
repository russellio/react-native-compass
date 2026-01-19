// language: typescript
// File: src/utils/__tests__/headingMath.test.ts
import {
  normalizeHeading,
  calculateHeading,
  shouldWrapHeading,
  shortestAngularDistance,
  applyEMA,
  degreesToRadians,
  radiansToDegrees,
  getCardinalDirection,
} from '../headingMath';

describe('headingMath utilities', () => {
  describe('normalizeHeading', () => {
    it.each([
      [0, 0],
      [90, 90],
      [180, 180],
      [270, 270],
      [359, 359],
      [-90, 270],
      [-360, 0],
      [720, 0],
      [360, 0],
    ])('normalizes %s -> %s', (input, expected) => {
      expect(normalizeHeading(input as number)).toBe(expected);
    });

    it('handles non-integer and float values', () => {
      expect(normalizeHeading(360.5)).toBeCloseTo(0.5);
      expect(normalizeHeading(-0.5)).toBeCloseTo(359.5);
    });
  });

  describe('degrees/radians conversions', () => {
    it.each([
      [0, 0],
      [90, Math.PI / 2],
      [180, Math.PI],
      [360, 2 * Math.PI],
    ])('degreesToRadians(%s) -> %s', (deg, rad) => {
      expect(degreesToRadians(deg as number)).toBeCloseTo(rad as number);
      expect(radiansToDegrees(rad as number)).toBeCloseTo(deg as number);
    });
  });

  describe('calculateHeading', () => {
    // assume calculateHeading accepts magnetometer vector { x, y }
    it('calculates cardinal headings from vectors', () => {
      expect(calculateHeading({ x: 0, y: -1 })).toBeCloseTo(0); // North
      expect(calculateHeading({ x: 1, y: 0 })).toBeCloseTo(90); // East
      expect(calculateHeading({ x: 0, y: 1 })).toBeCloseTo(180); // South
      expect(calculateHeading({ x: -1, y: 0 })).toBeCloseTo(270); // West
    });

    it('calculates intermediate angles', () => {
      expect(calculateHeading({ x: Math.sqrt(2) / 2, y: -Math.sqrt(2) / 2 })).toBeCloseTo(45);
    });

    it('defensively handles malformed vectors', () => {
      expect(() => calculateHeading({ x: NaN as any, y: 0 } as any)).toThrow();
    });

    it('handles zero vector defensively', () => {
      expect(() => calculateHeading({ x: 0, y: 0, z: 0 })).toThrow();
    });

    it('handles extreme values', () => {
      expect(() => calculateHeading({ x: 1e10, y: 1e10, z: 0 })).not.toThrow();
    });
  });

  describe('shouldWrapHeading', () => {
    it.each([
      [350, 10, true],
      [10, 350, true],
      [45, 90, false],
      [0, 180, false],
      [179, 181, false],
    ])('%s -> %s crossing? %s', (from, to, expected) => {
      expect(shouldWrapHeading(from as number, to as number)).toBe(expected);
    });
  });

  describe('shortestAngularDistance', () => {
    it('same side forward', () => {
      expect(shortestAngularDistance(45, 90)).toBeCloseTo(45);
    });

    it('wrap forward 350 -> 10 = +20', () => {
      expect(shortestAngularDistance(350, 10)).toBeCloseTo(20);
    });

    it('wrap reverse 10 -> 350 = -20', () => {
      expect(shortestAngularDistance(10, 350)).toBeCloseTo(-20);
    });
  });

  describe('applyEMA', () => {
    it('alpha=0 returns previous unchanged', () => {
      expect(applyEMA(0, 100, 0)).toBeCloseTo(100);
    });

    it('alpha=1 returns current', () => {
      expect(applyEMA(1, 100, 200)).toBeCloseTo(200);
    });

    it('normal smoothing with wrap (350 -> 10)', () => {
      // previous=350, current=10, alpha=0.5 -> moves shortest direction (+20 => +10)
      const out = applyEMA(0.5, 350, 10);
      expect(typeof out).toBe('number');
      // Should be around 360 (350 + 10) normalized -> 0ish, but ensure distance reduced toward 10
      const dist = shortestAngularDistance(350, out);
      expect(Math.abs(dist)).toBeLessThan(15);
    });

    it('handles NaN inputs gracefully', () => {
      expect(applyEMA(0.5, NaN, 100)).toBeCloseTo(100); // previous NaN, return current
      expect(applyEMA(0.5, 100, NaN)).toBeCloseTo(100); // current NaN, return previous
      expect(applyEMA(NaN, 100, 200)).toBeCloseTo(200); // alpha NaN, return current
    });

    it('handles infinite values', () => {
      expect(applyEMA(0.5, Infinity, 100)).toBeCloseTo(100);
      expect(applyEMA(0.5, 100, -Infinity)).toBeCloseTo(100);
    });
  });

  describe('getCardinalDirection', () => {
    const map = [
      [0, 'N'],
      [22.5, 'NNE'],
      [45, 'NE'],
      [67.5, 'ENE'],
      [90, 'E'],
      [112.5, 'ESE'],
      [135, 'SE'],
      [157.5, 'SSE'],
      [180, 'S'],
      [202.5, 'SSW'],
      [225, 'SW'],
      [247.5, 'WSW'],
      [270, 'W'],
      [292.5, 'WNW'],
      [315, 'NW'],
      [337.5, 'NNW'],
    ] as const;

    it.each(map)('%s -> %s', (deg, expected) => {
      expect(getCardinalDirection(deg as number)).toBe(expected);
    });

    it('handles boundaries correctly (exact midpoints)', () => {
      expect(getCardinalDirection(11.25)).toBe('NNE'); // depends on implementation, ensure deterministic
    });
  });
});

