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

describe('headingMath', () => {
  describe('normalizeHeading', () => {
    it('returns 0 for 0', () => {
      expect(normalizeHeading(0)).toBe(0);
    });

    it('returns 0 for 360', () => {
      expect(normalizeHeading(360)).toBe(0);
    });

    it('returns 270 for -90', () => {
      expect(normalizeHeading(-90)).toBe(270);
    });

    it('returns 0 for 720', () => {
      expect(normalizeHeading(720)).toBe(0);
    });

    it('returns 180 for -180', () => {
      expect(normalizeHeading(-180)).toBe(180);
    });

    it('handles large positive values', () => {
      expect(normalizeHeading(1080)).toBe(0);
      expect(normalizeHeading(1090)).toBe(10);
    });

    it('handles large negative values', () => {
      expect(normalizeHeading(-720)).toBe(0);
      expect(normalizeHeading(-450)).toBe(270);
    });
  });

  describe('calculateHeading', () => {
    // The implementation uses atan2(x, -y) which produces compass convention:
    // - North (y negative) = 0°
    // - East (x positive) = 90°
    // - South (y positive) = 180°
    // - West (x negative) = 270°

    it('returns 0 for magnetic north vector (x=0, y=-1)', () => {
      const heading = calculateHeading({ x: 0, y: -1, z: 0 });
      expect(heading).toBeCloseTo(0, 0);
    });

    it('returns 90 for magnetic east vector (x=1, y=0)', () => {
      const heading = calculateHeading({ x: 1, y: 0, z: 0 });
      expect(heading).toBeCloseTo(90, 0);
    });

    it('returns 180 for magnetic south vector (x=0, y=1)', () => {
      const heading = calculateHeading({ x: 0, y: 1, z: 0 });
      expect(heading).toBeCloseTo(180, 0);
    });

    it('returns 270 for magnetic west vector (x=-1, y=0)', () => {
      const heading = calculateHeading({ x: -1, y: 0, z: 0 });
      expect(heading).toBeCloseTo(270, 0);
    });

    it('returns 45 for NE diagonal (x=1, y=-1)', () => {
      const heading = calculateHeading({ x: 1, y: -1, z: 0 });
      expect(heading).toBeCloseTo(45, 0);
    });

    it('returns 135 for SE diagonal (x=1, y=1)', () => {
      const heading = calculateHeading({ x: 1, y: 1, z: 0 });
      expect(heading).toBeCloseTo(135, 0);
    });

    it('returns 225 for SW diagonal (x=-1, y=1)', () => {
      const heading = calculateHeading({ x: -1, y: 1, z: 0 });
      expect(heading).toBeCloseTo(225, 0);
    });

    it('returns 315 for NW diagonal (x=-1, y=-1)', () => {
      const heading = calculateHeading({ x: -1, y: -1, z: 0 });
      expect(heading).toBeCloseTo(315, 0);
    });
  });

  describe('shouldWrapHeading', () => {
    it('returns true for 350 to 10 (crossing 0)', () => {
      expect(shouldWrapHeading(10, 350)).toBe(true);
    });

    it('returns true for 10 to 350 (crossing 360)', () => {
      expect(shouldWrapHeading(350, 10)).toBe(true);
    });

    it('returns false for 45 to 90 (no crossing)', () => {
      expect(shouldWrapHeading(90, 45)).toBe(false);
    });

    it('returns false for 90 to 45 (no crossing)', () => {
      expect(shouldWrapHeading(45, 90)).toBe(false);
    });

    it('returns false for 170 to 190 (no crossing at 180)', () => {
      expect(shouldWrapHeading(190, 170)).toBe(false);
    });

    it('returns true for 5 to 355', () => {
      expect(shouldWrapHeading(355, 5)).toBe(true);
    });
  });

  describe('shortestAngularDistance', () => {
    it('returns +45 for 45 to 90', () => {
      expect(shortestAngularDistance(45, 90)).toBe(45);
    });

    it('returns -45 for 90 to 45', () => {
      expect(shortestAngularDistance(90, 45)).toBe(-45);
    });

    it('returns +20 for 350 to 10 (crossing 0)', () => {
      expect(shortestAngularDistance(350, 10)).toBe(20);
    });

    it('returns -20 for 10 to 350 (crossing 360)', () => {
      expect(shortestAngularDistance(10, 350)).toBe(-20);
    });

    it('returns 0 for same heading', () => {
      expect(shortestAngularDistance(90, 90)).toBe(0);
    });

    it('returns 180 or -180 for opposite headings', () => {
      const result = shortestAngularDistance(0, 180);
      expect(Math.abs(result)).toBe(180);
    });

    it('returns correct value for 355 to 5', () => {
      expect(shortestAngularDistance(355, 5)).toBe(10);
    });
  });

  describe('applyEMA', () => {
    it('returns previous value when alpha is 0', () => {
      const result = applyEMA(100, 50, 0);
      expect(result).toBe(50);
    });

    it('returns current value when alpha is 1', () => {
      const result = applyEMA(100, 50, 1);
      expect(result).toBe(100);
    });

    it('returns weighted average for alpha 0.5', () => {
      const result = applyEMA(100, 50, 0.5);
      expect(result).toBe(75);
    });

    it('handles boundary crossing from 350 to 10', () => {
      const result = applyEMA(10, 350, 0.5);
      // Should smooth across the boundary without wrapping backwards
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThan(360);
    });

    it('handles boundary crossing from 10 to 350', () => {
      const result = applyEMA(350, 10, 0.5);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThan(360);
    });

    it('normalizes result to 0-359 range', () => {
      const result = applyEMA(359, 1, 0.5);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThan(360);
    });
  });

  describe('degreesToRadians', () => {
    it('converts 0 degrees to 0 radians', () => {
      expect(degreesToRadians(0)).toBe(0);
    });

    it('converts 180 degrees to PI radians', () => {
      expect(degreesToRadians(180)).toBeCloseTo(Math.PI, 10);
    });

    it('converts 90 degrees to PI/2 radians', () => {
      expect(degreesToRadians(90)).toBeCloseTo(Math.PI / 2, 10);
    });

    it('converts 360 degrees to 2*PI radians', () => {
      expect(degreesToRadians(360)).toBeCloseTo(2 * Math.PI, 10);
    });
  });

  describe('radiansToDegrees', () => {
    it('converts 0 radians to 0 degrees', () => {
      expect(radiansToDegrees(0)).toBe(0);
    });

    it('converts PI radians to 180 degrees', () => {
      expect(radiansToDegrees(Math.PI)).toBeCloseTo(180, 10);
    });

    it('converts PI/2 radians to 90 degrees', () => {
      expect(radiansToDegrees(Math.PI / 2)).toBeCloseTo(90, 10);
    });

    it('converts 2*PI radians to 360 degrees', () => {
      expect(radiansToDegrees(2 * Math.PI)).toBeCloseTo(360, 10);
    });
  });

  describe('getCardinalDirection', () => {
    it('returns N for 0 degrees', () => {
      expect(getCardinalDirection(0)).toBe('N');
    });

    it('returns N for 360 degrees (normalized)', () => {
      expect(getCardinalDirection(360)).toBe('N');
    });

    it('returns NNE for ~22.5 degrees', () => {
      expect(getCardinalDirection(22.5)).toBe('NNE');
    });

    it('returns NE for 45 degrees', () => {
      expect(getCardinalDirection(45)).toBe('NE');
    });

    it('returns ENE for ~67.5 degrees', () => {
      expect(getCardinalDirection(67.5)).toBe('ENE');
    });

    it('returns E for 90 degrees', () => {
      expect(getCardinalDirection(90)).toBe('E');
    });

    it('returns ESE for ~112.5 degrees', () => {
      expect(getCardinalDirection(112.5)).toBe('ESE');
    });

    it('returns SE for 135 degrees', () => {
      expect(getCardinalDirection(135)).toBe('SE');
    });

    it('returns SSE for ~157.5 degrees', () => {
      expect(getCardinalDirection(157.5)).toBe('SSE');
    });

    it('returns S for 180 degrees', () => {
      expect(getCardinalDirection(180)).toBe('S');
    });

    it('returns SSW for ~202.5 degrees', () => {
      expect(getCardinalDirection(202.5)).toBe('SSW');
    });

    it('returns SW for 225 degrees', () => {
      expect(getCardinalDirection(225)).toBe('SW');
    });

    it('returns WSW for ~247.5 degrees', () => {
      expect(getCardinalDirection(247.5)).toBe('WSW');
    });

    it('returns W for 270 degrees', () => {
      expect(getCardinalDirection(270)).toBe('W');
    });

    it('returns WNW for ~292.5 degrees', () => {
      expect(getCardinalDirection(292.5)).toBe('WNW');
    });

    it('returns NW for 315 degrees', () => {
      expect(getCardinalDirection(315)).toBe('NW');
    });

    it('returns NNW for ~337.5 degrees', () => {
      expect(getCardinalDirection(337.5)).toBe('NNW');
    });

    it('handles negative angles', () => {
      expect(getCardinalDirection(-90)).toBe('W');
    });

    it('handles angles > 360', () => {
      expect(getCardinalDirection(450)).toBe('E');
    });
  });
});
