# Drive Index Schema

DriveMind uses SQLite for local indexing.

## Tables

```sql
CREATE TABLE drives (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  root_label TEXT,
  connected_at TEXT,
  last_indexed_at TEXT
);

CREATE TABLE files (
  id TEXT PRIMARY KEY,
  drive_id TEXT NOT NULL,
  path TEXT NOT NULL,
  name TEXT NOT NULL,
  extension TEXT,
  mime TEXT,
  size_bytes INTEGER,
  modified_at TEXT,
  sha256 TEXT,
  indexed_status TEXT NOT NULL,
  text_extract_path TEXT,
  preview_path TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE file_chunks (
  id TEXT PRIMARY KEY,
  file_id TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  text TEXT NOT NULL,
  token_estimate INTEGER,
  sha256 TEXT
);

CREATE VIRTUAL TABLE file_chunks_fts USING fts5(
  file_id,
  path,
  text
);

CREATE TABLE tags (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

CREATE TABLE file_tags (
  file_id TEXT NOT NULL,
  tag_id TEXT NOT NULL,
  PRIMARY KEY (file_id, tag_id)
);

CREATE TABLE manifests (
  id TEXT PRIMARY KEY,
  drive_id TEXT NOT NULL,
  path TEXT NOT NULL,
  generated_at TEXT NOT NULL,
  compressed INTEGER NOT NULL,
  size_bytes INTEGER
);
```

## Indexing statuses

```
pending
indexed_metadata
indexed_text
skipped_binary
skipped_too_large
error
```

## Supported MVP text types

```
.txt .md .json .jsonl .csv .html .xml
.js .ts .py .swift .sql .log .yaml .toml
```
