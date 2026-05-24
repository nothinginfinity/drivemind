# DriveMind MCP Bridge Spec

**status:** proposed
**version:** 0.1
**created:** 2026-05-24
**project:** DriveMind
**doctrine:** local-first, mobile-first, user-approved access

---

## 0. Product Position

DriveMind is **not** a cloud sync project.

DriveMind is a local-first intelligence layer for external drives connected to iPhone.

The goal is to let Jared plug a SanDisk or other USB-C external SSD into an iPhone, grant folder access, locally index the drive, search it, build context packets, and use ChatGPT, Claude, or other LLMs to discuss and organize the data without uploading the whole drive to a cloud provider.

Core flow:

```txt
External SSD
  ↓
iPhone native file access
  ↓
DriveMind local SQLite index
  ↓
Search / browse / select / summarize
  ↓
User-approved context packet
  ↓
ChatGPT / Claude / other LLM
```

The MCP bridge should expose controlled capabilities over a local index, not raw unfettered filesystem access.

---

## 1. iPhone Native Shell Responsibilities

A pure PWA is not enough on iPhone because Safari cannot reliably traverse an external drive. DriveMind should start as:

```txt
Native iOS shell + web-style UI
```

The iOS shell is responsible for everything that requires native file access, security-scoped resources, and local persistence.

### Responsibilities

1. **Drive/folder connection**
   - Present iOS document/folder picker.
   - Let the user choose an external drive root or specific folder.
   - Store security-scoped bookmark references where allowed.
   - Revalidate access on app launch.

2. **Permission lifecycle**
   - Show which folders are currently connected.
   - Let the user revoke/disconnect a drive.
   - Never scan outside user-selected locations.

3. **Filesystem traversal**
   - Recursively list files and folders under approved roots.
   - Track path, relative path, filename, extension, size, modified time, and directory status.
   - Respect hidden/system file exclusions by default.

4. **Local indexing**
   - Maintain a local SQLite database on the iPhone.
   - Store file metadata, text chunks, search index, summaries, tags, and manifest records.
   - Support incremental re-indexing.

5. **Text extraction**
   - Read text-like files locally.
   - Chunk large files.
   - Store extracted text snippets locally.
   - Defer OCR and heavy media processing to later phases.

6. **Local bridge to UI / MCP layer**
   - Expose a safe bridge from native code to the web-style UI.
   - Optionally expose a local MCP-compatible endpoint only while the app is open and the user enables it.
   - Prefer app-mediated context export over persistent background server behavior.

7. **User approval gates**
   - Require explicit user action before sending any file contents or snippets to an LLM.
   - Show exactly which files/snippets are included in a context packet.

8. **No autonomous file mutation in MVP**
   - No delete, move, rename, or write operations in MVP.
   - Organization suggestions are allowed; autonomous modifications are not.

---

## 2. Local SQLite Schema

The local SQLite database is the DriveMind source of truth for connected drives, indexed files, chunks, search, context packets, and manifests.

### `drives`

```sql
CREATE TABLE drives (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  root_bookmark_id TEXT,
  root_display_path TEXT,
  connected_at TEXT NOT NULL,
  last_seen_at TEXT,
  last_scan_at TEXT,
  status TEXT NOT NULL DEFAULT 'connected',
  metadata_json TEXT
);
```

### `files`

```sql
CREATE TABLE files (
  id TEXT PRIMARY KEY,
  drive_id TEXT NOT NULL,
  relative_path TEXT NOT NULL,
  filename TEXT NOT NULL,
  extension TEXT,
  mime_type TEXT,
  size_bytes INTEGER,
  modified_at TEXT,
  is_directory INTEGER NOT NULL DEFAULT 0,
  partial_hash TEXT,
  scan_status TEXT NOT NULL DEFAULT 'pending',
  text_status TEXT NOT NULL DEFAULT 'not_extracted',
  summary_status TEXT NOT NULL DEFAULT 'not_summarized',
  tags_json TEXT,
  metadata_json TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(drive_id, relative_path)
);
```

### `file_chunks`

```sql
CREATE TABLE file_chunks (
  id TEXT PRIMARY KEY,
  file_id TEXT NOT NULL,
  drive_id TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  start_offset INTEGER,
  end_offset INTEGER,
  text TEXT NOT NULL,
  token_estimate INTEGER,
  created_at TEXT NOT NULL,
  UNIQUE(file_id, chunk_index)
);
```

### `file_search_fts`

Use SQLite FTS5 for local content search.

```sql
CREATE VIRTUAL TABLE file_search_fts USING fts5(
  file_id UNINDEXED,
  drive_id UNINDEXED,
  relative_path,
  filename,
  text
);
```

### `summaries`

```sql
CREATE TABLE summaries (
  id TEXT PRIMARY KEY,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  summary TEXT NOT NULL,
  model TEXT,
  created_at TEXT NOT NULL,
  metadata_json TEXT
);
```

### `context_packets`

```sql
CREATE TABLE context_packets (
  id TEXT PRIMARY KEY,
  title TEXT,
  question TEXT,
  packet_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  exported_at TEXT,
  metadata_json TEXT
);
```

### `manifests`

```sql
CREATE TABLE manifests (
  id TEXT PRIMARY KEY,
  drive_id TEXT NOT NULL,
  manifest_json TEXT NOT NULL,
  compressed_size_bytes INTEGER,
  created_at TEXT NOT NULL,
  metadata_json TEXT
);
```

### Suggested indexes

```sql
CREATE INDEX idx_files_drive_path ON files(drive_id, relative_path);
CREATE INDEX idx_files_extension ON files(extension);
CREATE INDEX idx_files_modified ON files(modified_at);
CREATE INDEX idx_chunks_file ON file_chunks(file_id, chunk_index);
CREATE INDEX idx_context_packets_created ON context_packets(created_at);
```

---

## 3. MCP Tool List

The MCP bridge should start read-only and user-approved. It should expose search, browse, read-snippet, context-packet, and manifest tools.

### Tool: `drive_status`

Return app, index, and bridge status.

Inputs: none.

Outputs:

```json
{
  "app": "DriveMind",
  "bridge": "ready",
  "drives_connected": 1,
  "indexed_files": 1200,
  "text_chunks": 6400
}
```

### Tool: `list_drives`

List approved connected/indexed drives.

Inputs:

```json
{}
```

Outputs:

```json
{
  "drives": [
    {
      "id": "drv_sandisk_1tb",
      "display_name": "SanDisk 1TB",
      "status": "connected",
      "last_scan_at": "2026-05-24T00:00:00Z"
    }
  ]
}
```

### Tool: `scan_drive`

Start or resume local indexing for a selected drive.

Inputs:

```json
{
  "drive_id": "drv_sandisk_1tb",
  "mode": "metadata_only | text_files | incremental",
  "max_files": 1000
}
```

Outputs:

```json
{
  "scan_started": true,
  "drive_id": "drv_sandisk_1tb",
  "mode": "incremental"
}
```

MVP note: scanning may be app-mediated and not long-running in background.

### Tool: `browse_folder`

Browse indexed folder contents.

Inputs:

```json
{
  "drive_id": "drv_sandisk_1tb",
  "path": "Projects/AFO",
  "limit": 100
}
```

### Tool: `search_files`

Search filenames and content through SQLite metadata + FTS.

Inputs:

```json
{
  "drive_id": "drv_sandisk_1tb",
  "query": "AFO Toolsmith belt system",
  "limit": 20,
  "file_types": ["md", "txt", "json"]
}
```

Outputs should include file path, snippet, score/rank, modified date, and size.

### Tool: `get_file_metadata`

Return metadata for a selected indexed file.

Inputs:

```json
{
  "file_id": "file_abc123"
}
```

### Tool: `read_file_chunks`

Read selected chunks from a file. This is safer than raw full-file reads.

Inputs:

```json
{
  "file_id": "file_abc123",
  "chunk_ids": ["chunk_1", "chunk_2"],
  "max_chars": 12000
}
```

### Tool: `build_context_packet`

Build a user-reviewable context packet from search results, selected files, selected chunks, and a question.

Inputs:

```json
{
  "question": "What should I do with these AFO project files?",
  "drive_id": "drv_sandisk_1tb",
  "file_ids": ["file_abc123"],
  "chunk_ids": ["chunk_1", "chunk_2"],
  "max_chars": 30000
}
```

### Tool: `summarize_selected_files`

Summarize selected files using user-approved snippets and the user's configured LLM provider.

Inputs:

```json
{
  "file_ids": ["file_abc123", "file_def456"],
  "style": "brief | detailed | action_items"
}
```

### Tool: `generate_drive_manifest`

Generate a portable, compressed drive map.

Inputs:

```json
{
  "drive_id": "drv_sandisk_1tb",
  "include_summaries": true,
  "include_hashes": true,
  "include_chunks": false
}
```

### Tool: `export_context_packet`

Export a context packet for use in ChatGPT, Claude, or another client.

Inputs:

```json
{
  "packet_id": "ctx_abc123",
  "format": "markdown | json"
}
```

---

## 4. Context Packet Format

Context packets are the safe bridge between the local external drive and an LLM.

They should be explicit, bounded, reviewable, and cite local file paths.

### JSON format

```json
{
  "schema": "drivemind.context_packet.v1",
  "id": "ctx_abc123",
  "created_at": "2026-05-24T00:00:00Z",
  "question": "What project files are related to AFO Toolsmith?",
  "drive": {
    "id": "drv_sandisk_1tb",
    "display_name": "SanDisk 1TB"
  },
  "limits": {
    "max_chars": 30000,
    "snippets": 12
  },
  "sources": [
    {
      "file_id": "file_abc123",
      "relative_path": "Projects/AFO/README.md",
      "filename": "README.md",
      "modified_at": "2026-05-01T12:00:00Z",
      "snippets": [
        {
          "chunk_id": "chunk_1",
          "text": "DriveMind is a local-first...",
          "start_offset": 0,
          "end_offset": 800
        }
      ]
    }
  ],
  "instructions": [
    "Use only the supplied context packet unless the user asks for outside knowledge.",
    "Cite local file paths when making claims about drive contents.",
    "Do not assume access to the full drive."
  ]
}
```

### Markdown format

```md
# DriveMind Context Packet

Question: What project files are related to AFO Toolsmith?
Drive: SanDisk 1TB

## Source: Projects/AFO/README.md
file_id: file_abc123
modified_at: 2026-05-01T12:00:00Z

> snippet text here

## Instructions for LLM

- Use only this context packet for claims about the drive.
- Cite local file paths.
- Ask for more context if needed.
```

---

## 5. Manifest Format

The manifest is a portable map of the drive. It should be much smaller than the drive itself and safe to export/share if the user approves.

### JSON format

```json
{
  "schema": "drivemind.drive_manifest.v1",
  "id": "manifest_abc123",
  "created_at": "2026-05-24T00:00:00Z",
  "drive": {
    "id": "drv_sandisk_1tb",
    "display_name": "SanDisk 1TB"
  },
  "stats": {
    "file_count": 1200,
    "folder_count": 80,
    "total_size_bytes": 734003200000,
    "indexed_text_files": 420,
    "text_chunks": 6400
  },
  "file_types": {
    "md": 120,
    "txt": 80,
    "json": 60,
    "jpg": 300,
    "mp4": 40
  },
  "top_folders": [
    {
      "path": "Projects/AFO",
      "file_count": 240,
      "size_bytes": 1200000000
    }
  ],
  "files": [
    {
      "id": "file_abc123",
      "relative_path": "Projects/AFO/README.md",
      "extension": "md",
      "size_bytes": 12000,
      "modified_at": "2026-05-01T12:00:00Z",
      "partial_hash": "sha256:...",
      "summary": "Optional short local/LLM summary"
    }
  ]
}
```

### Compression

Support:

```txt
manifest.json
manifest.json.gz
```

Do not include full file contents in default manifests.

---

## 6. Privacy and Safety Rules

1. **Local-first by default**
   - The external drive is not uploaded wholesale.
   - Indexing happens locally on the iPhone.

2. **User-approved context only**
   - The user must approve file contents/snippets before they are sent to an LLM.
   - The app should show the context packet before export/send.

3. **Read-only MVP**
   - No delete, move, rename, write, or cleanup automation in MVP.
   - Organization suggestions are allowed.

4. **Least context principle**
   - Send the smallest useful snippets, not whole folders.
   - Ask for approval before increasing context size.

5. **Path citation**
   - LLM answers should cite local file paths and chunk references.

6. **No hidden full-drive access**
   - LLMs should not be told they can access the whole drive.
   - They only see the context packet or tool-returned snippets.

7. **Sensitive file warnings**
   - Detect likely sensitive extensions or folders where possible.
   - Warn before including secrets, keys, backups, financial, medical, or identity documents.

8. **Provider transparency**
   - If snippets are sent to an external LLM provider, show which provider is used.
   - Support user-provided API keys only after explicit configuration.

9. **Offline usefulness**
   - Browsing, indexing, metadata search, and manifest viewing should work without internet.

10. **No cloud sync positioning**
   - DriveMind is not Dropbox, iCloud Drive, Google Drive, or cloud backup.
   - It is a local intelligence layer over user-owned storage.

---

## 7. MVP Build Order

### Phase A — UI and mock index

Goal: validate the interaction model before native file access.

Deliverables:

- Drive dashboard
- Mock connected drive
- Mock folder browser
- Mock search results
- Context packet preview
- Manifest preview

Success criteria:

- User can browse fake drive contents.
- User can search mock records.
- User can build a mock context packet.

### Phase B — iOS native shell

Goal: get real folder access on iPhone.

Deliverables:

- Swift iOS shell
- Web-style UI container
- Folder picker
- Security-scoped folder access
- Native-to-web bridge

Success criteria:

- User can select a folder/external drive.
- Native code can list selected folder contents.
- UI can display real files.

### Phase C — local SQLite index

Goal: persist metadata locally.

Deliverables:

- SQLite database
- `drives` and `files` tables
- recursive metadata scan
- incremental re-scan

Success criteria:

- Indexed file list persists between app launches.
- Modified/new files are detected.

### Phase D — text extraction and FTS

Goal: make text-like drive contents searchable.

First file types:

```txt
.txt .md .json .jsonl .csv .html .xml
.js .ts .py .swift .sql .log .yaml .toml
```

Deliverables:

- text extractor
- chunker
- `file_chunks`
- SQLite FTS5 search
- snippet cards

Success criteria:

- User can search inside files.
- Results show path and snippet.
- User can inspect selected chunks.

### Phase E — context packets

Goal: create user-approved context for LLMs.

Deliverables:

- `build_context_packet`
- context packet preview
- Markdown export
- JSON export
- selected snippets only

Success criteria:

- User can ask a question.
- DriveMind retrieves local snippets.
- User approves packet.
- Packet can be pasted/sent to ChatGPT or Claude.

### Phase F — MCP bridge

Goal: expose controlled DriveMind tools to compatible clients.

Deliverables:

- MCP-compatible tool endpoint or app-mediated bridge
- `drive_status`
- `list_drives`
- `search_files`
- `read_file_chunks`
- `build_context_packet`
- `generate_drive_manifest`

Success criteria:

- An LLM client can request search/read/context operations through DriveMind.
- User remains in control of what content is released.

### Phase G — LLM chat over drive

Goal: answer questions over selected local context.

Deliverables:

- provider settings
- user-provided API key support
- retrieval-before-generation flow
- answer with local path citations

Success criteria:

- User can ask: “What AFO files are on this drive?”
- DriveMind searches locally.
- LLM answer cites local paths from the context packet.

### Later phases

Do not start here:

- OCR for all images
- embeddings for every file
- autonomous cleanup
- cloud sync
- background indexing while app is closed
- phone-to-phone sync
- write/delete/move operations

These come after the local-first read/search/context loop is solid.

---

## 8. Workcell Placement

DriveMind belongs in a future workcell:

```txt
Personal Knowledge Workcell
```

Suggested belt:

```txt
Comms Spine
+ DriveMind MCP
+ Vector Lab MCP
+ Toolsmith Admin MCP
+ Google Drive MCP later
```

Primary use cases:

- discuss data on an external SSD
- search old project archives
- organize files by topic
- generate compressed drive manifests
- prepare context packets for Claude or ChatGPT
- reason over local knowledge without uploading the entire drive

---

## 9. Missing Tool Request

```md
## Missing Tool Request: drivemind-mcp

**Problem:**
LLMs cannot safely access an external SSD connected to an iPhone. Cloud MCPs cannot directly read the local drive, and iOS web apps cannot reliably traverse external drive directories.

**Needed capability:**
A local-first iPhone DriveMind bridge that indexes an approved external drive/folder locally and exposes user-approved search, chunk-read, context-packet, and manifest tools.

**Inputs:**
- drive_id: selected approved drive
- query: search question or keywords
- file_ids: selected file IDs
- chunk_ids: selected chunk IDs
- max_chars: context budget

**Outputs:**
- search results with local paths and snippets
- selected file/chunk metadata
- context packets
- compressed drive manifests

**Safety / risk:**
local-private / user-approved-readonly

**Belongs in belt/workcell:**
Personal Knowledge Workcell, Research + Spec Workcell, Full Project Ops Workcell.

**Success criteria:**
Jared can plug in a SanDisk external SSD, index/search it from iPhone, build a context packet, and discuss selected drive content with ChatGPT/Claude without uploading the entire drive.
```

---
