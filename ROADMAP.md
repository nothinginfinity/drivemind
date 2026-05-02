# DriveMind Roadmap

## Phase 0 — Repo Scaffold

Goal: create the repo structure and clarify architecture.

Deliverables:

- README
- roadmap
- architecture docs
- initial schemas
- placeholder iOS app folder
- placeholder web UI
- core TypeScript packages

Status: planned

---

## Phase 1 — Local Web UI Prototype

Goal: build the app interface with mock data before native drive access exists.

Features:

- Drive dashboard
- Mock file browser
- Mock search results
- Chat panel
- Manifest preview
- Search result cards
- File summary view

Deliverables:

- React UI in `apps/web`
- mock drive data
- local state only
- no real file system access yet

Success criteria:

- User can browse fake drive contents
- User can search fake file records
- User can open a mock file summary
- UI shape is validated

---

## Phase 2 — iOS Native Shell

Goal: create the iOS wrapper that can host the web UI and expose native file access.

Features:

- Swift iOS app shell
- WKWebView or native SwiftUI container
- bridge between web UI and native code
- basic "Connect Drive" button
- iOS folder picker

Deliverables:

- iOS project
- native bridge skeleton
- folder selection flow
- permission handling

Success criteria:

- User can choose a folder from Files
- Native layer can list files in selected folder
- Web UI can receive file list through bridge

---

## Phase 3 — Drive Indexer

Goal: build local indexing for external drive folders.

Features:

- recursive file scanning
- metadata extraction
- extension detection
- file size tracking
- modified date tracking
- partial hashing
- index persistence

Deliverables:

- SQLite schema
- file indexer
- file records table
- drive records table
- re-index command

Success criteria:

- DriveMind can scan a selected folder
- Files appear in the browser
- Index persists between app launches

---

## Phase 4 — Text Extraction + Full-Text Search

Goal: make the drive searchable by content.

Supported first file types:

- `.txt` `.md` `.json` `.jsonl` `.csv` `.html` `.xml`
- `.js` `.ts` `.py` `.swift` `.sql` `.log` `.yaml` `.toml`

Features:

- read text-like files
- chunk large files
- store chunks
- SQLite FTS search
- snippets in search results

Success criteria:

- User can search for terms inside files
- Search results show file path and snippet
- User can open matching chunks

---

## Phase 5 — LLM Chat Over Drive

Goal: allow natural-language questions over indexed drive contents.

Features:

- user-provided API key
- local retrieval before LLM call
- context packet builder
- chat interface
- answer with file references
- summarize selected file
- summarize selected folder

Success criteria:

- User can ask: "What files mention Studio OS OCR?"
- DriveMind searches locally
- DriveMind sends only relevant snippets to the LLM
- LLM answer cites local file paths

---

## Phase 6 — Manifest + Compression

Goal: create portable compressed drive maps.

Features:

- generate `drive_manifest.json`
- gzip manifest
- export manifest
- import manifest
- detect changed files
- estimate storage categories

Success criteria:

- User can export a compressed manifest
- Manifest contains file metadata, tags, summaries, and hashes
- Manifest can be searched without reconnecting the drive

---

## Phase 7 — CausalVault Integration

Goal: add recipe-based storage metadata.

---

## Phase 8 — OCR and Image Intelligence

Goal: make screenshots and image-heavy drives useful.

---

## Phase 9 — Phone-to-Phone Sync

Goal: add the future local cloud layer.

---

## Phase 10 — Advanced Local Intelligence

Goal: organize and reason over the drive.

Features:

- duplicate detection
- large file analysis
- topic clustering
- auto-tagging
- file cleanup suggestions
- project detection
- semantic search with embeddings
- local model support
