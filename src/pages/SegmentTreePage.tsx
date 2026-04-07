import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Shuffle } from 'lucide-react';
import Navbar from '../components/Navbar';
import SegmentTreeVisualizer from '../components/SegmentTreeVisualizer';
import CodePanel from '../components/CodePanel';
import PlaybackControls from '../components/PlaybackControls';
import { getDefaultAlgorithm, type AlgorithmCategory } from '../algorithms/registry';
import { getSegmentTreeAlgorithm, getDefaultSegmentTreeAlgorithm } from '../algorithms/segmentTreeRegistry';
import { generateRandomArray } from '../utils/array';
import { soundEngine } from '../utils/sound';
import { useDarkMode, useSound } from '../hooks';
import type { SegmentTreeStep } from '../types';

const EMPTY_STEP: SegmentTreeStep = {
  nodes: [],
  sourceArray: [],
  activeLine: 0,
  phase: 'build',
  highlights: {},
  operations: { comparisons: 0, accesses: 0 },
};

function useSegmentTreePlayback() {
  const [steps, setSteps] = useState<SegmentTreeStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [playbackStatus, setPlaybackStatus] = useState<'idle' | 'playing' | 'paused' | 'finished'>('idle');
  const [playbackMode, setPlaybackMode] = useState<'continuous' | 'step'>('continuous');
  const [speed, setSpeed] = useState(1);

  const currentStep = steps[currentStepIndex] ?? EMPTY_STEP;
  const canStepForward = currentStepIndex < steps.length - 1;
  const canStepBackward = currentStepIndex > 0;

  const loadSteps = useCallback((newSteps: SegmentTreeStep[]) => {
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

function SegmentTreePage() {
  const { algorithm: algorithmParam } = useParams<{ algorithm: string }>();
  const navigate = useNavigate();

  const [category] = useState<AlgorithmCategory>('tree');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(algorithmParam || 'segment');
  const [arraySize, setArraySize] = useState(8);
  const [isDarkMode, setIsDarkMode] = useDarkMode();
  const [isSoundEnabled, setIsSoundEnabled] = useSound();
  const prevPhaseRef = useRef<string>('');

  const {
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
  } = useSegmentTreePlayback();

  useEffect(() => {
    if (algorithmParam && algorithmParam !== selectedAlgorithm) {
      setSelectedAlgorithm(algorithmParam);
    }
  }, [algorithmParam, selectedAlgorithm]);

  useEffect(() => {
    soundEngine.initialize();
  }, []);

  const handleGenerateArray = useCallback(() => {
    const algorithm = getSegmentTreeAlgorithm(selectedAlgorithm);
    if (algorithm) {
      const newArray = generateRandomArray(arraySize);
      loadSteps(algorithm.generateSteps(newArray));
    }
  }, [arraySize, selectedAlgorithm, loadSteps]);

  useEffect(() => {
    handleGenerateArray();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [arraySize, selectedAlgorithm]);

  // Sound effects
  useEffect(() => {
    if (!isSoundEnabled || currentStepIndex === 0 || steps.length === 0) return;
    const phase = currentStep.phase;
    if (phase !== prevPhaseRef.current) {
      prevPhaseRef.current = phase;
      soundEngine.playVisit();
    } else if (currentStep.highlights.inRange?.length) {
      soundEngine.playSuccess();
    } else if (currentStep.highlights.active?.length) {
      soundEngine.playCompare();
    }
  }, [currentStepIndex, steps.length, currentStep, isSoundEnabled]);

  const handleCategoryChange = (newCategory: AlgorithmCategory) => {
    const defaultAlgo = getDefaultAlgorithm(newCategory);
    if (newCategory === 'sorting') navigate(`/sorting/${defaultAlgo}`);
    else if (newCategory === 'searching') navigate(`/searching/${defaultAlgo}`);
    else if (newCategory === 'graph') navigate(`/graph/${defaultAlgo}`);
    else if (newCategory === 'tree') navigate(`/tree/${getDefaultSegmentTreeAlgorithm()}`);
  };

  const handleAlgorithmChange = (algo: string) => {
    setSelectedAlgorithm(algo);
    navigate(`/tree/${algo}`);
  };

  const algorithm = getSegmentTreeAlgorithm(selectedAlgorithm);
  if (!algorithm) return <div>Algorithm not found</div>;

  const { operations, phase, metadata } = currentStep;

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

          {/* Left: Visualizer + Playback */}
          <div className="lg:col-span-2 flex flex-col space-y-4 sm:space-y-6 lg:min-h-0 lg:overflow-y-auto">
            <SegmentTreeVisualizer
              nodes={currentStep.nodes}
              sourceArray={currentStep.sourceArray}
              highlights={currentStep.highlights}
              phase={phase}
              metadata={metadata}
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

          {/* Right: Controls + State + Code */}
          <div className="flex flex-col space-y-4 sm:space-y-6 lg:min-h-0 lg:overflow-y-auto lg:pr-1">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-soft p-5 sm:p-6 space-y-6">
              {/* Controls */}
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Controls</h3>
                <div className="space-y-5">
                  {/* Array size */}
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
                      min="4"
                      max="16"
                      step="1"
                      value={arraySize}
                      onChange={e => setArraySize(Number(e.target.value))}
                      disabled={playbackStatus === 'playing'}
                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-blue-500 disabled:opacity-40 disabled:cursor-not-allowed"
                    />
                  </div>

                  {/* Speed */}
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
                      max="5"
                      step="0.5"
                      value={speed}
                      onChange={e => setSpeed(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>

                  <button
                    onClick={handleGenerateArray}
                    disabled={playbackStatus === 'playing'}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <Shuffle className="w-4 h-4" />
                    <span>Generate New Array</span>
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="pt-5 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
                  Statistics
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center justify-between px-3 py-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Comparisons</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                      {operations.comparisons}
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-3 py-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Accesses</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                      {operations.accesses}
                    </span>
                  </div>
                </div>
              </div>

              {/* Algorithm State */}
              <div className="pt-5 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
                  Algorithm State
                </h4>
                <div className="space-y-2">
                  {/* Current phase */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide block mb-0.5">Phase</span>
                      <span className="text-sm font-mono font-bold text-slate-900 dark:text-white capitalize">
                        {phase}
                      </span>
                    </div>
                    <div className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide block mb-0.5">Step</span>
                      <span className="text-sm font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                        {currentStepIndex + 1} / {steps.length}
                      </span>
                    </div>
                  </div>

                  {/* Query info */}
                  {phase === 'query' && metadata?.queryRange && (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                          <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide block mb-0.5">Query L</span>
                          <span className="text-sm font-mono font-bold text-slate-900 dark:text-white">{metadata.queryRange[0]}</span>
                        </div>
                        <div className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                          <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide block mb-0.5">Query R</span>
                          <span className="text-sm font-mono font-bold text-slate-900 dark:text-white">{metadata.queryRange[1]}</span>
                        </div>
                      </div>
                      {metadata.queryResult !== undefined && (
                        <div className="px-3 py-2.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800">
                          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wide block mb-0.5">Result</span>
                          <span className="text-sm font-mono font-bold text-emerald-700 dark:text-emerald-300">{metadata.queryResult}</span>
                        </div>
                      )}
                    </>
                  )}

                  {/* Update info */}
                  {phase === 'update' && metadata?.updateIndex !== undefined && (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                        <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide block mb-0.5">Index</span>
                        <span className="text-sm font-mono font-bold text-slate-900 dark:text-white">{metadata.updateIndex}</span>
                      </div>
                      <div className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                        <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide block mb-0.5">New Val</span>
                        <span className="text-sm font-mono font-bold text-violet-700 dark:text-violet-300">{metadata.updateValue}</span>
                      </div>
                    </div>
                  )}

                  {/* Complexity info */}
                  <div className="mt-1">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-2 uppercase tracking-wide">
                      Complexity
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2">
                        <div className="text-xs text-slate-400 dark:text-slate-500 mb-0.5">Build</div>
                        <div className="text-sm font-mono font-semibold text-emerald-600 dark:text-emerald-400">O(n)</div>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2">
                        <div className="text-xs text-slate-400 dark:text-slate-500 mb-0.5">Query</div>
                        <div className="text-sm font-mono font-semibold text-amber-600 dark:text-amber-400">O(log n)</div>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2">
                        <div className="text-xs text-slate-400 dark:text-slate-500 mb-0.5">Update</div>
                        <div className="text-sm font-mono font-semibold text-red-600 dark:text-red-400">O(log n)</div>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2">
                        <div className="text-xs text-slate-400 dark:text-slate-500 mb-0.5">Space</div>
                        <div className="text-sm font-mono font-semibold text-blue-600 dark:text-blue-400">O(n)</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

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

export default SegmentTreePage;
