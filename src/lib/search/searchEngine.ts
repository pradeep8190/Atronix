import type {
  SearchDocument,
  SearchResult,
  SearchResponse,
  DidYouMeanSuggestion,
  MatchHighlight,
} from './types';
import { normalizeText, compactText, tokenize, findMatchIndices } from './normalizer';
import { damerauLevenshtein, fuzzySimilarity } from './levenshtein';
import { buildSearchCatalog } from './registryMeta';

// In-memory cached catalog
let cachedCatalog: SearchDocument[] | null = null;

export function getSearchCatalog(): SearchDocument[] {
  if (!cachedCatalog) {
    cachedCatalog = buildSearchCatalog();
  }
  return cachedCatalog;
}

/**
 * Searches the Atronix catalog with YouTube-grade intelligence:
 * - Exact and prefix matching
 * - Spacing and hyphen normalization
 * - Semantic synonyms & aliases
 * - Damerau-Levenshtein typo tolerance
 * - "Did you mean?" suggestions
 */
export function searchCatalog(
  rawQuery: string,
  catalog: SearchDocument[] = getSearchCatalog(),
  maxResults: number = 8
): SearchResponse {
  const query = rawQuery.trim();
  if (!query) {
    return {
      results: [],
      query: '',
      totalCount: 0,
    };
  }

  const normQuery = normalizeText(query);
  const compQuery = compactText(query);
  const queryTokens = tokenize(query);

  const scoredResults: SearchResult[] = [];
  let bestFuzzySuggestion: DidYouMeanSuggestion | undefined;
  let highestFuzzyScore = 0;

  for (const doc of catalog) {
    let score = 0;
    let matchedField: SearchResult['matchedField'] = 'name';
    let matchedValue = doc.name;
    const highlights: MatchHighlight[] = [];
    let isFuzzy = false;

    const normName = normalizeText(doc.name);
    const compName = compactText(doc.name);
    const nameTokens = tokenize(doc.name);

    // 1. Exact Name / ID Match (Score: 100)
    if (normName === normQuery || doc.id.toLowerCase() === normQuery) {
      score = Math.max(score, 100);
      matchedField = 'name';
      matchedValue = doc.name;
      highlights.push({ field: 'name', indices: findMatchIndices(doc.name, query) });
    }
    // 2. Compact Match (e.g. "frostvault" -> "frost vault" or "liquidmitosis")
    else if (compName === compQuery || compName.includes(compQuery)) {
      score = Math.max(score, 90);
      matchedField = 'name';
      matchedValue = doc.name;
      highlights.push({ field: 'name', indices: findMatchIndices(doc.name, query) });
    }
    // 3. Name Prefix Match (e.g. "fro" in "frost vault")
    else if (normName.startsWith(normQuery) || nameTokens.some((t) => t.startsWith(normQuery))) {
      score = Math.max(score, 85);
      matchedField = 'name';
      matchedValue = doc.name;
      highlights.push({ field: 'name', indices: findMatchIndices(doc.name, query) });
    }
    // 4. Name Contains Query
    else if (normName.includes(normQuery)) {
      score = Math.max(score, 80);
      matchedField = 'name';
      matchedValue = doc.name;
      highlights.push({ field: 'name', indices: findMatchIndices(doc.name, query) });
    }

    // 5. Semantic Aliases Match (e.g. "folder", "glass folder", "card reveal")
    for (const alias of doc.aliases) {
      const normAlias = normalizeText(alias);
      const compAlias = compactText(alias);

      if (normAlias === normQuery || compAlias === compQuery) {
        if (score < 85) {
          score = 85;
          matchedField = 'aliases';
          matchedValue = alias;
        }
      } else if (normAlias.includes(normQuery) || queryTokens.every((qt) => normAlias.includes(qt))) {
        if (score < 75) {
          score = 75;
          matchedField = 'aliases';
          matchedValue = alias;
        }
      } else if (normQuery.includes(normAlias)) {
        if (score < 70) {
          score = 70;
          matchedField = 'aliases';
          matchedValue = alias;
        }
      }
    }

    // 6. Visual Tags / Category Match
    for (const tag of doc.tags) {
      const normTag = normalizeText(tag);
      if (normTag === normQuery || normTag.startsWith(normQuery)) {
        if (score < 60) {
          score = 60;
          matchedField = 'tags';
          matchedValue = tag;
        }
      }
    }

    const normCat = normalizeText(doc.category);
    if (normCat.includes(normQuery)) {
      if (score < 50) {
        score = 50;
        matchedField = 'category';
        matchedValue = doc.category;
      }
    }

    // 7. Description Match
    const normDesc = normalizeText(doc.description);
    if (normDesc.includes(normQuery) || queryTokens.some((qt) => qt.length > 3 && normDesc.includes(qt))) {
      if (score < 40) {
        score = 40;
        matchedField = 'description';
        matchedValue = doc.description;
        highlights.push({ field: 'description', indices: findMatchIndices(doc.description, query) });
      }
    }

    // 8. Typo Tolerance / Damerau-Levenshtein Fuzzy Matching
    // Check against Title Tokens & Aliases (e.g. "frost valut" -> "frost vault")
    if (score < 70 && query.length >= 3) {
      // Check full string distance to component name
      const fullDist = damerauLevenshtein(normQuery, normName);
      const fullSim = fuzzySimilarity(normQuery, normName);

      if (fullDist <= 2 && fullSim >= 0.7) {
        const fuzzyScore = Math.round(70 * fullSim);
        if (fuzzyScore > score) {
          score = fuzzyScore;
          matchedField = 'name';
          matchedValue = doc.name;
          isFuzzy = true;
        }
      } else {
        // Check token-by-token typo tolerance
        for (const qToken of queryTokens) {
          if (qToken.length < 3) continue;

          // Check name tokens
          for (const nToken of nameTokens) {
            const dist = damerauLevenshtein(qToken, nToken);
            if (dist <= 2) {
              const sim = 1 - dist / Math.max(qToken.length, nToken.length);
              if (sim >= 0.65) {
                const fuzzyScore = Math.round(65 * sim);
                if (fuzzyScore > score) {
                  score = fuzzyScore;
                  matchedField = 'name';
                  matchedValue = doc.name;
                  isFuzzy = true;
                }
              }
            }
          }

          // Check alias tokens
          for (const alias of doc.aliases) {
            const aliasTokens = tokenize(alias);
            for (const aToken of aliasTokens) {
              const dist = damerauLevenshtein(qToken, aToken);
              if (dist <= 1 && aToken.length >= 4) {
                const sim = 1 - dist / Math.max(qToken.length, aToken.length);
                const fuzzyScore = Math.round(60 * sim);
                if (fuzzyScore > score) {
                  score = fuzzyScore;
                  matchedField = 'aliases';
                  matchedValue = alias;
                  isFuzzy = true;
                }
              }
            }
          }
        }
      }

      // Track Did-You-Mean suggestion if fuzzy matched strongly
      if (isFuzzy && score > highestFuzzyScore && score >= 50) {
        highestFuzzyScore = score;
        bestFuzzySuggestion = {
          text: doc.name,
          targetId: doc.id,
          score,
        };
      }
    }

    if (score > 0) {
      // Ensure we have highlights for the name if possible
      if (!highlights.some((h) => h.field === 'name')) {
        const nameIdxs = findMatchIndices(doc.name, query);
        if (nameIdxs.length > 0) {
          highlights.push({ field: 'name', indices: nameIdxs });
        }
      }

      scoredResults.push({
        item: doc,
        score,
        matchedField,
        matchedValue,
        highlights,
        isFuzzy,
      });
    }
  }

  // Sort by score descending, then alphabetically by name
  scoredResults.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.item.name.localeCompare(b.item.name);
  });

  const sliced = scoredResults.slice(0, maxResults);

  // If top result is an exact/clean match (score >= 85), clear the "did you mean"
  if (sliced.length > 0 && sliced[0].score >= 85) {
    bestFuzzySuggestion = undefined;
  }

  return {
    results: sliced,
    query,
    didYouMean: bestFuzzySuggestion,
    totalCount: scoredResults.length,
  };
}
