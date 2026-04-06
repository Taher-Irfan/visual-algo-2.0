# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (http://localhost:5173)
npm run build     # Type-check + production bundle (tsc -b && vite build)
npm run lint      # ESLint over all src/**/*.{ts,tsx}
npm run preview   # Serve the dist/ build locally
```

No test framework is configured.

## Architecture

**VisualAlgo** is a React + TypeScript + Vite single-page app for step-by-step algorithm visualization.

### Routing

`App.tsx` defines three route families via React Router v7:
- `/sorting/:algorithm` → `SortingPage`
- `/searching/:algorithm` → `SearchingPage`
- `/graph/:algorithm` → `GraphPage`
- `/` redirects to `/sorting/bubble`

### Algorithm Execution Model

Algorithms **precompute all steps upfront** — they do not run incrementally. Each algorithm exports a `generateSteps(array)` function that returns a full `Step[]` array before playback begins. The UI then advances `currentStepIndex` to animate through them.

Each `Step` carries: the full array state, the active pseudo-code line, highlight categories (comparing / swapping / sorted / found), and running operation counts.

### Registry Pattern

`src/algorithms/registry.ts` and `src/algorithms/graphRegistry.ts` are the single sources of truth for available algorithms. Adding a new algorithm means:
1. Implementing `generateSteps` + exporting the `Algorithm` (or `GraphAlgorithm`) object
2. Registering it in the appropriate registry

### Playback State

`usePlaybackController` (`src/hooks/usePlaybackController.ts`) owns all playback state: `currentStepIndex`, `playbackStatus` (idle / playing / paused / finished), and speed multiplier (0.5×–15×). Pages wire this hook to `PlaybackControls` and `ControlPanel`.

### Component Composition per Page

Each page composes: `Navbar` → `Visualizer` (or `GraphVisualizer` / `SearchingVisualizer`) → `PlaybackControls` → `ControlPanel` → `CodePanel`.

`CodePanel` highlights the pseudo-code line that matches the current step's `activeLine` field.

### Styling

Tailwind CSS v4 (PostCSS plugin). Dark mode is CSS-class–based (`.dark` on `document.documentElement`), persisted to `localStorage` via `useDarkMode`.

### Sound

`src/utils/sound.ts` wraps the Web Audio API in a singleton `SoundEngine`. It synthesizes tones for compare vs. swap events — no audio files.
