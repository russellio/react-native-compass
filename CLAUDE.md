# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Context7 Integration

Always use Context7 when needing code generation, setup or configuration steps, or library/API documentation. Automatically use the Context7 MCP tools to resolve library id and get library docs without being explicitly asked.

## Commands

```bash
# Build the library (outputs to lib/)
npm run prepare

# Type checking
npm run typecheck

# Linting
npm run lint

# Run tests
npm run test

# Clean build output
npm run clean

# Release
npm run release
```

## Demo App

The `demo/` directory contains an Expo app for testing the library locally:

```bash
cd demo
npm install
npx expo start
```

## Architecture

This is a TypeScript-only React Native library that provides a horizontal scrolling compass component with real-time magnetometer integration.

### Core Flow

```
Magnetometer (expo-sensors)
    ↓
useCompassHeading hook (EMA smoothing)
    ↓
useHeadingAnimation hook (Reanimated spring physics)
    ↓
Compass component → CompassTape, HeadingDisplay, CompassNeedle
```

### Key Components

- **`src/Compass.tsx`**: Main component that orchestrates everything. Renders the tape, heading display, and needle indicator.
- **`src/components/CompassTape.tsx`**: SVG-based horizontal tape showing tick marks and cardinal directions. Uses a 3x360° extended tape for seamless 0°/360° wrapping.
- **`src/components/HeadingDisplay.tsx`**: Animated heading value display at the top.
- **`src/components/CompassNeedle.tsx`**: Center triangle indicator.

### Custom Hooks

- **`useCompassHeading`**: Subscribes to magnetometer data, calculates heading, and applies EMA smoothing. Returns `{ heading, accuracy, error, isAvailable }`.
- **`useHeadingAnimation`**: Converts heading changes into spring-animated SharedValue. Handles 0°/360° boundary wrapping to prevent backwards spinning.

### Utility Functions (`src/utils/headingMath.ts`)

- `normalizeHeading`: Normalize angle to 0-359 range
- `calculateHeading`: Convert magnetometer x/y data to heading
- `shortestAngularDistance`: Calculate shortest path between two headings (handles wrapping)
- `applyEMA`: Exponential moving average smoothing
- `getCardinalDirection`: Convert heading to cardinal direction string

### Constants (`src/constants.ts`)

- `DEGREE_WIDTH`: Pixels per degree on the tape (4px)
- `COMPASS_TICKS`: Pre-computed array of all tick marks for the 1080° extended tape
- `SPRING_CONFIG`: Reanimated spring animation parameters

### Build System

Uses `react-native-builder-bob` to build CommonJS, ESM, and TypeScript declaration files. Source is in `src/`, output goes to `lib/`.

## Compass Heading Calibration

**IMPORTANT**: If working on heading accuracy issues (compass showing wrong direction compared to native iOS compass), read `COMPASS_HEADING_CALIBRATION.md` first. It contains:

- The correct `calculateHeading()` formula and why it works
- How to interpret comparison screenshots (native vs RN demo)
- Common wrong formulas and their symptoms (90° off, 180° off, etc.)
- Step-by-step debugging workflow
- Test vector conventions for compass bearing

**Key file**: `src/utils/headingMath.ts:17-27` - the `calculateHeading()` function

**Current correct formula**: `atan2(-data.y, data.x)` for iOS magnetometer where X points North:
- North (x=1, y=0) → 0°
- East (x=0, y=-1) → 90°
- South (x=-1, y=0) → 180°
- West (x=0, y=1) → 270°
