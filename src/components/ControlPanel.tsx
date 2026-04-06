import { Shuffle } from 'lucide-react';

interface ControlPanelProps {
  arraySize: number;
  speed: number;
  comparisons: number;
  swaps?: number;
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
  onArraySizeChange,
  onSpeedChange,
  onGenerateArray,
  isPlaying,
}: ControlPanelProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-soft p-4 sm:p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Controls
        </h3>

        <div className="space-y-6">
          {/* Array Size Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Array Size
              </label>
              <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
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
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Speed Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Speed
              </label>
              <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                {speed}x
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="15"
              step="0.5"
              value={speed}
              onChange={(e) => onSpeedChange(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
            />
          </div>

          {/* Generate Array Button */}
          <button
            onClick={onGenerateArray}
            disabled={isPlaying}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <Shuffle className="w-5 h-5" />
            <span>Generate New Array</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Statistics
        </h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Comparisons
            </span>
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {comparisons}
            </span>
          </div>
          {swaps !== undefined && (
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Swaps
              </span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {swaps}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
