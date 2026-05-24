# DriveMind

DriveMind is a **local-first LLM file explorer for external drives connected to iPhone**.

It turns an external SSD, such as a SanDisk 1TB drive, into a searchable, conversational, MCP-accessible knowledge base.

DriveMind is **not cloud sync**. It is not Dropbox, iCloud Drive, Google Drive, or cloud backup. DriveMind is a local intelligence layer over user-owned storage, with an optional temporary AI cloud workspace for selected files/snippets only.

---

## The clearest architecture

DriveMind has two modes:

```txt
1. Local Mode
   External SSD + iPhone app + local SQLite index.
   Private, local-first, offline-capable, user-controlled.

2. Temp Cloud / Project Vault Mode
   User-selected files/snippets/manifests promoted into Cloudflare.
   Fast MCP access through R2 + D1 + Vectorize.
   Temporary by default, persistent only if the user chooses.
```

The important part: DriveMind does **not** upload the whole external drive by default.

It lets the user search locally first, then promote only the useful working set into an AI-accessible workspace.

---

## The most important architecture point

DriveMind is **not just a hosted MCP server**.

A normal hosted MCP connector works for services that already live online, like GitHub or Cloudflare. An external SSD plugged into an iPhone is different: the cloud cannot see the physical drive.

So DriveMind needs two pieces for direct drive access:

```txt
1. DriveMind iPhone app
   - gets permission to read the external SSD
   - indexes/searches the drive locally
   - builds context packets
   - uploads selected working sets only when approved

2. DriveMind MCP bridge
   - exposes controlled tools to ChatGPT, Claude, and other LLMs
   - talks to local/app-mediated data or Temp Cloud workspaces
   - returns user-approved search results, snippets, manifests, and context packets
```

The simple user experience should feel like:

```txt
Install DriveMind
→ plug in external SSD
→ tap Connect Drive
→ index locally
→ search the drive
→ select what matters
→ optionally promote selected data to Temp Cloud
→ add DriveMind MCP URL to ChatGPT/Claude
→ ask questions and work with the data
```

Under the hood, the iPhone app is what has actual access to the drive. The cloud workspace only has what the user selected.

---

## Core local flow

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

This is the private local-first path. It is the foundation.

---

## Optional Temp Cloud flow

The Temp Cloud flow is for when the user wants ChatGPT, Claude, or another LLM to work quickly with selected data while the phone/drive may not remain constantly connected.

```txt
Search local SSD
  ↓
Select files / folders / snippets / manifest
  ↓
Upload selected working set only
  ↓
Cloudflare workspace
  - R2: original selected files / exported packets
  - D1: metadata, file records, chunks, job state
  - Vectorize: semantic index
  - SQL / FTS-style search where useful
  ↓
DriveMind MCP URL
  ↓
ChatGPT / Claude can search, retrieve, summarize, and organize selected data
  ↓
User chooses:
  - delete temp workspace
  - keep as project vault
  - download changed artifacts
  - move important data into permanent databases
```

This makes DriveMind feel like a normal hosted MCP connector once the user has promoted a working set.

---

## Three product modes

### Local Mode

```txt
Private
Offline-capable
iPhone + external SSD
Local SQLite + FTS
Context packets
No cloud required
```

Use when:

- browsing the drive
- scanning metadata
- searching text files locally
- building context packets
- deciding what is worth promoting

### Temp Cloud Mode

```txt
Selected upload only
Cloudflare R2 + D1 + Vectorize
Fast MCP access
Expires/deletes by default
```

Use when:

- ChatGPT/Claude needs faster access to selected project data
- the user wants a temporary AI workspace
- the phone/drive connection should not be required for every query
- the user wants semantic search over selected files/snippets

### Project Vault Mode

```txt
User chooses to keep it
Persistent project workspace
Longer-term Cloudflare knowledge base
LLM-accessible through MCP
```

Use when:

- a temp workspace becomes important
- files belong to an ongoing project
- the user wants a durable AI-accessible knowledge base

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
- Promote selected folders into a temporary Cloudflare AI workspace.
- Discuss selected local or temporary-cloud files with an LLM.
- Get organization suggestions without letting an agent modify files automatically.

---

## First target

The first personal target is:

```txt
iPhone + external USB-C SSD + local index + context packets
```

The second target is:

```txt
selected working set → Cloudflare Temp Cloud → MCP connector
```

The initial version should use:

- iOS native file/folder access
- local SQLite indexing
- local full-text search
- a web-style app interface
- user-approved context packets
- selected upload to Cloudflare only when approved
- R2 + D1 + Vectorize for temp/project workspaces
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
- selected upload to Temp Cloud
- bridge between native code and UI/MCP layer

The web-style UI handles:

- drive dashboard
- folder browser
- search
- file cards
- local/temp/project mode controls
- context packet preview
- manifest preview
- temp cloud workspace preview
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
promote_to_temp_cloud
list_temp_workspaces
search_workspace
read_workspace_chunks
export_workspace_changes
delete_temp_workspace
```

Good LLM behavior:

```txt
Search for AFO project files.
Return top snippets.
Build a context packet from this folder.
Promote these 20 selected files into a temp workspace.
Search the project vault semantically.
Summarize this selected file.
Generate a manifest.
```

Bad MVP behavior:

```txt
Read my entire hard drive.
Upload my whole SSD automatically.
Delete duplicate files automatically.
Move these folders around without approval.
Keep temp data forever by default.
```

---

## Cloudflare workspace shape

A promoted DriveMind workspace should use:

```txt
R2
- selected source files
- exported context packets
- manifests
- generated summaries/artifacts

D1
- workspace metadata
- file records
- chunk records
- source/local path mapping
- upload jobs
- retention/expiration state
- LLM action logs

Vectorize
- embeddings for selected chunks
- semantic search over the working set

Workers
- DriveMind MCP endpoint
- upload/session endpoints
- workspace search/retrieval tools
```

Default retention:

```txt
Temp workspace: expires by default
Project vault: user explicitly chooses to keep
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

## MVP 0.2

DriveMind MVP 0.2 should support:

- Create a Temp Cloud workspace.
- Upload selected files/snippets/manifests only.
- Store selected files in R2.
- Store metadata/chunks in D1.
- Embed selected chunks into Vectorize.
- Provide a DriveMind workspace MCP URL.
- Delete/export/keep the workspace.

---

## Non-goals for MVP

Do not start with:

- cloud sync
- automatic full-drive upload
- Bluetooth sync
- Wi-Fi phone-to-phone transfer
- full OCR for every image
- embeddings for every file on the full SSD
- autonomous file modification
- background indexing while app is closed
- delete/move/rename/write tools
- keeping temp workspaces forever by default

Those are future layers, if needed.

---

## Product phrase

```txt
DriveMind turns an external drive into an MCP-accessible local knowledge base.
```

Expanded:

```txt
DriveMind lets you search your external drive locally, then promote selected data into a temporary AI cloud workspace when you want LLMs to work fast.
```

Precise architecture:

```txt
External SSD + iPhone app + local index + optional Cloudflare workspace + MCP bridge
= private portable knowledge base for LLMs.
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

This lets ChatGPT, Claude, or another LLM work with user-approved local drive context and selected cloud workspaces while preserving project comms, memory, and safety.

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
- temporary and persistent Cloudflare project vaults
