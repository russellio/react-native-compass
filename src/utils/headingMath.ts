import type { MagnetometerData } from '../types';

/**
 * Normalizes a heading to the 0-359 degree range
 * Note: Can be used in both JS and UI thread contexts
 */
export function normalizeHeading(heading: number): number {
  const normalized = ((heading % 360) + 360) % 360;
  return normalized;
}

/**
 * Calculates heading from magnetometer data
 * Uses atan2 to compute the angle from magnetic north
 */
export function calculateHeading(data: MagnetometerData): number {
  // Calculate heading in radians, then convert to degrees
  // Note: We use -y and x to get the correct orientation
  const radians = Math.atan2(-data.y, data.x);
  let degrees = radians * (180 / Math.PI);

  // Normalize to 0-359 range
  return normalizeHeading(degrees);
}

/**
 * Detects if heading is crossing the 0°/360° boundary
 * Returns true if we should wrap to prevent backwards spinning
 */
export function shouldWrapHeading(current: number, previous: number): boolean {
  const diff = Math.abs(current - previous);

  // If the difference is greater than 180°, we're likely crossing the boundary
  // For example: going from 359° to 1° or from 1° to 359°
  return diff > 180;
}

/**
 * Calculates the shortest angular distance between two headings
 * Returns a value between -180 and 180
 * Positive means clockwise, negative means counter-clockwise
 */
export function shortestAngularDistance(from: number, to: number): number {
  const diff = to - from;
  const normalizedDiff = ((diff + 180) % 360) - 180;
  return normalizedDiff < -180 ? normalizedDiff + 360 : normalizedDiff;
}

/**
 * Applies Exponential Moving Average (EMA) smoothing to heading values
 */
export function applyEMA(current: number, previous: number, alpha: number): number {
  // Handle wrapping at 0°/360° boundary
  if (shouldWrapHeading(current, previous)) {
    // Adjust the current value to be on the same "side" as previous
    if (current < previous) {
      current += 360;
    } else {
      previous += 360;
    }
  }

  // Apply EMA formula: smoothed = α * current + (1 - α) * previous
  const smoothed = alpha * current + (1 - alpha) * previous;

  // Normalize back to 0-359 range
  return normalizeHeading(smoothed);
}

/**
 * Converts degrees to radians
 */
export function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Converts radians to degrees
 */
export function radiansToDegrees(radians: number): number {
  return radians * (180 / Math.PI);
}

/**
 * Gets the cardinal direction name for a given heading
 */
export function getCardinalDirection(heading: number): string {
  const normalized = normalizeHeading(heading);

  const directions = [
    'N',
    'NNE',
    'NE',
    'ENE',
    'E',
    'ESE',
    'SE',
    'SSE',
    'S',
    'SSW',
    'SW',
    'WSW',
    'W',
    'WNW',
    'NW',
    'NNW',
  ];

  // Each direction covers 22.5° (360° / 16 directions)
  const index = Math.round(normalized / 22.5) % 16;
  return directions[index];
}
