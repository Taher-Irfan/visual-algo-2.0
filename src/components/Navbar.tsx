import { Moon, Sun, Volume2, VolumeX } from 'lucide-react';
import type { AlgorithmCategory } from '../algorithms/registry';
import { getAlgorithmOptions } from '../algorithms/registry';
import { getGraphAlgorithmOptions } from '../algorithms/graphRegistry';
import { getSegmentTreeAlgorithmOptions } from '../algorithms/segmentTreeRegistry';

interface NavbarProps {
  category: AlgorithmCategory;
  selectedAlgorithm: string;
  onCategoryChange: (category: AlgorithmCategory) => void;
  onAlgorithmChange: (algorithm: string) => void;
  isDarkMode: boolean;
  onDarkModeToggle: () => void;
  isSoundEnabled: boolean;
  onSoundToggle: () => void;
}

const CATEGORIES = [
  { id: 'sorting' as AlgorithmCategory, name: 'Sorting' },
  { id: 'searching' as AlgorithmCategory, name: 'Searching' },
  { id: 'graph' as AlgorithmCategory, name: 'Graph' },
  { id: 'tree' as AlgorithmCategory, name: 'Tree' },
];

export default function Navbar({
  category,
  selectedAlgorithm,
  onCategoryChange,
  onAlgorithmChange,
  isDarkMode,
  onDarkModeToggle,
  isSoundEnabled,
  onSoundToggle,
}: NavbarProps) {
  const algorithmOptions =
    category === 'graph'
      ? getGraphAlgorithmOptions()
      : category === 'tree'
      ? getSegmentTreeAlgorithmOptions()
      : getAlgorithmOptions(category);

  const categoryButtons = CATEGORIES.map((cat) => (
    <button
      key={cat.id}
      onClick={() => onCategoryChange(cat.id)}
      className={`
        px-3 py-1.5 sm:px-4 sm:py-1.5 rounded-lg font-medium transition-all duration-200 text-sm
        ${
          category === cat.id
            ? 'bg-blue-500 text-white shadow-md'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
        }
      `}
    >
      {cat.name}
    </button>
  ));

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="max-w-screen-2xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
        {/* Main row: Logo | tabs (sm+) | icons */}
        <div className="flex items-center justify-between gap-2">
          {/* Logo */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-sm sm:text-base">VA</span>
            </div>
            <h1 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white tracking-tight">
              VisualAlgo
            </h1>
          </div>

          {/* Navigation Tabs — hidden on mobile, shown sm+ */}
          <div className="hidden sm:flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
            {categoryButtons}
          </div>

          {/* Right Side: Algorithm Dropdown (sm+) + Toggles */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            {algorithmOptions.length > 0 && (
              <select
                value={selectedAlgorithm}
                onChange={(e) => onAlgorithmChange(e.target.value)}
                className="hidden sm:block px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 min-w-[170px]"
              >
                {algorithmOptions.map((algo) => (
                  <option key={algo.id} value={algo.id}>
                    {algo.name}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={onSoundToggle}
              className={`p-2 sm:p-2.5 rounded-lg transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500
                ${isSoundEnabled
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 ring-1 ring-blue-200 dark:ring-blue-800'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              aria-label={isSoundEnabled ? 'Mute sound' : 'Enable sound'}
            >
              {isSoundEnabled ? (
                <Volume2 className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              ) : (
                <VolumeX className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              )}
            </button>

            <button
              onClick={onDarkModeToggle}
              className="p-2 sm:p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={isDarkMode ? 'Light mode' : 'Dark mode'}
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              ) : (
                <Moon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile-only second row: category tabs + algorithm selector */}
        <div className="sm:hidden mt-2 flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
            {categoryButtons}
          </div>
          {algorithmOptions.length > 0 && (
            <select
              value={selectedAlgorithm}
              onChange={(e) => onAlgorithmChange(e.target.value)}
              className="ml-auto text-sm px-2 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer min-w-0 max-w-[150px]"
            >
              {algorithmOptions.map((algo) => (
                <option key={algo.id} value={algo.id}>
                  {algo.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
    </nav>
  );
}
