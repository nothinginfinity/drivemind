# DriveMind Architecture

DriveMind is a local-first AI file explorer for external drives connected to iPhone.

## System layers

```txt
External Drive
  ↓
iOS File Access Layer
  ↓
Native Bridge
  ↓
Local Index Engine
  ↓
Search / Retrieval Layer
  ↓
LLM Tool Layer
  ↓
Web UI / Chat UI
```

## Main components

**1. iOS File Access Layer**

Responsibilities:
- ask user to select an external folder
- preserve access using security-scoped bookmarks where possible
- list files
- read file metadata
- read file chunks
- expose file operations to the app bridge

**2. Native Bridge**

Responsibilities:
- connect native iOS file access to the UI
- expose safe commands to web layer
- serialize responses
- enforce file size limits
- avoid sending huge files into memory at once

Example bridge calls:
```
connectDrive()
listFiles()
indexDrive()
readFileChunk()
searchIndex()
summarizeFile()
```

**3. Local Index Engine**

Responsibilities:
- scan selected folders
- record file metadata
- detect text-like files
- extract text
- chunk large files
- store chunks
- maintain SQLite index
- track modified files

**4. Search Layer**

Initial search should use:
- filename search
- extension filters
- folder filters
- SQLite FTS full-text search

Future search can add:
- embeddings
- topic clustering
- semantic reranking
- local vector index

**5. LLM Tool Layer**

The LLM never receives the entire drive.
Instead:
1. User asks a question.
2. DriveMind searches locally.
3. DriveMind builds a compact context packet.
4. LLM receives only relevant snippets.
5. Answer includes local file references.

**6. Web UI**

The web UI provides:
- drive connection status
- file browser
- search panel
- chat panel
- summary views
- future manifest and recipe views

## Data flow

```
User asks:
  "What files mention OCR?"

DriveMind:
  searchIndex("OCR")
  read top chunks
  build context packet
  call LLM
  show answer with file paths
```

## Privacy principle

DriveMind should send the smallest useful context to the LLM API.
The default rule:

```
Do not upload whole files unless the user explicitly asks.
Do not upload whole drives ever.
Use local retrieval first.
```
