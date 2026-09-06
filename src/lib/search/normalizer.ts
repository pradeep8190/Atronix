/**
 * Text normalizer and tokenizer for search matching
 */

export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s\-_/]+/g, ' ');
}

export function compactText(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function tokenize(text: string): string[] {
  const normalized = normalizeText(text);
  if (!normalized) return [];
  return normalized
    .split(' ')
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
}

/**
 * Finds all occurrence ranges of substring within text (case-insensitive)
 * Returns array of [start, end] tuples (inclusive).
 */
export function findMatchIndices(text: string, query: string): Array<[number, number]> {
  if (!text || !query) return [];
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return [];

  const results: Array<[number, number]> = [];
  let startIndex = 0;

  while ((startIndex = lowerText.indexOf(lowerQuery, startIndex)) !== -1) {
    results.push([startIndex, startIndex + lowerQuery.length - 1]);
    startIndex += lowerQuery.length;
  }

  // If exact whole-query match wasn't found, try matching individual tokens
  if (results.length === 0) {
    const tokens = tokenize(lowerQuery).filter((t) => t.length > 1);
    for (const token of tokens) {
      let tStart = 0;
      while ((tStart = lowerText.indexOf(token, tStart)) !== -1) {
        // avoid overlapping ranges
        const end = tStart + token.length - 1;
        const overlaps = results.some(
          ([rStart, rEnd]) => (tStart >= rStart && tStart <= rEnd) || (end >= rStart && end <= rEnd)
        );
        if (!overlaps) {
          results.push([tStart, end]);
        }
        tStart += token.length;
      }
    }
  }

  return results.sort((a, b) => a[0] - b[0]);
}
