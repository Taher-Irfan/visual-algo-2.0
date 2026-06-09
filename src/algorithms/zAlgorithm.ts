import type { StringAlgorithm, StringStep } from '../types';

/**
 * Z-Algorithm C++ Code
 *
 * Line mapping (1-indexed) used for activeLine highlights:
 * 1:  void zSearch(string p, string t) {
 * 2:    string s = p + "$" + t;
 * 3:    int n = s.size(), m = p.size();
 * 4:    vector<int> z(n, 0);
 * 5:    int l = 0, r = 0;
 * 6:    for (int i = 1; i < n; i++) {
 * 7:      if (i < r) z[i] = min(r - i, z[i - l]);
 * 8:      while (i + z[i] < n && s[z[i]] == s[i + z[i]])
 * 9:        z[i]++;
 * 10:     if (i + z[i] > r) { l = i; r = i + z[i]; }
 * 11:     if (z[i] == m) report match at i - m - 1;
 * 12:   }
 * 13: }
 */
const code = `void zSearch(string p, string t) {
  string s = p + "$" + t;
  int n = s.size(), m = p.size();
  vector<int> z(n, 0);
  int l = 0, r = 0;
  for (int i = 1; i < n; i++) {
    if (i < r) z[i] = min(r - i, z[i - l]);
    while (i + z[i] < n && s[z[i]] == s[i + z[i]])
      z[i]++;
    if (i + z[i] > r) { l = i; r = i + z[i]; }
    if (z[i] == m) report match at i - m - 1;
  }
}`;

const ALPHABET = 'AB';

function randomText(length: number): string {
  return Array.from({ length }, () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join('');
}

/**
 * Generate visualization steps for the Z-Algorithm applied to pattern
 * matching.
 *
 * The combined string s = pattern + '$' + text is scanned once; z[i] is the
 * length of the longest substring starting at i that matches a prefix of s.
 * The [l, r) Z-box lets previously computed values seed new ones, keeping
 * the total work linear. Wherever z[i] equals the pattern length, the
 * pattern occurs in the text.
 *
 * Time Complexity: O(n + m)   Space Complexity: O(n + m)
 */
function generateSteps(size: number): StringStep[] {
  const steps: StringStep[] = [];
  const textLen = Math.max(10, Math.min(18, size + 6));
  const rawText = randomText(textLen);
  const m = 3;
  const start = Math.floor(Math.random() * (textLen - m));
  const pattern = rawText.slice(start, start + m);
  const s = pattern + '$' + rawText;
  const n = s.length;

  let comparisons = 0;
  let matches = 0;
  const found: number[] = [];
  const matchPositions: number[] = []; // positions in the ORIGINAL text

  const z: (number | null)[] = new Array(n).fill(null);
  z[0] = n;
  const aux = (hl?: number[]) => ({ label: 'Z', values: [...z], highlight: hl });

  const zbox = (l: number, r: number) =>
    r > l ? Array.from({ length: r - l }, (_, k) => l + k) : [];

  // Step: build the combined string (line 2)
  steps.push({
    text: s,
    activeLine: 2,
    auxTable: aux([0]),
    highlights: { match: Array.from({ length: m }, (_, k) => k) },
    metadata: { description: `s = "${pattern}" + "$" + text — match wherever Z[i] = ${m}` },
    operations: { comparisons, matches },
  });

  let l = 0;
  let r = 0;
  const zi = new Array<number>(n).fill(0);
  zi[0] = n;

  for (let i = 1; i < n; i++) {
    // Seed from the Z-box if inside it (line 7)
    if (i < r) {
      zi[i] = Math.min(r - i, zi[i - l]);
      steps.push({
        text: s,
        activeLine: 7,
        auxTable: aux([i, i - l]),
        highlights: { compare: [i], match: zbox(l, r), found: [...found] },
        metadata: {
          description: `i=${i} is inside the Z-box [${l}, ${r}) — seed Z[${i}] = min(${r - i}, Z[${i - l}]) = ${zi[i]}`,
          i,
          matchPositions: [...matchPositions],
        },
        operations: { comparisons, matches },
      });
    }

    // Extend by direct comparison (lines 8-9)
    while (i + zi[i] < n && s[zi[i]] === s[i + zi[i]]) {
      comparisons++;
      zi[i]++;
      steps.push({
        text: s,
        activeLine: 9,
        auxTable: aux([i]),
        highlights: {
          compare: [zi[i] - 1, i + zi[i] - 1],
          match: Array.from({ length: zi[i] }, (_, k) => i + k),
          found: [...found],
        },
        metadata: {
          description: `s[${zi[i] - 1}] == s[${i + zi[i] - 1}] — extend Z[${i}] to ${zi[i]}`,
          i,
          matchPositions: [...matchPositions],
        },
        operations: { comparisons, matches },
      });
    }
    // The comparison that ended the loop (if any position remained)
    if (i + zi[i] < n) comparisons++;

    z[i] = zi[i];

    // Update the Z-box (line 10)
    if (i + zi[i] > r) {
      l = i;
      r = i + zi[i];
    }

    // A Z-value equal to the pattern length is a match (line 11)
    if (zi[i] === m) {
      matches++;
      const textPos = i - m - 1;
      matchPositions.push(textPos);
      for (let k = i; k < i + m; k++) if (!found.includes(k)) found.push(k);
      steps.push({
        text: s,
        activeLine: 11,
        auxTable: aux([i]),
        highlights: { found: [...found] },
        metadata: {
          description: `Z[${i}] = ${m} = |pattern| — match at text index ${textPos}!`,
          i,
          matchPositions: [...matchPositions],
        },
        operations: { comparisons, matches },
      });
    } else {
      steps.push({
        text: s,
        activeLine: 6,
        auxTable: aux([i]),
        highlights: { compare: [i], found: [...found] },
        metadata: { description: `Z[${i}] = ${zi[i]}`, i, matchPositions: [...matchPositions] },
        operations: { comparisons, matches },
      });
    }
  }

  // Final step
  steps.push({
    text: s,
    activeLine: 13,
    auxTable: aux(),
    highlights: { found: [...found] },
    metadata: {
      description: `Done — ${matches} match${matches === 1 ? '' : 'es'} at text positions [${matchPositions.join(', ')}]`,
      matchPositions: [...matchPositions],
    },
    operations: { comparisons, matches },
  });

  return steps;
}

export const zAlgorithm: StringAlgorithm = {
  id: 'z',
  name: 'Z-Algorithm',
  generateSteps,
  code,
  complexity: {
    best: 'O(n + m)',
    average: 'O(n + m)',
    worst: 'O(n + m)',
    space: 'O(n + m)',
  },
};
