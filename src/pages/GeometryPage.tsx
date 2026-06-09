import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Shuffle } from 'lucide-react';
import Navbar from '../components/Navbar';
import GeometryVisualizer from '../components/GeometryVisualizer';
import CodePanel from '../components/CodePanel';
import PlaybackControls from '../components/PlaybackControls';
import { getCategoryRoute, type AlgorithmCategory } from '../algorithms/registry';
import { getGeometryAlgorithm, getDefaultGeometryAlgorithm } from '../algorithms/geometryRegistry';
import { soundEngine } from '../utils/sound';
import { algorithmSeo } from '../utils/seo';
import { useDarkMode, useSound, useSeo } from '../hooks';
import { useStepPlayback } from '../hooks/useStepPlayback';
import type { GeometryStep } from '../types';

const EMPTY_STEP: GeometryStep = {
  points: [],
  hull: [],
  activeLine: 0,
  highlights: {},
  operations: { comparisons: 0, hullSize: 0 },
};

function GeometryPage() {
  const { algorithm: algorithmParam } = useParams<{ algorithm: string }>();
  const navigate = useNavigate();

  const [category] = useState<AlgorithmCategory>('geometry');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(algorithmParam || getDefaultGeometryAlgorithm());
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
  } = useStepPlayback<GeometryStep>(EMPTY_STEP);

  useEffect(() => {
    if (algorithmParam && algorithmParam !== selectedAlgorithm) {
      setSelectedAlgorithm(algorithmParam);
    }
  }, [algorithmParam, selectedAlgorithm]);

  useEffect(() => {
    soundEngine.initialize();
  }, []);

  const handleGenerateProblem = useCallback(() => {
    const algorithm = getGeometryAlgorithm(selectedAlgorithm);
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
    if (currentStep.closed) {
      soundEngine.playSuccess();
    } else if (currentStep.highlights.rejected?.length) {
      soundEngine.playVisit();
    } else if (currentStep.highlights.current?.length) {
      soundEngine.playCompare();
    }
  }, [currentStepIndex, steps.length, currentStep, isSoundEnabled]);

  const handleCategoryChange = (newCategory: AlgorithmCategory) => {
    navigate(getCategoryRoute(newCategory));
  };

  const handleAlgorithmChange = (algo: string) => {
    setSelectedAlgorithm(algo);
    navigate(`/geometry/${algo}`);
  };

  const algorithm = getGeometryAlgorithm(selectedAlgorithm);

  useSeo(algorithmSeo('geometry', selectedAlgorithm, algorithm?.name));

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
        <h1 className="sr-only">{algorithm.name} – Interactive Convex Hull Visualization</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:h-[calc(100vh-140px)]">

          {/* Left: Visualizer + Playback */}
          <div className="lg:col-span-2 flex flex-col space-y-4 sm:space-y-6 lg:min-h-0 lg:overflow-y-auto">
            <GeometryVisualizer
              points={currentStep.points}
              hull={currentStep.hull}
              closed={currentStep.closed}
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
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Controls</h3>
                <div className="space-y-5">
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        Point Count
                      </label>
                      <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 tabular-nums">
                        {currentStep.points.length || problemSize * 2 + 4}
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
                    <span>New Point Set</span>
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
                    <span className="text-xs text-slate-500 dark:text-slate-400">Cross Products</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                      {operations.comparisons}
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-3 py-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Hull Size</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                      {operations.hullSize}
                    </span>
                  </div>
                </div>
              </div>

              {/* Algorithm State */}
              <div className="pt-5 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
                  Algorithm State
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide block mb-0.5">Step</span>
                    <span className="text-sm font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                      {currentStepIndex + 1} / {steps.length}
                    </span>
                  </div>
                  <div className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide block mb-0.5">
                      {selectedAlgorithm === 'jarvis' ? 'Start Point' : 'Pivot'}
                    </span>
                    <span className="text-sm font-mono font-bold text-slate-900 dark:text-white">
                      {metadata?.pivot !== undefined ? `#${metadata.pivot}` : '—'}
                    </span>
                  </div>
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

export default GeometryPage;
