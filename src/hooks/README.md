# Custom Hooks

## usePlaybackController

A comprehensive hook for managing algorithm visualization playback.

### Features

✅ **Playback Control**
- Play/Pause in continuous mode
- Manual step forward/backward
- Replay from beginning

✅ **Modes**
- **Continuous**: Auto-play with speed control
- **Step**: Manual stepping only

✅ **Safety**
- Automatic overflow prevention
- Boundary checking on all operations
- State synchronization

✅ **Performance**
- Optimized with useCallback
- Proper dependency management
- Clean effect cleanup

### Usage

```typescript
import { usePlaybackController } from './hooks/usePlaybackController';

function MyComponent() {
  const [steps, setSteps] = useState<Step[]>([]);
  
  const {
    currentStep,           // Current step data
    currentStepIndex,      // Index of current step
    playbackStatus,        // 'idle' | 'playing' | 'paused' | 'finished'
    playbackMode,          // 'continuous' | 'step'
    speed,                 // Playback speed (steps per second)
    canStepForward,        // Boolean: can move forward
    canStepBackward,       // Boolean: can move backward
    play,                  // Start playback
    pause,                 // Pause playback
    stepForward,           // Move to next step
    stepBackward,          // Move to previous step
    replay,                // Reset to beginning
    setPlaybackMode,       // Change mode
    setSpeed,              // Change speed
  } = usePlaybackController({ steps });

  return (
    <div>
      <button onClick={play}>Play</button>
      <button onClick={pause}>Pause</button>
      <button onClick={stepForward} disabled={!canStepForward}>
        Next
      </button>
      <button onClick={stepBackward} disabled={!canStepBackward}>
        Previous
      </button>
      <button onClick={replay}>Replay</button>
    </div>
  );
}
```

### API

#### Parameters

```typescript
interface UsePlaybackControllerProps {
  steps: Step[];                              // Array of visualization steps
  onStepChange?: (stepIndex: number) => void; // Optional callback on step change
}
```

#### Return Value

```typescript
interface UsePlaybackControllerReturn {
  // State
  currentStep: Step;              // Current step object
  currentStepIndex: number;       // Index (0 to steps.length - 1)
  playbackStatus: PlaybackStatus; // 'idle' | 'playing' | 'paused' | 'finished'
  playbackMode: PlaybackMode;     // 'continuous' | 'step'
  speed: number;                  // Steps per second
  
  // Capabilities
  canStepForward: boolean;        // True if can move forward
  canStepBackward: boolean;       // True if can move backward
  
  // Actions
  play: () => void;               // Start continuous playback
  pause: () => void;              // Pause playback
  stepForward: () => void;        // Move to next step
  stepBackward: () => void;       // Move to previous step
  replay: () => void;             // Reset to step 0
  setPlaybackMode: (mode: PlaybackMode) => void;  // Change mode
  setSpeed: (speed: number) => void;              // Change speed
}
```

### Behavior

#### Continuous Mode
- Auto-advances through steps based on speed
- Interval calculated as `1000 / speed` milliseconds
- Automatically stops at the last step
- Can be paused mid-playback

#### Step Mode
- Disables auto-play
- Requires manual `stepForward()`/`stepBackward()` calls
- Useful for teaching/debugging

#### Overflow Prevention
- `stepForward()`: Does nothing if at last step
- `stepBackward()`: Does nothing if at first step
- Boundary checks built into all navigation functions

#### State Transitions

```
idle → playing → finished
  ↓       ↓
paused ←-┘
  ↑
  └─ (step backward from finished)
```

#### Auto-Reset
When `steps` array changes:
- Resets to `currentStepIndex = 0`
- Sets `playbackStatus = 'idle'`
- Preserves `speed` and `playbackMode`

### Example: Sound Effects

```typescript
const { currentStep, currentStepIndex } = usePlaybackController({ steps });

useEffect(() => {
  if (currentStepIndex === 0) return;
  
  if (currentStep.highlights.swapping) {
    playSwapSound();
  } else if (currentStep.highlights.comparing) {
    playCompareSound();
  }
}, [currentStepIndex, currentStep]);
```

### Example: Speed Control

```typescript
const { speed, setSpeed } = usePlaybackController({ steps });

return (
  <input
    type="range"
    min="0.5"
    max="4"
    step="0.5"
    value={speed}
    onChange={(e) => setSpeed(Number(e.target.value))}
  />
);
```

### Example: Mode Switching

```typescript
const { playbackMode, setPlaybackMode } = usePlaybackController({ steps });

return (
  <div>
    <button
      onClick={() => setPlaybackMode('continuous')}
      disabled={playbackMode === 'continuous'}
    >
      Continuous
    </button>
    <button
      onClick={() => setPlaybackMode('step')}
      disabled={playbackMode === 'step'}
    >
      Step Mode
    </button>
  </div>
);
```

### Internal Implementation

#### State Management
- Uses `useState` for all state
- `useCallback` for action functions (stable references)
- `useEffect` for side effects (interval, notifications)

#### Interval Logic (Continuous Mode)
```typescript
useEffect(() => {
  if (playbackStatus !== 'playing' || playbackMode !== 'continuous') {
    return; // Exit early if not in continuous mode
  }

  const delay = 1000 / speed;
  const timer = setTimeout(() => {
    if (currentStepIndex < steps.length - 1) {
      stepForward();
    } else {
      setPlaybackStatus('finished');
    }
  }, delay);

  return () => clearTimeout(timer); // Cleanup
}, [playbackStatus, playbackMode, currentStepIndex, steps.length, speed, stepForward]);
```

### Performance Notes

- **Memoization**: All action functions are memoized with `useCallback`
- **Optimization**: Interval only runs when actively playing
- **Cleanup**: Timer cleaned up on unmount and dependency changes
- **Minimal Re-renders**: State changes trigger only necessary re-renders

### Testing

```typescript
// Test overflow prevention
const { stepForward, canStepForward } = usePlaybackController({ 
  steps: [step1, step2] 
});

// At last step
setCurrentStepIndex(1);
expect(canStepForward).toBe(false);
stepForward(); // Does nothing
expect(currentStepIndex).toBe(1);
```

### Future Enhancements

Potential additions:
- [ ] Speed presets (slow, normal, fast)
- [ ] Loop mode (restart at end)
- [ ] Breakpoints (pause at specific steps)
- [ ] Skip to step N
- [ ] Playback history (undo/redo)
- [ ] Time travel debugging
