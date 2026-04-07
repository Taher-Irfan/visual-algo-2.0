import { memo } from 'react';

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
  const getBoxStyle = (index: number): { color: string; opacity: string } => {
    if (highlights.sorted?.includes(index)) {
      return {
        color: 'bg-emerald-500 border-emerald-600',
        opacity: 'opacity-100',
      };
    }
    if (highlights.comparing?.includes(index)) {
      return {
        color: 'bg-amber-400 border-amber-500',
        opacity: 'opacity-100',
      };
    }
    if (highlights.swapping?.includes(index)) {
      return {
        color: 'bg-slate-300 dark:bg-slate-700 border-slate-400 dark:border-slate-600',
        opacity: 'opacity-35',
      };
    }
    return {
      color: 'bg-blue-500 border-blue-600',
      opacity: 'opacity-100',
    };
  };

  const hasTarget = metadata?.target !== undefined;

  return (
    <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-soft p-4 sm:p-8 flex flex-col min-h-[220px]">
      {/* Search Info Header */}
      {hasTarget && (
        <div className="mb-4 sm:mb-6 flex flex-wrap items-center gap-2 sm:justify-between">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Target:
              </span>
              <span className="px-2.5 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-lg font-bold text-base ring-1 ring-blue-200 dark:ring-blue-800">
                {metadata!.target}
              </span>
            </div>
            {metadata!.found !== undefined && (
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Status:
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-lg font-semibold text-xs sm:text-sm ${
                    metadata!.found
                      ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-200 dark:ring-emerald-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {metadata!.found ? `Found at index ${metadata!.foundIndex}` : 'Searching...'}
                </span>
              </div>
            )}
          </div>
          {metadata!.searchRange && (
            <div className="text-xs text-slate-400 dark:text-slate-500 font-mono bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
              [{metadata!.searchRange.left}, {metadata!.searchRange.right}]
              {metadata!.searchRange.mid !== undefined && ` · mid: ${metadata!.searchRange.mid}`}
            </div>
          )}
        </div>
      )}

      {/* Array Visualization */}
      <div className="flex-1 flex items-center justify-center">
        {array.length === 0 ? (
          <div className="text-slate-400 dark:text-slate-500">
            <p className="text-base font-medium">Generate an array to begin</p>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-wrap justify-center max-w-full">
            {array.map((value, index) => {
              const { color, opacity } = getBoxStyle(index);
              const isMid = metadata?.searchRange?.mid === index;

              return (
                <div key={index} className="flex flex-col items-center">
                  {/* Index label */}
                  <span className="text-xs text-slate-400 dark:text-slate-500 mb-1 font-mono">
                    {index}
                  </span>

                  {/* Value box */}
                  <div
                    className={`
                      relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center
                      rounded-xl border-2 font-bold text-base sm:text-lg
                      transition-all duration-250 ease-in-out
                      ${color} ${opacity}
                      ${isMid ? 'ring-4 ring-offset-1 ring-blue-400/60 dark:ring-blue-500/60 scale-110' : ''}
                    `}
                    role="presentation"
                    aria-label={`Element ${index}: value ${value}`}
                  >
                    <span className="text-white drop-shadow-sm">
                      {value}
                    </span>

                    {isMid && (
                      <div className="absolute -top-2 -right-2 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md">
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
      <div className="mt-4 sm:mt-6 flex items-center justify-center flex-wrap gap-3 sm:gap-5 text-xs">
        {[
          { color: 'bg-amber-400 border-amber-500', label: 'Current' },
          { color: 'bg-emerald-500 border-emerald-600', label: 'Found' },
          { color: 'bg-slate-300 dark:bg-slate-700 border-slate-400 opacity-35', label: 'Eliminated' },
          { color: 'bg-blue-500 border-blue-600', label: 'Search Range' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center space-x-1.5">
            <div className={`w-3.5 h-3.5 rounded-md border-2 ${color}`} />
            <span className="text-slate-500 dark:text-slate-400">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default memo(SearchingVisualizer);
