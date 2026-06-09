import { memo } from 'react';
import type { BoardStep } from '../types';

interface BoardVisualizerProps {
  board: BoardStep['board'];
  fixed?: BoardStep['fixed'];
  boardKind: BoardStep['boardKind'];
  highlights: BoardStep['highlights'];
  metadata?: BoardStep['metadata'];
}

const keyOf = (r: number, c: number) => `${r},${c}`;

function BoardVisualizer({ board, fixed, boardKind, highlights, metadata }: BoardVisualizerProps) {
  const current = new Set((highlights.current ?? []).map(([r, c]) => keyOf(r, c)));
  const conflict = new Set((highlights.conflict ?? []).map(([r, c]) => keyOf(r, c)));
  const candidates = new Set((highlights.candidates ?? []).map(([r, c]) => keyOf(r, c)));
  const solution = new Set((highlights.solution ?? []).map(([r, c]) => keyOf(r, c)));

  const n = board.length;
  const isSudoku = boardKind === 'sudoku';

  const cellBg = (r: number, c: number): string => {
    const k = keyOf(r, c);
    if (solution.has(k)) return 'bg-emerald-500 text-white';
    if (conflict.has(k)) return 'bg-rose-500 text-white';
    if (current.has(k)) return 'bg-violet-500 text-white ring-2 ring-violet-400/70';
    if (candidates.has(k)) return 'bg-amber-400 text-white';
    if (isSudoku) {
      return 'bg-white dark:bg-slate-800';
    }
    // Chess shading
    return (r + c) % 2 === 0
      ? 'bg-slate-100 dark:bg-slate-700'
      : 'bg-slate-300 dark:bg-slate-800';
  };

  const cellText = (r: number, c: number): string => {
    const k = keyOf(r, c);
    if (solution.has(k) || conflict.has(k) || current.has(k) || candidates.has(k)) return '';
    if (isSudoku) {
      return fixed?.[r]?.[c]
        ? 'text-slate-900 dark:text-white'
        : 'text-blue-600 dark:text-blue-400';
    }
    return 'text-slate-700 dark:text-slate-200';
  };

  // Thicker separators around the 3×3 sudoku boxes
  const sudokuBorders = (r: number, c: number): string => {
    if (!isSudoku) return '';
    const top = r % 3 === 0 ? 'border-t-2 border-t-slate-400 dark:border-t-slate-500' : 'border-t border-t-slate-200 dark:border-t-slate-700';
    const left = c % 3 === 0 ? 'border-l-2 border-l-slate-400 dark:border-l-slate-500' : 'border-l border-l-slate-200 dark:border-l-slate-700';
    const right = c === 8 ? 'border-r-2 border-r-slate-400 dark:border-r-slate-500' : '';
    const bottom = r === 8 ? 'border-b-2 border-b-slate-400 dark:border-b-slate-500' : '';
    return `${top} ${left} ${right} ${bottom}`;
  };

  const cellSize = isSudoku
    ? 'w-8 h-8 sm:w-10 sm:h-10 text-sm sm:text-base'
    : n <= 5
    ? 'w-12 h-12 sm:w-14 sm:h-14 text-xl sm:text-2xl'
    : 'w-10 h-10 sm:w-12 sm:h-12 text-lg sm:text-xl';

  return (
    <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-soft p-4 sm:p-6 flex flex-col min-h-[220px]">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Board Visualization
        </h2>
        {metadata?.solved !== undefined && (
          <span
            className={`px-2.5 py-0.5 rounded-lg font-semibold text-xs sm:text-sm ring-1 ${
              metadata.solved
                ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 ring-emerald-200 dark:ring-emerald-800'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 ring-slate-200 dark:ring-slate-700'
            }`}
          >
            {metadata.solved ? 'Solved ✓' : 'Unsolved'}
          </span>
        )}
      </div>

      {/* Step description */}
      {metadata?.description && (
        <div className="mb-4 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-mono bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-lg truncate">
          {metadata.description}
        </div>
      )}

      {/* Board grid */}
      <div className="flex-1 overflow-auto flex items-center justify-center">
        <div
          className={`grid ${isSudoku ? '' : 'rounded-lg overflow-hidden border-2 border-slate-300 dark:border-slate-600'}`}
          style={{ gridTemplateColumns: `repeat(${board[0]?.length ?? n}, minmax(0, 1fr))` }}
        >
          {board.map((row, r) =>
            row.map((value, c) => (
              <div
                key={keyOf(r, c)}
                className={`
                  ${cellSize} flex items-center justify-center font-bold tabular-nums
                  transition-all duration-200
                  ${cellBg(r, c)} ${cellText(r, c)} ${sudokuBorders(r, c)}
                  ${isSudoku && fixed?.[r]?.[c] ? 'font-extrabold' : ''}
                `}
                role="presentation"
                aria-label={`Cell ${r},${c}: ${value ?? 'empty'}`}
              >
                {value ?? ''}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center flex-wrap gap-3 sm:gap-5 text-xs">
        {[
          { color: 'bg-violet-500', label: 'Trying' },
          { color: 'bg-amber-400', label: 'Candidates' },
          { color: 'bg-rose-500', label: 'Conflict / Backtrack' },
          { color: 'bg-emerald-500', label: 'Solution' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center space-x-1.5">
            <div className={`w-3.5 h-3.5 rounded-md ${color}`} />
            <span className="text-slate-500 dark:text-slate-400">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default memo(BoardVisualizer);
