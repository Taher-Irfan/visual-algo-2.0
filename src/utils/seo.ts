import type { AlgorithmCategory } from '../algorithms/registry';

/**
 * Canonical site origin used for canonical URLs, Open Graph tags, and
 * structured data. Update this single constant if the site moves to a
 * custom domain (also update public/robots.txt, public/sitemap.xml, and
 * index.html, which must stay static).
 */
export const SITE_URL = 'https://visual-algo-2-0.vercel.app';

export const SITE_NAME = 'VisualAlgo';

export interface PageSeo {
  title: string;
  description: string;
  /** Path beginning with '/', appended to SITE_URL for the canonical URL */
  path: string;
}

/**
 * Unique, handcrafted meta description per algorithm page, keyed by
 * "category/algorithmId". Unique descriptions help search engines treat
 * each route as a distinct, indexable page instead of near-duplicates.
 */
const DESCRIPTIONS: Record<string, string> = {
  // Sorting
  'sorting/bubble': 'Watch Bubble Sort step by step: adjacent comparisons, swaps, and the sorted region growing from the end. Interactive animation with code highlighting and O(n²) complexity analysis.',
  'sorting/selection': 'Visualize Selection Sort finding the minimum of the unsorted region and swapping it into place. Step-by-step animation with live comparison counts and O(n²) analysis.',
  'sorting/insertion': 'See Insertion Sort build a sorted prefix one element at a time, shifting larger values right. Interactive step-by-step animation with synced C++ code.',
  'sorting/quick': 'Explore Quick Sort partitioning around a pivot with recursive subarray sorting. Animated visualization with pivot highlighting and O(n log n) average-case analysis.',
  'sorting/merge': 'Follow Merge Sort dividing the array and merging sorted halves. Step-by-step visualization of the classic O(n log n) divide-and-conquer algorithm.',
  'sorting/heap': 'Watch Heap Sort build a max-heap and repeatedly extract the maximum. Interactive animation of sift-down operations with guaranteed O(n log n) performance.',
  'sorting/shell': 'Visualize Shell Sort performing gapped insertion passes with a shrinking gap sequence. Step-by-step animation showing how distant swaps speed up sorting.',
  'sorting/cocktail': 'See Cocktail Shaker Sort bubble values in both directions, growing the sorted region from both ends. Interactive bidirectional bubble sort animation.',
  'sorting/gnome': 'Watch Gnome Sort walk forward and step back on out-of-order pairs, like a gnome sorting flower pots. Simple step-by-step sorting animation.',
  'sorting/counting': 'Explore Counting Sort tallying value frequencies and rebuilding the array in order — sorting without comparisons in O(n + k) time. Animated walkthrough.',
  'sorting/radix': 'Follow Radix Sort (LSD) sorting numbers digit by digit with stable counting passes. Step-by-step animation of non-comparison O(n·d) sorting.',
  'sorting/comb': 'Visualize Comb Sort comparing elements a shrinking gap apart to eliminate turtles early. Interactive animation of the improved bubble sort.',
  'sorting/cycle': 'See Cycle Sort rotate permutation cycles so every value is written at most once — the write-optimal sorting algorithm, animated step by step.',
  'sorting/pancake': 'Watch Pancake Sort order an array using only prefix flips, like flipping a stack of pancakes. Interactive step-by-step flip animation.',
  'sorting/oddeven': 'Explore Odd-Even (Brick) Sort alternating odd and even pair phases — a parallel-friendly bubble sort variant, animated step by step.',
  // Searching
  'searching/linear': 'Watch Linear Search scan an array element by element until the target is found. Interactive step-by-step animation with comparison counting.',
  'searching/binary': 'Visualize Binary Search halving a sorted array each step to find the target in O(log n). Animated range narrowing with mid-point highlighting.',
  'searching/jump': 'See Jump Search hop through a sorted array in √n blocks, then scan the candidate block linearly. Interactive O(√n) search animation.',
  'searching/exponential': 'Follow Exponential Search doubling its bound to find a range, then binary searching inside it. Step-by-step O(log n) animation.',
  'searching/ternary': 'Watch Ternary Search split a sorted range into three parts with two midpoints, discarding thirds each step. Interactive animation.',
  'searching/interpolation': 'Explore Interpolation Search estimating the probe position from the value distribution — O(log log n) on uniform data. Animated walkthrough.',
  'searching/fibonacci': 'See Fibonacci Search divide a sorted array at Fibonacci offsets using only addition. Step-by-step O(log n) search animation.',
  // Graph
  'graph/bfs': 'Visualize Breadth-First Search exploring a graph level by level with a queue. Interactive animation with visited states and level labels.',
  'graph/dfs': 'Watch Depth-First Search dive deep along each branch with recursive backtracking. Step-by-step graph traversal animation with call-stack view.',
  'graph/dijkstra': "Follow Dijkstra's algorithm settling nodes by shortest distance with a priority queue. Animated shortest-path computation with a live distance table.",
  'graph/prim': "See Prim's algorithm grow a minimum spanning tree edge by edge from a start node. Interactive MST animation with key values and tree highlighting.",
  'graph/kruskal': "Watch Kruskal's algorithm sort edges by weight and join components with union-find, skipping cycles. Animated minimum spanning tree construction.",
  'graph/bellmanford': 'Explore Bellman-Ford relaxing every edge up to V-1 times to find shortest paths. Step-by-step animation with early-exit detection.',
  'graph/floyd': 'Visualize Floyd-Warshall computing all-pairs shortest paths via intermediate nodes. Animated dynamic programming on graphs with a distance table.',
  'graph/astar': 'See A* pathfinding guided by an admissible straight-line heuristic find the shortest path to a target. Interactive animation with g and f scores.',
  // Tree
  'tree/segment': 'Watch a Segment Tree being built, queried, and updated with O(log n) range-sum operations. Interactive tree animation with range highlighting.',
  // DP
  'dp/lcs': 'Visualize the Longest Common Subsequence DP table filling cell by cell, then trace back the subsequence itself. Interactive dynamic programming animation.',
  'dp/knapsack': 'Watch the 0/1 Knapsack DP weigh skip-vs-take decisions in an animated table, then trace back the chosen items. Step-by-step walkthrough.',
  'dp/lis': 'See the Longest Increasing Subsequence DP extend the best smaller predecessor at each index, then recover the subsequence. Animated table.',
  'dp/fib': 'Learn dynamic programming with bottom-up Fibonacci: each cell sums the two before it. The canonical memoization example, animated step by step.',
  // Strings
  'strings/kmp': 'Watch KMP build its LPS failure table, then scan the text without ever moving backwards. Interactive pattern matching animation with pointer tracking.',
  'strings/rabinkarp': 'See Rabin-Karp compare rolling hashes before characters — including spurious hash collisions. Animated sliding-window pattern matching.',
  'strings/z': 'Visualize the Z-Algorithm computing prefix-match lengths with its Z-box optimization, finding pattern matches in linear time. Step-by-step animation.',
  'strings/palindrome': 'Find the longest palindromic substring by expanding around every center. Interactive animation with live best-palindrome tracking.',
  // Puzzles
  'puzzles/queens': 'Watch N-Queens backtracking place queens row by row, detect attacks, and retreat from dead ends. Interactive chessboard animation up to 8×8.',
  'puzzles/sudoku': 'See a Sudoku solver try digits, hit contradictions, and backtrack on a freshly generated puzzle. Step-by-step 9×9 constraint-solving animation.',
  'puzzles/knight': "Follow a knight visiting every square exactly once, guided by Warnsdorff's fewest-exits rule. Interactive Knight's Tour animation.",
};

const CATEGORY_LABELS: Record<AlgorithmCategory, string> = {
  sorting: 'Sorting Algorithm',
  searching: 'Searching Algorithm',
  graph: 'Graph Algorithm',
  tree: 'Tree Data Structure',
  dp: 'Dynamic Programming',
  strings: 'String Algorithm',
  puzzles: 'Backtracking Puzzle',
  race: 'Algorithm Race',
};

/**
 * Build per-page SEO metadata for an algorithm page.
 */
export function algorithmSeo(category: AlgorithmCategory, algorithmId: string, algorithmName?: string): PageSeo {
  const name = algorithmName ?? algorithmId;
  const label = CATEGORY_LABELS[category];
  return {
    title: `${name} Visualization – Interactive ${label} Animation | ${SITE_NAME}`,
    description:
      DESCRIPTIONS[`${category}/${algorithmId}`] ??
      `Interactive step-by-step visualization of ${name} with synced code highlighting, playback controls, and complexity analysis.`,
    path: `/${category === 'tree' ? 'tree' : category}/${algorithmId}`,
  };
}
