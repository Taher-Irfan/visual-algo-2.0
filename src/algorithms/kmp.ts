import type { StringAlgorithm, StringStep } from '../types';

/**
 * Knuth-Morris-Pratt C++ Code
 *
 * Line mapping (1-indexed) used for activeLine highlights:
 * 1:  void computeLPS(string p, int lps[]) {
 * 2:    int len = 0; lps[0] = 0;
 * 3:    for (int i = 1; i < p.size(); ) {
 * 4:      if (p[i] == p[len]) lps[i++] = ++len;
 * 5:      else if (len) len = lps[len - 1];
 * 6:      else lps[i++] = 0;
 * 7:    }
 * 8:  }
 * 9:  (blank)
 * 10: void KMP(string t, string p) {
 * 11:   computeLPS(p, lps);
 * 12:   int i = 0, j = 0;
 * 13:   while (i < t.size()) {
 * 14:     if (t[i] == p[j]) { i++; j++; }
 * 15:     if (j == p.size()) {
 * 16:       report match at i - j;
 * 17:       j = lps[j - 1];
 * 18:     } else if (i < t.size() && t[i] != p[j]) {
 * 19:       j ? j = lps[j - 1] : i++;
 * 20:     }
 * 21:   }
 * 22: }
 */
const code = `void computeLPS(string p, int lps[]) {
  int len = 0; lps[0] = 0;
  for (int i = 1; i < p.size(); ) {
    if (p[i] == p[len]) lps[i++] = ++len;
    else if (len) len = lps[len - 1];
    else lps[i++] = 0;
  }
}

void KMP(string t, string p) {
  computeLPS(p, lps);
  int i = 0, j = 0;
  while (i < t.size()) {
    if (t[i] == p[j]) { i++; j++; }
    if (j == p.size()) {
      report match at i - j;
      j = lps[j - 1];
    } else if (i < t.size() && t[i] != p[j]) {
      j ? j = lps[j - 1] : i++;
    }
  }
}`;

const ALPHABET = 'AB';

function randomText(length: number): string {
  return Array.from({ length }, () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join('');
}

/**
 * Generate visualization steps for Knuth-Morris-Pratt pattern matching.
 *
 * Phase 1 builds the LPS (longest proper prefix that is also a suffix)
 * failure table for the pattern. Phase 2 scans the text once: on a mismatch
 * the pattern jumps to lps[j-1] instead of restarting, so the text pointer
 * never moves backwards — giving the linear O(n + m) bound.
 *
 * A small two-letter alphabet makes repeated prefixes (and the LPS table)
 * actually interesting. The pattern is sampled from the text so at least
 * one match is always present.
 *
 * Time Complexity: O(n + m)   Space Complexity: O(m)
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

  const lps: (number | null)[] = new Array(m).fill(null);
  const aux = () => ({ label: 'LPS', values: [...lps] });

  // --- Phase 1: build the LPS table (lines 1-8) ---
  let len = 0;
  lps[0] = 0;
  steps.push({
    text,
    pattern,
    alignOffset: 0,
    auxTable: { ...aux(), highlight: [0] },
    activeLine: 2,
    highlights: { patternCompare: [0] },
    metadata: { description: 'LPS[0] = 0 — a single character has no proper prefix', i: 0, j: 0 },
    operations: { comparisons, matches },
  });

  let i = 1;
  while (i < m) {
    comparisons++;
    if (pattern[i] === pattern[len]) {
      len++;
      lps[i] = len;
      steps.push({
        text,
        pattern,
        alignOffset: 0,
        auxTable: { ...aux(), highlight: [i] },
        activeLine: 4,
        highlights: { patternCompare: [i, len - 1], patternMatch: [] },
        metadata: { description: `p[${i}] == p[${len - 1}] — LPS[${i}] = ${len}`, i, j: len },
        operations: { comparisons, matches },
      });
      i++;
    } else if (len !== 0) {
      steps.push({
        text,
        pattern,
        alignOffset: 0,
        auxTable: { ...aux(), highlight: [len - 1] },
        activeLine: 5,
        highlights: { patternCompare: [i], mismatch: [] },
        metadata: { description: `p[${i}] != p[${len}] — fall back: len = LPS[${len - 1}] = ${lps[len - 1]}`, i, j: len },
        operations: { comparisons, matches },
      });
      len = lps[len - 1] as number;
    } else {
      lps[i] = 0;
      steps.push({
        text,
        pattern,
        alignOffset: 0,
        auxTable: { ...aux(), highlight: [i] },
        activeLine: 6,
        highlights: { patternCompare: [i] },
        metadata: { description: `No prefix matches — LPS[${i}] = 0`, i, j: len },
        operations: { comparisons, matches },
      });
      i++;
    }
  }

  // --- Phase 2: scan the text (lines 10-22) ---
  let ti = 0;
  let j = 0;

  steps.push({
    text,
    pattern,
    alignOffset: 0,
    auxTable: aux(),
    activeLine: 12,
    highlights: { compare: [0], patternCompare: [0] },
    metadata: { description: 'LPS table ready — start scanning the text', i: 0, j: 0 },
    operations: { comparisons, matches },
  });

  while (ti < n) {
    const align = ti - j;
    comparisons++;
    const equal = text[ti] === pattern[j];

    steps.push({
      text,
      pattern,
      alignOffset: align,
      auxTable: aux(),
      activeLine: 14,
      highlights: {
        compare: [ti],
        match: Array.from({ length: j }, (_, k) => align + k),
        found: [...found],
        mismatch: equal ? [] : [ti],
        patternCompare: [j],
        patternMatch: Array.from({ length: j }, (_, k) => k),
      },
      metadata: {
        description: equal
          ? `t[${ti}] == p[${j}] — advance both pointers`
          : `t[${ti}] != p[${j}] — ${j > 0 ? `jump pattern to LPS[${j - 1}] = ${lps[j - 1]}` : 'advance text'}`,
        i: ti,
        j,
        matchPositions: [...matchPositions],
      },
      operations: { comparisons, matches },
    });

    if (equal) {
      ti++;
      j++;
    }

    if (j === m) {
      matches++;
      matchPositions.push(ti - j);
      for (let k = ti - j; k < ti; k++) if (!found.includes(k)) found.push(k);
      steps.push({
        text,
        pattern,
        alignOffset: ti - j,
        auxTable: aux(),
        activeLine: 16,
        highlights: { found: [...found], patternMatch: Array.from({ length: m }, (_, k) => k) },
        metadata: { description: `Full match at index ${ti - j}!`, i: ti, j, matchPositions: [...matchPositions] },
        operations: { comparisons, matches },
      });
      j = lps[j - 1] as number;
    } else if (ti < n && !equal) {
      if (j !== 0) {
        j = lps[j - 1] as number;
      } else {
        ti++;
      }
    }
  }

  // Final step
  steps.push({
    text,
    pattern,
    alignOffset: n - m,
    auxTable: aux(),
    activeLine: 22,
    highlights: { found: [...found] },
    metadata: {
      description: `Done — ${matches} match${matches === 1 ? '' : 'es'} at [${matchPositions.join(', ')}]`,
      matchPositions: [...matchPositions],
    },
    operations: { comparisons, matches },
  });

  return steps;
}

export const kmp: StringAlgorithm = {
  id: 'kmp',
  name: 'KMP Pattern Matching',
  generateSteps,
  code,
  complexity: {
    best: 'O(n + m)',
    average: 'O(n + m)',
    worst: 'O(n + m)',
    space: 'O(m)',
  },
};
