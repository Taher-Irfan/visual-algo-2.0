import type { StringAlgorithm, StringStep } from '../types';

/**
 * Longest Palindromic Substring (expand around center) C++ Code
 *
 * Line mapping (1-indexed) used for activeLine highlights:
 * 1:  string longestPalindrome(string s) {
 * 2:    int bestL = 0, bestLen = 1;
 * 3:    for (int c = 0; c < s.size(); c++) {
 * 4:      expand(c, c);       // odd-length centers
 * 5:      expand(c, c + 1);   // even-length centers
 * 6:    }
 * 7:    return s.substr(bestL, bestLen);
 * 8:  }
 * 9:  (blank)
 * 10: void expand(int l, int r) {
 * 11:   while (l >= 0 && r < n && s[l] == s[r]) {
 * 12:     if (r - l + 1 > bestLen)
 * 13:       { bestL = l; bestLen = r - l + 1; }
 * 14:     l--; r++;
 * 15:   }
 * 16: }
 */
const code = `string longestPalindrome(string s) {
  int bestL = 0, bestLen = 1;
  for (int c = 0; c < s.size(); c++) {
    expand(c, c);       // odd-length centers
    expand(c, c + 1);   // even-length centers
  }
  return s.substr(bestL, bestLen);
}

void expand(int l, int r) {
  while (l >= 0 && r < n && s[l] == s[r]) {
    if (r - l + 1 > bestLen)
      { bestL = l; bestLen = r - l + 1; }
    l--; r++;
  }
}`;

const ALPHABET = 'ABC';

function randomText(length: number): string {
  return Array.from({ length }, () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join('');
}

/**
 * Generate visualization steps for finding the Longest Palindromic Substring
 * by expanding around every center.
 *
 * Every palindrome is symmetric around a center — either a character (odd
 * length) or a gap between characters (even length). For each of the 2n-1
 * centers the algorithm expands outward while the boundary characters match,
 * tracking the longest palindrome seen.
 *
 * A three-letter alphabet keeps palindromes frequent enough to be fun.
 *
 * Time Complexity: O(n²)   Space Complexity: O(1)
 */
function generateSteps(size: number): StringStep[] {
  const steps: StringStep[] = [];
  const n = Math.max(8, Math.min(14, size + 4));
  const text = randomText(n);

  let comparisons = 0;
  let matches = 0; // counts palindromes found that improved the best
  let bestL = 0;
  let bestLen = 1;

  const bestIdx = () => Array.from({ length: bestLen }, (_, k) => bestL + k);
  const range = (lo: number, hi: number) =>
    hi >= lo ? Array.from({ length: hi - lo + 1 }, (_, k) => lo + k) : [];

  steps.push({
    text,
    activeLine: 2,
    highlights: { found: [0] },
    metadata: { description: 'Any single character is a palindrome — best starts at length 1', longestPalindrome: text[0] },
    operations: { comparisons, matches },
  });

  const expand = (startL: number, startR: number, line: number, kind: string) => {
    let l = startL;
    let r = startR;

    while (l >= 0 && r < n) {
      comparisons++;
      const equal = text[l] === text[r];

      steps.push({
        text,
        activeLine: 11,
        highlights: {
          compare: [l, r],
          match: equal ? range(l, r) : range(l + 1, r - 1),
          found: bestIdx(),
          mismatch: equal ? [] : l === r ? [] : [l, r],
        },
        metadata: {
          description: equal
            ? `s[${l}] == s[${r}] — "${text.slice(l, r + 1)}" is a palindrome (${kind} center)`
            : `s[${l}] != s[${r}] — stop expanding this center`,
          i: l,
          j: r,
          longestPalindrome: text.slice(bestL, bestL + bestLen),
        },
        operations: { comparisons, matches },
      });

      if (!equal) break;

      if (r - l + 1 > bestLen) {
        bestL = l;
        bestLen = r - l + 1;
        matches++;
        steps.push({
          text,
          activeLine: 13,
          highlights: { found: bestIdx() },
          metadata: {
            description: `New best: "${text.slice(bestL, bestL + bestLen)}" (length ${bestLen})`,
            longestPalindrome: text.slice(bestL, bestL + bestLen),
          },
          operations: { comparisons, matches },
        });
      }

      l--;
      r++;
    }
    void line;
  };

  for (let c = 0; c < n; c++) {
    // Odd-length center at c (line 4)
    expand(c, c, 4, 'odd');
    // Even-length center between c and c+1 (line 5)
    if (c + 1 < n) expand(c, c + 1, 5, 'even');
  }

  // Final step (line 7)
  steps.push({
    text,
    activeLine: 7,
    highlights: { found: bestIdx() },
    metadata: {
      description: `Longest palindromic substring: "${text.slice(bestL, bestL + bestLen)}" (length ${bestLen})`,
      longestPalindrome: text.slice(bestL, bestL + bestLen),
    },
    operations: { comparisons, matches },
  });

  return steps;
}

export const palindrome: StringAlgorithm = {
  id: 'palindrome',
  name: 'Longest Palindromic Substring',
  generateSteps,
  code,
  complexity: {
    best: 'O(n)',
    average: 'O(n²)',
    worst: 'O(n²)',
    space: 'O(1)',
  },
};
