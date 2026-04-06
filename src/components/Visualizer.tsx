import { memo, useMemo } from 'react';

/**
 * Visualizer Component
 * 
 * Renders algorithm visualization as vertical bars.
 * Connected to playback system via props from usePlaybackController hook.
 * 
 * Data Flow:
 * 1. usePlaybackController manages currentStep
 * 2. App passes currentStep.array and currentStep.highlights to Visualizer
 * 3. Visualizer renders bars with colors based on highlights
 * 4. React automatically re-renders on step changes
 * 
 * Features:
 * - Auto-scales bars based on max value
 * - Smooth height transitions (300ms)
 * - Smooth color transitions (200ms)
 * - Responsive bar widths
 * - Dark mode support
 */

interface VisualizerProps {
  /** Array of numbers to visualize */
  array: number[];
  /** Highlight indices for visual feedback */
  highlights: {
    comparing?: number[];
    swapping?: number[];
    sorted?: number[];
  };
}

function Visualizer({ array, highlights }: VisualizerProps) {
  // Calculate max value for scaling (memoized for performance)
  const maxValue = useMemo(() => Math.max(...array, 1), [array]);

  /**
   * Determine bar color based on highlight state
   * Priority: sorted > swapping > comparing > default
   */
  const getBarColor = (index: number): string => {
    if (highlights.sorted?.includes(index)) {
      return 'bg-green-500 dark:bg-green-600 shadow-sm';
    }
    if (highlights.swapping?.includes(index)) {
      return 'bg-red-500 dark:bg-red-600 shadow-sm';
    }
    if (highlights.comparing?.includes(index)) {
      return 'bg-yellow-500 dark:bg-yellow-600 shadow-sm';
    }
    return 'bg-gray-400 dark:bg-gray-600';
  };

  return (
    <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-soft p-3 sm:p-8 flex items-end justify-center gap-[2px] sm:gap-1 min-h-[220px]">
      {array.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
          <p className="text-lg font-medium">Generate an array to begin</p>
        </div>
      ) : (
        array.map((value, index) => {
          const height = (value / maxValue) * 100;
          const barColor = getBarColor(index);
          
          return (
            <div
              key={index}
              className="flex-1 transition-all duration-300 ease-in-out"
              style={{
                height: `${height}%`,
                minHeight: '4px',
              }}
              role="presentation"
              aria-label={`Bar ${index + 1}: value ${value}`}
            >
              <div
                className={`h-full w-full rounded-t transition-colors duration-200 ${barColor}`}
              />
            </div>
          );
        })
      )}
    </div>
  );
}

// Memoize component to prevent unnecessary re-renders
// Only re-renders when array or highlights change
export default memo(Visualizer);
