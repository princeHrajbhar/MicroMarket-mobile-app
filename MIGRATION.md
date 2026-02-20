# MicroMarket — SDK 54 Migration Guide

## What Changed (SDK 50 → SDK 54)

### Core Versions
| Package | SDK 50 (Old) | SDK 54 (New) |
|---------|-------------|-------------|
| `expo` | ~50.0.0 | ~54.0.9 |
| `react` | 18.2.0 | **19.1.0** |
| `react-native` | 0.73.4 | **0.81.4** |
| `react-native-reanimated` | ~3.6.2 | **~4.1.0** |
| `react-native-gesture-handler` | ~2.14.0 | **~2.28.0** |
| `react-native-safe-area-context` | 4.8.2 | **~5.6.0** |
| `react-native-screens` | ~3.29.0 | **~4.16.0** |
| `@react-native-async-storage/async-storage` | 1.21.0 | **2.2.0** |
| `@react-native-community/netinfo` | 11.1.0 | **^11.4.1** |
| `expo-splash-screen` | ~0.26.4 | **~31.0.10** |
| `expo-linear-gradient` | ~12.7.2 | **~15.0.7** |
| `expo-font` | ~11.10.3 | **~14.0.8** |
| `expo-constants` | ~15.4.5 | **~18.0.9** |
| `expo-status-bar` | ~1.11.1 | **~3.0.8** |
| `@expo/vector-icons` | ^14.0.0 | **^14.0.4** |

### New Required Packages
- `react-native-worklets`: **~0.4.0** — new peer dependency for Reanimated v4

### Removed Packages
- `react-native-vector-icons` — use `@expo/vector-icons` instead
- `expo-image` — use built-in `<Image>` from react-native
- `react-native-skeleton-placeholder` — replaced with custom Reanimated v4 skeleton
- `@types/react-native` — types now bundled in react-native itself

---

## Key Breaking Changes

### 1. Reanimated v4 (MAJOR)

**`babel.config.js` — Remove the plugin manually:**
```js
// OLD (SDK 50 / Reanimated v3):
module.exports = function (api) {
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated/plugin'], // ❌ DO NOT include this anymore
  };
};

// NEW (SDK 54 / Reanimated v4):
module.exports = function (api) {
  return {
    presets: ['babel-preset-expo'], // ✅ babel-preset-expo handles it automatically
  };
};
```

**`interpolateColor` removed from main export:**
```ts
// OLD (v3):
import { interpolateColor } from 'react-native-reanimated'; // ❌ Removed in v4

// NEW (v4): Use direct state-based color switching or CSS transitions
// interpolateColor is not needed for most use cases — use JS-side state
```

**`createAnimatedComponent` still works but prefer `Animated.View` wrapper:**
```tsx
// OLD (v3):
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

// NEW (v4) — wrap instead:
<Animated.View style={animStyle}>
  <TouchableOpacity ...>
```

**`withTiming` on non-style values (like `elevation`) no longer works:**
```ts
// OLD: elevation.value = withTiming(2); // ❌ elevation is not an animatable style
// NEW: Just set it directly or use shadowOpacity
```

**New `withDelay` for staggered animations:**
```ts
import { withDelay, withTiming } from 'react-native-reanimated';
// withDelay(ms, animation) replaces setTimeout pattern
opacity.value = withDelay(400, withTiming(1, { duration: 500 }));
```

### 2. React 19.1 Changes

- No more `propTypes` support — removed entirely
- `React.FC` typing is cleaner — no implicit `children` prop
- Empty catch blocks require named parameter in strict TS: `catch (_) {}`
- `useEffect` dependency warnings are stricter

### 3. expo-splash-screen v31

```ts
// NEW: hideAsync() is still the same, but call it directly in useEffect
// No more SplashScreen.preventAutoHideAsync() needed when using
// expo-splash-screen plugin in app.json

// In App.tsx (root):
SplashScreen.preventAutoHideAsync(); // Called at module level, still works

// In your component:
useEffect(() => {
  SplashScreen.hideAsync(); // Call when ready
}, []);
```

### 4. app.json — Stricter Schema

```json
// ❌ REMOVED — statusBar at root or android level:
{
  "expo": {
    "statusBar": { ... },  // REMOVED
    "android": {
      "statusBar": { ... } // REMOVED
    }
  }
}

// ✅ Use expo-status-bar component instead
// ✅ Android permissions use full package paths:
"permissions": [
  "android.permission.INTERNET",    // NOT "INTERNET"
  "android.permission.ACCESS_NETWORK_STATE"
]

// ✅ New Architecture enabled by default:
"newArchEnabled": true
```

### 5. Android Edge-to-Edge (SDK 54)

Android apps now run edge-to-edge by default (content behind system bars). Use `react-native-safe-area-context` (already in the project) to handle insets — which this project already does correctly with `useSafeAreaInsets()`.

---

## Setup & Run Instructions

### Prerequisites
- **Node.js 20.19.4+** (required for SDK 54)
- **Expo CLI** — `npm install -g expo-cli` or use `npx expo`
- **Expo Go app** on your device (SDK 54 version)

### Installation

```bash
# 1. Navigate to project
cd MicroMarket

# 2. Install all dependencies
npm install

# 3. Copy environment file
cp .env.example .env
# Update API_BASE_URL in .env

# 4. Start development server
npx expo start

# For specific platforms:
npx expo start --android
npx expo start --ios
```

### For Physical Device Testing

Replace `localhost` in `.env` with your machine's local IP:
```env
API_BASE_URL=http://192.168.1.xxx:5000/api/v1
```

Find your IP:
- **Mac/Linux:** `ifconfig | grep "inet "`
- **Windows:** `ipconfig`

### Clearing Cache (if issues arise)

```bash
npx expo start --clear
# or
rm -rf node_modules/.cache
npm install
npx expo start
```

### Running expo-doctor to verify

```bash
npx expo-doctor
```

All checks should pass. If you see peer dependency warnings for `react-native-worklets`, install it:
```bash
npx expo install react-native-worklets
```

---

## Common Issues & Fixes

| Error | Fix |
|-------|-----|
| `Duplicate plugin: react-native-reanimated/plugin` | Remove from `babel.config.js` — handled automatically |
| `react-native-worklets not installed` | `npx expo install react-native-worklets` |
| `interpolateColor not found` | Removed in v4 — use JS state for color changes |
| `statusBar schema error` | Remove `statusBar` from `app.json` — use `expo-status-bar` |
| Metro bundler errors | `npx expo start --clear` |
| iOS pod install fails | `cd ios && pod install` after `npm install` |
