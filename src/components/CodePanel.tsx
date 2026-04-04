import { useRef } from 'react';

/**
 * CodePanel Component
 * 
 * Displays algorithm code with syntax highlighting and active line tracking.
 * Connected to playback system - highlights the currently executing line.
 * 
 * Features:
 * - Line numbers
 * - Active line highlighting (yellow)
 * - Scrollable container
 * - Premium dark theme
 * - Smooth transitions
 */

interface CodePanelProps {
  /** Algorithm code (C++ syntax) - can be string or array of lines */
  code: string | string[];
  /** Currently executing line number (1-indexed) */
  activeLine: number;
}

export default function CodePanel({ code, activeLine }: CodePanelProps) {
  const lines = Array.isArray(code) ? code : code.split('\n');
  const activeLineRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-soft p-6 h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Algorithm Code
        </h3>
        <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
          C++
        </span>
      </div>
      
      {/* Code Container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto scrollbar-thin bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
      >
        <pre className="text-sm font-mono leading-relaxed p-4">
          {lines.map((line, index) => {
            const lineNumber = index + 1;
            const isActive = lineNumber === activeLine;
            
            return (
              <div
                key={index}
                ref={isActive ? activeLineRef : null}
                className={`flex items-center min-h-[1.5rem] px-2 -mx-2 rounded transition-all duration-200 ${
                  isActive
                    ? 'bg-yellow-100 dark:bg-yellow-900/30 shadow-sm'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700/30'
                }`}
              >
                {/* Line Number */}
                <span
                  className={`inline-block w-12 flex-shrink-0 text-right pr-4 select-none transition-colors ${
                    isActive
                      ? 'text-yellow-700 dark:text-yellow-400 font-bold'
                      : 'text-gray-400 dark:text-gray-500'
                  }`}
                >
                  {lineNumber}
                </span>
                
                {/* Vertical Line Separator */}
                <span className={`w-px h-full mr-4 ${
                  isActive 
                    ? 'bg-yellow-300 dark:bg-yellow-700' 
                    : 'bg-gray-300 dark:bg-gray-600'
                }`} />
                
                {/* Code Line */}
                <span
                  className={`flex-1 whitespace-pre transition-colors ${
                    isActive
                      ? 'text-gray-900 dark:text-white font-medium'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {line || ' '}
                </span>
              </div>
            );
          })}
        </pre>
      </div>
      
      {/* Footer Info */}
      <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>
          {lines.length} {lines.length === 1 ? 'line' : 'lines'}
        </span>
        {activeLine > 0 && (
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
            <span>Line {activeLine}</span>
          </span>
        )}
      </div>
    </div>
  );
}
