import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Visualizer from '../components/Visualizer';
import ControlPanel from '../components/ControlPanel';
import CodePanel from '../components/CodePanel';
import PlaybackControls from '../components/PlaybackControls';
import { algorithms, getAlgorithm, getDefaultAlgorithm, type AlgorithmCategory } from '../algorithms';
import { generateRandomArray } from '../utils/array';
import { soundEngine } from '../utils/sound';
import { usePlaybackController, useDarkMode, useSound } from '../hooks';
import type { Step } from '../types';

function SortingPage() {
  const { algorithm: algorithmParam } = useParams<{ algorithm: string }>();
  const navigate = useNavigate();
  
  const [category, setCategory] = useState<AlgorithmCategory>('sorting');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(algorithmParam || 'bubble');
  const [arraySize, setArraySize] = useState(50);
  const [steps, setSteps] = useState<Step[]>([]);
  const [isDarkMode, setIsDarkMode] = useDarkMode();
  const [isSoundEnabled, setIsSoundEnabled] = useSound();

  // Use custom playback controller hook
  const {
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
  } = usePlaybackController({ steps });

  // Sync algorithm with URL
  useEffect(() => {
    if (algorithmParam && algorithmParam !== selectedAlgorithm) {
      setSelectedAlgorithm(algorithmParam);
    }
  }, [algorithmParam, selectedAlgorithm]);

  // Initialize sound engine
  useEffect(() => {
    soundEngine.initialize();
  }, []);

  // Generate array and steps
  const handleGenerateArray = useCallback(() => {
    const newArray = generateRandomArray(arraySize);
    const algorithm = getAlgorithm(category, selectedAlgorithm) || algorithms[selectedAlgorithm];
    if (algorithm) {
      const newSteps = algorithm.generateSteps(newArray);
      setSteps(newSteps);
    }
  }, [arraySize, selectedAlgorithm, category]);

  // Reset when algorithm or array size changes
  useEffect(() => {
    handleGenerateArray();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [arraySize, selectedAlgorithm]);

  // Play sounds based on step highlights
  useEffect(() => {
    if (currentStepIndex === 0 || steps.length === 0) return;

    if (currentStep.highlights.swapping?.length) {
      soundEngine.playSwap();
    } else if (currentStep.highlights.comparing?.length) {
      soundEngine.playCompare();
    }
  }, [currentStepIndex, steps.length, currentStep.highlights]);

  const handleCategoryChange = (newCategory: AlgorithmCategory) => {
    setCategory(newCategory);
    const defaultAlgo = getDefaultAlgorithm(newCategory);
    setSelectedAlgorithm(defaultAlgo);
    
    if (newCategory === 'sorting') {
      navigate(`/sorting/${defaultAlgo}`);
    } else if (newCategory === 'searching') {
      navigate(`/searching/${defaultAlgo}`);
    } else if (newCategory === 'graph') {
      navigate(`/graph/${defaultAlgo}`);
    } else if (newCategory === 'tree') {
      navigate('/tree/segment');
    }
  };

  const handleAlgorithmChange = (algorithm: string) => {
    setSelectedAlgorithm(algorithm);
    navigate(`/sorting/${algorithm}`);
  };

  const algorithm = getAlgorithm(category, selectedAlgorithm) || algorithms[selectedAlgorithm];

  const stateInfo = (() => {
    const meta = currentStep.metadata;
    if (!meta) return undefined;
    const items: { label: string; value: string | number }[] = [];
    switch (selectedAlgorithm) {
      case 'bubble':
        if (meta.i !== undefined) items.push({ label: 'i', value: meta.i });
        if (meta.j !== undefined) items.push({ label: 'j', value: meta.j });
        break;
      case 'selection':
        if (meta.i !== undefined) items.push({ label: 'i', value: meta.i });
        if (meta.j !== undefined) items.push({ label: 'j', value: meta.j });
        if (meta.minIdx !== undefined) items.push({ label: 'minIdx', value: meta.minIdx });
        break;
      case 'insertion':
        if (meta.i !== undefined) items.push({ label: 'i', value: meta.i });
        if (meta.j !== undefined) items.push({ label: 'j', value: meta.j });
        if (meta.key !== undefined) items.push({ label: 'key', value: meta.key });
        break;
      case 'merge':
        if (meta.l !== undefined) items.push({ label: 'l', value: meta.l });
        if (meta.r !== undefined) items.push({ label: 'r', value: meta.r });
        if (meta.m !== undefined) items.push({ label: 'm', value: meta.m });
        if (meta.i !== undefined) items.push({ label: 'i', value: meta.i });
        if (meta.j !== undefined) items.push({ label: 'j', value: meta.j });
        if (meta.k !== undefined) items.push({ label: 'k', value: meta.k });
        break;
      case 'quick':
        if (meta.low !== undefined) items.push({ label: 'low', value: meta.low });
        if (meta.high !== undefined) items.push({ label: 'high', value: meta.high });
        if (meta.pivot !== undefined) items.push({ label: 'pivot', value: meta.pivot });
        if (meta.i !== undefined) items.push({ label: 'i', value: meta.i });
        if (meta.j !== undefined) items.push({ label: 'j', value: meta.j });
        break;
    }
    return items.length > 0 ? items : undefined;
  })();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 transition-colors">
      <Navbar
        category={category}
        selectedAlgorithm={selectedAlgorithm}
        onCategoryChange={handleCategoryChange}
        onAlgorithmChange={handleAlgorithmChange}
        isDarkMode={isDarkMode}
        onDarkModeToggle={() => setIsDarkMode(!isDarkMode)}
        isSoundEnabled={isSoundEnabled}
        onSoundToggle={() => setIsSoundEnabled(!isSoundEnabled)}
      />

      <main className="max-w-screen-2xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:h-[calc(100vh-140px)]">
          {/* Left Panel - Visualizer (2/3 width on large screens) */}
          <div className="lg:col-span-2 flex flex-col space-y-4 sm:space-y-6">
            <Visualizer
              array={currentStep.array}
              highlights={currentStep.highlights}
            />

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-soft p-5 sm:p-6">
              <PlaybackControls
                playbackStatus={playbackStatus}
                playbackMode={playbackMode}
                onPlay={play}
                onPause={pause}
                onStepForward={stepForward}
                onStepBackward={stepBackward}
                onReplay={replay}
                onModeChange={setPlaybackMode}
                canStepForward={canStepForward}
                canStepBackward={canStepBackward}
              />
            </div>
          </div>

          {/* Right Panel - Controls + Code (1/3 width on large screens) */}
          <div className="flex flex-col space-y-4 sm:space-y-6">
            <ControlPanel
              arraySize={arraySize}
              speed={speed}
              comparisons={currentStep.operations.comparisons}
              swaps={currentStep.operations.swaps}
              stateInfo={stateInfo}
              onArraySizeChange={setArraySize}
              onSpeedChange={(newSpeed) => setSpeed(newSpeed)}
              onGenerateArray={handleGenerateArray}
              isPlaying={playbackStatus === 'playing'}
            />

            <CodePanel
              code={algorithm.code}
              activeLine={currentStep.activeLine}
              complexity={algorithm.complexity}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default SortingPage;
