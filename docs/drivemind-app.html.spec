<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <title>DriveMind App HTML Spec</title>
  <meta name="description" content="DriveMind iPhone app + local index + MCP bridge + optional temp cloud workspace UI spec." />
  <style>
    :root {
      --bg: #0b1020;
      --panel: #121a2e;
      --panel-2: #17213a;
      --text: #eef3ff;
      --muted: #9eabc8;
      --line: #263352;
      --accent: #79d6ff;
      --good: #7cf3b4;
      --warn: #ffd36e;
      --danger: #ff8a8a;
      --radius: 18px;
      --shadow: 0 12px 36px rgba(0,0,0,.24);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, sans-serif;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: radial-gradient(circle at top, #17213a 0, var(--bg) 44%);
      color: var(--text);
    }
    .app-shell {
      min-height: 100vh;
      max-width: 1220px;
      margin: 0 auto;
      padding: env(safe-area-inset-top) 16px calc(24px + env(safe-area-inset-bottom));
    }
    header {
      position: sticky;
      top: 0;
      z-index: 10;
      padding: 16px 0 12px;
      backdrop-filter: blur(18px);
      background: linear-gradient(to bottom, rgba(11,16,32,.96), rgba(11,16,32,.72));
    }
    .topbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
    .brand { display: flex; flex-direction: column; gap: 3px; }
    .brand h1 { margin: 0; font-size: 24px; letter-spacing: -.03em; }
    .brand p { margin: 0; color: var(--muted); font-size: 13px; }
    .pill {
      display: inline-flex; align-items: center; gap: 6px; border: 1px solid var(--line);
      background: rgba(255,255,255,.04); border-radius: 999px; padding: 8px 10px;
      color: var(--muted); font-size: 12px; white-space: nowrap;
    }
    .dot { width: 8px; height: 8px; border-radius: 999px; background: var(--good); }
    main { display: grid; grid-template-columns: 1.1fr .9fr; gap: 16px; margin-top: 12px; }
    .panel {
      background: rgba(18,26,46,.88); border: 1px solid var(--line); border-radius: var(--radius);
      box-shadow: var(--shadow); overflow: hidden;
    }
    .panel-header {
      display: flex; align-items: center; justify-content: space-between; gap: 12px;
      padding: 16px; border-bottom: 1px solid var(--line); background: rgba(255,255,255,.025);
    }
    .panel-header h2 { margin: 0; font-size: 16px; }
    .panel-header span { color: var(--muted); font-size: 12px; }
    .panel-body { padding: 16px; }
    .grid { display: grid; gap: 12px; }
    .cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
    .card { border: 1px solid var(--line); border-radius: 16px; padding: 14px; background: rgba(255,255,255,.035); }
    .card strong { display: block; font-size: 20px; margin-bottom: 4px; }
    .card span { color: var(--muted); font-size: 12px; }
    .actions { display: flex; flex-wrap: wrap; gap: 10px; }
    button, .button {
      appearance: none; border: 1px solid var(--line); background: var(--panel-2); color: var(--text);
      border-radius: 14px; padding: 11px 13px; font-weight: 650; font-size: 14px;
    }
    .primary { background: linear-gradient(135deg, #3fb6ff, #7cf3b4); color: #06101a; border: 0; }
    .warn { color: var(--warn); }
    .danger { color: var(--danger); }
    .search { display: flex; gap: 10px; margin-bottom: 14px; }
    input, select, textarea {
      width: 100%; border: 1px solid var(--line); background: rgba(0,0,0,.22); color: var(--text);
      border-radius: 14px; padding: 12px; font: inherit;
    }
    textarea { min-height: 110px; resize: vertical; }
    .file-row, .result-row, .source-row {
      display: grid; grid-template-columns: auto 1fr auto; gap: 10px; align-items: start;
      padding: 12px; border: 1px solid var(--line); border-radius: 14px; background: rgba(255,255,255,.025);
    }
    .icon { width: 34px; height: 34px; display: grid; place-items: center; border-radius: 10px; background: rgba(121,214,255,.12); }
    .meta { min-width: 0; }
    .meta b { display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .meta small { color: var(--muted); display: block; margin-top: 3px; line-height: 1.35; }
    .tag { border: 1px solid var(--line); border-radius: 999px; padding: 5px 8px; color: var(--muted); font-size: 11px; white-space: nowrap; }
    .tabs { display: flex; gap: 8px; overflow-x: auto; padding: 0 0 12px; }
    .tab { flex: 0 0 auto; padding: 9px 11px; border-radius: 999px; background: rgba(255,255,255,.04); color: var(--muted); border: 1px solid var(--line); font-size: 13px; }
    .tab.active { color: #06101a; background: var(--accent); border-color: transparent; }
    .split { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .notice { border: 1px solid rgba(255,211,110,.35); background: rgba(255,211,110,.08); color: #ffe6a0; padding: 12px; border-radius: 14px; font-size: 13px; line-height: 1.45; }
    .good { border-color: rgba(124,243,180,.35); background: rgba(124,243,180,.08); color: #c8ffe0; }
    .footer-note { color: var(--muted); font-size: 12px; line-height: 1.45; margin-top: 12px; }
    @media (max-width: 900px) { main { grid-template-columns: 1fr; } .cards { grid-template-columns: 1fr 1fr; } }
    @media (max-width: 520px) {
      .app-shell { padding-left: 12px; padding-right: 12px; }
      .topbar { align-items: flex-start; }
      .brand h1 { font-size: 21px; }
      .cards, .split { grid-template-columns: 1fr; }
      .search { flex-direction: column; }
      .panel-header { align-items: flex-start; flex-direction: column; }
      .file-row, .result-row, .source-row { grid-template-columns: auto 1fr; }
      .file-row .tag, .result-row .tag, .source-row .tag { grid-column: 2; justify-self: start; }
    }
  </style>
</head>
<body>
  <!--
    DriveMind App HTML Spec
    Purpose: visual and structural spec for the iPhone native shell + web-style UI.
    Positioning: local-first external SSD intelligence with optional selected-data Temp Cloud.
  -->
  <div class="app-shell">
    <header>
      <div class="topbar">
        <div class="brand">
          <h1>DriveMind</h1>
          <p>External SSD → local index → selected temp cloud → MCP workcell</p>
        </div>
        <div class="pill"><span class="dot"></span> Local-first · Temp cloud optional</div>
      </div>
    </header>

    <main>
      <section class="grid">
        <section class="panel" id="mode-switcher">
          <div class="panel-header">
            <div>
              <h2>Mode</h2>
              <span>DriveMind starts local, then promotes selected working sets only.</span>
            </div>
          </div>
          <div class="panel-body">
            <div class="tabs" aria-label="DriveMind modes">
              <div class="tab active">Local Mode</div>
              <div class="tab">Temp Cloud</div>
              <div class="tab">Project Vault</div>
            </div>
            <div class="notice">
              Local Mode scans and searches the connected SSD on iPhone. Temp Cloud uploads only selected files/snippets/manifests into Cloudflare R2 + D1 + Vectorize. Project Vault keeps a workspace only when the user explicitly chooses.
            </div>
          </div>
        </section>

        <section class="panel" id="drive-dashboard">
          <div class="panel-header">
            <div>
              <h2>Drive Dashboard</h2>
              <span>Native iOS shell owns external-drive access and local indexing.</span>
            </div>
            <button class="primary">Connect Drive</button>
          </div>
          <div class="panel-body grid">
            <div class="cards">
              <div class="card"><strong>1</strong><span>Connected drives</span></div>
              <div class="card"><strong>12,480</strong><span>Indexed files</span></div>
              <div class="card"><strong>38,912</strong><span>Text chunks</span></div>
            </div>
            <div class="actions">
              <button>Scan Metadata</button>
              <button>Index Text Files</button>
              <button>Generate Manifest</button>
              <button class="danger">Disconnect Drive</button>
            </div>
          </div>
        </section>

        <section class="panel" id="browse-search">
          <div class="panel-header">
            <div>
              <h2>Browse + Search Local SSD</h2>
              <span>Find the working set before uploading anything.</span>
            </div>
          </div>
          <div class="panel-body">
            <div class="tabs" aria-label="DriveMind sections">
              <div class="tab active">Search</div>
              <div class="tab">Browse</div>
              <div class="tab">Recent</div>
              <div class="tab">Large Files</div>
              <div class="tab">Manifests</div>
            </div>
            <div class="search">
              <input aria-label="Search drive" value="AFO Toolsmith belt system" />
              <button class="primary">Search</button>
            </div>
            <div class="grid">
              <article class="result-row">
                <div class="icon">MD</div>
                <div class="meta">
                  <b>Projects/AFO/Toolsmith/README.md</b>
                  <small>Snippet: “Tool belts create scoped workcells for agents...”</small>
                </div>
                <span class="tag">selected</span>
              </article>
              <article class="result-row">
                <div class="icon">JSON</div>
                <div class="meta">
                  <b>Archives/agent-bridge/shared/decisions.json</b>
                  <small>Snippet: “Workcells &gt; Swarms...”</small>
                </div>
                <span class="tag">selected</span>
              </article>
              <article class="file-row">
                <div class="icon">DIR</div>
                <div class="meta">
                  <b>Projects/DriveMind/specs</b>
                  <small>42 files · 18 text-indexed · last modified today</small>
                </div>
                <span class="tag">folder</span>
              </article>
            </div>
          </div>
        </section>

        <section class="panel" id="temp-cloud">
          <div class="panel-header">
            <div>
              <h2>Temp Cloud Workspace</h2>
              <span>Promote selected data into Cloudflare for fast LLM access.</span>
            </div>
            <button class="primary">Create Workspace</button>
          </div>
          <div class="panel-body grid">
            <div class="notice good">
              Only selected files, snippets, and manifests are uploaded. The full SSD is never uploaded by default.
            </div>
            <div class="cards">
              <div class="card"><strong>2</strong><span>Selected files</span></div>
              <div class="card"><strong>2,620</strong><span>Chars selected</span></div>
              <div class="card"><strong>7 days</strong><span>Default expiry</span></div>
            </div>
            <div class="grid">
              <div class="source-row">
                <div class="icon">R2</div>
                <div class="meta"><b>Object storage</b><small>Selected source files, packets, manifests, generated artifacts.</small></div>
                <span class="tag">empty</span>
              </div>
              <div class="source-row">
                <div class="icon">D1</div>
                <div class="meta"><b>Metadata + chunks</b><small>Workspace records, file map, upload jobs, retention state.</small></div>
                <span class="tag">ready</span>
              </div>
              <div class="source-row">
                <div class="icon">V</div>
                <div class="meta"><b>Vectorize</b><small>Embeddings for selected chunks only.</small></div>
                <span class="tag">ready</span>
              </div>
            </div>
            <div class="split">
              <button>Preview Upload Set</button>
              <button class="primary">Promote Selected</button>
            </div>
            <div class="split">
              <button>Keep as Project Vault</button>
              <button class="danger">Delete Temp Workspace</button>
            </div>
          </div>
        </section>
      </section>

      <aside class="grid">
        <section class="panel" id="mcp-bridge">
          <div class="panel-header">
            <div>
              <h2>MCP Bridge</h2>
              <span>Controlled tools for ChatGPT, Claude, and other LLMs.</span>
            </div>
          </div>
          <div class="panel-body grid">
            <div class="cards">
              <div class="card"><strong>Ready</strong><span>Bridge status</span></div>
              <div class="card"><strong>Read-only</strong><span>MVP safety</span></div>
              <div class="card"><strong>Scoped</strong><span>Selected data</span></div>
            </div>
            <div class="grid">
              <div class="source-row">
                <div class="icon">🔎</div>
                <div class="meta"><b>search_files / search_workspace</b><small>Search local SSD index or promoted cloud workspace.</small></div>
                <span class="tag">safe</span>
              </div>
              <div class="source-row">
                <div class="icon">📄</div>
                <div class="meta"><b>read_file_chunks</b><small>Return selected snippets, not full-drive access.</small></div>
                <span class="tag">approved</span>
              </div>
              <div class="source-row">
                <div class="icon">☁️</div>
                <div class="meta"><b>promote_to_temp_cloud</b><small>Upload selected working set into Cloudflare R2/D1/Vectorize.</small></div>
                <span class="tag">approval</span>
              </div>
              <div class="source-row">
                <div class="icon">🧠</div>
                <div class="meta"><b>build_context_packet</b><small>Create bounded context for LLM discussion.</small></div>
                <span class="tag">review</span>
              </div>
            </div>
          </div>
        </section>

        <section class="panel" id="context-packet">
          <div class="panel-header">
            <div>
              <h2>Context Packet Preview</h2>
              <span>User reviews exactly what gets sent to the LLM.</span>
            </div>
          </div>
          <div class="panel-body grid">
            <textarea aria-label="Question">What AFO Toolsmith files are on this drive, and what should I organize first?</textarea>
            <div class="grid">
              <div class="source-row">
                <div class="icon">1</div>
                <div class="meta"><b>Projects/AFO/Toolsmith/README.md</b><small>2 snippets · 1,840 chars</small></div>
                <span class="tag">included</span>
              </div>
              <div class="source-row">
                <div class="icon">2</div>
                <div class="meta"><b>Archives/agent-bridge/shared/decisions.json</b><small>1 snippet · 780 chars</small></div>
                <span class="tag">included</span>
              </div>
            </div>
            <div class="split">
              <button>Preview Markdown</button>
              <button class="primary">Approve + Send</button>
            </div>
            <p class="footer-note">MVP rule: the LLM only receives the approved context packet or scoped workspace. It does not get hidden full-drive access.</p>
          </div>
        </section>

        <section class="panel" id="workspace-lifecycle">
          <div class="panel-header">
            <div>
              <h2>Workspace Lifecycle</h2>
              <span>Temp by default. Persistent only by choice.</span>
            </div>
          </div>
          <div class="panel-body grid">
            <select aria-label="Retention policy">
              <option>Delete after 7 days</option>
              <option>Delete after 24 hours</option>
              <option>Keep as Project Vault</option>
              <option>Manual delete only</option>
            </select>
            <div class="source-row">
              <div class="icon">↓</div>
              <div class="meta"><b>Download changed artifacts</b><small>Export summaries, manifests, organized notes, and action plans back to iPhone.</small></div>
              <span class="tag">export</span>
            </div>
            <div class="source-row">
              <div class="icon">✓</div>
              <div class="meta"><b>Move important data</b><small>Promote useful artifacts into a permanent project database.</small></div>
              <span class="tag">optional</span>
            </div>
          </div>
        </section>

        <section class="panel" id="manifest">
          <div class="panel-header">
            <div>
              <h2>Drive Manifest</h2>
              <span>Compressed map of the drive without full file contents.</span>
            </div>
          </div>
          <div class="panel-body grid">
            <div class="cards">
              <div class="card"><strong>742 GB</strong><span>Total size</span></div>
              <div class="card"><strong>19</strong><span>Top folders</span></div>
              <div class="card"><strong>gzip</strong><span>Export</span></div>
            </div>
            <div class="actions">
              <button>Preview Manifest</button>
              <button>Export JSON</button>
              <button>Export .gz</button>
            </div>
          </div>
        </section>
      </aside>
    </main>
  </div>

  <script type="application/json" id="drivemind-ui-spec">
  {
    "schema": "drivemind.html_spec.v2",
    "purpose": "Simple app UI for iPhone native shell, local index, MCP bridge, and optional selected-data Temp Cloud.",
    "positioning": "DriveMind is local-first and not cloud sync. Temp Cloud uploads selected working sets only.",
    "modes": ["Local Mode", "Temp Cloud Mode", "Project Vault Mode"],
    "screens": [
      "Mode Switcher",
      "Drive Dashboard",
      "Browse + Search Local SSD",
      "Temp Cloud Workspace",
      "MCP Bridge",
      "Context Packet Preview",
      "Workspace Lifecycle",
      "Drive Manifest"
    ],
    "native_responsibilities": [
      "folder picker",
      "security-scoped file access",
      "recursive file traversal",
      "local SQLite index",
      "text extraction",
      "native-to-web bridge",
      "selected upload to temp cloud"
    ],
    "cloudflare_workspace": {
      "r2": "selected source files, packets, manifests, generated artifacts",
      "d1": "metadata, file map, chunks, jobs, retention state",
      "vectorize": "embeddings for selected chunks",
      "workers": "MCP endpoint and upload/session APIs"
    },
    "mcp_tools": [
      "drive_status",
      "list_drives",
      "scan_drive",
      "browse_folder",
      "search_files",
      "get_file_metadata",
      "read_file_chunks",
      "build_context_packet",
      "summarize_selected_files",
      "generate_drive_manifest",
      "promote_to_temp_cloud",
      "list_temp_workspaces",
      "search_workspace",
      "read_workspace_chunks",
      "export_workspace_changes",
      "delete_temp_workspace"
    ],
    "mvp_safety": [
      "read-only local MVP",
      "user-approved snippets only",
      "no full-drive hidden access",
      "no automatic full-drive upload",
      "no delete/move/rename/write tools against source SSD",
      "temp cloud expires by default",
      "project vault persistence only by explicit choice"
    ]
  }
  </script>
</body>
</html>
