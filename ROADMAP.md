# DriveMind Roadmap — Relay-First MCP Capability

**Direction authorized:** 2026-10-18 — prioritize the missing capability, not a standalone AI/chat application.
**Document status:** documentation candidate for review; not implementation or live acceptance.
**Baseline:** `c79bd8861d09a782191ca452d300a037b2e12e7e`; CairnStone chain `drivemind`; C0000 registry accepted, application unaccepted.
**Coordination:** `thread:drivemind-collab-20261018` (ChatGPT, Claude, Grok).

## Product contract: the app inside the AI app

DriveMind is an **MCP-accessible, local-first storage capability**. ChatGPT, Claude, Grok and other supported hosts already provide the chat, reasoning and agent UI. DriveMind must **not** build another general chat client.

There are two distinct surfaces:

1. **Tiny native iPhone companion (SwiftUI preferred).** Select/revoke an external SSD folder using iOS security-scoped file access; safely enumerate/read within the approved root; optionally build a local SQLite/FTS index; preview and approve bounded excerpts; show connected/offline status and release history. Keep native controls to **Connect Drive, Refresh, Connection Status, Access Controls**. Native app does not expose unrestricted filesystem paths to an LLM.
2. **Authenticated HTTPS MCP gateway + optional MCP App view.** Standard MCP tools let existing AI clients request drive status, search, selected chunks and approved context packets. A small `ui://` MCP Apps view, **only in hosts/clients that support it**, can show file-selection, citation and approval controls *inside* the AI conversation. Tool-only JSON/text responses remain the compatibility path. An MCP App view cannot directly bypass iOS file permissions.

MCP Apps (in-chat UI), an MCP tool server (remote tool transport), and a native iOS companion (permission-holder) are separate components. The term "app within the app" means the **in-chat UI is hosted by the compatible AI client**, not that the iOS sandbox vanishes.

## Non-negotiable transport reality

An external SSD mounted on iPhone is not directly accessible to a Cloudflare Worker. Switching to ChatGPT/Claude/Grok may suspend DriveMind. **Foregrounded at one moment is not an always-on remote server.** Do not advertise live reads while DriveMind is offline.

Evaluate three modes as distinct, never conflated:

- **Local:** SSD -> native permission holder -> local browsing/index/search; no network and no remote MCP access required.
- **Approved packet/cache (first remote MVP):** user explicitly selects and approves minimal snippets or a context packet -> short-lived encrypted/authenticated Cloudflare storage -> remote MCP reads only this approved snapshot (with provenance and expiry); SSD may be disconnected afterward. This is **not** automatic full-drive upload or true live filesystem relay.
- **Live app-mediated access (feasibility gated):** gateway queues a bounded request; an authenticated *currently running and reachable* iOS companion fetches it, obtains scoped approval, reads locally and posts a response. A suspended app must report `offline`/`pending` (with expiry) rather than fabricate a live result. Verify actual transport and cross-app behavior on physical iPhone before promising it.

The gateway should be thin: auth, device/request correlation, TTL, policy, user-approved context, observability. **Never proxy a raw path or offer an unrestricted read-anything endpoint.**

## First valuable vertical slice (priority over UI polish or full index)

**Objective:** While conversing in an existing supported AI app, retrieve a *specific user-approved* excerpt from an SSD previously connected to DriveMind, with an accurate file citation.

1. Connect a real external USB-C SSD via native folder picker; grant only selected root.
2. Preview one text-like file, select a bounded excerpt, and approve explicit destination/release.
3. Transfer only the approved excerpt (not a whole folder or manifest with secrets) to a short-lived, authenticated gateway packet with source identity, freshness snapshot, TTL, deletion and audit.
4. Connect an existing AI client to the DriveMind MCP URL and call `drive_status`, `search_files` / `read_file_chunks` against the approved snapshot.
5. Return the actual selected excerpt, path label and source-version timestamp; show stale/offline semantics. Verify source citation, access revocation and expiry.

**Acceptance:** owner-observed physical iPhone + SSD read; one authenticated cross-client MCP tool call returns the exact approved bytes and bounded citation; unauthorized client cannot read; deleting/expiring packet prevents subsequent access. Never claim raw-live-drive access was proven by this cached-snapshot flow.

## Milestones and gates

### R0 — Relay-first contract and repository alignment (current documentation slice)
- Reframe ROADMAP, ARCHITECTURE and MCP bridge specification; keep old mock React UI as historical prototype.
- Record the product decision separately in CairnStone; send review correspondence on the existing AC1 thread.
- **Gate:** independent architecture review and explicit owner decision. A docs PR is not M1 implementation acceptance.

### R1 — Foreground/background and connector feasibility proof
- Test real iPhone security-scoped SSD access, app-switch suspension, disconnection, and candidate callback/poll/queue lifecycle.
- Confirm the actual supported iOS ChatGPT/Claude/Grok MCP tool behavior **per client**. Test MCP Apps UI support separately.
- Select packet/cache-first as default remote MVP; do not depend on unverified always-on local service.
- **Gate:** reproducible device/client matrix and a documented live-relay GO/NO-GO decision. If live mode fails, retain explicit packet-only mode.

### R2 — Minimal native permission-holder + one-packet upload
- SwiftUI folder picker, stable approved-root ID, bookmark restoration/revocation where supported, root-confined enumeration and file-handle bounded reads.
- Limit sizes; reject symlink/path escapes and unapproved directories, unsafe file types, disconnected drives, expired access.
- Clear human review/approve/export step. Connect/Refresh/Status/Access Controls; no native chat, WKWebView or React dependency required for first proof.
- **Gate:** physical iPhone external-drive read and explicit release receipt; no unauthorized access in adversarial tests.

### R3 — Secure remote MCP gateway and existing-client acceptance
- Cloudflare Worker MCP server with per-user/per-device auth and scoped grants; expiry/revoke/delete for selected packet storage.
- MVP tools: `drive_status`, `search_files` (approved packet scope initially), `read_file_chunks`, `build_context_packet`. Use stable opaque file/chunk IDs, strict budgets and accurate provenance.
- End-to-end client test for one approved packet. `drive_status` describes `snapshot` vs `live` vs `offline` honestly.
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

- Native security-scoped authorization is held only on device. Server cannot browse the SSD.
- All file identifiers are opaque; canonicalize/contain references to authorized roots. Enforce bytes, token budgets and extensions on device and in gateway.
- Authentication, explicit release approval, audience scope, revocation, TTL, replay/idempotency controls and audit are mandatory before exposing content to third-party LLMs.
- Never claim "the SSD was searched live" when results came from a dated approved packet or index.
- Validate per-client mobile MCP discovery, connection, OAuth and in-chat UI compatibility; assume no uniform support without testing.
- GitHub holds mutable source; CairnStone accepted per-path HEADs hold reviewed source identity, and canonical `drivemind` HEAD is the verified START HERE. A branch/PR, green CI, owner acceptance, deploy and CairnStone promotion are separate gates.

## Next action after this docs-only review

Independent Grok/Claude architecture review of the thin-native + remote-MCP contract; then owner-approved R1 device/transport spike and R2–R3 vertical slice. **Do not merge/deploy or claim accepted application status from this roadmap draft alone.**
