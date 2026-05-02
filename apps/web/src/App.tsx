import { useState } from "react";
import { DriveConnectPanel } from "./components/DriveConnectPanel";
import { FileBrowser } from "./components/FileBrowser";
import { SearchPanel } from "./components/SearchPanel";
import { ChatPanel } from "./components/ChatPanel";
import { mockFiles } from "./lib/mockData";

export function App() {
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);

  const selectedFile = selectedFileId
    ? mockFiles.find((f) => f.file_id === selectedFileId) ?? null
    : null;

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <h1>DriveMind</h1>
          <p>Local-first LLM explorer for external drives.</p>
        </div>
      </header>

      <section className="layout">
        <aside className="left-panel">
          <DriveConnectPanel />
          <SearchPanel
            selectedFileId={selectedFileId}
            onSelect={setSelectedFileId}
          />
        </aside>

        <section className="center-panel">
          <FileBrowser
            selectedFileId={selectedFileId}
            onSelect={setSelectedFileId}
          />
        </section>

        <aside className="right-panel">
          <ChatPanel
            selectedFile={selectedFile}
            onClearFile={() => setSelectedFileId(null)}
          />
        </aside>
      </section>
    </main>
  );
}
