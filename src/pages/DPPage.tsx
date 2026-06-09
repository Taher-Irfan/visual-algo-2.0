import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Shuffle } from 'lucide-react';
import Navbar from '../components/Navbar';
import DPVisualizer from '../components/DPVisualizer';
import CodePanel from '../components/CodePanel';
import PlaybackControls from '../components/PlaybackControls';
import { getDefaultAlgorithm, type AlgorithmCategory } from '../algorithms/registry';
import { getDPAlgorithm, getDefaultDPAlgorithm } from '../algorithms/dpRegistry';
import { soundEngine } from '../utils/sound';
import { useDarkMode, useSound } from '../hooks';
import type { DPStep } from '../types';

const EMPTY_STEP: DPStep = {
  table: [],
  rowLabels: [],
  colLabels: [],
  activeLine: 0,
  highlights: {},
  operations: { cellsFilled: 0, comparisons: 0 },
};

function useDPPlayback() {
  const [steps, setSteps] = useState<DPStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [playbackStatus, setPlaybackStatus] = useState<'idle' | 'playing' | 'paused' | 'finished'>('idle');
  const [playbackMode, setPlaybackMode] = useState<'continuous' | 'step'>('continuous');
  const [speed, setSpeed] = useState(1);

  const currentStep = steps[currentStepIndex] ?? EMPTY_STEP;
  const canStepForward = currentStepIndex < steps.length - 1;
  const canStepBackward = currentStepIndex > 0;

  const loadSteps = useCallback((newSteps: DPStep[]) => {
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

function DPPage() {
  const { algorithm: algorithmParam } = useParams<{ algorithm: string }>();
  const navigate = useNavigate();

  const [category] = useState<AlgorithmCategory>('dp');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(algorithmParam || getDefaultDPAlgorithm());
  const [problemSize, setProblemSize] = useState(8);
  const [isDarkMode, setIsDarkMode] = useDarkMode();
  const [isSoundEnabled, setIsSoundEnabled] = useSound();

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
  } = useDPPlayback();

  useEffect(() => {
    if (algorithmParam && algorithmParam !== selectedAlgorithm) {
      setSelectedAlgorithm(algorithmParam);
    }
  }, [algorithmParam, selectedAlgorithm]);

  useEffect(() => {
    soundEngine.initialize();
  }, []);

  const handleGenerateProblem = useCallback(() => {
    const algorithm = getDPAlgorithm(selectedAlgorithm);
    if (algorithm) {
      loadSteps(algorithm.generateSteps(problemSize));
    }
  }, [problemSize, selectedAlgorithm, loadSteps]);

  useEffect(() => {
    handleGenerateProblem();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problemSize, selectedAlgorithm]);

  // Sound effects driven by step highlights
  useEffect(() => {
    if (!isSoundEnabled || currentStepIndex === 0 || steps.length === 0) return;
    if (currentStep.highlights.result?.length) {
      soundEngine.playSuccess();
    } else if (currentStep.highlights.sources?.length) {
      soundEngine.playCompare();
    } else if (currentStep.highlights.current?.length) {
      soundEngine.playVisit();
    }
  }, [currentStepIndex, steps.length, currentStep.highlights, isSoundEnabled]);

  const handleCategoryChange = (newCategory: AlgorithmCategory) => {
    const defaultAlgo = getDefaultAlgorithm(newCategory);
    if (newCategory === 'sorting') navigate(`/sorting/${defaultAlgo}`);
    else if (newCategory === 'searching') navigate(`/searching/${defaultAlgo}`);
    else if (newCategory === 'graph') navigate(`/graph/${defaultAlgo}`);
    else if (newCategory === 'tree') navigate('/tree/segment');
    else if (newCategory === 'dp') navigate(`/dp/${getDefaultDPAlgorithm()}`);
  };

  const handleAlgorithmChange = (algo: string) => {
    setSelectedAlgorithm(algo);
    navigate(`/dp/${algo}`);
  };

  const algorithm = getDPAlgorithm(selectedAlgorithm);
  if (!algorithm) return <div>Algorithm not found</div>;

  const { operations, metadata } = currentStep;

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
            <DPVisualizer
              table={currentStep.table}
              rowLabels={currentStep.rowLabels}
              colLabels={currentStep.colLabels}
              highlights={currentStep.highlights}
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
                  {/* Problem size */}
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        Problem Size
                      </label>
                      <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 tabular-nums">
                        {problemSize}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="4"
                      max="12"
                      step="1"
                      value={problemSize}
                      onChange={e => setProblemSize(Number(e.target.value))}
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
                    onClick={handleGenerateProblem}
                    disabled={playbackStatus === 'playing'}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <Shuffle className="w-4 h-4" />
                    <span>Generate New Problem</span>
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
                    <span className="text-xs text-slate-500 dark:text-slate-400">Cells Filled</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                      {operations.cellsFilled}
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-3 py-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Comparisons</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                      {operations.comparisons}
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
                  <div className="grid grid-cols-2 gap-2">
                    <div className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide block mb-0.5">Step</span>
                      <span className="text-sm font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                        {currentStepIndex + 1} / {steps.length}
                      </span>
                    </div>
                    <div className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide block mb-0.5">Cell</span>
                      <span className="text-sm font-mono font-bold text-slate-900 dark:text-white">
                        {metadata?.i !== undefined && metadata?.j !== undefined
                          ? `[${metadata.i}, ${metadata.j}]`
                          : metadata?.i !== undefined
                          ? `[${metadata.i}]`
                          : '—'}
                      </span>
                    </div>
                  </div>

                  {/* Problem inputs */}
                  {(metadata?.inputA || metadata?.inputArray || metadata?.weights) && (
                    <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1.5 uppercase tracking-wide">
                        Problem Input
                      </span>
                      <div className="text-xs font-mono text-slate-900 dark:text-white space-y-0.5">
                        {metadata.inputA && (
                          <div className="flex justify-between">
                            <span className="text-slate-500 dark:text-slate-400">String A</span>
                            <span className="font-bold">{metadata.inputA}</span>
                          </div>
                        )}
                        {metadata.inputB && (
                          <div className="flex justify-between">
                            <span className="text-slate-500 dark:text-slate-400">String B</span>
                            <span className="font-bold">{metadata.inputB}</span>
                          </div>
                        )}
                        {metadata.inputArray && (
                          <div className="flex justify-between gap-2">
                            <span className="text-slate-500 dark:text-slate-400 shrink-0">Array</span>
                            <span className="font-bold text-right">[{metadata.inputArray.join(', ')}]</span>
                          </div>
                        )}
                        {metadata.weights && (
                          <div className="flex justify-between">
                            <span className="text-slate-500 dark:text-slate-400">Weights</span>
                            <span className="font-bold">[{metadata.weights.join(', ')}]</span>
                          </div>
                        )}
                        {metadata.values && (
                          <div className="flex justify-between">
                            <span className="text-slate-500 dark:text-slate-400">Values</span>
                            <span className="font-bold">[{metadata.values.join(', ')}]</span>
                          </div>
                        )}
                        {metadata.capacity !== undefined && (
                          <div className="flex justify-between">
                            <span className="text-slate-500 dark:text-slate-400">Capacity</span>
                            <span className="font-bold">{metadata.capacity}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Final result */}
                  {metadata?.finalResult !== undefined && (
                    <div className="px-3 py-2.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800">
                      <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wide block mb-0.5">Result</span>
                      <span className="text-sm font-mono font-bold text-emerald-700 dark:text-emerald-300">
                        {metadata.finalResult}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

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

export default DPPage;
