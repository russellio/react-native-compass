import type { CompassTick, TickType } from './types';

/**
 * Constants for compass appearance and behavior
 */

// Pixels per degree for the compass tape
export const DEGREE_WIDTH = 4;

// Default visual settings
export const DEFAULT_VISIBLE_DEGREES = 120;
export const DEFAULT_HEIGHT = 200;

// Default smoothing and update rate
export const DEFAULT_SMOOTHING = 0.2;
export const DEFAULT_UPDATE_INTERVAL = 16; // ~60fps

// Default colors (matching BUILD_BRIEF specifications)
export const DEFAULT_COLORS = {
  background: '#1a2b4a', // dark blue
  headingLabel: '#ff9f43', // orange/amber
  headingValue: '#ffffff', // white
  scaleText: '#e0e0e0', // light gray
  scaleLines: '#8899aa', // muted blue-gray
  needle: '#ff9f43', // orange/amber
};

// Cardinal directions with their degree values
export const CARDINALS: Record<number, string> = {
  0: 'N',
  45: 'NE',
  90: 'E',
  135: 'SE',
  180: 'S',
  225: 'SW',
  270: 'W',
  315: 'NW',
};

/**
 * Determines the tick type based on degree
 */
function getTickType(degree: number): TickType {
  const normalizedDegree = ((degree % 360) + 360) % 360;

  // Cardinals are at 0°, 45°, 90°, 135°, 180°, 225°, 270°, 315°
  if (normalizedDegree in CARDINALS) {
    return 'cardinal';
  }

  // Major ticks every 10°
  if (normalizedDegree % 10 === 0) {
    return 'major';
  }

  // Minor ticks every 5°
  if (normalizedDegree % 5 === 0) {
    return 'minor';
  }

  return 'minor';
}

/**
 * Gets the label for a tick mark
 */
function getTickLabel(degree: number, showNumericLabels: boolean = true): string | undefined {
  const normalizedDegree = ((degree % 360) + 360) % 360;

  // Always show cardinal directions
  if (normalizedDegree in CARDINALS) {
    return CARDINALS[normalizedDegree];
  }

  // Show numeric labels every 30° if enabled
  if (showNumericLabels && normalizedDegree % 30 === 0 && normalizedDegree !== 0) {
    return `${normalizedDegree}°`;
  }

  return undefined;
}

/**
 * Generate compass ticks for the extended tape (3x360° = 1080°)
 * Structure: [...degrees -360 to 0] [0 to 360] [360 to 720]
 */
function generateCompassTicks(): CompassTick[] {
  const ticks: CompassTick[] = [];

  // Generate ticks from -360 to 720 (total 1080°) in 5° increments
  for (let degree = -360; degree <= 720; degree += 5) {
    const normalizedDegree = ((degree % 360) + 360) % 360;

    ticks.push({
      degree,
      type: getTickType(normalizedDegree),
      label: getTickLabel(normalizedDegree),
      x: degree * DEGREE_WIDTH,
    });
  }

  return ticks;
}

/**
 * Pre-computed array of all compass ticks
 * Generated once at module load time for optimal performance
 */
export const COMPASS_TICKS: CompassTick[] = generateCompassTicks();

/**
 * Reanimated spring animation configuration
 */
export const SPRING_CONFIG = {
  damping: 20,
  stiffness: 100,
  mass: 0.5,
};

/**
 * Height of different tick marks
 */
export const TICK_HEIGHTS = {
  cardinal: 40,
  major: 30,
  minor: 20,
};

/**
 * Font sizes for different labels
 */
export const FONT_SIZES = {
  cardinal: 16,
  major: 14,
  heading: 24,
  headingLabel: 12,
};
