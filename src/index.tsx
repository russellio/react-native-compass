/**
 * @russellio/react-native-compass
 * A TypeScript-only React Native horizontal scrolling compass with real-time magnetometer integration
 */
const checkType: number = 42;
  console.log('[compass] TS check:', checkType);
// Main component
export { Compass } from './Compass';

// Types
export type {
  CompassProps,
  CompassTick,
  TickType,
  MagnetometerData,
  HeadingData,
  UseCompassHeadingResult,
  UseHeadingAnimationResult,
} from './types';

// Hooks (for advanced users who want to build custom compass UIs)
export { useCompassHeading } from './hooks/useCompassHeading';
export { useHeadingAnimation } from './hooks/useHeadingAnimation';

// Utilities (for advanced users who need heading calculations)
export {
  normalizeHeading,
  calculateHeading,
  shouldWrapHeading,
  shortestAngularDistance,
  applyEMA,
  degreesToRadians,
  radiansToDegrees,
  getCardinalDirection,
} from './utils/headingMath';

// Constants
export {
  DEGREE_WIDTH,
  DEFAULT_VISIBLE_DEGREES,
  DEFAULT_HEIGHT,
  DEFAULT_SMOOTHING,
  DEFAULT_UPDATE_INTERVAL,
  DEFAULT_COLORS,
  CARDINALS,
  SPRING_CONFIG,
} from './constants';