import { memo, useMemo } from 'react';

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
  const maxValue = useMemo(() => Math.max(...array, 1), [array]);

  const getBarColor = (index: number): string => {
    if (highlights.sorted?.includes(index)) {
      return 'bg-emerald-400 shadow-lg shadow-emerald-400/50';
    }
    if (highlights.swapping?.includes(index)) {
      return 'bg-rose-500 shadow-lg shadow-rose-500/50';
    }
    if (highlights.comparing?.includes(index)) {
      return 'bg-yellow-400 shadow-lg shadow-yellow-400/50';
    }
    return 'bg-violet-500 dark:bg-violet-500';
  };

  return (
    <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-soft p-3 sm:p-6 flex items-end justify-center gap-[2px] sm:gap-[3px] min-h-[220px]">
      {array.length === 0 ? (
        <div className="flex items-center justify-center h-full text-slate-400 dark:text-slate-500">
          <p className="text-base font-medium">Generate an array to begin</p>
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
                className={`h-full w-full rounded-t-sm transition-colors duration-200 shadow-sm ${barColor}`}
              />
            </div>
          );
        })
      )}
    </div>
  );
}

export default memo(Visualizer);
