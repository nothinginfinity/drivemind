# LLM Tooling

DriveMind should expose local tools to the LLM layer.

The LLM should not directly access the filesystem.

Instead, it requests tool calls through DriveMind.

## Core tools

### `search_files`

Search indexed files.

Input:

```json
{
  "query": "OCR architecture",
  "extensions": ["md", "txt"],
  "max_results": 20
}
```

### `read_file`

Read a selected file or selected byte range.

Input:

```json
{
  "file_id": "file_001",
  "max_bytes": 20000
}
```

### `read_chunks`

Read specific indexed chunks.

Input:

```json
{
  "chunk_ids": ["chunk_001", "chunk_002"]
}
```

### `summarize_file`

Summarize a selected file.

Input:

```json
{
  "file_id": "file_001"
}
```

### `list_large_files`

Find large files.

Input:

```json
{
  "min_size_bytes": 100000000
}
```

### `generate_manifest`

Generate a compressed manifest of the drive.

Input:

```json
{
  "drive_id": "drive_001",
  "include_summaries": false
}
```

## Context packet

Before calling an LLM, DriveMind builds a compact context packet.

```json
{
  "user_query": "What files mention OCR?",
  "matches": [
    {
      "file_id": "file_001",
      "path": "/StudioOS/ocr.md",
      "snippet": "OCR tool converts screenshots into markdown...",
      "score": 0.92
    }
  ]
}
```

## First LLM task types

MVP should support:

- answer from search results
- summarize selected file
- explain folder contents
- classify files
- suggest tags
