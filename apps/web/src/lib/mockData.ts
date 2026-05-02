import type { FileRecord } from "./types";

export const mockFiles: FileRecord[] = [
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
    tags: ["studio-os", "ocr"]
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
    tags: ["prompt", "agent"]
  }
];
