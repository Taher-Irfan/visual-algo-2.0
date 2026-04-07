import { useState, useEffect, useCallback } from 'react';
import type { Step, PlaybackMode, PlaybackStatus } from '../types';

interface UsePlaybackControllerProps {
  steps: Step[];
  onStepChange?: (stepIndex: number) => void;
}

interface UsePlaybackControllerReturn {
  currentStep: Step;
  currentStepIndex: number;
  playbackStatus: PlaybackStatus;
  playbackMode: PlaybackMode;
  speed: number;
  canStepForward: boolean;
  canStepBackward: boolean;
  play: () => void;
  pause: () => void;
  stepForward: () => void;
  stepBackward: () => void;
  replay: () => void;
  setPlaybackMode: (mode: PlaybackMode) => void;
  setSpeed: (speed: number) => void;
}

/**
 * Custom hook for managing algorithm visualization playback
 * 
 * Features:
 * - Play/Pause in continuous mode with configurable speed
 * - Manual step forward/backward navigation
 * - Replay from beginning
 * - Step mode (manual stepping only)
 * - Automatic overflow prevention
 * 
 * @param steps - Array of visualization steps
 * @param onStepChange - Optional callback when step index changes
 */
export function usePlaybackController({
  steps,
  onStepChange,
}: UsePlaybackControllerProps): UsePlaybackControllerReturn {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [playbackStatus, setPlaybackStatus] = useState<PlaybackStatus>('idle');
  const [playbackMode, setPlaybackMode] = useState<PlaybackMode>('continuous');
  const [speed, setSpeed] = useState(5);

  // Default empty step
  const defaultStep: Step = {
    array: [],
    activeLine: 0,
    highlights: {},
    operations: { comparisons: 0, swaps: 0 },
  };

  const currentStep = steps[currentStepIndex] || defaultStep;

  // Check if we can move forward/backward
  const canStepForward = currentStepIndex < steps.length - 1;
  const canStepBackward = currentStepIndex > 0;

  // Reset to beginning when steps change
  // This is intentional - we want to reset state when steps array changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentStepIndex(0);
    setPlaybackStatus('idle');
  }, [steps]);

  // Notify parent of step changes
  useEffect(() => {
    if (onStepChange) {
      onStepChange(currentStepIndex);
    }
  }, [currentStepIndex, onStepChange]);

  /**
   * Move to next step
   * Prevents overflow beyond last step
   */
  const stepForward = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
      
      // Mark as finished if we reached the last step
      if (currentStepIndex + 1 === steps.length - 1) {
        setPlaybackStatus('finished');
      }
    }
  }, [currentStepIndex, steps.length]);

  /**
   * Move to previous step
   * Prevents overflow below first step
   */
  const stepBackward = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
      
      // If we were finished, change to paused when going back
      if (playbackStatus === 'finished') {
        setPlaybackStatus('paused');
      }
    }
  }, [currentStepIndex, playbackStatus]);

  /**
   * Start continuous playback
   * Only works if not at the end
   */
  const play = useCallback(() => {
    if (steps.length === 0 || currentStepIndex >= steps.length - 1) return;
    setPlaybackStatus('playing');
  }, [steps.length, currentStepIndex]);

  /**
   * Pause continuous playback
   */
  const pause = useCallback(() => {
    setPlaybackStatus('paused');
  }, []);

  /**
   * Reset to beginning
   */
  const replay = useCallback(() => {
    setCurrentStepIndex(0);
    setPlaybackStatus('idle');
  }, []);

  // Continuous mode playback effect
  useEffect(() => {
    // Only run in continuous mode when playing
    if (playbackStatus !== 'playing' || playbackMode !== 'continuous') {
      return;
    }

    // Calculate delay based on speed (speed 1 = 1 step per second)
    const delay = 1000 / speed;

    const timer = setTimeout(() => {
      if (currentStepIndex < steps.length - 1) {
        stepForward();
      } else {
        // Reached the end
        setPlaybackStatus('finished');
      }
    }, delay);

    // Cleanup timer on unmount or when dependencies change
    return () => clearTimeout(timer);
  }, [playbackStatus, playbackMode, currentStepIndex, steps.length, speed, stepForward]);

  return {
    currentStep,
    currentStepIndex,
    playbackStatus,
    playbackMode,
    speed,
    canStepForward,
    canStepBackward,
    play,
    pause,
    stepForward,
    stepBackward,
    replay,
    setPlaybackMode,
    setSpeed,
  };
}
