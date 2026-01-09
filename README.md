# @russellio/react-native-compass

A TypeScript-only React Native horizontal scrolling compass with real-time magnetometer integration. Features smooth 60fps animations, seamless 0°/360° wrapping, and fully customizable appearance.

Perfect for GPS apps, navigation tools, and any application requiring device heading information.

## Features

- 🧭 **Horizontal Tape Design** - Aircraft-style horizontal scrolling compass
- 📱 **Real-time Magnetometer** - Live device heading using expo-sensors
- ⚡ **Smooth 60fps Animation** - Spring-based physics using react-native-reanimated
- 🔄 **Seamless Wrapping** - No jumps at 0°/360° boundary
- 🎨 **Fully Customizable** - Override colors, sizes, and behavior via props
- 📐 **TypeScript First** - Complete type safety and IntelliSense support
- 🎯 **iOS & Android** - Cross-platform support

## Installation

```bash
npm install @russellio/react-native-compass
```

### Peer Dependencies

This library requires the following peer dependencies:

```bash
npm install expo-sensors react-native-reanimated react-native-svg
```

### Additional Setup

#### react-native-reanimated

Add the Babel plugin to your `babel.config.js`:

```javascript
module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: ['react-native-reanimated/plugin'],
};
```

#### iOS Location Permission

On iOS, magnetometer access requires location permission. Add to your `Info.plist`:

```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>We need your location to access the compass sensor.</string>
```

## Basic Usage

```tsx
import { Compass } from '@russellio/react-native-compass';

function App() {
  return (
    <Compass
      onHeadingChange={(heading) => console.log(`Current heading: ${heading}°`)}
    />
  );
}
```

## Props API

### Visual Props

| Prop                  | Type     | Default      | Description                           |
| --------------------- | -------- | ------------ | ------------------------------------- |
| `backgroundColor`     | `string` | `#1a2b4a`    | Background color of compass container |
| `headingLabelColor`   | `string` | `#ff9f43`    | Color of "HEADING" label              |
| `headingValueColor`   | `string` | `#ffffff`    | Color of heading degree value         |
| `scaleTextColor`      | `string` | `#e0e0e0`    | Color of tick mark labels             |
| `scaleLineColor`      | `string` | `#8899aa`    | Color of tick mark lines              |
| `needleColor`         | `string` | `#ff9f43`    | Color of center triangle indicator    |
| `fontFamily`          | `string` | system       | Custom font family for all text       |

### Layout Props

| Prop              | Type     | Default | Description                          |
| ----------------- | -------- | ------- | ------------------------------------ |
| `visibleDegrees`  | `number` | `120`   | Width of visible compass window      |
| `height`          | `number` | `200`   | Height of compass component          |

### Behavior Props

| Prop                  | Type      | Default | Description                                    |
| --------------------- | --------- | ------- | ---------------------------------------------- |
| `showNumericLabels`   | `boolean` | `true`  | Show numeric degree labels every 30°           |
| `smoothingFactor`     | `number`  | `0.2`   | EMA smoothing (0.05-1.0, lower = smoother)     |
| `updateInterval`      | `number`  | `16`    | Magnetometer update interval in ms (~60fps)    |

### Callbacks

| Prop                 | Type                         | Description                                |
| -------------------- | ---------------------------- | ------------------------------------------ |
| `onHeadingChange`    | `(heading: number) => void`  | Called when heading changes (0-359°)       |
| `onAccuracyChange`   | `(accuracy: number) => void` | Called when magnetometer accuracy changes  |

### Style

| Prop    | Type        | Description                    |
| ------- | ----------- | ------------------------------ |
| `style` | `ViewStyle` | Additional styles for container |

## Examples

### Basic Compass

```tsx
import { Compass } from '@russellio/react-native-compass';

export default function App() {
  return <Compass />;
}
```

### Custom Styling

```tsx
<Compass
  backgroundColor="#000000"
  headingLabelColor="#00ff00"
  headingValueColor="#00ff00"
  scaleTextColor="#00ff00"
  scaleLineColor="#003300"
  needleColor="#00ff00"
  height={250}
  visibleDegrees={90}
/>
```

### With Callbacks

```tsx
import { useState } from 'react';
import { View, Text } from 'react-native';
import { Compass, getCardinalDirection } from '@russellio/react-native-compass';

export default function App() {
  const [heading, setHeading] = useState(0);

  return (
    <View>
      <Compass onHeadingChange={setHeading} />
      <Text>Current heading: {Math.round(heading)}°</Text>
      <Text>Direction: {getCardinalDirection(heading)}</Text>
    </View>
  );
}
```

### Adjustable Smoothing

```tsx
import { useState } from 'react';
import { Compass } from '@russellio/react-native-compass';
import Slider from '@react-native-community/slider';

export default function App() {
  const [smoothing, setSmoothing] = useState(0.2);

  return (
    <>
      <Compass smoothingFactor={smoothing} />
      <Slider
        minimumValue={0.05}
        maximumValue={1.0}
        value={smoothing}
        onValueChange={setSmoothing}
      />
    </>
  );
}
```

## Advanced Usage

### Using Hooks Directly

For custom compass implementations, you can use the underlying hooks:

```tsx
import { useCompassHeading, useHeadingAnimation } from '@russellio/react-native-compass';

function CustomCompass() {
  const { heading, accuracy, error, isAvailable } = useCompassHeading();
  const { animatedHeading } = useHeadingAnimation(heading);

  // Build your custom UI using animatedHeading
  return <YourCustomUI />;
}
```

### Utility Functions

```tsx
import {
  normalizeHeading,
  getCardinalDirection,
  shortestAngularDistance,
} from '@russellio/react-native-compass';

// Normalize any angle to 0-359 range
const normalized = normalizeHeading(370); // Returns 10

// Get cardinal direction (N, NE, E, etc.)
const direction = getCardinalDirection(45); // Returns "NE"

// Calculate shortest path between two headings
const distance = shortestAngularDistance(350, 10); // Returns 20
```

## Calibration

The magnetometer sensor can be affected by magnetic interference. Users should calibrate their device for best results:

### iOS
1. Hold device flat
2. Move it in a figure-8 pattern
3. Repeat several times
4. Follow any on-screen prompts

### Android
1. Open Settings → Display
2. Enable Auto-rotate
3. Move device in figure-8 pattern
4. Follow calibration dialog

### Tips
- Move away from magnetic interference (speakers, magnets, metal objects)
- Remove magnetic phone cases
- Hold device relatively flat
- Recalibrate if compass behaves erratically

## Troubleshooting

### Compass Not Working

**Error: "Magnetometer sensor is not available"**
- Device may not have a magnetometer sensor
- Check on a physical device (simulators don't have sensors)

**Error: "Location permission is required"** (iOS)
- Grant location permission when prompted
- Check Settings → Privacy → Location Services

### Erratic Readings

- Calibrate the magnetometer (see Calibration section)
- Move away from magnetic interference
- Remove magnetic phone cases
- Try adjusting `smoothingFactor` (lower = smoother)

### Performance Issues

- Reduce `visibleDegrees` for better performance
- Increase `updateInterval` to reduce update frequency
- Ensure react-native-reanimated is properly configured

## API Reference

### Types

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
  visibleDegrees?: number;
  height?: number;

  // Behavior
  showNumericLabels?: boolean;
  smoothingFactor?: number;
  updateInterval?: number;

  // Callbacks
  onHeadingChange?: (heading: number) => void;
  onAccuracyChange?: (accuracy: number) => void;

  // Style
  style?: ViewStyle;
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details.

## Author

Jon Russell ([@russellio](https://github.com/russellio))

## Acknowledgments

- Built with [expo-sensors](https://docs.expo.dev/versions/latest/sdk/magnetometer/)
- Animations powered by [react-native-reanimated](https://docs.swmansion.com/react-native-reanimated/)
- Graphics using [react-native-svg](https://github.com/software-mansion/react-native-svg)
