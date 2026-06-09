import type { StringAlgorithm, StringStep } from '../types';

/**
 * Rabin-Karp C++ Code
 *
 * Line mapping (1-indexed) used for activeLine highlights:
 * 1:  void rabinKarp(string t, string p) {
 * 2:    int m = p.size(), n = t.size();
 * 3:    long ph = hash(p);
 * 4:    long th = hash(t.substr(0, m));
 * 5:    for (int s = 0; s + m <= n; s++) {
 * 6:      if (th == ph) {
 * 7:        if (t.substr(s, m) == p)   // verify char by char
 * 8:          report match at s;
 * 9:        // else: spurious hit (hash collision)
 * 10:     }
 * 11:     th = roll(th, t[s], t[s + m]);  // slide the window
 * 12:   }
 * 13: }
 */
const code = `void rabinKarp(string t, string p) {
  int m = p.size(), n = t.size();
  long ph = hash(p);
  long th = hash(t.substr(0, m));
  for (int s = 0; s + m <= n; s++) {
    if (th == ph) {
      if (t.substr(s, m) == p)   // verify char by char
        report match at s;
      // else: spurious hit (hash collision)
    }
    th = roll(th, t[s], t[s + m]);  // slide the window
  }
}`;

const ALPHABET = 'AB';
// Small base/modulus on purpose: spurious hash hits become visible,
// which is the most instructive part of Rabin-Karp.
const BASE = 3;
const MOD = 31;

function randomText(length: number): string {
  return Array.from({ length }, () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join('');
}

function charCode(ch: string): number {
  return ch.charCodeAt(0) - 64; // A=1, B=2
}

/**
 * Generate visualization steps for Rabin-Karp pattern matching.
 *
 * The pattern and a sliding text window are compared by hash value first;
 * only equal hashes trigger a character-by-character verification. The
 * rolling hash updates in O(1) per shift. A deliberately small modulus
 * makes occasional spurious hits (hash collisions that fail verification)
 * appear, demonstrating why verification is required.
 *
 * Time Complexity: O(n + m) average, O(n·m) worst   Space Complexity: O(1)
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

  const hashOf = (s: string): number => {
    let h = 0;
    for (const ch of s) h = (h * BASE + charCode(ch)) % MOD;
    return h;
  };

  const ph = hashOf(pattern);
  let th = hashOf(text.slice(0, m));
  // BASE^(m-1) mod MOD, used to remove the outgoing character
  let pow = 1;
  for (let k = 0; k < m - 1; k++) pow = (pow * BASE) % MOD;

  const aux = (windowHash: number) => ({
    label: 'hash',
    values: [`pattern: ${ph}`, `window: ${windowHash}`],
  });

  const windowIdx = (s: number) => Array.from({ length: m }, (_, k) => s + k);

  // Step: hash the pattern (line 3)
  steps.push({
    text,
    pattern,
    alignOffset: 0,
    auxTable: aux(th),
    activeLine: 3,
    highlights: { patternMatch: Array.from({ length: m }, (_, k) => k) },
    metadata: { description: `hash("${pattern}") = ${ph} (base ${BASE}, mod ${MOD})` },
    operations: { comparisons, matches },
  });

  // Step: hash the first window (line 4)
  steps.push({
    text,
    pattern,
    alignOffset: 0,
    auxTable: aux(th),
    activeLine: 4,
    highlights: { match: windowIdx(0) },
    metadata: { description: `hash of first window "${text.slice(0, m)}" = ${th}` },
    operations: { comparisons, matches },
  });

  for (let s = 0; s + m <= n; s++) {
    // Step: compare hashes (line 6)
    comparisons++;
    const hashEqual = th === ph;
    steps.push({
      text,
      pattern,
      alignOffset: s,
      auxTable: aux(th),
      activeLine: 6,
      highlights: {
        compare: windowIdx(s),
        found: [...found],
        patternCompare: Array.from({ length: m }, (_, k) => k),
      },
      metadata: {
        description: hashEqual
          ? `Hashes equal (${th}) — verify character by character`
          : `Hashes differ (${th} vs ${ph}) — skip without comparing characters`,
        i: s,
        matchPositions: [...matchPositions],
      },
      operations: { comparisons, matches },
    });

    if (hashEqual) {
      // Verify character by character (line 7)
      let ok = true;
      for (let k = 0; k < m; k++) {
        comparisons++;
        if (text[s + k] !== pattern[k]) { ok = false; break; }
      }

      if (ok) {
        matches++;
        matchPositions.push(s);
        for (const idx of windowIdx(s)) if (!found.includes(idx)) found.push(idx);
        steps.push({
          text,
          pattern,
          alignOffset: s,
          auxTable: aux(th),
          activeLine: 8,
          highlights: { found: [...found], patternMatch: Array.from({ length: m }, (_, k) => k) },
          metadata: { description: `Verified — match at index ${s}!`, i: s, matchPositions: [...matchPositions] },
          operations: { comparisons, matches },
        });
      } else {
        steps.push({
          text,
          pattern,
          alignOffset: s,
          auxTable: aux(th),
          activeLine: 9,
          highlights: { mismatch: windowIdx(s), found: [...found] },
          metadata: {
            description: `Spurious hit! Equal hashes but "${text.slice(s, s + m)}" != "${pattern}" — a hash collision`,
            i: s,
            matchPositions: [...matchPositions],
          },
          operations: { comparisons, matches },
        });
      }
    }

    // Roll the hash to the next window (line 11)
    if (s + m < n) {
      th = ((th - charCode(text[s]) * pow) % MOD + MOD) % MOD;
      th = (th * BASE + charCode(text[s + m])) % MOD;
    }
  }

  // Final step
  steps.push({
    text,
    pattern,
    alignOffset: n - m,
    auxTable: aux(th),
    activeLine: 13,
    highlights: { found: [...found] },
    metadata: {
      description: `Done — ${matches} match${matches === 1 ? '' : 'es'} at [${matchPositions.join(', ')}]`,
      matchPositions: [...matchPositions],
    },
    operations: { comparisons, matches },
  });

  return steps;
}

export const rabinKarp: StringAlgorithm = {
  id: 'rabinkarp',
  name: 'Rabin-Karp',
  generateSteps,
  code,
  complexity: {
    best: 'O(n + m)',
    average: 'O(n + m)',
    worst: 'O(n·m)',
    space: 'O(1)',
  },
};
