# DriveMind Roadmap — Relay-First MCP Capability

**Direction authorized:** 2026-10-18 — prioritize the missing capability, not a standalone AI/chat application.
**Document status:** PR #1 correction candidate after independent Claude/Grok R0001 reviews; not implemented, merged or live accepted.
**Baseline:** `c79bd8861d09a782191ca452d300a037b2e12e7e`; CairnStone chain `drivemind`; C0000 registry accepted, application unaccepted.
**Coordination:** `thread:drivemind-collab-20261018` (ChatGPT, Claude, Grok).

## Product contract: the app inside the AI app

DriveMind is an **MCP-accessible, local-first storage capability**. ChatGPT, Claude, Grok and other supported hosts already provide the chat, reasoning and agent UI. DriveMind must **not** build another general chat client.

There are two distinct surfaces:

1. **Tiny native iPhone companion (SwiftUI preferred).** Select/revoke an external SSD folder using iOS security-scoped file access; safely enumerate/read within the approved root; optionally build a local SQLite/FTS index; preview and approve bounded excerpts; show connected/offline status and release history. Keep native controls to **Connect Drive, Refresh Connection, Connection Status, Access Controls**. Initial Refresh Connection revalidates root permission/listing only; SQLite/FTS indexing starts in R4. Native app does not expose unrestricted filesystem paths to an LLM.
2. **Authenticated HTTPS MCP gateway + optional MCP App view.** Standard MCP tools let existing AI clients request drive status, search, selected chunks and approved context packets. A small `ui://` MCP Apps view, **only in hosts/clients that support it**, can show file-selection, citation and approval controls *inside* the AI conversation. Tool-only JSON/text responses remain the compatibility path. An MCP App view cannot directly bypass iOS file permissions.

MCP Apps (in-chat UI), an MCP tool server (remote tool transport), and a native iOS companion (permission-holder) are separate components. The term "app within the app" means the **in-chat UI is hosted by the compatible AI client**, not that the iOS sandbox vanishes.

## Non-negotiable transport reality

An external SSD mounted on iPhone is not directly accessible to a Cloudflare Worker. Switching to ChatGPT/Claude/Grok may suspend DriveMind. **Foregrounded at one moment is not an always-on remote server.** Do not advertise live reads while DriveMind is offline.

Evaluate three modes as distinct, never conflated:

- **Local:** SSD -> native permission holder -> local browsing/index/search; no network and no remote MCP access required.
- **Approved packet/cache (first remote MVP):** user explicitly selects and approves minimal snippets or a context packet -> short-lived authenticated Cloudflare storage (encrypted at rest where available; not end-to-end encrypted when the gateway can read the packet) -> remote MCP reads only this approved snapshot (with provenance and expiry); SSD may be disconnected afterward. This is **not** automatic full-drive upload or true live filesystem relay.
- **Live app-mediated access (feasibility gated):** gateway queues a bounded request; an authenticated *currently running and reachable* iOS companion fetches it, obtains scoped approval, reads locally and posts a response. A suspended app must report `offline`/`pending` (with expiry) rather than fabricate a live result. Verify actual transport and cross-app behavior on physical iPhone before promising it.

The gateway should be thin: auth, device/request correlation, TTL, policy, user-approved context, observability. **Never proxy a raw path or offer an unrestricted read-anything endpoint.**

## First valuable vertical slice (priority over UI polish or full index)

**Objective:** While conversing in an existing supported AI app, retrieve a *specific user-approved* excerpt from an SSD previously connected to DriveMind, with an accurate file citation.

1. **R1a — physical iPhone / no network:** connect a real external USB-C SSD, select one root using native Files picker and locally preview one text excerpt (initial max 16,384 UTF-8 bytes). Test unplug/replug, bookmark revalidation, re-grant, app suspension, drive format, cable/power and denied paths.
2. **R1b — release / HTTPS / no MCP:** preview exactly which excerpt and audience will be released; explicitly approve it; use an **isolated development token** only for this initial test to upload one authenticated expiring gateway packet (initial max 65,536 serialized UTF-8 bytes, 1-hour default TTL, 24-hour hard cap). Test unauthorized denial, delete, revoke and expiry. Do not ship the dev token for production.
3. **R1c — MCP / no live phone needed:** connect at least one existing AI client, call `drive_status` and `read_file_chunks` against the **already approved snapshot**, and verify the exact released bytes, provenance and bounded citation. Independently test web setup vs mobile iPhone tool exposure, OAuth principal binding, and MCP Apps UI compatibility. No step can claim another step passed.
4. **After R1:** retain packet-first remote MVP; evaluate live phone queue separately behind R5 NO-GO/GO gate.

**Acceptance:** owner-observed physical iPhone + SSD read; one authenticated cross-client MCP tool call returns the exact approved bytes and bounded citation; unauthorized client cannot read; deleting/expiring packet prevents subsequent access. Never claim raw-live-drive access was proven by this cached-snapshot flow.

## Milestones and gates

### R0 — Relay-first contract and repository alignment (current documentation slice)
- Reframe ROADMAP, ARCHITECTURE and MCP bridge specification; keep old mock React UI as historical prototype.
- Record the product decision separately in CairnStone; send review correspondence on the existing AC1 thread.
- **Gate:** independent architecture review and explicit owner decision. A docs PR is not M1 implementation acceptance.

### R1 — Three isolated feasibility tests and mobile compatibility matrix
- **R1a local:** picker → selected root → one bounded local read on physical iPhone/SSD; test suspend, power/filesystem formats, bookmark revalidation, unplug/replug and manual re-grant.
- **R1b upload:** user approves an explicit excerpt/audience → HTTPS upload to isolated test Worker with development-only token → packet TTL/revoke/delete and wrong-principal denial. No MCP client required for this proof.
- **R1c client:** from an existing AI application, call one authenticated MCP tool against the approved snapshot; verify exact bytes/citation, then denial after revoke/expiry. Check connector install surface (web vs mobile), mobile availability, OAuth and optional MCP Apps `ui://` support **separately per client**.
- **Gate:** independent PASS/FAIL evidence for all three stages and the device/client matrix. A cached packet does not prove live SSD relay. **Live queued relay remains NO-GO until independently tested under R5.**

### R2 — Minimal native permission-holder + one-packet upload
- SwiftUI folder picker, stable approved-root ID, bookmark restoration/revocation where supported, root-confined enumeration and file-handle bounded reads.
- Limit sizes; reject symlink/path escapes and unapproved directories, unsafe file types, disconnected drives, expired access.
- Clear human review/approve/export step. Connect/Refresh Connection (permission and bounded listing only)/Status/Access Controls; comprehensive indexing does not start until R4. No native chat, WKWebView or React dependency required for first proof.
- **Gate:** physical iPhone external-drive read and explicit release receipt; no unauthorized access in adversarial tests.

### R3 — Secure remote MCP gateway and existing-client acceptance
- Cloudflare Worker MCP server with **device pairing to DriveMind owner**, separately authenticated AI-client principal (OAuth-compatible host flow), and packet-release grant bound to **owner, packet, client principal, scopes and expiry**. Validate token issuer, audience, signature and expiration; dev tokens are test-only.
- MVP tools: `drive_status`, `search_files` (approved packet scope only), `read_file_chunks`, `build_context_packet` (subset of **preapproved** chunks only; no approval request). Use opaque file/chunk IDs, strict budgets and accurate provenance; no remote `scan_drive` or raw-path browsing.
- End-to-end client test for one approved packet. `source_mode` = `approved_snapshot | live_verified | local_only` (provenance); separate `connection_status` = `reachable | offline | pending | unknown` (reachability), each with truthful observation timestamps.
- **Gate:** authenticated tool call in at least one intended client; permission, TTL, cross-user isolation, revocation and citation acceptance.

### R4 — Local indexing for broader SSD knowledge (after first MCP success)
- On-device SQLite/FTS5, incremental metadata/text extraction for allowlisted formats, resumable scans, bounded resource budgets and safe stale-index signaling.
- Search local index before selecting remote context. No whole-drive uploads, automatic background scans or full-file export by default.
- **Gate:** persistent search and reproducible results on real drive, including disconnect/reconnect.

### R5 — MCP App inline interface and optional live request queue
- Add a portable MCP Apps `ui://` view for results/selection/context-release **where verified supported**; preserve tool-only response for other clients.
- Explore time-limited authenticated gateway queue + live native companion only after R1 proof; request-level consent, non-foreground failure states, timeouts, replay protection.
- **Gate:** owner-tested in-chat interface/client matrix; independent live-relay security and availability acceptance. No claims that all mobile hosts support identical UI.

### R6 — Optional Temp Cloud / persistent project vault
- Explicitly promote selected working sets to R2/D1 (Vectorize only if beneficial). Separate short-lived packet TTL from intentionally retained vault data.
- Signed-out/offline behavior, deletion/export, audit, per-provider scope, least-data defaults.
- **Gate:** deletion and isolation tests, precise grant model, production lifecycle evidence.

## What stops being MVP work

- Building a second LLM chat client, ChatPanel, provider API-key UI or native LLM orchestration.
- Maintaining a full React dashboard as a dependency for external SSD access.
- Autonomous file mutation, whole-drive uploads, background always-on promises, cloud sync, universal OCR/embeddings and perfect UI parity across clients.

The existing `apps/web` mock interface and previous phases are **legacy reference/scaffold**, not evidence of a working bridge. Existing GitHub Pages run **26365684378 failed at "Build web app"**; carry this forward as known legacy build debt, but do not allow it to block an independent SwiftUI + gateway vertical slice. Repair/remove legacy workflow only with separate reviewed scope.

## Security and provenance contract

- **Initial test budgets:** per-excerpt 16,384 UTF-8 bytes, total serialized packet 65,536 UTF-8 bytes including metadata, default 1-hour expiry, absolute max 24 hours; type allowlist starts with `.txt`, `.md`, `.json`, `.csv`, `.log`. Validate/reject oversize; tune with device evidence.
- Native security-scoped authorization is held only on device. Server cannot browse the SSD. Bookmark persistence after unmount/replug is a **test case**, not a presumed capability; show access failure and provide easy manual re-grant.
- The remote packet is **authenticated, HTTPS-protected, and encrypted at rest where supported**, not end-to-end encrypted if the Worker can decrypt it for MCP reads.
- User release permissions **cannot recall data already read into LLM/provider context**; revocation only prevents future gateway reads. Disclose clearly.
- File text, paths and metadata are **untrusted data**. They cannot add instructions, authorize new tools, or tell an agent to exfiltrate. Do not embed LLM instruction arrays in context packet payloads.
- All file identifiers are opaque; canonicalize/contain references to authorized roots. Enforce bytes, token budgets and extensions on device and in gateway.
- Authentication, explicit release approval, audience scope, revocation, TTL, replay/idempotency controls and audit are mandatory before exposing content to third-party LLMs.
- Never claim "the SSD was searched live" when results came from a dated approved packet or index.
- Validate per-client mobile MCP discovery, connection, OAuth and in-chat UI compatibility; assume no uniform support without testing.
- GitHub holds mutable source; CairnStone accepted per-path HEADs hold reviewed source identity, and canonical `drivemind` HEAD is the verified START HERE. A branch/PR, green CI, owner acceptance, deploy and CairnStone promotion are separate gates.

## Next action after this docs-only review

Claude and Grok reviewed previous PR #1 SHA `0ec49ba01ccf8cead78e3de4ed46121fdd0cadc1`. Their findings informed the current corrections; **the new candidate SHA still requires verification/review before merge**. After the owner makes the merge/acceptance decision, proceed to **R1a physical-device test**, **R1b isolated upload**, then **R1c authenticated MCP client test**. **Do not merge/deploy or claim accepted application status from docs alone.**
