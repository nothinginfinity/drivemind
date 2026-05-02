# DriveMind

DriveMind is a local-first LLM file explorer for external drives connected to iPhone.

The goal is to let a user plug an external SSD into an iPhone, grant folder access, index the drive locally, search the contents, and chat with the drive using their own LLM API keys.

DriveMind is not cloud storage. DriveMind is a local intelligence layer for personal storage.

## Core idea

```txt
External SSD
  ↓
iPhone file access
  ↓
DriveMind local index
  ↓
Search / browse / summarize
  ↓
LLM chat over selected local context
```

## Why this exists

External drives can hold huge amounts of useful personal data, but phones do not provide a good AI-native way to explore them.
DriveMind makes an external SSD feel searchable, conversational, and organized without uploading the entire drive to a cloud provider.

## First target

The first target is iPhone + external USB-C SSD.
The initial version will use:

- iOS native file/folder access
- local SQLite indexing
- local full-text search
- a web-style app interface
- user-provided LLM API keys
- selective context sending to LLMs

## Important constraint

A pure PWA is not enough on iPhone because iOS Safari does not provide reliable full external-drive directory traversal for a web app.
DriveMind should start as:

```
Native iOS shell + web-style UI
```

The native shell handles external drive access. The web UI handles browsing, search, chat, and future portability.

## MVP

DriveMind MVP 0.1 should support:

- Connect an external drive/folder
- Recursively scan file metadata
- Index text-like files
- Search by filename and file contents
- Read selected files
- Ask an LLM questions using retrieved local snippets
- Summarize selected files
- Generate a compressed drive manifest

## Non-goals for MVP

Do not start with:

- Bluetooth sync
- Wi-Fi phone-to-phone transfer
- full OCR for every image
- embeddings for every file
- autonomous file modification
- background indexing while app is closed
- cloud sync

Those are future layers.

## Future direction

DriveMind becomes the root layer for:

- CausalVault recipe-based storage
- phone-to-phone local cloud
- Bluetooth metadata transfer
- Wi-Fi large file transfer
- AI-native external drive organization
- compressed manifest exchange
- local-first personal memory systems
