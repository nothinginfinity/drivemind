import { mockFiles } from "../lib/mockData";

export function FileBrowser() {
  return (
    <section>
      <h2>Files</h2>
      {mockFiles.map((file) => (
        <article className="card" key={file.file_id}>
          <strong>{file.name}</strong>
          <p>{file.path}</p>
          <small>
            {file.extension || "unknown"} · {file.size_bytes} bytes · {file.indexed_status}
          </small>
        </article>
      ))}
    </section>
  );
}
