import type { DPAlgorithm, DPStep } from '../types';

/**
 * Longest Common Subsequence C++ Code
 *
 * Line mapping (1-indexed) used for activeLine highlights:
 * 1:  int lcs(string A, string B) {
 * 2:    int m = A.size(), n = B.size();
 * 3:    vector dp(m + 1, vector<int>(n + 1, 0));
 * 4:  (blank)
 * 5:    for (int i = 1; i <= m; i++) {
 * 6:      for (int j = 1; j <= n; j++) {
 * 7:        if (A[i-1] == B[j-1])
 * 8:          dp[i][j] = dp[i-1][j-1] + 1;
 * 9:        else
 * 10:         dp[i][j] = max(dp[i-1][j], dp[i][j-1]);
 * 11:     }
 * 12:   }
 * 13:   return dp[m][n];
 * 14: }
 */
const code = `int lcs(string A, string B) {
  int m = A.size(), n = B.size();
  vector dp(m + 1, vector<int>(n + 1, 0));

  for (int i = 1; i <= m; i++) {
    for (int j = 1; j <= n; j++) {
      if (A[i-1] == B[j-1])
        dp[i][j] = dp[i-1][j-1] + 1;
      else
        dp[i][j] = max(dp[i-1][j], dp[i][j-1]);
    }
  }
  return dp[m][n];
}`;

const ALPHABET = 'ABCDE';

function randomString(length: number): string {
  return Array.from({ length }, () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join('');
}

/**
 * Generate visualization steps for the Longest Common Subsequence DP.
 *
 * dp[i][j] = length of the LCS of A[0..i) and B[0..j). On a character match
 * the value extends the diagonal; otherwise it takes the max of dropping the
 * last character of either string. A traceback through the table at the end
 * recovers the subsequence itself.
 *
 * Time Complexity: O(m·n)   Space Complexity: O(m·n)
 */
function generateSteps(size: number): DPStep[] {
  const steps: DPStep[] = [];
  const m = Math.max(3, Math.min(10, size));
  const n = Math.max(3, Math.min(10, size - 1));
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

  // Initialise the border with zeros (line 3)
  for (let i = 0; i <= m; i++) table[i][0] = 0;
  for (let j = 0; j <= n; j++) table[0][j] = 0;
  cellsFilled += m + n + 1;

  steps.push({
    table: snap(),
    ...base,
    activeLine: 3,
    highlights: {},
    metadata: { inputA: A, inputB: B, description: 'Empty prefixes share no characters: first row and column are 0' },
    operations: { cellsFilled, comparisons },
  });

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const match = A[i - 1] === B[j - 1];
      comparisons++;

      // Step: compare A[i-1] with B[j-1] (line 7)
      steps.push({
        table: snap(),
        ...base,
        activeLine: 7,
        highlights: {
          current: [[i, j]],
          sources: match ? [[i - 1, j - 1]] : [[i - 1, j], [i, j - 1]],
        },
        metadata: {
          inputA: A,
          inputB: B,
          i,
          j,
          description: match
            ? `'${A[i - 1]}' == '${B[j - 1]}' — extend the diagonal`
            : `'${A[i - 1]}' != '${B[j - 1]}' — take the best of skipping either`,
        },
        operations: { cellsFilled, comparisons },
      });

      table[i][j] = match
        ? (table[i - 1][j - 1] as number) + 1
        : Math.max(table[i - 1][j] as number, table[i][j - 1] as number);
      cellsFilled++;

      // Step: write the cell (line 8 or 10)
      steps.push({
        table: snap(),
        ...base,
        activeLine: match ? 8 : 10,
        highlights: {
          current: [[i, j]],
          sources: match ? [[i - 1, j - 1]] : [[i - 1, j], [i, j - 1]],
        },
        metadata: { inputA: A, inputB: B, i, j, description: `dp[${i}][${j}] = ${table[i][j]}` },
        operations: { cellsFilled, comparisons },
      });
    }
  }

  // Traceback to recover the subsequence itself
  const path: Array<[number, number]> = [];
  let ti = m;
  let tj = n;
  let lcsStr = '';
  while (ti > 0 && tj > 0) {
    path.push([ti, tj]);
    if (A[ti - 1] === B[tj - 1]) {
      lcsStr = A[ti - 1] + lcsStr;
      ti--;
      tj--;
    } else if ((table[ti - 1][tj] as number) >= (table[ti][tj - 1] as number)) {
      ti--;
    } else {
      tj--;
    }
  }

  // Final step: highlight the traceback path (line 13)
  steps.push({
    table: snap(),
    ...base,
    activeLine: 13,
    highlights: { result: path },
    metadata: {
      inputA: A,
      inputB: B,
      finalResult: `"${lcsStr}" (length ${table[m][n]})`,
      description: `LCS of "${A}" and "${B}" is "${lcsStr}"`,
    },
    operations: { cellsFilled, comparisons },
  });

  return steps;
}

export const dpLCS: DPAlgorithm = {
  id: 'lcs',
  name: 'Longest Common Subsequence',
  generateSteps,
  code,
  complexity: {
    best: 'O(m·n)',
    average: 'O(m·n)',
    worst: 'O(m·n)',
    space: 'O(m·n)',
  },
};
