import type { FileRecord } from "./types";

export interface SearchableFileRecord extends FileRecord {
  text?: string;
}

export const mockFiles: SearchableFileRecord[] = [
  {
    file_id: "file_001",
    drive_id: "drive_mock_001",
    path: "/StudioOS/ocr-architecture.md",
    name: "ocr-architecture.md",
    extension: "md",
    mime: "text/markdown",
    size_bytes: 18420,
    modified_at: "2026-05-02T16:00:00Z",
    indexed_status: "indexed_text",
    tags: ["studio-os", "ocr"],
    text:
      "OCR tool converts screenshots into markdown. The architecture uses a native Vision framework pipeline on iOS. Output is stored as indexed text chunks for later retrieval by the LLM layer."
  },
  {
    file_id: "file_002",
    drive_id: "drive_mock_001",
    path: "/Prompts/drive-agent.json",
    name: "drive-agent.json",
    extension: "json",
    mime: "application/json",
    size_bytes: 8240,
    modified_at: "2026-05-02T16:10:00Z",
    indexed_status: "indexed_text",
    tags: ["prompt", "agent"],
    text:
      "System prompt for the DriveMind drive agent. Instructs the LLM to use local search tools before answering. Never upload full files. Always cite file paths in answers."
  },
  {
    file_id: "file_003",
    drive_id: "drive_mock_001",
    path: "/Notes/sqlite-fts-notes.md",
    name: "sqlite-fts-notes.md",
    extension: "md",
    mime: "text/markdown",
    size_bytes: 4100,
    modified_at: "2026-04-28T10:00:00Z",
    indexed_status: "indexed_text",
    tags: ["sqlite", "search"],
    text:
      "SQLite FTS5 notes. Use CREATE VIRTUAL TABLE with fts5. Tokenizer options: unicode61, porter. BM25 ranking available via bm25() function. Best for full-text search over file chunks."
  },
  {
    file_id: "file_004",
    drive_id: "drive_mock_001",
    path: "/Projects/drivemind-roadmap.md",
    name: "drivemind-roadmap.md",
    extension: "md",
    mime: "text/markdown",
    size_bytes: 9870,
    modified_at: "2026-05-01T09:30:00Z",
    indexed_status: "indexed_text",
    tags: ["roadmap", "planning"],
    text:
      "DriveMind roadmap phases. Phase 1 is the local web UI prototype. Phase 2 is the iOS native shell. Phase 3 is the drive indexer using SQLite. Phase 5 adds LLM chat over indexed drive contents."
  },
  {
    file_id: "file_005",
    drive_id: "drive_mock_001",
    path: "/Archive/old-api-notes.txt",
    name: "old-api-notes.txt",
    extension: "txt",
    mime: "text/plain",
    size_bytes: 1230,
    modified_at: "2025-12-10T14:00:00Z",
    indexed_status: "indexed_text",
    tags: [],
    text:
      "Old notes on OpenAI API usage. Token limits for GPT-4o. Context window is 128k tokens. Function calling format. Streaming responses with server-sent events."
  }
];
