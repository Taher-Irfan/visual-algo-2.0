# Components

All UI components for the VisualAlgo application.

## Component Architecture

### Data Flow
```
App.tsx
  ├─ usePlaybackController() → Logic
  │
  ├─ Navbar (controls)
  │
  ├─ Visualizer (array visualization)
  │   ├─ array: currentStep.array
  │   └─ highlights: currentStep.highlights
  │
  ├─ PlaybackControls (play/pause/step)
  │   ├─ actions: play, pause, stepForward, etc.
  │   └─ state: playbackStatus, canStepForward, etc.
  │
  ├─ ControlPanel (settings + stats)
  │   ├─ controls: arraySize, speed, generate
  │   └─ stats: comparisons, swaps
  │
  └─ CodePanel (code highlighting)
      ├─ code: algorithm.code
      └─ activeLine: currentStep.activeLine
```

## Components

### Navbar
**Purpose**: Top navigation bar with controls

**Props**:
- `selectedAlgorithm` - Current algorithm ID
- `onAlgorithmChange` - Algorithm selection handler
- `isDarkMode` - Dark mode state
- `onDarkModeToggle` - Dark mode toggle handler
- `isSoundEnabled` - Sound state
- `onSoundToggle` - Sound toggle handler

**Features**:
- Logo and branding
- Algorithm dropdown selector
- Dark mode toggle (moon/sun icon)
- Sound toggle (volume icon)

---

### Visualizer
**Purpose**: Main visualization of array as vertical bars

**Props**:
- `array: number[]` - Array to visualize
- `highlights: { comparing?, swapping?, sorted? }` - Visual feedback

**Features**:
- Auto-scaling bars based on max value
- Color-coded highlights:
  - 🟢 Green = Sorted
  - 🔴 Red = Swapping
  - 🟡 Yellow = Comparing
  - ⚫ Gray = Default
- Smooth transitions (300ms height, 200ms color)
- Dark mode support
- Responsive width
- Memoized for performance

**Connection**: Receives data from `currentStep` via App.tsx

---

### PlaybackControls
**Purpose**: Playback control buttons

**Props**:
- `playbackStatus` - 'idle' | 'playing' | 'paused' | 'finished'
- `playbackMode` - 'continuous' | 'step'
- `onPlay` - Start playback
- `onPause` - Pause playback
- `onStepForward` - Next step
- `onStepBackward` - Previous step
- `onReplay` - Reset to beginning
- `onModeChange` - Switch mode
- `canStepForward` - Can move forward
- `canStepBackward` - Can move backward

**Features**:
- Mode switcher (Continuous / Step Mode)
- Replay button
- Step backward button
- Play/Pause button (continuous) or Step button (step mode)
- Step forward button
- Disabled states for unavailable actions

**Connection**: Receives actions from `usePlaybackController` hook

---

### ControlPanel
**Purpose**: Settings and statistics display

**Props**:
- `arraySize` - Current array size
- `speed` - Current playback speed
- `comparisons` - Comparison count
- `swaps` - Swap count
- `onArraySizeChange` - Array size slider handler
- `onSpeedChange` - Speed slider handler
- `onGenerateArray` - Generate new array handler
- `isPlaying` - Playing state (to disable controls)

**Features**:
- Array size slider (5-150)
- Speed slider (0.5x-4x)
- Generate new array button
- Statistics display:
  - Comparisons counter
  - Swaps counter

**Connection**: Receives operations from `currentStep.operations`

---

### CodePanel
**Purpose**: Code display with line highlighting

**Props**:
- `code: string` - Algorithm code (C++)
- `activeLine: number` - Line to highlight

**Features**:
- Syntax display (C++)
- Line numbers
- Active line highlighting (yellow background)
- Scrollable container
- Dark mode support
- Monospace font

**Connection**: Receives data from `algorithm.code` and `currentStep.activeLine`

---

## Design Principles

### 1. Pure Presentation Components
All components are **pure** - they don't manage their own state for business logic. They only:
- Receive props
- Render UI
- Call callbacks

### 2. Clean Separation
```
Logic:        usePlaybackController hook
Presentation: All components in this folder
```

### 3. Type Safety
All components have explicit TypeScript interfaces for props.

### 4. Dark Mode
All components support dark mode via `dark:` utility classes.

### 5. Accessibility
All components include:
- Semantic HTML
- ARIA labels where needed
- Keyboard support
- Focus indicators

## Styling

### Theme
- **Primary Color**: Blue (sky-500)
- **Background**: White / Gray-900
- **Text**: Gray-900 / White
- **Borders**: Gray-200 / Gray-800

### Shadows
- `shadow-soft`: Subtle shadow for cards
- `shadow-soft-lg`: Larger shadow for elevation

### Transitions
- **Duration**: 200-300ms
- **Easing**: ease-in-out
- **Properties**: colors, all (height/width)

## Performance

### Optimizations
1. **Visualizer**: Memoized with `React.memo()`
2. **Calculations**: Use `useMemo()` for expensive computations
3. **Callbacks**: Use `useCallback()` in parent (App.tsx)
4. **Keys**: Proper key usage for list rendering

### Re-render Strategy
Components only re-render when their props change:
- Visualizer: array or highlights
- CodePanel: code or activeLine
- ControlPanel: stats or controls
- PlaybackControls: status or capabilities

## Testing

### Component Tests (Future)
```typescript
describe('Visualizer', () => {
  test('renders bars for array', () => {
    render(<Visualizer array={[3, 1, 2]} highlights={{}} />);
    expect(screen.getAllByRole('presentation')).toHaveLength(3);
  });
  
  test('applies highlight colors', () => {
    render(<Visualizer 
      array={[1, 2]} 
      highlights={{ comparing: [0] }} 
    />);
    expect(/* yellow bar */).toBeInTheDocument();
  });
});
```

## File Structure

```
components/
├── Navbar.tsx              - Navigation bar
├── Visualizer.tsx          - Bar chart visualization
├── PlaybackControls.tsx    - Playback buttons
├── ControlPanel.tsx        - Settings + stats
├── CodePanel.tsx           - Code display
└── README.md              - This file
```

## Usage Example

```typescript
import Visualizer from './components/Visualizer';
import PlaybackControls from './components/PlaybackControls';
import { usePlaybackController } from './hooks';

function MyApp() {
  const [steps, setSteps] = useState<Step[]>([]);
  
  const {
    currentStep,
    playbackStatus,
    play,
    pause,
  } = usePlaybackController({ steps });

  return (
    <>
      <Visualizer 
        array={currentStep.array}
        highlights={currentStep.highlights}
      />
      
      <PlaybackControls
        playbackStatus={playbackStatus}
        onPlay={play}
        onPause={pause}
        {/* ... */}
      />
    </>
  );
}
```

## Best Practices

### ✅ Do
- Keep components pure (no business logic)
- Use TypeScript interfaces for props
- Add ARIA labels for accessibility
- Use Tailwind for styling
- Memoize expensive components
- Use semantic HTML

### ❌ Don't
- Manage business state in components
- Use inline styles (use Tailwind)
- Hardcode values (use props)
- Make network calls in components
- Use `any` types

## Status

All components are:
- ✅ Type-safe
- ✅ Documented
- ✅ Dark mode ready
- ✅ Accessible
- ✅ Performance optimized
- ✅ Production ready
