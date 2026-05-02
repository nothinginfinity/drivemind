import { useState, useDeferredValue } from "react";
import { simpleSearch } from "@drivemind/search";
import { mockFiles } from "../lib/mockData";

const searchableRecords = mockFiles.map((f) => ({
  id: f.file_id,
  path: f.path,
  name: f.name,
  text: f.text ?? ""
}));

export function SearchPanel() {
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query);

  const results =
    deferred.trim().length > 0
      ? simpleSearch(deferred.trim(), searchableRecords, 20)
      : [];

  return (
    <section className="card">
      <h2>Search</h2>
      <input
        placeholder="Search files, folders, or contents..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {deferred.trim().length > 0 && (
        <div className="search-results">
          {results.length === 0 ? (
            <p className="search-empty">No matches for &ldquo;{deferred}&rdquo;</p>
          ) : (
            results.map((r) => (
              <article className="search-result-card" key={r.id}>
                <strong className="result-name">{r.name}</strong>
                <span className="result-path">{r.path}</span>
                {r.snippet && (
                  <p className="result-snippet">&ldquo;{r.snippet}&rdquo;</p>
                )}
                <span className="result-score">score {r.score}</span>
              </article>
            ))
          )}
        </div>
      )}
    </section>
  );
}
