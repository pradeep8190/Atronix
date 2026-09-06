export type SearchDocumentType = 'component' | 'template';

export interface SearchDocument {
  id: string;
  name: string;
  type: SearchDocumentType;
  category: string;
  description: string;
  aliases: string[];
  tags: string[];
  cliCommand?: string;
  url: string;
}

export interface MatchHighlight {
  field: 'name' | 'aliases' | 'tags' | 'category' | 'description';
  indices: Array<[number, number]>; // [start, end] inclusive
}

export interface SearchResult {
  item: SearchDocument;
  score: number;
  matchedField: 'name' | 'aliases' | 'tags' | 'category' | 'description' | 'id';
  matchedValue: string;
  highlights: MatchHighlight[];
  isFuzzy: boolean;
}

export interface DidYouMeanSuggestion {
  text: string;
  targetId: string;
  score: number;
}

export interface SearchResponse {
  results: SearchResult[];
  query: string;
  didYouMean?: DidYouMeanSuggestion;
  totalCount: number;
}
