import { Moon, Sun, Volume2, VolumeX } from 'lucide-react';
import type { AlgorithmCategory } from '../algorithms/registry';
import { getAlgorithmOptions } from '../algorithms/registry';
import { getGraphAlgorithmOptions } from '../algorithms/graphRegistry';

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
  const algorithmOptions = category === 'graph' 
    ? getGraphAlgorithmOptions() 
    : getAlgorithmOptions(category);

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-soft">
      <div className="max-w-screen-2xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Side: Logo + Navigation Tabs */}
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">VA</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                VisualAlgo
              </h1>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center space-x-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => onCategoryChange(cat.id)}
                  className={`
                    px-4 py-2 rounded-lg font-medium transition-all
                    ${
                      category === cat.id
                        ? 'bg-primary-500 text-white shadow-md'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }
                  `}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Right Side: Algorithm Dropdown + Toggles */}
          <div className="flex items-center space-x-4">
            {/* Algorithm Selector */}
            {algorithmOptions.length > 0 && (
              <select
                value={selectedAlgorithm}
                onChange={(e) => onAlgorithmChange(e.target.value)}
                className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all cursor-pointer hover:border-gray-300 dark:hover:border-gray-600 min-w-[180px]"
              >
                {algorithmOptions.map((algo) => (
                  <option key={algo.id} value={algo.id}>
                    {algo.name}
                  </option>
                ))}
              </select>
            )}

            {/* Sound Toggle */}
            <button
              onClick={onSoundToggle}
              className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-all focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label={isSoundEnabled ? 'Mute sound' : 'Enable sound'}
            >
              {isSoundEnabled ? (
                <Volume2 className="w-5 h-5" />
              ) : (
                <VolumeX className="w-5 h-5" />
              )}
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={onDarkModeToggle}
              className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-all focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label={isDarkMode ? 'Light mode' : 'Dark mode'}
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
