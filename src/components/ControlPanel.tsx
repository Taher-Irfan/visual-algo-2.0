import { Shuffle } from 'lucide-react';

interface StateInfoItem {
  label: string;
  value: string | number;
}

interface ControlPanelProps {
  arraySize: number;
  speed: number;
  comparisons: number;
  swaps?: number;
  stateInfo?: StateInfoItem[];
  onArraySizeChange: (size: number) => void;
  onSpeedChange: (speed: number) => void;
  onGenerateArray: () => void;
  isPlaying: boolean;
}

export default function ControlPanel({
  arraySize,
  speed,
  comparisons,
  swaps,
  stateInfo,
  onArraySizeChange,
  onSpeedChange,
  onGenerateArray,
  isPlaying,
}: ControlPanelProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-soft p-5 sm:p-6 space-y-6">
      {/* Controls Section */}
      <div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">
          Controls
        </h3>

        <div className="space-y-5">
          {/* Array Size Slider */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Array Size
              </label>
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 tabular-nums">
                {arraySize}
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="150"
              value={arraySize}
              onChange={(e) => onArraySizeChange(Number(e.target.value))}
              disabled={isPlaying}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-blue-500 disabled:opacity-40 disabled:cursor-not-allowed"
            />
          </div>

          {/* Speed Slider */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Speed
              </label>
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 tabular-nums">
                {speed}×
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="30"
              step="0.5"
              value={speed}
              onChange={(e) => onSpeedChange(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          {/* Generate Array Button */}
          <button
            onClick={onGenerateArray}
            disabled={isPlaying}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-200 dark:border-slate-700"
          >
            <Shuffle className="w-4 h-4" />
            <span>Generate New Array</span>
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="pt-5 border-t border-slate-100 dark:border-slate-800">
        <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
          Statistics
        </h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Comparisons
            </span>
            <span className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">
              {comparisons.toLocaleString()}
            </span>
          </div>
          {swaps !== undefined && (
            <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Swaps
              </span>
              <span className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">
                {swaps.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>

      {stateInfo && stateInfo.length > 0 && (
        <div className="pt-5 border-t border-slate-100 dark:border-slate-800">
          <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
            Algorithm State
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {stateInfo.map(({ label, value }) => (
              <div
                key={label}
                className="flex flex-col px-3 py-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800"
              >
                <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-0.5">
                  {label}
                </span>
                <span className="text-sm font-mono font-bold text-slate-900 dark:text-white tabular-nums truncate">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
