import { mockFiles } from "../lib/mockData";

interface FileBrowserProps {
  selectedFileId: string | null;
  onSelect: (fileId: string) => void;
}

export function FileBrowser({ selectedFileId, onSelect }: FileBrowserProps) {
  return (
    <section>
      <h2>Files</h2>
      {mockFiles.map((file) => (
        <article
          id={`file-card-${file.file_id}`}
          className={`card file-card${
            selectedFileId === file.file_id ? " file-card--selected" : ""
          }`}
          key={file.file_id}
          onClick={() => onSelect(file.file_id)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && onSelect(file.file_id)}
          aria-pressed={selectedFileId === file.file_id}
        >
          <strong>{file.name}</strong>
          <p>{file.path}</p>
          <small>
            {file.extension || "unknown"} · {file.size_bytes.toLocaleString()} bytes · {file.indexed_status}
          </small>
          {file.tags && file.tags.length > 0 && (
            <div className="file-tags">
              {file.tags.map((tag) => (
                <span className="file-tag" key={tag}>{tag}</span>
              ))}
            </div>
          )}
        </article>
      ))}
    </section>
  );
}
