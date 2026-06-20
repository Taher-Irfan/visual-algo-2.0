import type { DPAlgorithm, DPStep } from '../types';

/**
 * Edit Distance (Levenshtein) C++ Code
 *
 * Line mapping (1-indexed) used for activeLine highlights:
 * 1:  int editDistance(string A, string B) {
 * 2:    int m = A.size(), n = B.size();
 * 3:    vector dp(m + 1, vector<int>(n + 1));
 * 4:    for (int i = 0; i <= m; i++) dp[i][0] = i;
 * 5:    for (int j = 0; j <= n; j++) dp[0][j] = j;
 * 6:    for (int i = 1; i <= m; i++)
 * 7:      for (int j = 1; j <= n; j++)
 * 8:        if (A[i-1] == B[j-1])
 * 9:          dp[i][j] = dp[i-1][j-1];
 * 10:       else
 * 11:         dp[i][j] = 1 + min({ dp[i-1][j],     // delete
 * 12:                              dp[i][j-1],     // insert
 * 13:                              dp[i-1][j-1] }); // replace
 * 14:   return dp[m][n];
 * 15: }
 */
const code = `int editDistance(string A, string B) {
  int m = A.size(), n = B.size();
  vector dp(m + 1, vector<int>(n + 1));
  for (int i = 0; i <= m; i++) dp[i][0] = i;
  for (int j = 0; j <= n; j++) dp[0][j] = j;
  for (int i = 1; i <= m; i++)
    for (int j = 1; j <= n; j++)
      if (A[i-1] == B[j-1])
        dp[i][j] = dp[i-1][j-1];
      else
        dp[i][j] = 1 + min({ dp[i-1][j],      // delete
                             dp[i][j-1],      // insert
                             dp[i-1][j-1] }); // replace
  return dp[m][n];
}`;

const ALPHABET = 'ABCD';

function randomString(length: number): string {
  return Array.from({ length }, () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join('');
}

/**
 * Generate visualization steps for the Edit Distance (Levenshtein) DP.
 *
 * dp[i][j] = the minimum number of single-character insertions, deletions, or
 * substitutions to turn A[0..i) into B[0..j). On a character match the value
 * copies the diagonal; otherwise it is 1 plus the best of the three
 * neighbours (delete / insert / replace). A traceback recovers the cheapest
 * edit path.
 *
 * Time Complexity: O(m·n)   Space Complexity: O(m·n)
 */
function generateSteps(size: number): DPStep[] {
  const steps: DPStep[] = [];
  const m = Math.max(3, Math.min(9, size));
  const n = Math.max(3, Math.min(9, size - 1));
  const A = randomString(m);
  const B = randomString(n);

  let cellsFilled = 0;
  let comparisons = 0;

  const table: (number | null)[][] = Array.from({ length: m + 1 }, () =>
    new Array<number | null>(n + 1).fill(null)
  );
  const rowLabels = ['ε', ...A.split('')];
  const colLabels = ['ε', ...B.split('')];
  const base = { rowLabels, colLabels };
  const snap = () => table.map(row => [...row]);

  // Border: turning a prefix into the empty string costs one edit per char
  for (let i = 0; i <= m; i++) table[i][0] = i;
  for (let j = 0; j <= n; j++) table[0][j] = j;
  cellsFilled += m + n + 1;

  steps.push({
    table: snap(),
    ...base,
    activeLine: 5,
    highlights: {},
    metadata: { inputA: A, inputB: B, description: 'Borders: i edits to delete a prefix, j edits to insert one' },
    operations: { cellsFilled, comparisons },
  });

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const match = A[i - 1] === B[j - 1];
      comparisons++;

      // Step: compare A[i-1] with B[j-1] (line 8)
      steps.push({
        table: snap(),
        ...base,
        activeLine: 8,
        highlights: {
          current: [[i, j]],
          sources: match ? [[i - 1, j - 1]] : [[i - 1, j], [i, j - 1], [i - 1, j - 1]],
        },
        metadata: {
          inputA: A,
          inputB: B,
          i,
          j,
          description: match
            ? `'${A[i - 1]}' == '${B[j - 1]}' — free, copy the diagonal`
            : `'${A[i - 1]}' != '${B[j - 1]}' — 1 + min(delete, insert, replace)`,
        },
        operations: { cellsFilled, comparisons },
      });

      table[i][j] = match
        ? (table[i - 1][j - 1] as number)
        : 1 + Math.min(table[i - 1][j] as number, table[i][j - 1] as number, table[i - 1][j - 1] as number);
      cellsFilled++;

      // Step: write the cell (line 9 or 11)
      steps.push({
        table: snap(),
        ...base,
        activeLine: match ? 9 : 11,
        highlights: {
          current: [[i, j]],
          sources: match ? [[i - 1, j - 1]] : [[i - 1, j], [i, j - 1], [i - 1, j - 1]],
        },
        metadata: { inputA: A, inputB: B, i, j, description: `dp[${i}][${j}] = ${table[i][j]}` },
        operations: { cellsFilled, comparisons },
      });
    }
  }

  // Traceback the cheapest edit path
  const path: Array<[number, number]> = [];
  let ti = m;
  let tj = n;
  while (ti > 0 || tj > 0) {
    path.push([ti, tj]);
    if (ti > 0 && tj > 0 && A[ti - 1] === B[tj - 1]) {
      ti--;
      tj--;
    } else {
      const diag = ti > 0 && tj > 0 ? (table[ti - 1][tj - 1] as number) : Infinity;
      const up = ti > 0 ? (table[ti - 1][tj] as number) : Infinity;
      const left = tj > 0 ? (table[ti][tj - 1] as number) : Infinity;
      const best = Math.min(diag, up, left);
      if (best === diag) { ti--; tj--; }
      else if (best === up) ti--;
      else tj--;
    }
  }
  path.push([0, 0]);

  // Final step: highlight the traceback (line 14)
  steps.push({
    table: snap(),
    ...base,
    activeLine: 14,
    highlights: { result: path },
    metadata: {
      inputA: A,
      inputB: B,
      finalResult: `${table[m][n]} edits`,
      description: `Edit distance between "${A}" and "${B}" is ${table[m][n]}`,
    },
    operations: { cellsFilled, comparisons },
  });

  return steps;
}

export const dpEditDistance: DPAlgorithm = {
  id: 'editdistance',
  name: 'Edit Distance',
  generateSteps,
  code,
  complexity: {
    best: 'O(m·n)',
    average: 'O(m·n)',
    worst: 'O(m·n)',
    space: 'O(m·n)',
  },
};
