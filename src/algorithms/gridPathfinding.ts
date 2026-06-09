/**
 * Grid pathfinding engine for the interactive Pathfinding Playground.
 *
 * Unlike the step-snapshot model used elsewhere, grid algorithms return the
 * order in which cells were settled plus the reconstructed path; the page
 * animates by revealing prefixes of those lists, which scales to hundreds of
 * cells without snapshotting the whole grid per step.
 */

export type Cell = [number, number];

export interface GridResult {
  /** Cells in the order they were settled (start first) */
  visitOrder: Cell[];
  /** Shortest/reconstructed path start→target (empty if unreachable) */
  path: Cell[];
  found: boolean;
}

export interface GridAlgorithm {
  id: string;
  name: string;
  /** Human description shown on the page */
  tagline: string;
  /** Guarantees the shortest path on an unweighted grid */
  guaranteesShortest: boolean;
  code: string;
  run: (rows: number, cols: number, walls: Set<string>, start: Cell, target: Cell) => GridResult;
}

const key = (r: number, c: number) => `${r},${c}`;

// Up, right, down, left — the order shapes DFS's snaking and BFS's diamond
const DIRS: Cell[] = [[-1, 0], [0, 1], [1, 0], [0, -1]];

function neighbors(r: number, c: number, rows: number, cols: number, walls: Set<string>): Cell[] {
  const out: Cell[] = [];
  for (const [dr, dc] of DIRS) {
    const nr = r + dr;
    const nc = c + dc;
    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !walls.has(key(nr, nc))) {
      out.push([nr, nc]);
    }
  }
  return out;
}

function reconstruct(prev: Map<string, string | null>, target: Cell): Cell[] {
  const path: Cell[] = [];
  let cur: string | null = key(target[0], target[1]);
  while (cur !== null) {
    const [r, c] = cur.split(',').map(Number);
    path.unshift([r, c]);
    cur = prev.get(cur) ?? null;
  }
  return path;
}

const manhattan = (a: Cell, b: Cell) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);

function bfsRun(rows: number, cols: number, walls: Set<string>, start: Cell, target: Cell): GridResult {
  const visitOrder: Cell[] = [];
  const prev = new Map<string, string | null>([[key(start[0], start[1]), null]]);
  const queue: Cell[] = [start];

  while (queue.length > 0) {
    const [r, c] = queue.shift()!;
    visitOrder.push([r, c]);
    if (r === target[0] && c === target[1]) {
      return { visitOrder, path: reconstruct(prev, target), found: true };
    }
    for (const [nr, nc] of neighbors(r, c, rows, cols, walls)) {
      if (!prev.has(key(nr, nc))) {
        prev.set(key(nr, nc), key(r, c));
        queue.push([nr, nc]);
      }
    }
  }
  return { visitOrder, path: [], found: false };
}

function dfsRun(rows: number, cols: number, walls: Set<string>, start: Cell, target: Cell): GridResult {
  const visitOrder: Cell[] = [];
  const prev = new Map<string, string | null>([[key(start[0], start[1]), null]]);
  const visited = new Set<string>();
  const stack: Cell[] = [start];

  while (stack.length > 0) {
    const [r, c] = stack.pop()!;
    const k = key(r, c);
    if (visited.has(k)) continue;
    visited.add(k);
    visitOrder.push([r, c]);
    if (r === target[0] && c === target[1]) {
      return { visitOrder, path: reconstruct(prev, target), found: true };
    }
    // Reversed so exploration follows the natural up-right-down-left order
    const nbrs = neighbors(r, c, rows, cols, walls).reverse();
    for (const [nr, nc] of nbrs) {
      const nk = key(nr, nc);
      if (!visited.has(nk)) {
        if (!prev.has(nk) || !visited.has(prev.get(nk)!)) prev.set(nk, k);
        stack.push([nr, nc]);
      }
    }
  }
  return { visitOrder, path: [], found: false };
}

function greedyRun(rows: number, cols: number, walls: Set<string>, start: Cell, target: Cell): GridResult {
  const visitOrder: Cell[] = [];
  const prev = new Map<string, string | null>([[key(start[0], start[1]), null]]);
  const closed = new Set<string>();
  const open: Array<{ cell: Cell; h: number }> = [{ cell: start, h: manhattan(start, target) }];

  while (open.length > 0) {
    open.sort((a, b) => a.h - b.h);
    const { cell } = open.shift()!;
    const [r, c] = cell;
    const k = key(r, c);
    if (closed.has(k)) continue;
    closed.add(k);
    visitOrder.push([r, c]);
    if (r === target[0] && c === target[1]) {
      return { visitOrder, path: reconstruct(prev, target), found: true };
    }
    for (const [nr, nc] of neighbors(r, c, rows, cols, walls)) {
      const nk = key(nr, nc);
      if (!closed.has(nk) && !prev.has(nk)) {
        prev.set(nk, k);
        open.push({ cell: [nr, nc], h: manhattan([nr, nc], target) });
      }
    }
  }
  return { visitOrder, path: [], found: false };
}

function aStarRun(rows: number, cols: number, walls: Set<string>, start: Cell, target: Cell): GridResult {
  const visitOrder: Cell[] = [];
  const prev = new Map<string, string | null>([[key(start[0], start[1]), null]]);
  const g = new Map<string, number>([[key(start[0], start[1]), 0]]);
  const closed = new Set<string>();
  const open: Array<{ cell: Cell; f: number }> = [{ cell: start, f: manhattan(start, target) }];

  while (open.length > 0) {
    open.sort((a, b) => a.f - b.f);
    const { cell } = open.shift()!;
    const [r, c] = cell;
    const k = key(r, c);
    if (closed.has(k)) continue;
    closed.add(k);
    visitOrder.push([r, c]);
    if (r === target[0] && c === target[1]) {
      return { visitOrder, path: reconstruct(prev, target), found: true };
    }
    for (const [nr, nc] of neighbors(r, c, rows, cols, walls)) {
      const nk = key(nr, nc);
      if (closed.has(nk)) continue;
      const tentative = (g.get(k) ?? Infinity) + 1;
      if (tentative < (g.get(nk) ?? Infinity)) {
        g.set(nk, tentative);
        prev.set(nk, k);
        open.push({ cell: [nr, nc], f: tentative + manhattan([nr, nc], target) });
      }
    }
  }
  return { visitOrder, path: [], found: false };
}

export const gridAlgorithmRegistry: Record<string, GridAlgorithm> = {
  bfs: {
    id: 'bfs',
    name: 'Breadth-First Search',
    tagline: 'Floods outward evenly — guarantees the shortest path',
    guaranteesShortest: true,
    run: bfsRun,
    code: `void BFS(grid, start, target) {
  queue = [start]
  prev[start] = null
  while queue is not empty:
    cell = queue.pop_front()
    visit(cell)
    if cell == target:
      return path via prev[]
    for next in neighbors(cell):
      if next not seen and not wall:
        prev[next] = cell
        queue.push_back(next)
}`,
  },
  dfs: {
    id: 'dfs',
    name: 'Depth-First Search',
    tagline: 'Dives down one corridor at a time — path can be far from shortest',
    guaranteesShortest: false,
    run: dfsRun,
    code: `void DFS(grid, start, target) {
  stack = [start]
  while stack is not empty:
    cell = stack.pop_back()
    if cell visited: continue
    visit(cell)
    if cell == target:
      return path via prev[]
    for next in neighbors(cell):
      if next not visited and not wall:
        prev[next] = cell
        stack.push_back(next)
}`,
  },
  greedy: {
    id: 'greedy',
    name: 'Greedy Best-First',
    tagline: 'Chases the target by straight-line guess — fast but can be fooled',
    guaranteesShortest: false,
    run: greedyRun,
    code: `void greedyBFS(grid, start, target) {
  open = priority queue ordered by h(cell)
  // h = Manhattan distance to target
  open.push(start)
  while open is not empty:
    cell = open.pop_min_h()
    visit(cell)
    if cell == target:
      return path via prev[]
    for next in neighbors(cell):
      if next not seen and not wall:
        prev[next] = cell
        open.push(next)
}`,
  },
  astar: {
    id: 'astar',
    name: 'A* Search',
    tagline: 'Cost so far + straight-line guess — fast AND shortest',
    guaranteesShortest: true,
    run: aStarRun,
    code: `void aStar(grid, start, target) {
  open = priority queue ordered by f = g + h
  g[start] = 0          // cost from start
  // h = Manhattan distance to target
  open.push(start)
  while open is not empty:
    cell = open.pop_min_f()
    visit(cell)
    if cell == target:
      return path via prev[]
    for next in neighbors(cell):
      if g[cell] + 1 < g[next] and not wall:
        g[next] = g[cell] + 1
        prev[next] = cell
        open.push(next)
}`,
  },
};

export function getGridAlgorithm(id: string): GridAlgorithm | undefined {
  return gridAlgorithmRegistry[id];
}

export function getGridAlgorithmOptions(): Array<{ id: string; name: string }> {
  return Object.values(gridAlgorithmRegistry).map(a => ({ id: a.id, name: a.name }));
}

export function getDefaultGridAlgorithm(): string {
  return 'bfs';
}

/**
 * Recursive-division maze. Walls land on even rows/columns with doors at odd
 * offsets, which keeps every region connected — a path between any two free
 * cells (including start and target, which are cleared afterwards) always
 * exists.
 */
export function generateMaze(rows: number, cols: number, start: Cell, target: Cell): Set<string> {
  const walls = new Set<string>();

  const divide = (r1: number, c1: number, r2: number, c2: number) => {
    const height = r2 - r1;
    const width = c2 - c1;
    if (height < 2 || width < 2) return;

    const horizontal = height > width ? true : width > height ? false : Math.random() < 0.5;

    if (horizontal) {
      // Wall on an even row inside the region, door at an odd column
      const candidates: number[] = [];
      for (let r = r1 + 1; r < r2; r++) if (r % 2 === 0) candidates.push(r);
      if (candidates.length === 0) return;
      const wallRow = candidates[Math.floor(Math.random() * candidates.length)];
      const doors: number[] = [];
      for (let c = c1; c <= c2; c++) if (c % 2 === 1) doors.push(c);
      const door = doors.length > 0 ? doors[Math.floor(Math.random() * doors.length)] : c1;
      for (let c = c1; c <= c2; c++) if (c !== door) walls.add(key(wallRow, c));
      divide(r1, c1, wallRow - 1, c2);
      divide(wallRow + 1, c1, r2, c2);
    } else {
      const candidates: number[] = [];
      for (let c = c1 + 1; c < c2; c++) if (c % 2 === 0) candidates.push(c);
      if (candidates.length === 0) return;
      const wallCol = candidates[Math.floor(Math.random() * candidates.length)];
      const doors: number[] = [];
      for (let r = r1; r <= r2; r++) if (r % 2 === 1) doors.push(r);
      const door = doors.length > 0 ? doors[Math.floor(Math.random() * doors.length)] : r1;
      for (let r = r1; r <= r2; r++) if (r !== door) walls.add(key(r, wallCol));
      divide(r1, c1, r2, wallCol - 1);
      divide(r1, wallCol + 1, r2, c2);
    }
  };

  divide(0, 0, rows - 1, cols - 1);

  // Never bury the endpoints
  walls.delete(key(start[0], start[1]));
  walls.delete(key(target[0], target[1]));
  return walls;
}
