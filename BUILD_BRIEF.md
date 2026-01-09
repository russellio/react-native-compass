# Build Brief: React Native Horizontal Scrolling Compass

## Goal

Build a TypeScript-only React Native npm package that displays a horizontal scrolling compass with real-time device magnetometer integration. The compass shows a sliding degree tape (like an aircraft attitude indicator) with a fixed center needle that updates as the device rotates.

**Success Criteria:**

- Smooth 60fps animation with natural easing
- Seamless 0°/360° wrapping in both directions
- Fully customizable appearance via props
- Works on iOS and Android
- Published as `@russellio/react-native-compass` on npm

## Constraints

### Tech Stack

- **Language**: TypeScript (full conversion from scaffolded JS)
- **Platform**: React Native (iOS/Android only, no web)
- **Sensors**: `expo-sensors` v14+ (Magnetometer API)
- **Animation**: `react-native-reanimated` v3.6+
- **Graphics**: `react-native-svg` v14+ (for needle triangle)
- **Build Tool**: `react-native-builder-bob` (already configured)
- **Package Manager**: npm

### Style Rules

- Default colors match provided screenshot:
  - Background: `#1a2b4a` (dark blue)
  - Heading label: `#ff9f43` (orange/amber)
  - Heading value: `#ffffff` (white)
  - Scale text: `#e0e0e0` (light gray)
  - Scale lines: `#8899aa` (muted blue-gray)
- All defaults must be overridable via props
- No external fonts (system default, but allow custom via prop)

### Must Not

- Use circular rotating compass design (must be horizontal tape)
- Include web support (iOS/Android only)
- Add calibration UI in the library (only in demo app)
- Use FlatList or ScrollView (use fixed View with transforms)
- Create any dependencies on navigation or state management libraries

## Architecture

### Component Structure

```
Compass (main orchestrator)
├── HeadingDisplay (static overlay - "HEADING" label + "345°" value)
├── CompassTape (animated horizontal tape with tick marks)
└── CompassNeedle (static center triangle indicator)
```

### Data Flow

```
Magnetometer → useCompassHeading → EMA smoothing →
useHeadingAnimation → Spring animation → CompassTape translateX
```

### Key Technical Decisions

**1. Infinite Scroll Pattern: Virtual Extended Tape**

- Render 3x360° = 1080° total width
- Structure: `[...degrees -360 to 0] [0 to 360] [360 to 720]`
- Use `translateX` transform based on heading
- No repositioning/jumping - pure transform-based movement

**2. Smoothing Strategy: Multi-Layer**

- Layer 1: Exponential Moving Average in `useCompassHeading` hook
- Layer 2: Reanimated spring animation (damping=20, stiffness=100, mass=0.5)
- Wrap detection to prevent backwards spinning at 0°/360° boundary

**3. Rendering: Pre-computed Ticks**

- Generate all 360 tick marks once in `constants.ts`
- Store with pre-calculated x positions (`degree * 4px`)
- Major ticks every 10°, minor every 5°
- Cardinals (N, NE, E, SE, S, SW, W, NW) at 45° intervals

**4. Animation: Reanimated UI Thread**

- All animations run on UI thread (no bridge crossing)
- `useSharedValue` for heading
- `useAnimatedStyle` for tape transform
- `useAnimatedProps` for text content updates

### File Organization

```
src/
├── index.tsx                          # Public exports
├── Compass.tsx                        # Main component
├── types.ts                           # All TypeScript interfaces
├── constants.ts                       # COMPASS_TICKS, DEFAULT_COLORS
├── hooks/
│   ├── useCompassHeading.ts          # Magnetometer + smoothing
│   └── useHeadingAnimation.ts        # Reanimated logic
├── components/
│   ├── CompassTape.tsx               # Scrolling scale
│   ├── HeadingDisplay.tsx            # Numeric overlay
│   ├── CompassNeedle.tsx             # Triangle indicator
│   └── ErrorView.tsx                 # Error state
└── utils/
    └── headingMath.ts                # normalizeHeading, shouldWrapHeading, etc.
```

## Milestones

### Phase 1: Foundation

- [ ] Create `tsconfig.json` with React Native settings
- [ ] Update `package.json`: name, dependencies, devDependencies
- [ ] Run `npm install`

### Phase 2: Core Logic

- [ ] Define all TypeScript interfaces in `types.ts`
- [ ] Build `constants.ts` with COMPASS_TICKS array
- [ ] Create utility functions in `headingMath.ts`
- [ ] Implement `useCompassHeading` hook with EMA smoothing
- [ ] Implement `useHeadingAnimation` hook with Reanimated

### Phase 3: UI Components

- [ ] Build `CompassTape` with extended ticks (3x360°)
- [ ] Build `HeadingDisplay` with animated text
- [ ] Build `CompassNeedle` SVG triangle
- [ ] Build `ErrorView` for unsupported devices

### Phase 4: Integration

- [ ] Create main `Compass.tsx` component
- [ ] Wire all hooks and components together
- [ ] Update `index.tsx` with public API exports

### Phase 5: Demo App

- [ ] Build `demo/src/App.tsx` with live demo
- [ ] Create `DemoControls.tsx` (sliders for visibleDegrees, smoothing)
- [ ] Create `DebugPanel.tsx` (show heading, accuracy, FPS)
- [ ] Add calibration instructions

### Phase 6: Polish

- [ ] Test on iOS and Android devices
- [ ] Verify 60fps performance during rotation
- [ ] Test all wrapping scenarios (359→0, 0→359)
- [ ] Write README.md with examples
- [ ] Verify build with `npm run prepare`

## Assumptions

### User Behavior

- Device held in portrait orientation (flat or upright)
- User will calibrate magnetometer if prompted by device OS
- User understands magnetic interference affects accuracy

### Technical Assumptions

- Device has magnetometer sensor available
- Location permissions granted on iOS (required for magnetometer)
- Expo environment available in consuming app
- React Native Reanimated configured in consuming app

### Visual Assumptions

- Degree width constant: 4 pixels per degree
- Default visible window: 120° (±60° from heading)
- Default height: 200px
- Numeric labels shown every 30° by default

## Non-Goals

### Out of Scope for v1

- 3D tilt compensation (device must be relatively flat)
- True north vs magnetic north correction
- Automatic calibration UI
- Haptic feedback
- Web platform support
- Standalone native modules (pure JS/TS only)
- Built-in GPS integration
- Recording/logging heading history
- Gesture controls (pinch to zoom, etc.)

### Explicitly NOT Implementing

- Circular/rotating compass design
- Vertical scrolling variant
- Multiple needles/pointers
- Background map integration
- Augmented reality features
- Compass rose graphics (stick to minimalist tape design)

## Key Props Interface

```typescript
interface CompassProps {
  // Visual
  backgroundColor?: string;
  headingLabelColor?: string;
  headingValueColor?: string;
  scaleTextColor?: string;
  scaleLineColor?: string;
  needleColor?: string;
  fontFamily?: string;

  // Layout
  visibleDegrees?: number; // Default: 120
  height?: number; // Default: 200

  // Behavior
  showNumericLabels?: boolean; // Default: true
  smoothingFactor?: number; // Default: 0.2
  updateInterval?: number; // Default: 16ms

  // Callbacks
  onHeadingChange?: (heading: number) => void;
  onAccuracyChange?: (accuracy: number) => void;

  // Style
  style?: ViewStyle;
}
```

## Constants Reference

- `DEGREE_WIDTH = 4` pixels per degree
- `DEFAULT_VISIBLE_DEGREES = 120`
- `DEFAULT_HEIGHT = 200`
- `DEFAULT_SMOOTHING = 0.2`
- `DEFAULT_UPDATE_INTERVAL = 16` (~60fps)
- Cardinals at: 0°(N), 45°(NE), 90°(E), 135°(SE), 180°(S), 225°(SW), 270°(W), 315°(NW)
