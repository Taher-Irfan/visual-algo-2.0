import { memo } from 'react';

/**
 * SearchingVisualizer Component
 * 
 * Renders search algorithm visualization as horizontal boxes.
 * Displays array elements in a row with different highlight states.
 * 
 * Features:
 * - Horizontal box layout
 * - Current index highlighted (yellow)
 * - Found element highlighted (green)
 * - Eliminated range faded (gray)
 * - Smooth transitions
 * - Dark mode support
 * - Search metadata display (target, found status)
 */

interface SearchingVisualizerProps {
  /** Array of numbers to visualize */
  array: number[];
  /** Highlight indices for visual feedback */
  highlights: {
    comparing?: number[];
    swapping?: number[];
    sorted?: number[];
  };
  /** Search metadata */
  metadata?: {
    target?: number;
    found?: boolean;
    foundIndex?: number;
    currentIndex?: number;
    searchRange?: {
      left: number;
      right: number;
      mid?: number;
    };
  };
}

function SearchingVisualizer({ array, highlights, metadata }: SearchingVisualizerProps) {
  /**
   * Determine box color and style based on highlight state
   * Priority: sorted (found) > comparing (current) > swapping (eliminated) > default
   */
  const getBoxStyle = (index: number): { color: string; opacity: string } => {
    if (highlights.sorted?.includes(index)) {
      // Found element - green
      return {
        color: 'bg-green-500 dark:bg-green-600 border-green-600 dark:border-green-500',
        opacity: 'opacity-100',
      };
    }
    if (highlights.comparing?.includes(index)) {
      // Current index being checked - yellow
      return {
        color: 'bg-yellow-400 dark:bg-yellow-500 border-yellow-500 dark:border-yellow-400',
        opacity: 'opacity-100',
      };
    }
    if (highlights.swapping?.includes(index)) {
      // Eliminated range - faded gray
      return {
        color: 'bg-gray-300 dark:bg-gray-700 border-gray-400 dark:border-gray-600',
        opacity: 'opacity-40',
      };
    }
    // Default - active search range
    return {
      color: 'bg-primary-400 dark:bg-primary-600 border-primary-500 dark:border-primary-500',
      opacity: 'opacity-100',
    };
  };

  const hasTarget = metadata?.target !== undefined;

  return (
    <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-soft p-3 sm:p-8 flex flex-col min-h-[220px]">
      {/* Search Info Header */}
      {hasTarget && (
        <div className="mb-3 sm:mb-6 flex flex-wrap items-center gap-2 sm:gap-0 sm:justify-between">
          <div className="flex flex-wrap items-center gap-2 sm:space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Target:
              </span>
              <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-lg font-bold text-base sm:text-lg">
                {metadata.target}
              </span>
            </div>
            {metadata.found !== undefined && (
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Status:
                </span>
                <span
                  className={`px-2 py-0.5 sm:px-3 sm:py-1 rounded-lg font-semibold text-xs sm:text-sm ${
                    metadata.found
                      ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {metadata.found ? `Found at index ${metadata.foundIndex}` : 'Searching...'}
                </span>
              </div>
            )}
          </div>
          {metadata.searchRange && (
            <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
              Range: [{metadata.searchRange.left}, {metadata.searchRange.right}]
              {metadata.searchRange.mid !== undefined && ` | Mid: ${metadata.searchRange.mid}`}
            </div>
          )}
        </div>
      )}

      {/* Array Visualization */}
      <div className="flex-1 flex items-center justify-center">
        {array.length === 0 ? (
          <div className="text-gray-400 dark:text-gray-500">
            <p className="text-lg font-medium">Generate an array to begin</p>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-wrap justify-center max-w-full">
            {array.map((value, index) => {
              const { color, opacity } = getBoxStyle(index);
              const isMid = metadata?.searchRange?.mid === index;
              
              return (
                <div
                  key={index}
                  className="flex flex-col items-center"
                >
                  {/* Index label */}
                  <span className="text-xs text-gray-400 dark:text-gray-500 mb-1 font-mono">
                    {index}
                  </span>
                  
                  {/* Value box */}
                  <div
                    className={`
                      relative w-16 h-16 flex items-center justify-center
                      rounded-lg border-2 font-bold text-lg
                      transition-all duration-300 ease-in-out
                      ${color} ${opacity}
                      ${isMid ? 'ring-4 ring-primary-300 dark:ring-primary-700' : ''}
                    `}
                    role="presentation"
                    aria-label={`Element ${index}: value ${value}`}
                  >
                    <span className="text-white drop-shadow-sm">
                      {value}
                    </span>
                    
                    {/* Mid indicator */}
                    {isMid && (
                      <div className="absolute -top-2 -right-2 w-5 h-5 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        M
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-3 sm:mt-6 flex items-center justify-center flex-wrap gap-3 sm:space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-yellow-400 dark:bg-yellow-500 rounded border-2 border-yellow-500" />
          <span className="text-gray-600 dark:text-gray-400">Current</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-500 dark:bg-green-600 rounded border-2 border-green-600" />
          <span className="text-gray-600 dark:text-gray-400">Found</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-300 dark:bg-gray-700 rounded border-2 border-gray-400 opacity-40" />
          <span className="text-gray-600 dark:text-gray-400">Eliminated</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-primary-400 dark:bg-primary-600 rounded border-2 border-primary-500" />
          <span className="text-gray-600 dark:text-gray-400">Search Range</span>
        </div>
      </div>
    </div>
  );
}

// Memoize component to prevent unnecessary re-renders
export default memo(SearchingVisualizer);
