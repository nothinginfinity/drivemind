# DriveMind Toolsmith Manifest

**project:** DriveMind
**status:** proposed
**version:** 0.1
**created:** 2026-05-24
**doctrine:** Workcells > Swarms

---

## 1. Purpose

This file is designed to be dropped into AFO Toolsmith so Toolsmith can:

1. Fetch existing MCP connectors needed for DriveMind.
2. Add those connectors to the right belt/workcell.
3. Identify missing MCPs that need to be generated.
4. Create a DriveMind project workcell for ChatGPT, Claude, and Jared.

DriveMind is a local-first iPhone + external SSD knowledge base with optional selected-data Temp Cloud workspaces.

---

## 2. Desired Workcell

```txt
DriveMind Builder Workcell
```

Goal:

```txt
Help Jared build DriveMind from iPhone: specs, app UI, native shell, local index, temp cloud workspace, MCP bridge, and remote iOS build flow.
```

Required operating model:

```txt
Comms Spine
+ Mobile Dev Tools
+ DriveMind Local/Cloud Tools
+ Cloudflare/Vector Tools
= DriveMind Builder Workcell
```

---

## 3. Existing MCPs to Connect

These already exist or are expected to be available in Jared's current MCP ecosystem.

### GitHub MCP

**status:** existing
**purpose:** read/write DriveMind repo, specs, code, issues, handoffs.

Required tools:

```txt
read_file
list_files
commit_file
search_code
get_repo
list_repos
```

Belt placement:

```txt
Comms Spine
DriveMind Builder Workcell
ChatGPT Architect Workcell
Claude Builder Workcell
```

---

### Agent Bridge / GitHub Comms

**status:** existing via GitHub MCP today; should become dedicated MCP later
**purpose:** boot, inboxes, handoffs, PRDs, specs, shared bulletin, decisions.

Required files:

```txt
agent-bridge/chatgpt/inbox.md
agent-bridge/claude/inbox.md
agent-bridge/alice/inbox.md
agent-bridge/shared/bulletin.md
agent-bridge/shared/decisions.md
```

Belt placement:

```txt
Comms Spine — required in almost every serious workcell
```

---

### Vector Lab MCP

**status:** existing
**connector_url:** `https://vector-lab-mcp.agentfeedoptimization.com/mcp`
**purpose:** semantic memory, embedding, D1 reindexing, vector search, retrieval tests.

Required tools:

```txt
deployment_status
chunk_text
embedding_generate
vectorize_query
vectorize_upsert_documents
vectorize_reindex_from_d1
hybrid_search_d1_vectorize
```

Belt placement:

```txt
DriveMind Builder Workcell
Personal Knowledge Workcell
Vector Memory Workcell
```

---

### Toolsmith Admin MCP

**status:** existing
**connector_url:** `https://toolsmith-admin-mcp.agentfeedoptimization.com/mcp`
**purpose:** inspect/register/embed catalogue tools, connectors, and belts.

Required tools:

```txt
deployment_status
list_tool_catalogue
list_connectors
list_belts
embed_catalogue
```

Belt placement:

```txt
DriveMind Builder Workcell
Toolsmith Admin Workcell
ChatGPT Architect Workcell
```

---

### mcp-prax / Cloudflare Control Plane

**status:** existing
**purpose:** Cloudflare Worker deploys, D1, R2, Vectorize, bindings, raw API calls where safe.

Required tools:

```txt
listWorkers
deployWorker
listWorkerBindings
listD1Databases
cfApiRequest
```

Belt placement:

```txt
Claude Builder Workcell
DriveMind Cloud Workcell
Full Project Ops Workcell
```

---

### Cloudflare Auditor MCP

**status:** existing/minimal
**connector_url:** `https://cloudflare-auditor-mcp.agentfeedoptimization.com/mcp`
**purpose:** safe Cloudflare endpoint health checks and read-only inspection.

Belt placement:

```txt
Cloudflare Readonly Workcell
DriveMind Builder Workcell
```

---

## 4. MCPs to Generate

These are the missing tools Toolsmith should generate or track.

---

### 4.1 Agent Bridge Comms MCP

**toolsmith_id:** `agent-bridge-comms-mcp`
**priority:** highest
**risk:** safe

Problem:

Every serious workcell needs comms continuity. Today this is done through GitHub MCP directly, but it should be wrapped as a dedicated Agent Bridge Comms MCP.

Needed tools:

```txt
read_chatgpt_inbox
read_claude_inbox
read_alice_inbox
read_bulletin
read_decisions
read_specs
send_message_to_claude
send_message_to_alice
send_message_to_chatgpt
append_bulletin
append_decision
write_handoff
```

Belongs in:

```txt
Comms Spine
DriveMind Builder Workcell
ChatGPT Architect Workcell
Claude Builder Workcell
Full Project Ops Workcell
```

Success criteria:

```txt
A new agent session can boot, read the right inbox/specs/decisions, and send handoffs without requiring the full generic GitHub tool surface.
```

---

### 4.2 DriveMind MCP

**toolsmith_id:** `drivemind-mcp`
**priority:** high
**risk:** local-private / user-approved-readonly

Problem:

LLMs cannot safely access an external SSD connected to an iPhone. A cloud MCP cannot see the drive. DriveMind needs an app-mediated local index and user-approved MCP bridge.

Needed tools:

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

Belongs in:

```txt
Personal Knowledge Workcell
DriveMind Builder Workcell
Research + Spec Workcell
```

Success criteria:

```txt
Jared can plug in a SanDisk SSD, index/search selected folders locally, build a context packet, and discuss selected drive content with ChatGPT/Claude.
```

---

### 4.3 DriveMind Temp Cloud MCP

**toolsmith_id:** `drivemind-temp-cloud-mcp`
**priority:** high
**risk:** user-approved / dev-only

Problem:

Local-only context packets are useful, but LLMs work faster when selected working sets are promoted into a scoped cloud workspace with R2, D1, and Vectorize.

Needed tools:

```txt
create_temp_workspace
promote_to_temp_cloud
upload_selected_manifest
upload_selected_file
index_workspace_chunks
embed_workspace
search_workspace
read_workspace_chunks
export_workspace_changes
delete_temp_workspace
promote_to_project_vault
```

Cloudflare resources:

```txt
R2: selected files, packets, manifests, generated artifacts
D1: workspace metadata, file map, chunks, upload jobs, retention state
Vectorize: embeddings for selected chunks
Workers: MCP endpoint and upload/session APIs
```

Belongs in:

```txt
Personal Knowledge Workcell
DriveMind Cloud Workcell
Full Project Ops Workcell
```

Success criteria:

```txt
Jared can search the SSD locally, select files/snippets, upload only that working set, and let ChatGPT/Claude search it through a fast hosted MCP workspace that expires by default.
```

---

### 4.4 Mobile Code Packet MCP

**toolsmith_id:** `mobile-code-packet-mcp`
**priority:** medium-high
**risk:** safe / repo-edit-assist

Problem:

Mobile editors like Textastic and Buffer are useful, but LLM-generated changes need to be packaged into small mobile-friendly patch packets.

Needed tools:

```txt
create_patch_packet
create_file_manifest
split_large_file_for_mobile_edit
summarize_repo_changes
make_copy_paste_file_block
make_review_checklist
```

Belongs in:

```txt
Mobile Dev Workcell
DriveMind Builder Workcell
ChatGPT Architect Workcell
```

---

### 4.5 Remote Build Bridge MCP

**toolsmith_id:** `remote-build-bridge-mcp`
**priority:** high for native iOS app
**risk:** dev-only / high-power

Problem:

DriveMind needs a real native iOS shell, but iPhone-only tools cannot fully build/sign/install the app. A remote Mac/Xcode builder is needed.

Needed tools:

```txt
list_build_targets
create_build_job
run_git_status
run_safe_command
run_xcode_build
run_tests
get_build_logs
create_testflight_checklist
```

Belongs in:

```txt
DriveMind Builder Workcell
Claude Builder Workcell
Full Project Ops Workcell
```

Safety:

```txt
Allowlisted commands only by default.
No destructive commands without explicit confirmation.
No secrets in logs.
Deploy/distribution requires explicit confirmation.
```

---

### 4.6 Swift Playground Packager MCP

**toolsmith_id:** `swift-playground-packager-mcp`
**priority:** medium
**risk:** safe / educational

Problem:

Swift Playgrounds can help with concepts, but not the full DriveMind app. Agents need to generate small SwiftUI/file-access/SQLite concept snippets that Jared can run or study from mobile.

Needed tools:

```txt
make_swiftui_concept
make_file_picker_demo
make_chunking_demo
make_sqlite_schema_demo
make_playground_notes
```

Belongs in:

```txt
DriveMind Prototype Workcell
Learning Workcell
```

---

### 4.7 Pythonista Prototype Packet MCP

**toolsmith_id:** `pythonista-prototype-packet-mcp`
**priority:** medium
**risk:** safe / local-prototype

Problem:

Pythonista can prototype DriveMind indexing/chunking/manifest algorithms locally, but agents need to generate scripts and fixtures in a structured way.

Needed tools:

```txt
make_manifest_scanner_script
make_chunking_script
make_sqlite_index_demo
make_fts_search_demo
make_context_packet_builder
make_test_fixture
```

Belongs in:

```txt
DriveMind Prototype Workcell
Personal Knowledge Workcell
```

---

### 4.8 Cloudflare Multipart MCP

**toolsmith_id:** `cloudflare-multipart-mcp`
**priority:** high for Cloudflare builds
**risk:** dev-only / high-power

Problem:

Cloudflare Worker settings/bindings updates can require `multipart/form-data`. Existing JSON-only raw API helpers fail for those endpoints.

Needed tools:

```txt
cf_api_multipart_request
update_worker_settings_multipart
```

Belongs in:

```txt
Claude Builder Workcell
Cloudflare Build Workcell
Full Project Ops Workcell
```

---

## 5. Recommended Belts / Workcells

### DriveMind Builder Workcell

```txt
Comms Spine
+ GitHub MCP
+ Agent Bridge Comms MCP
+ Vector Lab MCP
+ Toolsmith Admin MCP
+ mcp-prax / Cloudflare control tools
+ Cloudflare Auditor MCP
+ mobile_code_packet_mcp
+ remote_build_bridge_mcp
+ drivemind_mcp
+ drivemind_temp_cloud_mcp
```

### DriveMind Prototype Workcell

```txt
Comms Spine
+ GitHub MCP
+ swift_playground_packager_mcp
+ pythonista_prototype_packet_mcp
+ mobile_code_packet_mcp
```

### Personal Knowledge Workcell

```txt
Comms Spine
+ DriveMind MCP
+ DriveMind Temp Cloud MCP
+ Vector Lab MCP
+ Google Drive MCP later
```

### Cloudflare Workspace Workcell

```txt
Comms Spine
+ mcp-prax
+ cloudflare_multipart_mcp
+ Cloudflare Auditor MCP
+ Vector Lab MCP
+ Toolsmith Admin MCP
```

---

## 6. Toolsmith Ingestion Hints

Toolsmith should parse this file as:

```json
{
  "project": "DriveMind",
  "workcells": [
    "DriveMind Builder Workcell",
    "DriveMind Prototype Workcell",
    "Personal Knowledge Workcell",
    "Cloudflare Workspace Workcell"
  ],
  "existing_connectors_to_fetch": [
    "GitHub MCP",
    "Vector Lab MCP",
    "Toolsmith Admin MCP",
    "mcp-prax",
    "Cloudflare Auditor MCP"
  ],
  "missing_tools_to_generate": [
    "agent-bridge-comms-mcp",
    "drivemind-mcp",
    "drivemind-temp-cloud-mcp",
    "mobile-code-packet-mcp",
    "remote-build-bridge-mcp",
    "swift-playground-packager-mcp",
    "pythonista-prototype-packet-mcp",
    "cloudflare-multipart-mcp"
  ]
}
```

---

## 7. Next Best Build

Recommended next MCP to build first:

```txt
agent-bridge-comms-mcp
```

Recommended next DriveMind-specific MCP:

```txt
drivemind-temp-cloud-mcp
```

Recommended next iOS build enabler:

```txt
remote-build-bridge-mcp
```

---
