import { useState, useEffect, useRef, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Eraser, RotateCcw, Grid3x3 } from 'lucide-react';
import Navbar from '../components/Navbar';
import CodePanel from '../components/CodePanel';
import { getCategoryRoute, type AlgorithmCategory } from '../algorithms/registry';
import {
  getGridAlgorithm,
  getDefaultGridAlgorithm,
  generateMaze,
  type Cell as GridCell,
  type GridResult,
} from '../algorithms/gridPathfinding';
import { algorithmSeo } from '../utils/seo';
import { useDarkMode, useSound, useSeo } from '../hooks';

const ROWS = 15;
const COLS = 31;
const DEFAULT_START: GridCell = [7, 4];
const DEFAULT_TARGET: GridCell = [7, 26];

const key = (r: number, c: number) => `${r},${c}`;

type Phase = 'idle' | 'running' | 'done';
type CellType = 'empty' | 'wall' | 'start' | 'target';
type CellVisit = 'none' | 'visited' | 'path';

/** One grid square. No function props — events are delegated to the parent. */
const GridSquare = memo(function GridSquare({ type, visit }: { type: CellType; visit: CellVisit }) {
  let cls = 'bg-white dark:bg-slate-900';
  let glyph = '';
  if (type === 'wall') {
    cls = 'bg-slate-800 dark:bg-slate-950';
  } else if (type === 'start') {
    cls = 'bg-emerald-500 text-white';
    glyph = '▶';
  } else if (type === 'target') {
    cls = 'bg-rose-500 text-white';
    glyph = '◎';
  } else if (visit === 'path') {
    cls = 'bg-yellow-400 dark:bg-yellow-500';
  } else if (visit === 'visited') {
    cls = 'bg-blue-300 dark:bg-blue-700';
  }
  return (
    <div
      className={`w-5 h-5 sm:w-6 sm:h-6 border border-slate-200/70 dark:border-slate-700/50 flex items-center justify-center text-[10px] font-bold transition-colors duration-150 ${cls}`}
    >
      {glyph}
    </div>
  );
});

interface Run {
  /** Algorithm that produced this run — results from other algorithms are inert */
  algoId: string;
  result: GridResult;
  visitMap: Map<string, number>;
  pathMap: Map<string, number>;
}

function buildRun(algoId: string, res: GridResult): Run {
  const visitMap = new Map<string, number>();
  res.visitOrder.forEach(([r, c], i) => visitMap.set(key(r, c), i));
  const pathMap = new Map<string, number>();
  res.path.forEach(([r, c], i) => pathMap.set(key(r, c), i));
  return { algoId, result: res, visitMap, pathMap };
}

function PathfindingPage() {
  const { algorithm: algorithmParam } = useParams<{ algorithm: string }>();
  const navigate = useNavigate();

  const [isDarkMode, setIsDarkMode] = useDarkMode();
  const [isSoundEnabled, setIsSoundEnabled] = useSound();

  // The URL is the single source of truth for the selected algorithm
  const selectedAlgorithm = algorithmParam || getDefaultGridAlgorithm();
  const algorithm = getGridAlgorithm(selectedAlgorithm) ?? getGridAlgorithm(getDefaultGridAlgorithm())!;

  const [walls, setWalls] = useState<Set<string>>(new Set());
  const [start, setStart] = useState<GridCell>(DEFAULT_START);
  const [target, setTarget] = useState<GridCell>(DEFAULT_TARGET);
  const [phase, setPhase] = useState<Phase>('idle');
  const [speed, setSpeed] = useState(5);
  const [run, setRun] = useState<Run | null>(null);
  // Single animation clock: reveals visitOrder first, then the path
  const [progress, setProgress] = useState(0);

  const dragRef = useRef<'wall' | 'erase' | 'start' | 'target' | null>(null);

  useSeo(algorithmSeo('pathfinding', algorithm.id, algorithm.name));

  // A run from a previously selected algorithm is ignored entirely
  const active = run && run.algoId === algorithm.id ? run : null;
  const result = active?.result ?? null;
  const visitMap = active?.visitMap ?? null;
  const pathMap = active?.pathMap ?? null;

  const totalFrames = result ? result.visitOrder.length + result.path.length : 0;
  // Derived: idle without an active run; done once the clock revealed everything
  const effectivePhase: Phase = !active
    ? 'idle'
    : phase === 'running' && progress >= totalFrames
    ? 'done'
    : phase;

  const clearAnimation = () => {
    setPhase('idle');
    setRun(null);
    setProgress(0);
  };

  /** Run + animate from scratch. */
  const visualize = () => {
    const res = algorithm.run(ROWS, COLS, walls, start, target);
    setRun(buildRun(algorithm.id, res));
    setProgress(0);
    setPhase('running');
  };

  /** Re-run instantly (no animation) — used while editing after a finished run. */
  const recomputeInstant = (w: Set<string>, s: GridCell, t: GridCell) => {
    const res = algorithm.run(ROWS, COLS, w, s, t);
    setRun(buildRun(algorithm.id, res));
    setProgress(res.visitOrder.length + res.path.length);
    setPhase('done');
  };

  // Animation clock — stops on its own once everything is revealed
  useEffect(() => {
    if (effectivePhase !== 'running' || totalFrames === 0) return;
    const interval = setInterval(() => {
      setProgress(prev => Math.min(prev + speed, totalFrames));
    }, 25);
    return () => clearInterval(interval);
  }, [effectivePhase, totalFrames, speed]);

  // Global mouseup ends any drag
  useEffect(() => {
    const up = () => { dragRef.current = null; };
    window.addEventListener('mouseup', up);
    return () => window.removeEventListener('mouseup', up);
  }, []);

  const applyCell = (r: number, c: number, mode: 'wall' | 'erase' | 'start' | 'target') => {
    const k = key(r, c);
    const isEndpoint = (start[0] === r && start[1] === c) || (target[0] === r && target[1] === c);

    if (mode === 'start' || mode === 'target') {
      if (walls.has(k) || isEndpoint) return;
      const next: GridCell = [r, c];
      if (mode === 'start') setStart(next);
      else setTarget(next);
      if (effectivePhase === 'done') {
        recomputeInstant(walls, mode === 'start' ? next : start, mode === 'target' ? next : target);
      }
      return;
    }

    if (isEndpoint) return;
    const nextWalls = new Set(walls);
    if (mode === 'wall') nextWalls.add(k);
    else nextWalls.delete(k);
    setWalls(nextWalls);
    if (effectivePhase === 'done') recomputeInstant(nextWalls, start, target);
  };

  const cellFromEvent = (e: React.MouseEvent): GridCell | null => {
    const el = (e.target as HTMLElement).closest('[data-cell]');
    if (!el) return null;
    const [r, c] = (el as HTMLElement).dataset.cell!.split(',').map(Number);
    return [r, c];
  };

  const onGridMouseDown = (e: React.MouseEvent) => {
    if (effectivePhase === 'running') return;
    e.preventDefault();
    const cell = cellFromEvent(e);
    if (!cell) return;
    const [r, c] = cell;
    if (start[0] === r && start[1] === c) {
      dragRef.current = 'start';
    } else if (target[0] === r && target[1] === c) {
      dragRef.current = 'target';
    } else if (walls.has(key(r, c))) {
      dragRef.current = 'erase';
      applyCell(r, c, 'erase');
    } else {
      dragRef.current = 'wall';
      applyCell(r, c, 'wall');
    }
  };

  const onGridMouseOver = (e: React.MouseEvent) => {
    if (effectivePhase === 'running' || !dragRef.current) return;
    const cell = cellFromEvent(e);
    if (!cell) return;
    applyCell(cell[0], cell[1], dragRef.current);
  };

  const handleMaze = () => {
    clearAnimation();
    setWalls(generateMaze(ROWS, COLS, start, target));
  };

  const handleClearWalls = () => {
    clearAnimation();
    setWalls(new Set());
  };

  const handleCategoryChange = (newCategory: AlgorithmCategory) => {
    navigate(getCategoryRoute(newCategory));
  };

  const handleAlgorithmChange = (algo: string) => {
    navigate(`/pathfinding/${algo}`);
  };

  // Derived reveal counts: visiting animates first, then the path traces
  const visitedShown = result ? Math.min(progress, result.visitOrder.length) : 0;
  const pathShown = result ? Math.max(0, Math.min(progress - result.visitOrder.length, result.path.length)) : 0;

  const cellType = (r: number, c: number): CellType => {
    if (start[0] === r && start[1] === c) return 'start';
    if (target[0] === r && target[1] === c) return 'target';
    if (walls.has(key(r, c))) return 'wall';
    return 'empty';
  };

  const cellVisit = (r: number, c: number): CellVisit => {
    const k = key(r, c);
    const pi = pathMap?.get(k);
    if (pi !== undefined && pi < pathShown) return 'path';
    const vi = visitMap?.get(k);
    if (vi !== undefined && vi < visitedShown) return 'visited';
    return 'none';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 transition-colors">
      <Navbar
        category="pathfinding"
        selectedAlgorithm={selectedAlgorithm}
        onCategoryChange={handleCategoryChange}
        onAlgorithmChange={handleAlgorithmChange}
        isDarkMode={isDarkMode}
        onDarkModeToggle={() => setIsDarkMode(!isDarkMode)}
        isSoundEnabled={isSoundEnabled}
        onSoundToggle={() => setIsSoundEnabled(!isSoundEnabled)}
      />

      <main className="max-w-screen-2xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
        <h1 className="sr-only">{algorithm.name} – Interactive Pathfinding Grid Visualization</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

          {/* Left: grid + actions */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-soft p-4 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div>
                  <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                    Pathfinding Playground
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    Draw walls with your mouse, drag <span className="text-emerald-600 dark:text-emerald-400 font-semibold">start</span> and{' '}
                    <span className="text-rose-600 dark:text-rose-400 font-semibold">target</span>, then visualize. {algorithm.tagline}.
                  </p>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-lg font-semibold text-xs ring-1 ${
                    algorithm.guaranteesShortest
                      ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 ring-emerald-200 dark:ring-emerald-800'
                      : 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 ring-amber-200 dark:ring-amber-800'
                  }`}
                >
                  {algorithm.guaranteesShortest ? 'Guarantees shortest path' : 'No shortest-path guarantee'}
                </span>
              </div>

              {/* The grid */}
              <div className="overflow-x-auto">
                <div
                  className="inline-block select-none cursor-crosshair rounded-lg overflow-hidden border-2 border-slate-300 dark:border-slate-600"
                  onMouseDown={onGridMouseDown}
                  onMouseOver={onGridMouseOver}
                  role="application"
                  aria-label="Pathfinding grid — draw walls and drag endpoints"
                >
                  {Array.from({ length: ROWS }, (_, r) => (
                    <div key={r} className="flex">
                      {Array.from({ length: COLS }, (_, c) => (
                        <div key={c} data-cell={`${r},${c}`}>
                          <GridSquare type={cellType(r, c)} visit={cellVisit(r, c)} />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div className="mt-4 flex items-center justify-center flex-wrap gap-3 sm:gap-5 text-xs">
                {[
                  { color: 'bg-emerald-500', label: 'Start' },
                  { color: 'bg-rose-500', label: 'Target' },
                  { color: 'bg-slate-800 dark:bg-slate-950', label: 'Wall' },
                  { color: 'bg-blue-300 dark:bg-blue-700', label: 'Visited' },
                  { color: 'bg-yellow-400', label: 'Path' },
                ].map(({ color, label }) => (
                  <div key={label} className="flex items-center space-x-1.5">
                    <div className={`w-3.5 h-3.5 rounded-md ${color}`} />
                    <span className="text-slate-500 dark:text-slate-400">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-soft p-4 sm:p-5">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <button
                  onClick={visualize}
                  disabled={effectivePhase === 'running'}
                  className="flex items-center space-x-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <Play className="w-4 h-4" />
                  <span>Visualize {algorithm.name}</span>
                </button>
                <button
                  onClick={handleMaze}
                  disabled={effectivePhase === 'running'}
                  className="flex items-center space-x-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <Grid3x3 className="w-4 h-4" />
                  <span>Generate Maze</span>
                </button>
                <button
                  onClick={handleClearWalls}
                  disabled={effectivePhase === 'running'}
                  className="flex items-center space-x-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <Eraser className="w-4 h-4" />
                  <span>Clear Walls</span>
                </button>
                <button
                  onClick={clearAnimation}
                  disabled={effectivePhase === 'running' || effectivePhase === 'idle'}
                  className="flex items-center space-x-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Clear Path</span>
                </button>

                <div className="flex items-center gap-2 ml-auto min-w-[160px]">
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">Speed</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={speed}
                    onChange={e => setSpeed(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-blue-500"
                  />
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 tabular-nums">{speed}×</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: stats + code */}
          <div className="flex flex-col space-y-4 sm:space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-soft p-5 sm:p-6">
              <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
                Run Statistics
              </h4>
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide block mb-0.5">Cells Visited</span>
                    <span className="text-sm font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                      {result ? visitedShown : '—'}
                    </span>
                  </div>
                  <div className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide block mb-0.5">Path Length</span>
                    <span className="text-sm font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                      {effectivePhase === 'done' && result ? (result.found ? result.path.length - 1 : '∅') : '—'}
                    </span>
                  </div>
                </div>

                {effectivePhase === 'done' && result && !result.found && (
                  <div className="px-3 py-2.5 bg-rose-50 dark:bg-rose-900/20 rounded-xl border border-rose-100 dark:border-rose-800">
                    <span className="text-sm font-semibold text-rose-600 dark:text-rose-400">
                      No path exists — the target is walled off
                    </span>
                  </div>
                )}
                {effectivePhase === 'done' && result?.found && (
                  <div className="px-3 py-2.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800">
                    <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                      Path found{algorithm.guaranteesShortest ? ' — provably the shortest' : ' — may not be the shortest'}
                    </span>
                  </div>
                )}

                <p className="text-xs text-slate-400 dark:text-slate-500 pt-1">
                  Tip: after a run finishes, drag the start or target — the result updates instantly. Try the same maze with different algorithms.
                </p>
              </div>
            </div>

            <CodePanel code={algorithm.code} activeLine={0} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default PathfindingPage;
