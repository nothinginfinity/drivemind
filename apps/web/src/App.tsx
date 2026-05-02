import { DriveConnectPanel } from "./components/DriveConnectPanel";
import { FileBrowser } from "./components/FileBrowser";
import { SearchPanel } from "./components/SearchPanel";
import { ChatPanel } from "./components/ChatPanel";

export function App() {
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
          <SearchPanel />
        </aside>

        <section className="center-panel">
          <FileBrowser />
        </section>

        <aside className="right-panel">
          <ChatPanel />
        </aside>
      </section>
    </main>
  );
}
