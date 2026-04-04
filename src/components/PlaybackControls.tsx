import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  StepForward,
} from 'lucide-react';

interface PlaybackControlsProps {
  playbackStatus: 'idle' | 'playing' | 'paused' | 'finished';
  playbackMode: 'continuous' | 'step';
  onPlay: () => void;
  onPause: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onReplay: () => void;
  onModeChange: (mode: 'continuous' | 'step') => void;
  canStepForward: boolean;
  canStepBackward: boolean;
}

export default function PlaybackControls({
  playbackStatus,
  playbackMode,
  onPlay,
  onPause,
  onStepForward,
  onStepBackward,
  onReplay,
  onModeChange,
  canStepForward,
  canStepBackward,
}: PlaybackControlsProps) {
  const isPlaying = playbackStatus === 'playing';
  const isFinished = playbackStatus === 'finished';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center space-x-2 bg-gray-50 dark:bg-gray-800 rounded-lg p-1">
        <button
          onClick={() => onModeChange('continuous')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            playbackMode === 'continuous'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Continuous
        </button>
        <button
          onClick={() => onModeChange('step')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            playbackMode === 'step'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <div className="flex items-center justify-center space-x-1">
            <StepForward className="w-4 h-4" />
            <span>Step Mode</span>
          </div>
        </button>
      </div>

      <div className="flex items-center justify-center space-x-2">
        <button
          onClick={onReplay}
          disabled={!canStepBackward && !canStepForward}
          className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500"
          aria-label="Replay"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        <button
          onClick={onStepBackward}
          disabled={!canStepBackward}
          className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500"
          aria-label="Step backward"
        >
          <SkipBack className="w-5 h-5" />
        </button>

        {playbackMode === 'continuous' ? (
          <button
            onClick={isPlaying ? onPause : onPlay}
            disabled={isFinished || !canStepForward}
            className="p-4 rounded-lg bg-primary-500 hover:bg-primary-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 shadow-lg"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6" />
            )}
          </button>
        ) : (
          <button
            onClick={onStepForward}
            disabled={!canStepForward}
            className="p-4 rounded-lg bg-primary-500 hover:bg-primary-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 shadow-lg"
            aria-label="Step forward"
          >
            <SkipForward className="w-6 h-6" />
          </button>
        )}

        <button
          onClick={onStepForward}
          disabled={!canStepForward}
          className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500"
          aria-label="Step forward"
        >
          <SkipForward className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
