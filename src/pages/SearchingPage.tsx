import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import SearchingVisualizer from '../components/SearchingVisualizer';
import ControlPanel from '../components/ControlPanel';
import CodePanel from '../components/CodePanel';
import PlaybackControls from '../components/PlaybackControls';
import { algorithms, getAlgorithm, getDefaultAlgorithm, type AlgorithmCategory } from '../algorithms';
import { generateRandomArray } from '../utils/array';
import { soundEngine } from '../utils/sound';
import { usePlaybackController, useDarkMode, useSound } from '../hooks';
import type { Step } from '../types';

function SearchingPage() {
  const { algorithm: algorithmParam } = useParams<{ algorithm: string }>();
  const navigate = useNavigate();
  
  const [category] = useState<AlgorithmCategory>('searching');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(algorithmParam || 'linear');
  const [arraySize, setArraySize] = useState(15);
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

    if (currentStep.highlights.sorted?.length) {
      soundEngine.playSuccess(); // Element found
    } else if (currentStep.highlights.comparing?.length) {
      soundEngine.playCompare(); // Comparing elements
    }
  }, [currentStepIndex, steps.length, currentStep.highlights]);

  const handleCategoryChange = (newCategory: AlgorithmCategory) => {
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
    navigate(`/searching/${algorithm}`);
  };

  const algorithm = getAlgorithm(category, selectedAlgorithm) || algorithms[selectedAlgorithm];

  const stateInfo = (() => {
    const meta = currentStep.metadata;
    if (!meta) return undefined;
    const items: { label: string; value: string | number }[] = [];
    if (meta.target !== undefined) items.push({ label: 'target', value: meta.target });
    if (meta.currentIndex !== undefined) items.push({ label: 'i', value: meta.currentIndex });
    if (meta.searchRange !== undefined) {
      items.push({ label: 'left', value: meta.searchRange.left });
      items.push({ label: 'right', value: meta.searchRange.right });
      if (meta.searchRange.mid !== undefined) items.push({ label: 'mid', value: meta.searchRange.mid });
    }
    if (meta.found !== undefined) items.push({ label: 'found', value: meta.found ? 'true' : 'false' });
    if (meta.foundIndex !== undefined && meta.foundIndex !== -1) items.push({ label: 'index', value: meta.foundIndex });
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
            <SearchingVisualizer
              array={currentStep.array}
              highlights={currentStep.highlights}
              metadata={currentStep.metadata}
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
              stateInfo={stateInfo}
              onArraySizeChange={setArraySize}
              onSpeedChange={(newSpeed) => setSpeed(newSpeed)}
              onGenerateArray={handleGenerateArray}
              isPlaying={playbackStatus === 'playing'}
            />

            <CodePanel
              code={algorithm.code}
              activeLine={currentStep.activeLine}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default SearchingPage;
