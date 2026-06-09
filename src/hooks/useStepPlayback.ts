import { useState, useEffect, useCallback } from 'react';
import type { PlaybackMode, PlaybackStatus } from '../types';

/**
 * Generic precomputed-step playback controller, shared by the String and
 * Puzzle pages (same behavior as the per-page controllers used elsewhere).
 */
export function useStepPlayback<T>(emptyStep: T) {
  const [steps, setSteps] = useState<T[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [playbackStatus, setPlaybackStatus] = useState<PlaybackStatus>('idle');
  const [playbackMode, setPlaybackMode] = useState<PlaybackMode>('continuous');
  const [speed, setSpeed] = useState(1);

  const currentStep = steps[currentStepIndex] ?? emptyStep;
  const canStepForward = currentStepIndex < steps.length - 1;
  const canStepBackward = currentStepIndex > 0;

  const loadSteps = useCallback((newSteps: T[]) => {
    setSteps(newSteps);
    setCurrentStepIndex(0);
    setPlaybackStatus('idle');
  }, []);

  useEffect(() => {
    if (playbackStatus !== 'playing' || playbackMode !== 'continuous') return;
    const interval = setInterval(() => {
      setCurrentStepIndex(prev => {
        if (prev >= steps.length - 1) {
          setPlaybackStatus('finished');
          return prev;
        }
        return prev + 1;
      });
    }, 1000 / speed);
    return () => clearInterval(interval);
  }, [playbackStatus, playbackMode, speed, steps.length]);

  const play = useCallback(() => {
    if (currentStepIndex >= steps.length - 1) setCurrentStepIndex(0);
    setPlaybackStatus('playing');
  }, [currentStepIndex, steps.length]);

  const pause = useCallback(() => setPlaybackStatus('paused'), []);

  const stepForward = useCallback(() => {
    if (canStepForward) {
      setCurrentStepIndex(p => p + 1);
      setPlaybackStatus('paused');
    }
  }, [canStepForward]);

  const stepBackward = useCallback(() => {
    if (canStepBackward) {
      setCurrentStepIndex(p => p - 1);
      setPlaybackStatus('paused');
    }
  }, [canStepBackward]);

  const replay = useCallback(() => {
    setCurrentStepIndex(0);
    setPlaybackStatus('idle');
  }, []);

  return {
    steps,
    loadSteps,
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
