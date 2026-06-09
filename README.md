# VisualAlgo

Interactive, step-by-step visualizations for **sorting**, **searching**, **graph**, **tree**, and **dynamic programming** algorithms. Built with React, TypeScript, Vite, and Tailwind CSS.

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)

## Features

- **Sorting** — Animated bar charts with comparisons, swaps, and sorted regions
- **Searching** — Range and target highlighting across six search strategies
- **Graph** — Node–edge diagrams for traversal, shortest-path, MST, and A* pathfinding
- **Dynamic Programming** — Animated DP tables with cell dependencies and solution traceback
- **Playback** — Continuous auto-play with speed control, or manual step mode
- **Code panel** — Reference implementation with line highlighting synced to each step
- **Stats** — Live comparison and swap (or operation) counts where applicable
- **Sound** — Optional subtle audio feedback (toggle in the navbar)
- **Dark mode** — Light/dark theme with persistent preference
- **Responsive UI** — Clean layout with Lucide icons

## Algorithms

| Category   | Algorithms |
|-----------|------------|
| Sorting   | Bubble, Selection, Insertion, Quick, Merge, Heap, Shell, Cocktail Shaker, Gnome, Counting, Radix, Comb, Cycle, Pancake, Odd-Even |
| Searching | Linear, Binary, Jump, Exponential, Ternary, Interpolation, Fibonacci |
| Graph     | BFS, DFS, Dijkstra, Prim, Kruskal, Bellman-Ford, Floyd-Warshall, A* |
| Tree      | Segment Tree (build, query, update) |
| DP        | Longest Common Subsequence, 0/1 Knapsack, Longest Increasing Subsequence, Fibonacci |

## Routes

The app uses React Router. Default entry redirects to Bubble Sort.

| Path | Description |
|------|-------------|
| `/` | Redirects to `/sorting/bubble` |
| `/sorting/:algorithm` | Sorting visualizer (`bubble`, `selection`, `insertion`, `quick`, `merge`, `heap`, `shell`, `cocktail`, `gnome`, `counting`, `radix`, `comb`, `cycle`, `pancake`, `oddeven`) |
| `/searching/:algorithm` | Searching visualizer (`linear`, `binary`, `jump`, `exponential`, `ternary`, `interpolation`, `fibonacci`) |
| `/graph/:algorithm` | Graph visualizer (`bfs`, `dfs`, `dijkstra`, `prim`, `kruskal`, `bellmanford`, `floyd`, `astar`) |
| `/tree/:algorithm` | Segment tree visualizer (`segment`) |
| `/dp/:algorithm` | DP table visualizer (`lcs`, `knapsack`, `lis`, `fib`) |

Unknown paths fall back to `/sorting/bubble`.

## Tech stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite 8](https://vitejs.dev/) for dev server and production builds
- [Tailwind CSS v4](https://tailwindcss.com/) (via PostCSS)
- [React Router v7](https://reactrouter.com/) for routing
- [Lucide React](https://lucide.dev/) for icons

## Getting started

**Requirements:** [Node.js](https://nodejs.org/) 20+ recommended (LTS).

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:5173 by default)
npm run dev

# Production build
npm run build

# Preview production build locally
npm run preview

# Lint
npm run lint
```

## Project structure

```
src/
├── algorithms/          # Algorithm definitions and step generators
│   ├── registry.ts      # Sorting + searching registry
│   ├── graphRegistry.ts # Graph algorithms (BFS, DFS, Dijkstra, Prim, Kruskal, Bellman-Ford, Floyd-Warshall, A*)
│   ├── dpRegistry.ts    # Dynamic programming algorithms (LCS, Knapsack, LIS, Fibonacci)
│   └── *.ts             # Per-algorithm modules
├── components/          # UI (Visualizer, Navbar, ControlPanel, CodePanel, …)
├── pages/               # Route-level pages (Sorting, Searching, Graph, SegmentTree, DP)
├── hooks/               # e.g. playback, dark mode
├── types/               # Shared TypeScript types (Step, Graph, …)
├── utils/               # Helpers (array, graph, sound)
├── App.tsx              # Routes
├── main.tsx             # Entry
└── index.css            # Global styles + Tailwind
```

## How visualization works

Algorithms **precompute steps** before playback:

1. `generateSteps(...)` returns an ordered list of steps (array or graph state, highlights, active code line, counters, optional metadata).
2. The UI advances the current step index in continuous or step mode.
3. Highlights and the code panel stay in sync with the active step.

Sorting and searching share the `Algorithm` + `Step` model; graph algorithms use `GraphAlgorithm` + `GraphStep`; DP algorithms use `DPAlgorithm` + `DPStep` (table snapshots with cell highlights). Each family has its own registry.

## Extending the project

**New sorting or searching algorithm**

1. Add `src/algorithms/yourAlgo.ts` implementing the `Algorithm` interface (`id`, `name`, `generateSteps`, `code`).
2. Register it under `sorting` or `searching` in `src/algorithms/registry.ts`.
3. Navigate to `/sorting/your-id` or `/searching/your-id` (IDs must match `id`).

**New graph algorithm**

1. Add a module implementing `GraphAlgorithm`.
2. Register it in `src/algorithms/graphRegistry.ts`.
3. Use `/graph/your-id`.

**New DP algorithm**

1. Add a module implementing `DPAlgorithm` (`generateSteps(size)` returns `DPStep[]` table snapshots).
2. Register it in `src/algorithms/dpRegistry.ts`.
3. Use `/dp/your-id`.

## SEO

The app is search-engine friendly out of the box:

- `index.html` ships default title/description, Open Graph, Twitter card, and `WebApplication` JSON-LD.
- Each algorithm page sets a unique title, meta description, canonical URL, and `LearningResource` JSON-LD at runtime via the `useSeo` hook (`src/hooks/useSeo.ts`), driven by per-algorithm copy in `src/utils/seo.ts`.
- `public/robots.txt` and `public/sitemap.xml` cover every route; `vercel.json` rewrites make deep links return the app with HTTP 200.

**If the site moves to a custom domain**, update the URL in these four places: `src/utils/seo.ts` (`SITE_URL`), `index.html`, `public/robots.txt`, and `public/sitemap.xml`. Then submit the sitemap in [Google Search Console](https://search.google.com/search-console).

## Contributing

Contributions, issues, and pull requests are welcome. Please keep changes focused and consistent with existing patterns.

## License

Add a `LICENSE` file in the repository root to specify terms. Until then, all rights are reserved unless you state otherwise in that file.
