/**
 * Damerau-Levenshtein Distance implementation.
 * Accounts for insertions, deletions, substitutions, and adjacent transpositions (e.g. "valut" -> "vault").
 */
export function damerauLevenshtein(a: string, b: string): number {
  const al = a.length;
  const bl = b.length;

  if (al === 0) return bl;
  if (bl === 0) return al;

  // Optimize allocation by reusing 2D matrix
  const matrix: number[][] = Array.from({ length: al + 1 }, () => new Array(bl + 1).fill(0));

  for (let i = 0; i <= al; i++) {
    matrix[i][0] = i;
  }
  for (let j = 0; j <= bl; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= al; i++) {
    for (let j = 1; j <= bl; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;

      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );

      // Check transposition of adjacent characters
      if (
        i > 1 &&
        j > 1 &&
        a[i - 1] === b[j - 2] &&
        a[i - 2] === b[j - 1]
      ) {
        matrix[i][j] = Math.min(matrix[i][j], matrix[i - 2][j - 2] + 1);
      }
    }
  }

  return matrix[al][bl];
}

/**
 * Returns a normalized similarity score between 0.0 (completely distinct) and 1.0 (identical)
 */
export function fuzzySimilarity(a: string, b: string): number {
  if (a === b) return 1;
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  const dist = damerauLevenshtein(a, b);
  return Math.max(0, 1 - dist / maxLen);
}

/**
 * Checks if query fuzzily matches any token or sliding window of target string
 */
export function fuzzyMatchTokens(
  query: string,
  targetTokens: string[],
  maxDistanceThreshold: number = 2
): { matched: boolean; bestScore: number; matchedToken?: string } {
  let bestScore = 0;
  let matchedToken: string | undefined;

  for (const token of targetTokens) {
    if (token.length < 3 && query.length > 2) continue;
    const dist = damerauLevenshtein(query, token);
    const maxLen = Math.max(query.length, token.length);
    const score = 1 - dist / maxLen;

    if (dist <= maxDistanceThreshold && score > bestScore) {
      bestScore = score;
      matchedToken = token;
    }
  }

  return {
    matched: bestScore >= 0.65,
    bestScore,
    matchedToken,
  };
}
