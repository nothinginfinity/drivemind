# Mobile Dev Workcell MCPs for DriveMind

**status:** proposed
**created:** 2026-05-24
**project:** DriveMind
**doctrine:** iPhone-first development, Workcells > Swarms

---

## 1. Purpose

Jared wants to build DriveMind from an iPhone-first workflow using tools like Swift Playgrounds, Textastic, Buffer, Blink Shell, iSH, Pythonista, GitHub, Cloudflare, and eventually a remote Mac/Xcode builder.

The goal is not to force every iPhone app to become an MCP server. The goal is to create a **Mobile Dev Workcell** where ChatGPT, Claude, and Jared can coordinate code generation, repo edits, remote build commands, file manifests, prototypes, and handoffs from mobile.

Core idea:

```txt
iPhone command center
+ GitHub repo
+ code editor apps
+ remote shell/build host
+ agent comms
+ MCP tools
= Mobile Dev Workcell
```

---

## 2. What can and cannot be MCP-enabled

### Swift Playgrounds on iPhone

Useful for:

- learning Swift concepts
- tiny Swift experiments
- sketching simple SwiftUI ideas

Not enough for:

- full DriveMind app shell
- signed app builds
- reliable external SSD indexing app
- App Store/TestFlight distribution

MCP strategy:

```txt
swift_playground_packager_mcp
```

Generate small Swift/SwiftUI snippets and playground-ready examples that Jared can paste/run manually.

### Textastic / Buffer Editor

Useful for:

- editing Swift, HTML, JS, Markdown, specs
- reviewing generated files from phone
- committing through Git/SFTP workflows if configured

MCP strategy:

```txt
mobile_code_packet_mcp
```

Generate small patch packets, file manifests, and copy/paste-ready file payloads optimized for mobile editing.

### Blink Shell / iSH

Useful for:

- connecting to a remote Mac, VPS, GitHub Codespace, or build box
- running git, build commands, scripts, tests
- using command-line workflows from iPhone

MCP strategy:

```txt
remote_build_bridge_mcp
```

Expose safe remote command templates and build job orchestration for a remote Mac/Xcode host or Codespace.

### Pythonista

Useful for:

- prototyping file indexing logic
- scanning manifests
- chunking text
- testing local algorithms
- simulating DriveMind SQLite schemas

MCP strategy:

```txt
pythonista_prototype_packet_mcp
```

Generate Pythonista-ready scripts for manifests, chunking, text extraction experiments, and SQLite prototypes.

---

## 3. Recommended MCPs

### 3.1 `mobile_code_packet_mcp`

Purpose: create mobile-friendly code packets for apps like Textastic, Buffer, Working Copy, or GitHub web/editor.

Tools:

```txt
create_patch_packet
create_file_manifest
split_large_file_for_mobile_edit
summarize_repo_changes
make_copy_paste_file_block
make_review_checklist
```

Inputs:

- repo
- target files
- desired change
- max packet size
- output format: markdown | unified_diff | file_blocks

Outputs:

- copy/paste-ready file sections
- small patches
- file manifest
- review checklist

Risk profile:

```txt
safe / repo-edit-assist
```

Belongs in:

```txt
Mobile Dev Workcell
ChatGPT Architect Workcell
DriveMind Builder Workcell
```

---

### 3.2 `remote_build_bridge_mcp`

Purpose: coordinate remote build/test jobs from iPhone through a trusted remote environment.

This is the most important MCP for building the actual DriveMind native iOS shell.

Tools:

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

Inputs:

- repo URL
- branch
- build target
- command preset
- environment ID

Outputs:

- job ID
- build status
- logs
- artifacts list
- next action checklist

Safety rules:

- Prefer allowlisted commands.
- No arbitrary destructive commands by default.
- No secret output in logs.
- Require explicit confirmation for deploy/distribution.

Risk profile:

```txt
dev-only / high-power
```

Belongs in:

```txt
DriveMind Builder Workcell
Claude Builder Workcell
Full Project Ops Workcell
```

---

### 3.3 `swift_playground_packager_mcp`

Purpose: generate Swift Playgrounds/iPhone-friendly experiments.

Tools:

```txt
make_swiftui_concept
make_file_picker_demo
make_chunking_demo
make_sqlite_schema_demo
make_playground_notes
```

Inputs:

- concept
- target platform: iPhone playground | iPad playground | SwiftUI app snippet
- complexity

Outputs:

- Swift snippet
- explanation
- limitations
- next step for real app shell

Risk profile:

```txt
safe / educational
```

Belongs in:

```txt
Learning Workcell
DriveMind Prototype Workcell
```

---

### 3.4 `pythonista_prototype_packet_mcp`

Purpose: generate Pythonista-ready local prototypes for DriveMind algorithms.

Tools:

```txt
make_manifest_scanner_script
make_chunking_script
make_sqlite_index_demo
make_fts_search_demo
make_context_packet_builder
make_test_fixture
```

Inputs:

- prototype goal
- sample file types
- max lines
- output format

Outputs:

- Python script
- setup notes
- expected output
- migration notes to Swift/SQLite

Risk profile:

```txt
safe / local-prototype
```

Belongs in:

```txt
DriveMind Prototype Workcell
Personal Knowledge Workcell
```

---

### 3.5 `drivemind_temp_cloud_mcp`

Purpose: manage selected-data Cloudflare workspaces for DriveMind.

Tools:

```txt
create_temp_workspace
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
R2: selected files, packets, manifests
D1: workspace metadata, file records, chunks, retention state
Vectorize: selected chunk embeddings
Workers: MCP endpoint and upload/session APIs
```

Risk profile:

```txt
user-approved / dev-only
```

Belongs in:

```txt
Personal Knowledge Workcell
DriveMind Cloud Workcell
Full Project Ops Workcell
```

---

## 4. Best DriveMind development order

1. Use ChatGPT/GitHub MCP to generate and maintain specs.
2. Use `mobile_code_packet_mcp` for mobile-friendly patches.
3. Use Pythonista prototypes for local chunking/schema/manifest logic.
4. Use Swift Playgrounds only for small SwiftUI/file-access concepts.
5. Use Blink Shell/iSH to connect to a remote Mac/build host.
6. Use `remote_build_bridge_mcp` to build/sign/test the native iOS shell.
7. Use TestFlight/dev install to test on Jared's iPhone.
8. Add `drivemind_temp_cloud_mcp` when selected upload/cloud workspaces are ready.

---

## 5. Mobile Dev Workcell Belt

Suggested belt:

```txt
Comms Spine
+ GitHub MCP
+ Agent Bridge Comms MCP
+ mobile_code_packet_mcp
+ remote_build_bridge_mcp
+ pythonista_prototype_packet_mcp
+ swift_playground_packager_mcp
+ Vector Lab MCP
+ Toolsmith Admin MCP
```

For the actual native iOS app build, add:

```txt
remote Mac/Xcode builder connector
```

---

## 6. Missing Tool Requests

### Missing Tool Request: `mobile_code_packet_mcp`

**Problem:**
Mobile editors can edit code, but LLMs need to package changes into small copy/pasteable packets that are easy to apply from iPhone.

**Needed capability:**
Generate mobile-friendly file patches, manifests, and review checklists.

**Safety / risk:**
safe / repo-edit-assist

---

### Missing Tool Request: `remote_build_bridge_mcp`

**Problem:**
DriveMind needs a real iOS native shell, but iPhone-only tools cannot fully build/sign/install the app.

**Needed capability:**
Run allowlisted build/test commands on a trusted remote Mac or build host and return logs/artifacts.

**Safety / risk:**
dev-only / high-power

---

### Missing Tool Request: `pythonista_prototype_packet_mcp`

**Problem:**
Pythonista can prototype DriveMind algorithms, but agents need a structured way to generate scripts and test fixtures that Jared can run from iPhone.

**Needed capability:**
Generate Pythonista-ready scripts for indexing, manifests, chunking, SQLite, and context packets.

**Safety / risk:**
safe / local-prototype

---

### Missing Tool Request: `swift_playground_packager_mcp`

**Problem:**
Swift Playgrounds can help with concepts but not the full app. Agents need to generate small playground-ready snippets and explain the path to real app code.

**Needed capability:**
Generate SwiftUI/file-access/SQLite demo snippets optimized for Swift Playgrounds learning and concept validation.

**Safety / risk:**
safe / educational

---
