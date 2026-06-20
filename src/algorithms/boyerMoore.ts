import type { StringAlgorithm, StringStep } from '../types';

/**
 * Boyer-Moore (bad-character heuristic) C++ Code
 *
 * Line mapping (1-indexed) used for activeLine highlights:
 * 1:  void boyerMoore(string t, string p) {
 * 2:    int m = p.size(), n = t.size();
 * 3:    last = lastOccurrence(p);  // char -> rightmost index, else -1
 * 4:    int s = 0;                 // alignment of pattern over text
 * 5:    while (s + m <= n) {
 * 6:      int j = m - 1;
 * 7:      while (j >= 0 && p[j] == t[s + j]) j--;
 * 8:      if (j < 0) {
 * 9:        report match at s;
 * 10:       s += 1;
 * 11:     } else {
 * 12:       s += max(1, j - last[t[s + j]]);
 * 13:     }
 * 14:   }
 * 15: }
 */
const code = `void boyerMoore(string t, string p) {
  int m = p.size(), n = t.size();
  last = lastOccurrence(p);  // char -> rightmost index, else -1
  int s = 0;                 // alignment of pattern over text
  while (s + m <= n) {
    int j = m - 1;
    while (j >= 0 && p[j] == t[s + j]) j--;
    if (j < 0) {
      report match at s;
      s += 1;
    } else {
      s += max(1, j - last[t[s + j]]);
    }
  }
}`;

// A four-letter alphabet keeps bad-character shifts large enough to see.
const ALPHABET = 'ABCD';

function randomText(length: number): string {
  return Array.from({ length }, () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join('');
}

/**
 * Generate visualization steps for Boyer-Moore pattern matching using the
 * bad-character heuristic.
 *
 * Each alignment is compared from right to left. On a mismatch the pattern
 * jumps so the offending text character lines up with its last occurrence in
 * the pattern (or past it entirely), often skipping many positions at once —
 * which is why Boyer-Moore is frequently sublinear in practice.
 *
 * Time Complexity: O(n/m) best, O(n·m) worst   Space Complexity: O(alphabet)
 */
function generateSteps(size: number): StringStep[] {
  const steps: StringStep[] = [];
  const n = Math.max(12, Math.min(22, size + 10));
  const text = randomText(n);
  const m = 4;
  const start = Math.floor(Math.random() * (n - m));
  const pattern = text.slice(start, start + m);

  let comparisons = 0;
  let matches = 0;
  const found: number[] = [];
  const matchPositions: number[] = [];

  // Bad-character table: rightmost index of each character within the pattern
  const last: Record<string, number> = {};
  for (const ch of ALPHABET) last[ch] = -1;
  for (let k = 0; k < m; k++) last[pattern[k]] = k;
  const aux = () => ({
    label: 'last',
    values: ALPHABET.split('').map(ch => `${ch}:${last[ch]}`),
  });

  // Step: built the bad-character table (line 3)
  steps.push({
    text,
    pattern,
    alignOffset: 0,
    auxTable: aux(),
    activeLine: 3,
    highlights: { patternMatch: Array.from({ length: m }, (_, k) => k) },
    metadata: { description: `Bad-character table: rightmost index of each letter in "${pattern}"` },
    operations: { comparisons, matches },
  });

  let s = 0;
  while (s + m <= n) {
    let j = m - 1;

    // Scan this alignment right-to-left (lines 6-7)
    while (j >= 0) {
      comparisons++;
      const equal = pattern[j] === text[s + j];
      steps.push({
        text,
        pattern,
        alignOffset: s,
        auxTable: aux(),
        activeLine: 7,
        highlights: {
          compare: [s + j],
          match: Array.from({ length: m - 1 - j }, (_, k) => s + j + 1 + k),
          found: [...found],
          mismatch: equal ? [] : [s + j],
          patternCompare: [j],
          patternMatch: Array.from({ length: m - 1 - j }, (_, k) => j + 1 + k),
        },
        metadata: {
          description: equal
            ? `p[${j}] == t[${s + j}] ('${pattern[j]}') — keep scanning left`
            : `p[${j}] != t[${s + j}] ('${pattern[j]}' vs '${text[s + j]}') — mismatch`,
          i: s,
          j,
          matchPositions: [...matchPositions],
        },
        operations: { comparisons, matches },
      });
      if (!equal) break;
      j--;
    }

    if (j < 0) {
      // Whole pattern matched (lines 8-10)
      matches++;
      matchPositions.push(s);
      for (let k = s; k < s + m; k++) if (!found.includes(k)) found.push(k);
      steps.push({
        text,
        pattern,
        alignOffset: s,
        auxTable: aux(),
        activeLine: 9,
        highlights: { found: [...found], patternMatch: Array.from({ length: m }, (_, k) => k) },
        metadata: { description: `Full match at index ${s}!`, i: s, matchPositions: [...matchPositions] },
        operations: { comparisons, matches },
      });
      s += 1;
    } else {
      // Bad-character shift (line 12)
      const badChar = text[s + j];
      const shift = Math.max(1, j - last[badChar]);
      steps.push({
        text,
        pattern,
        alignOffset: s,
        auxTable: aux(),
        activeLine: 12,
        highlights: { mismatch: [s + j], found: [...found], patternCompare: [j] },
        metadata: {
          description: `Shift pattern by max(1, ${j} - last['${badChar}']=${last[badChar]}) = ${shift}`,
          i: s,
          j,
          matchPositions: [...matchPositions],
        },
        operations: { comparisons, matches },
      });
      s += shift;
    }
  }

  // Final step
  steps.push({
    text,
    pattern,
    alignOffset: Math.max(0, n - m),
    auxTable: aux(),
    activeLine: 15,
    highlights: { found: [...found] },
    metadata: {
      description: `Done — ${matches} match${matches === 1 ? '' : 'es'} at [${matchPositions.join(', ')}]`,
      matchPositions: [...matchPositions],
    },
    operations: { comparisons, matches },
  });

  return steps;
}

export const boyerMoore: StringAlgorithm = {
  id: 'boyermoore',
  name: 'Boyer-Moore',
  generateSteps,
  code,
  complexity: {
    best: 'O(n/m)',
    average: 'O(n)',
    worst: 'O(n·m)',
    space: 'O(k)',
  },
};
