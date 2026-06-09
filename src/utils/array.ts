export function generateRandomArray(size: number): number[] {
  return Array.from({ length: size }, () => Math.floor(Math.random() * 100) + 1);
}

/** Small deterministic PRNG (mulberry32) for reproducible shareable races. */
function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Same value range as generateRandomArray, but reproducible from a seed. */
export function generateSeededArray(size: number, seed: number): number[] {
  const rnd = mulberry32(seed);
  return Array.from({ length: size }, () => Math.floor(rnd() * 100) + 1);
}
