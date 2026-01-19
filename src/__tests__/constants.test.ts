// language: typescript
// File: src/__tests__/constants.test.ts
import {
  getTickType,
  getTickLabel,
  COMPASS_TICKS,
  DEGREE_WIDTH,
  CARDINALS,
  TICK_HEIGHTS,
} from '../constants';

describe('constants / ticks', () => {
  describe('getTickType', () => {
    it('returns cardinal for 0,45,90,...', () => {
      [0, 45, 90, 135, 180, 225, 270, 315].forEach((d) => {
        expect(getTickType(d)).toBe('cardinal');
      });
    });

    it('returns major for multiples of 10 (not cardinal)', () => {
      [10, 20, 30, 40, 50].forEach((d) => {
        if (![0,45,90,135,180,225,270,315].includes(d)) {
          expect(getTickType(d)).toBe('major');
        }
      });
    });

    it('returns minor for multiples of 5', () => {
      [5, 15, 25].forEach((d) => {
        expect(getTickType(d)).toBe('minor');
      });
    });

    it('handles negative degrees', () => {
      expect(getTickType(-45)).toBe('cardinal'); // -45 % 360 = 315, but normalized to 315? Wait, code normalizes.
      // Actually, ((degree % 360) + 360) % 360, for -45: ((-45 % 360)+360)%360 = (315+360)%360=675%360=315, and 315 is cardinal.
      expect(getTickType(-10)).toBe('major');
    });

    it('handles large degrees', () => {
      expect(getTickType(720)).toBe('cardinal'); // 720 % 360 = 0
      expect(getTickType(1000)).toBe('major'); // 1000 % 360 = 280, 280 % 10 = 0, major
    });

    it('handles NaN gracefully', () => {
      expect(getTickType(NaN)).toBe('minor'); // NaN % 360 = NaN, normalized NaN, not in cardinals, not %10, not %5
    });
  });

  describe('getTickLabel', () => {
    it('cardinals return direction letters', () => {
      expect(getTickLabel(0)).toBe('N');
      expect(getTickLabel(90)).toBe('E');
      expect(getTickLabel(180)).toBe('S');
      expect(getTickLabel(270)).toBe('W');
    });

    it('multiples of 30 show degrees', () => {
      expect(getTickLabel(30)).toBe('30°');
      expect(getTickLabel(60)).toBe('60°');
    });

    it('other ticks return undefined', () => {
      expect(getTickLabel(7)).toBeUndefined();
    });

    it('handles negative and large degrees', () => {
      expect(getTickLabel(-90)).toBe('W'); // normalized 270
      expect(getTickLabel(450)).toBe('NE'); // 450 % 360 = 90
    });

    it('handles NaN', () => {
      expect(getTickLabel(NaN)).toBeUndefined();
    });
  });

  describe('COMPASS_TICKS and exported values', () => {
    it('contains ticks from -360 to 720 in 5° increments', () => {
      expect(COMPASS_TICKS.length).toBeGreaterThanOrEqual(200); // sanity
      expect(COMPASS_TICKS[0].degree).toBe(-360);
      const last = COMPASS_TICKS[COMPASS_TICKS.length - 1];
      expect(last.degree).toBe(720);
      // expect count: ((720 - (-360)) / 5) + 1 = 217
      expect(COMPASS_TICKS.length).toBe(217);
    });

    it('each tick has x position = degree * DEGREE_WIDTH', () => {
      COMPASS_TICKS.forEach((t) => {
        expect(t.x).toBeCloseTo(t.degree * DEGREE_WIDTH);
      });
    });

    it('exported constants shape', () => {
      expect(DEGREE_WIDTH).toBe(4);
      expect(Array.isArray(CARDINALS)).toBe(true);
      expect(CARDINALS.length).toBeGreaterThanOrEqual(8);
      expect(Array.isArray(TICK_HEIGHTS)).toBe(true);
      expect(TICK_HEIGHTS.length).toBeGreaterThanOrEqual(3);
    });
  });
});