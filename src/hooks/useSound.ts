import { useState, useEffect } from 'react';
import { soundEngine } from '../utils/sound';

const SOUND_KEY = 'algo-visualizer-sound-enabled';

export function useSound() {
  const [isSoundEnabled, setIsSoundEnabled] = useState(() => {
    const saved = localStorage.getItem(SOUND_KEY);
    return saved ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem(SOUND_KEY, JSON.stringify(isSoundEnabled));
    soundEngine.setEnabled(isSoundEnabled);
  }, [isSoundEnabled]);

  return [isSoundEnabled, setIsSoundEnabled] as const;
}
