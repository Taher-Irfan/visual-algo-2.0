import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Play, Pause, RotateCcw, Trophy, Share2, Check } from 'lucide-react';
import Navbar from '../components/Navbar';
import { getCategoryRoute, getAlgorithmsByCategory, type AlgorithmCategory } from '../algorithms/registry';
import { generateSeededArray } from '../utils/array';
import { SITE_NAME, SITE_URL } from '../utils/seo';
import { useDarkMode, useSound, useSeo } from '../hooks';
import type { Step } from '../types';

interface Lane {
  id: string;
  name: string;
  steps: Step[];
}

type RaceStatus = 'idle' | 'racing' | 'paused' | 'finished';

const DEFAULT_SELECTION = ['bubble', 'insertion', 'quick', 'merge'];
const MAX_LANES = 6;
const MIN_LANES = 2;
const TICK_MS = 50;

const MEDALS = ['🥇', '🥈', '🥉', '4th', '5th', '6th'];

/** Compact bar chart for one race lane (slimmer than the main Visualizer). */
function MiniBars({ step, finished }: { step: Step; finished: boolean }) {
  const maxValue = Math.max(...step.array, 1);

  const barColor = (index: number): string => {
    if (finished || step.highlights.sorted?.includes(index)) return 'bg-emerald-400';
    if (step.highlights.swapping?.includes(index)) return 'bg-rose-500';
    if (step.highlights.comparing?.includes(index)) return 'bg-yellow-400';
    return 'bg-violet-500';
  };

  return (
    <div className="h-28 sm:h-32 flex items-end gap-px bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2 border border-slate-100 dark:border-slate-700/50">
      {step.array.map((value, index) => (
        <div
          key={index}
          className={`flex-1 rounded-t-sm transition-colors duration-100 ${barColor(index)}`}
          style={{ height: `${(value / maxValue) * 100}%`, minHeight: '2px' }}
        />
      ))}
    </div>
  );
}

function RacePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [isDarkMode, setIsDarkMode] = useDarkMode();
  const [isSoundEnabled, setIsSoundEnabled] = useSound();

  // A shared link preloads competitors, array size, and the exact array seed
  const validSortIds = useMemo(
    () => new Set(Object.keys(getAlgorithmsByCategory('sorting'))),
    []
  );
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    const fromUrl = searchParams.get('algos')?.split(',').filter(id => validSortIds.has(id)) ?? [];
    return fromUrl.length >= MIN_LANES ? fromUrl.slice(0, MAX_LANES) : DEFAULT_SELECTION;
  });
  const [arraySize, setArraySize] = useState(() => {
    const fromUrl = Number(searchParams.get('size'));
    return Number.isFinite(fromUrl) && fromUrl >= 10 && fromUrl <= 60 ? Math.round(fromUrl / 5) * 5 : 40;
  });
  const pendingSeedRef = useRef<number | null>(
    /^\d+$/.test(searchParams.get('seed') ?? '') ? Number(searchParams.get('seed')) : null
  );
  // Mirrors whether a shared seed is waiting; refs must not be read in render
  const [isSharedRace, setIsSharedRace] = useState(() => /^\d+$/.test(searchParams.get('seed') ?? ''));

  const [speed, setSpeed] = useState(5);
  const [status, setStatus] = useState<RaceStatus>('idle');
  const [lanes, setLanes] = useState<Lane[]>([]);
  const [tick, setTick] = useState(0);
  const [lastSeed, setLastSeed] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  useSeo({
    title: `Sorting Algorithm Race – Compare Algorithms Side by Side | ${SITE_NAME}`,
    description:
      'Race sorting algorithms against each other on the same array and watch them compete live. Compare Bubble, Quick, Merge, Heap and more, with step counts, comparisons, and finish order.',
    path: '/race',
  });

  const sortingAlgorithms = useMemo(() => Object.values(getAlgorithmsByCategory('sorting')), []);

  const toggleAlgorithm = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.length > MIN_LANES ? prev.filter(x => x !== id) : prev;
      }
      return prev.length < MAX_LANES ? [...prev, id] : prev;
    });
  };

  const startRace = useCallback(() => {
    // A pending seed (from a shared link) reproduces the exact same race once
    const seed = pendingSeedRef.current ?? Math.floor(Math.random() * 1_000_000_000);
    pendingSeedRef.current = null;
    setIsSharedRace(false);
    setLastSeed(seed);
    setCopied(false);

    const array = generateSeededArray(arraySize, seed);
    const newLanes: Lane[] = selectedIds
      .map(id => sortingAlgorithms.find(a => a.id === id))
      .filter((a): a is NonNullable<typeof a> => a !== undefined)
      .map(algo => ({
        id: algo.id,
        name: algo.name,
        steps: algo.generateSteps([...array]),
      }));
    setLanes(newLanes);
    setTick(0);
    setStatus('racing');
  }, [arraySize, selectedIds, sortingAlgorithms]);

  const resetRace = () => {
    setStatus('idle');
    setLanes([]);
    setTick(0);
    setLastSeed(null);
    setCopied(false);
  };

  const shareRace = useCallback(() => {
    if (lastSeed === null) return;
    const url = `${SITE_URL}/race?algos=${selectedIds.join(',')}&size=${arraySize}&seed=${lastSeed}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }, [lastSeed, selectedIds, arraySize]);

  const maxSteps = useMemo(
    () => lanes.reduce((mx, lane) => Math.max(mx, lane.steps.length), 0),
    [lanes]
  );

  // Advance the shared race clock
  useEffect(() => {
    if (status !== 'racing') return;
    const interval = setInterval(() => {
      setTick(prev => {
        const next = prev + Math.max(1, Math.round(speed * 2));
        if (next >= maxSteps - 1) {
          setStatus('finished');
          return maxSteps - 1;
        }
        return next;
      });
    }, TICK_MS);
    return () => clearInterval(interval);
  }, [status, speed, maxSteps]);

  // Finish order: fewer steps = earlier finish on the shared clock
  const placements = useMemo(() => {
    const order = [...lanes].sort((a, b) => a.steps.length - b.steps.length);
    const map: Record<string, number> = {};
    order.forEach((lane, i) => {
      map[lane.id] = i;
    });
    return map;
  }, [lanes]);

  const winner = useMemo(() => {
    if (lanes.length === 0) return undefined;
    return [...lanes].sort((a, b) => a.steps.length - b.steps.length)[0];
  }, [lanes]);

  const handleCategoryChange = (newCategory: AlgorithmCategory) => {
    navigate(getCategoryRoute(newCategory));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 transition-colors">
      <Navbar
        category="race"
        selectedAlgorithm=""
        onCategoryChange={handleCategoryChange}
        onAlgorithmChange={() => {}}
        isDarkMode={isDarkMode}
        onDarkModeToggle={() => setIsDarkMode(!isDarkMode)}
        isSoundEnabled={isSoundEnabled}
        onSoundToggle={() => setIsSoundEnabled(!isSoundEnabled)}
      />

      <main className="max-w-screen-2xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-6">
        <h1 className="sr-only">Sorting Algorithm Race – Compare Sorting Algorithms Side by Side</h1>

        {/* Setup / control card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-soft p-5 sm:p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Algorithm Race
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Every algorithm sorts the <span className="font-semibold">same shuffled array</span> — fewest steps wins.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {status === 'idle' || status === 'finished' ? (
                <button
                  onClick={startRace}
                  disabled={selectedIds.length < MIN_LANES}
                  className="flex items-center space-x-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <Play className="w-4 h-4" />
                  <span>{status === 'finished' ? 'Race Again' : 'Start Race'}</span>
                </button>
              ) : (
                <button
                  onClick={() => setStatus(status === 'racing' ? 'paused' : 'racing')}
                  className="flex items-center space-x-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl transition-all duration-200 active:scale-[0.98] shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {status === 'racing' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{status === 'racing' ? 'Pause' : 'Resume'}</span>
                </button>
              )}
              <button
                onClick={resetRace}
                disabled={status === 'idle'}
                className="flex items-center space-x-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>
              <button
                onClick={shareRace}
                disabled={lastSeed === null}
                className="flex items-center space-x-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Copy a shareable link that replays this exact race"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
                <span>{copied ? 'Link Copied!' : 'Share Race'}</span>
              </button>
            </div>
          </div>

          {/* Shared-race banner */}
          {isSharedRace && status === 'idle' && lanes.length === 0 && (
            <div className="flex items-center space-x-3 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <Share2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                Shared race loaded — press Start Race to replay the exact same array and competitors.
              </span>
            </div>
          )}

          {/* Competitor chips */}
          <div>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400 block mb-2">
              Competitors ({selectedIds.length}/{MAX_LANES})
            </span>
            <div className="flex flex-wrap gap-2">
              {sortingAlgorithms.map(algo => {
                const selected = selectedIds.includes(algo.id);
                return (
                  <button
                    key={algo.id}
                    onClick={() => toggleAlgorithm(algo.id)}
                    disabled={status === 'racing' || status === 'paused'}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 border disabled:opacity-50 disabled:cursor-not-allowed ${
                      selected
                        ? 'bg-blue-500 text-white border-blue-600 shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {algo.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Array Size</label>
                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 tabular-nums">{arraySize}</span>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                step="5"
                value={arraySize}
                onChange={e => setArraySize(Number(e.target.value))}
                disabled={status === 'racing' || status === 'paused'}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-blue-500 disabled:opacity-40 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Race Speed</label>
                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 tabular-nums">{speed}×</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={speed}
                onChange={e => setSpeed(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          </div>

          {/* Winner banner */}
          {status === 'finished' && winner && (
            <div className="flex items-center space-x-3 px-4 py-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
              <Trophy className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                {winner.name} wins with {winner.steps.length.toLocaleString()} steps!
              </span>
            </div>
          )}
        </div>

        {/* Race lanes */}
        {lanes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {lanes.map(lane => {
              const idx = Math.min(tick, lane.steps.length - 1);
              const step = lane.steps[idx];
              const finished = tick >= lane.steps.length - 1;
              const progress = lane.steps.length > 1 ? idx / (lane.steps.length - 1) : 1;

              return (
                <div
                  key={lane.id}
                  className={`bg-white dark:bg-slate-900 rounded-2xl border shadow-soft p-4 sm:p-5 space-y-3 transition-all duration-300 ${
                    finished
                      ? 'border-emerald-300 dark:border-emerald-700'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{lane.name}</h3>
                      {finished && (
                        <span className="text-base" aria-label={`Finished ${placements[lane.id] + 1}`}>
                          {MEDALS[placements[lane.id]] ?? `${placements[lane.id] + 1}th`}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-mono text-slate-400 dark:text-slate-500 tabular-nums">
                      {idx.toLocaleString()} / {(lane.steps.length - 1).toLocaleString()} steps
                    </span>
                  </div>

                  <MiniBars step={step} finished={finished} />

                  {/* Progress bar */}
                  <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-100 ${finished ? 'bg-emerald-500' : 'bg-blue-500'}`}
                      style={{ width: `${progress * 100}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
                    <span>comparisons: <span className="font-bold text-slate-900 dark:text-white">{step.operations.comparisons.toLocaleString()}</span></span>
                    <span>swaps: <span className="font-bold text-slate-900 dark:text-white">{step.operations.swaps.toLocaleString()}</span></span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {lanes.length === 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-soft p-10 text-center">
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              Pick {MIN_LANES}–{MAX_LANES} competitors above and press <span className="font-semibold text-blue-600 dark:text-blue-400">Start Race</span>.
            </p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
              Each algorithm gets an identical copy of the array — the visualization advances them on a shared clock.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default RacePage;
