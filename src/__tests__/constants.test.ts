import {
  DEGREE_WIDTH,
  DEFAULT_VISIBLE_DEGREES,
  DEFAULT_HEIGHT,
  DEFAULT_SMOOTHING,
  DEFAULT_UPDATE_INTERVAL,
  DEFAULT_COLORS,
  CARDINALS,
  getTickType,
  getTickLabel,
  COMPASS_TICKS,
  SPRING_CONFIG,
  TICK_HEIGHTS,
  FONT_SIZES,
} from '../constants';

describe('constants', () => {
  describe('basic constants', () => {
    it('has DEGREE_WIDTH defined', () => {
      expect(DEGREE_WIDTH).toBe(4);
    });

    it('has DEFAULT_VISIBLE_DEGREES defined', () => {
      expect(DEFAULT_VISIBLE_DEGREES).toBe(120);
    });

    it('has DEFAULT_HEIGHT defined', () => {
      expect(DEFAULT_HEIGHT).toBe(200);
    });

    it('has DEFAULT_SMOOTHING defined', () => {
      expect(DEFAULT_SMOOTHING).toBe(0.2);
    });

    it('has DEFAULT_UPDATE_INTERVAL defined for ~60fps', () => {
      expect(DEFAULT_UPDATE_INTERVAL).toBe(16);
    });
  });

  describe('DEFAULT_COLORS', () => {
    it('has all required color properties', () => {
      expect(DEFAULT_COLORS).toHaveProperty('background');
      expect(DEFAULT_COLORS).toHaveProperty('headingLabel');
      expect(DEFAULT_COLORS).toHaveProperty('headingValue');
      expect(DEFAULT_COLORS).toHaveProperty('scaleText');
      expect(DEFAULT_COLORS).toHaveProperty('scaleLines');
      expect(DEFAULT_COLORS).toHaveProperty('needle');
    });

    it('has valid hex color values', () => {
      const hexRegex = /^#[0-9a-fA-F]{6}$/;
      Object.values(DEFAULT_COLORS).forEach((color) => {
        expect(color).toMatch(hexRegex);
      });
    });
  });

  describe('CARDINALS', () => {
    it('is a Record (not an array)', () => {
      expect(typeof CARDINALS).toBe('object');
      expect(Array.isArray(CARDINALS)).toBe(false);
    });

    it('has 8 cardinal/intercardinal entries', () => {
      expect(Object.keys(CARDINALS)).toHaveLength(8);
    });

    it('has correct cardinal directions at correct degrees', () => {
      expect(CARDINALS[0]).toBe('N');
      expect(CARDINALS[45]).toBe('NE');
      expect(CARDINALS[90]).toBe('E');
      expect(CARDINALS[135]).toBe('SE');
      expect(CARDINALS[180]).toBe('S');
      expect(CARDINALS[225]).toBe('SW');
      expect(CARDINALS[270]).toBe('W');
      expect(CARDINALS[315]).toBe('NW');
    });
  });

  describe('getTickType', () => {
    it('returns cardinal for 0 (N)', () => {
      expect(getTickType(0)).toBe('cardinal');
    });

    it('returns cardinal for 45 (NE)', () => {
      expect(getTickType(45)).toBe('cardinal');
    });

    it('returns cardinal for 90 (E)', () => {
      expect(getTickType(90)).toBe('cardinal');
    });

    it('returns cardinal for 135 (SE)', () => {
      expect(getTickType(135)).toBe('cardinal');
    });

    it('returns cardinal for 180 (S)', () => {
      expect(getTickType(180)).toBe('cardinal');
    });

    it('returns cardinal for 225 (SW)', () => {
      expect(getTickType(225)).toBe('cardinal');
    });

    it('returns cardinal for 270 (W)', () => {
      expect(getTickType(270)).toBe('cardinal');
    });

    it('returns cardinal for 315 (NW)', () => {
      expect(getTickType(315)).toBe('cardinal');
    });

    it('returns major for 10 degrees', () => {
      expect(getTickType(10)).toBe('major');
    });

    it('returns major for 20 degrees', () => {
      expect(getTickType(20)).toBe('major');
    });

    it('returns major for 30 degrees', () => {
      expect(getTickType(30)).toBe('major');
    });

    it('returns minor for 5 degrees', () => {
      expect(getTickType(5)).toBe('minor');
    });

    it('returns minor for 15 degrees', () => {
      expect(getTickType(15)).toBe('minor');
    });

    it('returns minor for 25 degrees', () => {
      expect(getTickType(25)).toBe('minor');
    });

    it('normalizes degrees > 360', () => {
      expect(getTickType(360)).toBe('cardinal'); // 360 normalizes to 0
      expect(getTickType(450)).toBe('cardinal'); // 450 normalizes to 90
    });

    it('normalizes negative degrees', () => {
      expect(getTickType(-90)).toBe('cardinal'); // -90 normalizes to 270
      expect(getTickType(-10)).toBe('major'); // -10 normalizes to 350
    });
  });

  describe('getTickLabel', () => {
    it('returns N for 0 degrees', () => {
      expect(getTickLabel(0)).toBe('N');
    });

    it('returns E for 90 degrees', () => {
      expect(getTickLabel(90)).toBe('E');
    });

    it('returns E for 450 degrees (normalizes to 90)', () => {
      expect(getTickLabel(450)).toBe('E');
    });

    it('returns NE for 45 degrees', () => {
      expect(getTickLabel(45)).toBe('NE');
    });

    it('returns "30°" for 30 degrees when showNumericLabels is true', () => {
      expect(getTickLabel(30, true)).toBe('30°');
    });

    it('returns undefined for 30 degrees when showNumericLabels is false', () => {
      expect(getTickLabel(30, false)).toBeUndefined();
    });

    it('returns "60°" for 60 degrees when showNumericLabels is true', () => {
      expect(getTickLabel(60, true)).toBe('60°');
    });

    it('returns "120°" for 120 degrees when showNumericLabels is true', () => {
      expect(getTickLabel(120, true)).toBe('120°');
    });

    it('returns undefined for non-labeled degrees', () => {
      expect(getTickLabel(5)).toBeUndefined();
      expect(getTickLabel(10)).toBeUndefined();
      expect(getTickLabel(15)).toBeUndefined();
    });

    it('always shows cardinal directions regardless of showNumericLabels', () => {
      expect(getTickLabel(0, false)).toBe('N');
      expect(getTickLabel(90, false)).toBe('E');
      expect(getTickLabel(180, false)).toBe('S');
      expect(getTickLabel(270, false)).toBe('W');
    });
  });

  describe('COMPASS_TICKS', () => {
    it('is an array', () => {
      expect(Array.isArray(COMPASS_TICKS)).toBe(true);
    });

    it('has 217 ticks (-360 to 720 in 5 degree increments)', () => {
      // From -360 to 720, stepping by 5: (720 - (-360)) / 5 + 1 = 217
      expect(COMPASS_TICKS).toHaveLength(217);
    });

    it('starts at -360 degrees', () => {
      expect(COMPASS_TICKS[0].degree).toBe(-360);
    });

    it('ends at 720 degrees', () => {
      expect(COMPASS_TICKS[COMPASS_TICKS.length - 1].degree).toBe(720);
    });

    it('has correct structure for each tick', () => {
      const tick = COMPASS_TICKS[0];
      expect(tick).toHaveProperty('degree');
      expect(tick).toHaveProperty('type');
      expect(tick).toHaveProperty('label');
      expect(tick).toHaveProperty('x');
    });

    it('calculates x position correctly (degree * DEGREE_WIDTH)', () => {
      COMPASS_TICKS.forEach((tick) => {
        expect(tick.x).toBe(tick.degree * DEGREE_WIDTH);
      });
    });

    it('has ticks every 5 degrees', () => {
      for (let i = 1; i < COMPASS_TICKS.length; i++) {
        expect(COMPASS_TICKS[i].degree - COMPASS_TICKS[i - 1].degree).toBe(5);
      }
    });
  });

  describe('SPRING_CONFIG', () => {
    it('has damping property', () => {
      expect(SPRING_CONFIG).toHaveProperty('damping');
      expect(typeof SPRING_CONFIG.damping).toBe('number');
    });

    it('has stiffness property', () => {
      expect(SPRING_CONFIG).toHaveProperty('stiffness');
      expect(typeof SPRING_CONFIG.stiffness).toBe('number');
    });

    it('has mass property', () => {
      expect(SPRING_CONFIG).toHaveProperty('mass');
      expect(typeof SPRING_CONFIG.mass).toBe('number');
    });

    it('has reasonable spring values', () => {
      expect(SPRING_CONFIG.damping).toBeGreaterThan(0);
      expect(SPRING_CONFIG.stiffness).toBeGreaterThan(0);
      expect(SPRING_CONFIG.mass).toBeGreaterThan(0);
    });
  });

  describe('TICK_HEIGHTS', () => {
    it('has cardinal height of 40', () => {
      expect(TICK_HEIGHTS.cardinal).toBe(40);
    });

    it('has major height of 30', () => {
      expect(TICK_HEIGHTS.major).toBe(30);
    });

    it('has minor height of 20', () => {
      expect(TICK_HEIGHTS.minor).toBe(20);
    });

    it('has cardinal > major > minor heights', () => {
      expect(TICK_HEIGHTS.cardinal).toBeGreaterThan(TICK_HEIGHTS.major);
      expect(TICK_HEIGHTS.major).toBeGreaterThan(TICK_HEIGHTS.minor);
    });
  });

  describe('FONT_SIZES', () => {
    it('has cardinal font size', () => {
      expect(FONT_SIZES.cardinal).toBe(16);
    });

    it('has major font size', () => {
      expect(FONT_SIZES.major).toBe(14);
    });

    it('has heading font size', () => {
      expect(FONT_SIZES.heading).toBe(24);
    });

    it('has headingLabel font size', () => {
      expect(FONT_SIZES.headingLabel).toBe(12);
    });
  });
});
