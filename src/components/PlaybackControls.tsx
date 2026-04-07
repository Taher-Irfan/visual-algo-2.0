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
      {/* Mode Toggle */}
      <div className="flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 gap-1">
        <button
          onClick={() => onModeChange('continuous')}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            playbackMode === 'continuous'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Continuous
        </button>
        <button
          onClick={() => onModeChange('step')}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            playbackMode === 'step'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <div className="flex items-center justify-center space-x-1.5">
            <StepForward className="w-3.5 h-3.5" />
            <span>Step Mode</span>
          </div>
        </button>
      </div>

      {/* Playback Buttons */}
      <div className="flex items-center justify-center space-x-2">
        {/* Replay */}
        <button
          onClick={onReplay}
          disabled={!canStepBackward && !canStepForward}
          className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Replay"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        {/* Step Backward */}
        <button
          onClick={onStepBackward}
          disabled={!canStepBackward}
          className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Step backward"
        >
          <SkipBack className="w-5 h-5" />
        </button>

        {/* Primary: Play/Pause or Step Forward */}
        {playbackMode === 'continuous' ? (
          <button
            onClick={isPlaying ? onPause : onPlay}
            disabled={isFinished || !canStepForward}
            className="p-4 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
            className="p-4 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Step forward"
          >
            <SkipForward className="w-6 h-6" />
          </button>
        )}

        {/* Step Forward */}
        <button
          onClick={onStepForward}
          disabled={!canStepForward}
          className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Step forward"
        >
          <SkipForward className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
