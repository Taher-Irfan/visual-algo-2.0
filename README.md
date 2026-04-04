# VisualAlgo

A premium algorithm visualization platform focused on sorting algorithms, built with React, TypeScript, and Tailwind CSS.

## Routes

- `/sorting/bubble` - Bubble Sort visualization
- `/sorting/selection` - Selection Sort visualization
- `/` - Redirects to Bubble Sort

## Features

- **Interactive Visualization**: Watch sorting algorithms execute step-by-step with beautiful bar animations
- **Multiple Algorithms**: Currently supports Bubble Sort and Selection Sort
- **Dual Playback Modes**:
  - **Continuous Mode**: Auto-play with adjustable speed
  - **Step Mode**: Manual step-by-step execution
- **Code Highlighting**: Real-time C++ code display with line highlighting
- **Statistics Tracking**: Live comparison and swap counts
- **Sound Effects**: Subtle audio feedback for comparisons and swaps
- **Dark Mode**: Seamless light/dark theme switching
- **Responsive Design**: Premium UI inspired by modern SaaS products

## Tech Stack

- **React 19** with TypeScript
- **Vite** for blazing-fast development
- **Tailwind CSS v4** with dark mode support
- **React Router v7** for navigation
- **Lucide React** for beautiful icons

## Getting Started

### Install Dependencies

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── algorithms/       # Algorithm implementations
│   ├── bubbleSort.ts
│   ├── selectionSort.ts
│   └── index.ts
├── components/       # React components
│   ├── Navbar.tsx
│   ├── Visualizer.tsx
│   ├── ControlPanel.tsx
│   ├── CodePanel.tsx
│   └── PlaybackControls.tsx
├── hooks/           # Custom React hooks (planned)
├── types/           # TypeScript type definitions
│   └── index.ts
├── utils/           # Utility functions
│   ├── array.ts
│   └── sound.ts
├── App.tsx          # Main application component
└── main.tsx         # Application entry point
```

## Architecture

### Step-Based Engine

The visualizer uses a precomputed step-based approach:

1. **Step Generation**: Each algorithm implements `generateSteps(array)` which precomputes all visualization steps before playback
2. **Step Structure**: Each step contains:
   - Array state
   - Active code line
   - Element highlights (comparing, swapping, sorted)
   - Operation counts (comparisons, swaps)

### Adding New Algorithms

To add a new sorting algorithm:

1. Create a new file in `src/algorithms/` (e.g., `quickSort.ts`)
2. Implement the `Algorithm` interface:
   ```typescript
   export const quickSort: Algorithm = {
     id: 'quick',
     name: 'Quick Sort',
     generateSteps: (array: number[]) => Step[],
     code: '// C++ code here',
   };
   ```
3. Register it in `src/algorithms/index.ts`
4. Add it to the algorithm dropdown in `Navbar.tsx`

## Customization

### Colors

Tailwind theme colors can be customized in `tailwind.config.js`:
- Primary color scheme
- Dark mode colors
- Shadow styles

### Speed Range

Adjust playback speed in `ControlPanel.tsx`:
```typescript
<input type="range" min="0.5" max="4" step="0.5" />
```

### Array Size

Modify array size limits in `ControlPanel.tsx`:
```typescript
<input type="range" min="5" max="150" />
```

## Contributing

This is a portfolio project demonstrating clean React architecture and modern UI/UX practices.

## License

MIT
