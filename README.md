# DriveMind

DriveMind is a **local-first LLM file explorer for external drives connected to iPhone**.

It turns an external SSD, such as a SanDisk 1TB drive, into a searchable, conversational, MCP-accessible local knowledge base.

DriveMind is **not cloud sync**. It is not Dropbox, iCloud Drive, Google Drive, or cloud backup. DriveMind is a local intelligence layer over user-owned storage.

---

## The most important architecture point

DriveMind is **not just a hosted MCP server**.

A normal hosted MCP connector works for services that already live online, like GitHub or Cloudflare. An external SSD plugged into an iPhone is different: the cloud cannot see the physical drive.

So DriveMind needs two pieces:

```txt
1. DriveMind iPhone app
   - gets permission to read the external SSD
   - indexes/searches the drive locally
   - builds context packets

2. DriveMind MCP bridge
   - exposes controlled tools to ChatGPT, Claude, and other LLMs
   - talks to the local app/index or an app-mediated bridge
   - returns user-approved search results, snippets, manifests, and context packets
```

The simple user experience should feel like:

```txt
Install DriveMind
→ plug in external SSD
→ tap Connect Drive
→ index locally
→ add DriveMind MCP URL to ChatGPT/Claude
→ ask questions about the drive
```

But under the hood, the iPhone app is what has actual access to the drive.

---

## Core idea

```txt
External SSD
  ↓
iPhone native file access
  ↓
DriveMind local SQLite index
  ↓
Search / browse / summarize / manifest
  ↓
User-approved context packet
  ↓
ChatGPT / Claude / other LLM via MCP
```

DriveMind should expose controlled tools over an indexed local drive, not raw unfettered filesystem access.

---

## Why this exists

External drives can hold huge amounts of useful personal data, but phones do not provide a good AI-native way to explore them.

DriveMind makes an external SSD feel searchable, conversational, and organized without uploading the entire drive to a cloud provider.

Use cases:

- Ask what is on a 1TB external drive.
- Search old project archives from iPhone.
- Find files related to AFO, Toolsmith, code, notes, screenshots, or documents.
- Generate a compressed drive manifest.
- Build a context packet for ChatGPT or Claude.
- Discuss selected local files with an LLM.
- Get organization suggestions without letting an agent modify files automatically.

---

## First target

The first target is:

```txt
iPhone + external USB-C SSD + local index + MCP bridge
```

The initial version should use:

- iOS native file/folder access
- local SQLite indexing
- local full-text search
- a web-style app interface
- user-approved context packets
- user-provided LLM/API configuration later
- selective context sending to LLMs

---

## Important iPhone constraint

A pure PWA is not enough on iPhone because iOS Safari does not provide reliable full external-drive directory traversal for a web app.

DriveMind should start as:

```txt
Native iOS shell + web-style UI
```

The native shell handles:

- external drive/folder picker
- security-scoped file access
- recursive file listing
- local SQLite database
- text extraction
- local indexing
- bridge between native code and UI/MCP layer

The web-style UI handles:

- drive dashboard
- folder browser
- search
- file cards
- context packet preview
- manifest preview
- chat/context workflow

---

## What the MCP does

The MCP connector should not give an LLM blanket access to the whole hard drive.

Instead, it should expose safe, user-approved tools like:

```txt
drive_status
list_drives
scan_drive
browse_folder
search_files
get_file_metadata
read_file_chunks
build_context_packet
summarize_selected_files
generate_drive_manifest
export_context_packet
```

Good LLM behavior:

```txt
Search for AFO project files.
Return top snippets.
Build a context packet from this folder.
Summarize this selected file.
Generate a manifest.
```

Bad MVP behavior:

```txt
Read my entire hard drive.
Delete duplicate files automatically.
Move these folders around without approval.
Upload everything to the cloud.
```

---

## MVP 0.1

DriveMind MVP 0.1 should support:

- Connect an external drive/folder from iPhone.
- Recursively scan file metadata.
- Index text-like files.
- Search by filename and file contents.
- Read selected file chunks.
- Build a user-reviewable context packet.
- Ask an LLM questions using retrieved local snippets.
- Summarize selected files.
- Generate a compressed drive manifest.

---

## Non-goals for MVP

Do not start with:

- cloud sync
- Bluetooth sync
- Wi-Fi phone-to-phone transfer
- full OCR for every image
- embeddings for every file
- autonomous file modification
- background indexing while app is closed
- delete/move/rename/write tools
- uploading the full external drive

Those are future layers, if needed.

---

## Product phrase

```txt
DriveMind turns an external drive into an MCP-accessible local knowledge base.
```

More precisely:

```txt
External SSD + iPhone app + local index + MCP bridge = private portable knowledge base for LLMs.
```

---

## Workcell fit

DriveMind belongs in a future:

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

This lets ChatGPT, Claude, or another LLM work with user-approved local drive context while preserving project comms, memory, and safety.

---

## Docs

Important docs:

- `docs/drivemind-mcp-bridge.spec.md` — MCP bridge, SQLite schema, context packets, manifest format, privacy model, MVP build order.
- `docs/drivemind-app.html.spec` — simple app UI spec for the iPhone native shell + web-style interface.
- `docs/ARCHITECTURE.md` — architecture notes.
- `docs/DRIVE_INDEX_SCHEMA.md` — drive index schema notes.
- `docs/IOS_FILE_ACCESS.md` — iOS file access notes.
- `docs/LLM_TOOLING.md` — LLM tooling notes.
- `docs/SECURITY_MODEL.md` — security model.

---

## Future direction

DriveMind can become the root layer for:

- CausalVault recipe-based storage
- local-first personal memory systems
- AI-native external drive organization
- compressed manifest exchange
- topic clustering
- duplicate detection
- local model support
- semantic search after the read/search/context loop is solid
