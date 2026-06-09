import { memo } from 'react';
import type { DPStep } from '../types';

interface DPVisualizerProps {
  /** DP table snapshot; null cells are not yet computed */
  table: (number | null)[][];
  rowLabels: string[];
  colLabels: string[];
  highlights: DPStep['highlights'];
  metadata?: DPStep['metadata'];
}

const keyOf = (r: number, c: number) => `${r},${c}`;

function DPVisualizer({ table, rowLabels, colLabels, highlights, metadata }: DPVisualizerProps) {
  const current = new Set((highlights.current ?? []).map(([r, c]) => keyOf(r, c)));
  const sources = new Set((highlights.sources ?? []).map(([r, c]) => keyOf(r, c)));
  const result = new Set((highlights.result ?? []).map(([r, c]) => keyOf(r, c)));

  const getCellStyle = (r: number, c: number, value: number | null): string => {
    const k = keyOf(r, c);
    if (result.has(k)) {
      return 'bg-emerald-500 border-emerald-600 text-white';
    }
    if (current.has(k)) {
      return 'bg-violet-500 border-violet-600 text-white ring-2 ring-violet-400/60 scale-110';
    }
    if (sources.has(k)) {
      return 'bg-amber-400 border-amber-500 text-white';
    }
    if (value !== null) {
      return 'bg-blue-500 border-blue-600 text-white';
    }
    return 'bg-slate-100 dark:bg-slate-800 border-dashed border-slate-300 dark:border-slate-600 text-slate-300 dark:text-slate-600';
  };

  return (
    <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-soft p-4 sm:p-6 flex flex-col min-h-[220px]">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          DP Table
        </h2>
        {metadata?.finalResult !== undefined && (
          <span className="px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded-lg font-semibold text-xs sm:text-sm ring-1 ring-emerald-200 dark:ring-emerald-800">
            Result: {metadata.finalResult}
          </span>
        )}
      </div>

      {/* Step description */}
      {metadata?.description && (
        <div className="mb-4 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-mono bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-lg truncate">
          {metadata.description}
        </div>
      )}

      {/* Table grid */}
      <div className="flex-1 overflow-auto flex items-center">
        <div className="mx-auto">
          {/* Column labels */}
          <div className="flex">
            <div className="w-12 h-8 shrink-0" />
            {colLabels.map((label, c) => (
              <div
                key={`col-${c}`}
                className="w-10 h-8 sm:w-11 shrink-0 flex items-center justify-center text-xs font-mono font-semibold text-slate-400 dark:text-slate-500"
              >
                {label}
              </div>
            ))}
          </div>

          {/* Rows */}
          {table.map((row, r) => (
            <div key={`row-${r}`} className="flex items-center">
              {/* Row label */}
              <div className="w-12 h-10 sm:h-11 shrink-0 flex items-center justify-center text-xs font-mono font-semibold text-slate-400 dark:text-slate-500">
                {rowLabels[r] ?? ''}
              </div>
              {row.map((value, c) => (
                <div key={keyOf(r, c)} className="w-10 h-10 sm:w-11 sm:h-11 shrink-0 p-0.5">
                  <div
                    className={`
                      w-full h-full flex items-center justify-center rounded-lg border-2
                      font-bold text-xs sm:text-sm tabular-nums
                      transition-all duration-200 ease-in-out
                      ${getCellStyle(r, c, value)}
                    `}
                    role="presentation"
                    aria-label={`Cell ${r},${c}: ${value ?? 'empty'}`}
                  >
                    {value ?? '·'}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center flex-wrap gap-3 sm:gap-5 text-xs">
        {[
          { color: 'bg-slate-100 dark:bg-slate-800 border-slate-300 border-dashed', label: 'Empty' },
          { color: 'bg-blue-500 border-blue-600', label: 'Computed' },
          { color: 'bg-amber-400 border-amber-500', label: 'Reading' },
          { color: 'bg-violet-500 border-violet-600', label: 'Current' },
          { color: 'bg-emerald-500 border-emerald-600', label: 'Solution' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center space-x-1.5">
            <div className={`w-3.5 h-3.5 rounded-md border-2 ${color}`} />
            <span className="text-slate-500 dark:text-slate-400">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default memo(DPVisualizer);
