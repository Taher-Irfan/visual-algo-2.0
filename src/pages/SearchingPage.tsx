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
import { usePlaybackController, useDarkMode } from '../hooks';
import type { Step } from '../types';

function SearchingPage() {
  const { algorithm: algorithmParam } = useParams<{ algorithm: string }>();
  const navigate = useNavigate();
  
  const [category] = useState<AlgorithmCategory>('searching');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(algorithmParam || 'linear');
  const [arraySize, setArraySize] = useState(15);
  const [steps, setSteps] = useState<Step[]>([]);
  const [isDarkMode, setIsDarkMode] = useDarkMode();
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);

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

  // Update sound engine when sound toggle changes
  useEffect(() => {
    soundEngine.setEnabled(isSoundEnabled);
  }, [isSoundEnabled]);

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
    }
  };

  const handleAlgorithmChange = (algorithm: string) => {
    setSelectedAlgorithm(algorithm);
    navigate(`/searching/${algorithm}`);
  };

  const algorithm = getAlgorithm(category, selectedAlgorithm) || algorithms[selectedAlgorithm];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
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

      <main className="max-w-screen-2xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
          {/* Left Panel - Visualizer (2/3 width on large screens) */}
          <div className="lg:col-span-2 flex flex-col space-y-6">
            <SearchingVisualizer
              array={currentStep.array}
              highlights={currentStep.highlights}
              metadata={currentStep.metadata}
            />
            
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-soft p-6">
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
          <div className="flex flex-col space-y-6">
            <ControlPanel
              arraySize={arraySize}
              speed={speed}
              comparisons={currentStep.operations.comparisons}
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
