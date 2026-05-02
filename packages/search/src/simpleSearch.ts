import { tokenize } from "./tokenizer";

export interface SearchableRecord {
  id: string;
  path: string;
  name: string;
  text?: string;
}

export interface SearchResult {
  id: string;
  score: number;
  path: string;
  name: string;
  snippet?: string;
}

export function simpleSearch(
  query: string,
  records: SearchableRecord[],
  maxResults = 20
): SearchResult[] {
  const terms = tokenize(query);

  return records
    .map((record) => {
      const haystack = `${record.path} ${record.name} ${record.text ?? ""}`.toLowerCase();

      const score = terms.reduce((sum, term) => {
        return haystack.includes(term) ? sum + 1 : sum;
      }, 0);

      return {
        id: record.id,
        score,
        path: record.path,
        name: record.name,
        snippet: record.text?.slice(0, 240)
      };
    })
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);
}
