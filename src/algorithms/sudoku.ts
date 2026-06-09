import type { BoardAlgorithm, BoardStep } from '../types';

/**
 * Sudoku Solver C++ Code
 *
 * Line mapping (1-indexed) used for activeLine highlights:
 * 1:  bool solve(int cell) {
 * 2:    if (cell == 81) return true;       // grid complete
 * 3:    int r = cell / 9, c = cell % 9;
 * 4:    if (grid[r][c] != 0) return solve(cell + 1);
 * 5:    for (int v = 1; v <= 9; v++) {
 * 6:      if (valid(r, c, v)) {
 * 7:        grid[r][c] = v;
 * 8:        if (solve(cell + 1)) return true;
 * 9:        grid[r][c] = 0;                // backtrack
 * 10:     }
 * 11:   }
 * 12:   return false;
 * 13: }
 * 14: (blank)
 * 15: // valid(r,c,v): v not already in row r,
 * 16: //               column c, or the 3×3 box
 */
const code = `bool solve(int cell) {
  if (cell == 81) return true;       // grid complete
  int r = cell / 9, c = cell % 9;
  if (grid[r][c] != 0) return solve(cell + 1);
  for (int v = 1; v <= 9; v++) {
    if (valid(r, c, v)) {
      grid[r][c] = v;
      if (solve(cell + 1)) return true;
      grid[r][c] = 0;                // backtrack
    }
  }
  return false;
}

// valid(r,c,v): v not already in row r,
//               column c, or the 3×3 box`;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function isValid(grid: number[][], r: number, c: number, v: number): boolean {
  for (let k = 0; k < 9; k++) {
    if (grid[r][k] === v || grid[k][c] === v) return false;
  }
  const br = Math.floor(r / 3) * 3;
  const bc = Math.floor(c / 3) * 3;
  for (let i = br; i < br + 3; i++) {
    for (let j = bc; j < bc + 3; j++) {
      if (grid[i][j] === v) return false;
    }
  }
  return true;
}

/** Build a fully solved grid via randomized backtracking. */
function generateSolvedGrid(): number[][] {
  const grid: number[][] = Array.from({ length: 9 }, () => new Array(9).fill(0));
  const fill = (cell: number): boolean => {
    if (cell === 81) return true;
    const r = Math.floor(cell / 9);
    const c = cell % 9;
    for (const v of shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])) {
      if (isValid(grid, r, c, v)) {
        grid[r][c] = v;
        if (fill(cell + 1)) return true;
        grid[r][c] = 0;
      }
    }
    return false;
  };
  fill(0);
  return grid;
}

/**
 * Generate visualization steps for a Sudoku backtracking solver.
 *
 * A fresh puzzle is generated each time: a complete grid is built with
 * randomized backtracking, then `removals` cells are blanked. The solver
 * then fills empty cells in row-major order, trying digits 1-9 and
 * backtracking on dead ends. If a particular puzzle would produce an
 * excessively long animation, a new one is generated with fewer blanks.
 *
 * Time Complexity: O(9^k) worst case for k empty cells
 * Space Complexity: O(1) beyond the grid
 */
function generateSteps(size: number): BoardStep[] {
  // size 4-12 → 28-40 cells removed (more removals = more backtracking drama)
  let removals = Math.max(28, Math.min(40, 24 + size));
  const STEP_BUDGET = 2600;

  for (let attempt = 0; attempt < 8; attempt++) {
    const steps = tryGenerate(removals, STEP_BUDGET);
    if (steps) return steps;
    removals = Math.max(24, removals - 3);
  }
  // Final fallback: a very easy puzzle is guaranteed to fit the budget
  return tryGenerate(22, Number.POSITIVE_INFINITY)!;
}

function tryGenerate(removals: number, budget: number): BoardStep[] | null {
  const steps: BoardStep[] = [];
  const solution = generateSolvedGrid();
  const grid = solution.map(row => [...row]);

  const cells = shuffle(Array.from({ length: 81 }, (_, i) => i)).slice(0, removals);
  for (const cell of cells) {
    grid[Math.floor(cell / 9)][cell % 9] = 0;
  }
  const fixed = grid.map(row => row.map(v => v !== 0));

  let placements = 0;
  let backtracks = 0;

  const boardSnap = (): Array<Array<number | null>> =>
    grid.map(row => row.map(v => (v === 0 ? null : v)));

  steps.push({
    board: boardSnap(),
    fixed,
    boardKind: 'sudoku',
    activeLine: 1,
    highlights: {},
    metadata: { description: `Solve the puzzle: fill ${removals} empty cells so every row, column, and 3×3 box has 1-9` },
    operations: { placements, backtracks },
  });

  const solve = (cell: number): boolean => {
    if (steps.length > budget) return false; // animation too long — abort this instance
    if (cell === 81) return true;
    const r = Math.floor(cell / 9);
    const c = cell % 9;
    if (grid[r][c] !== 0) return solve(cell + 1);

    for (let v = 1; v <= 9; v++) {
      const ok = isValid(grid, r, c, v);

      // Step: try digit v at (r, c) (lines 5-6)
      steps.push({
        board: boardSnap(),
        fixed,
        boardKind: 'sudoku',
        activeLine: 6,
        highlights: { current: [[r, c]], conflict: ok ? [] : [[r, c]] },
        metadata: {
          description: ok
            ? `${v} fits at (${r}, ${c}) — place it`
            : `${v} conflicts at (${r}, ${c}) — try the next digit`,
          row: r,
          col: c,
          value: v,
        },
        operations: { placements, backtracks },
      });

      if (ok) {
        grid[r][c] = v;
        placements++;

        if (solve(cell + 1)) return true;
        if (steps.length > budget) return false;

        // Step: backtrack (line 9)
        grid[r][c] = 0;
        backtracks++;
        steps.push({
          board: boardSnap(),
          fixed,
          boardKind: 'sudoku',
          activeLine: 9,
          highlights: { conflict: [[r, c]] },
          metadata: { description: `Dead end — erase ${v} from (${r}, ${c}) and backtrack`, row: r, col: c, value: v },
          operations: { placements, backtracks },
        });
      }
    }
    return false;
  };

  const solved = solve(0);
  if (!solved || steps.length > budget) return null;

  // Final step: grid complete (line 2)
  const solvedCells: Array<[number, number]> = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (!fixed[r][c]) solvedCells.push([r, c]);
    }
  }
  steps.push({
    board: boardSnap(),
    fixed,
    boardKind: 'sudoku',
    activeLine: 2,
    highlights: { solution: solvedCells },
    metadata: {
      description: `Solved! ${placements} placements, ${backtracks} backtracks`,
      solved: true,
    },
    operations: { placements, backtracks },
  });

  return steps;
}

export const sudoku: BoardAlgorithm = {
  id: 'sudoku',
  name: 'Sudoku Solver',
  generateSteps,
  code,
  complexity: {
    best: 'O(k)',
    average: 'O(9^k)',
    worst: 'O(9^k)',
    space: 'O(1)',
  },
};
