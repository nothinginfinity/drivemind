# DriveMind — The MCP Bridge for Your iPhone's External Drive

**Status:** Relay-first architecture proposal on [draft PR #1](https://github.com/nothinginfinity/drivemind/pull/1). No functional iPhone application or remotely accessible DriveMind MCP service has passed live acceptance.

DriveMind is the missing local-storage capability inside existing AI apps. It lets a user connect an external SSD to their iPhone, approve specific snippets or context, and retrieve that content through a scoped **MCP connector in ChatGPT, Claude, Grok or another compatible host**. DriveMind is **not a replacement chat client**, universal file-sync product or cloud backup.

## The small product

```text
USB-C SSD -> minimal native SwiftUI iPhone companion
              [Connect / Preview / Status / Access Controls]
           -> human-approved, expiring context packet
           -> authenticated HTTPS Cloudflare MCP gateway
           -> existing ChatGPT / Claude / Grok conversation
              (optional inline MCP App UI where verified supported)
```

The **iPhone companion** alone holds iOS permission to the user-selected folder. A Cloudflare Worker cannot read that SSD directly. The first remote capability is an **approved snapshot**, not continuous live filesystem access. Ordinary iOS app suspension makes an always-on local phone relay unreliable; a separate live mode remains gated by physical-device evidence.

**MCP tools**, **MCP Apps interactive UI** and **native iOS drive permissions** are distinct. The initial MCP tools work without any in-chat widget. Validate actual connector setup and exposure independently in each AI provider's iPhone client; web support does not guarantee mobile support.

## First useful proof — three independent tests

1. **iPhone only:** with a real USB-C SSD, select a folder in Files, preview/read **one** bounded text excerpt locally; handle unsupported file systems, power, unplug/replug, bookmark failure and re-grant. No network required for this first test.
2. **HTTPS packet:** explicitly approve the excerpt/audience and upload only those bytes to a short-lived test Worker. Developer-token auth is allowed only in an isolated test environment. Confirm storage, expiry, revoke and denial.
3. **MCP in an existing AI app:** connect an authenticated client to the gateway; call a tool to read the already approved packet with accurate path label, capture timestamp and citation. Test iPhone app separately and prove expired/unauthorized clients cannot read.

**Initial proposed limits:** 16 KiB per excerpt, 64 KiB total serialized packet, 1 hour default TTL, 24 hours maximum; a small safe-text allowlist. These are R1 test defaults and must be revised with evidence if necessary.

## Native companion and MCP tools

The first companion should be **SwiftUI** and minimal: **Connect Drive**, **Refresh Connection** (revalidate permission/listing; not full indexing), **Connection Status**, and **Access Controls** (preview/release/revoke). SQLite/FTS indexing comes **after** the first authenticated end-to-end packet works. Existing React/WKWebView scaffolding in `apps/web` and `apps/ios` is historical/experimental, not a build dependency or proof of live acceptance.

**Exactly four initial remote tools:** `drive_status`, `search_files`, `read_file_chunks`, `build_context_packet`. These operate **only within an already user-approved packet**. Remote clients cannot pass arbitrary file paths, trigger scans, request unapproved files or start silent uploads. `build_context_packet` can assemble only preapproved chunks and cannot itself authorize a new release.

Tool data distinguishes provenance `source_mode` (`approved_snapshot`, `live_verified`, `local_only`) from reachability `connection_status` (`reachable`, `offline`, `pending`, `unknown`). No live mode is implemented or accepted yet.

## Privacy and permissions

- The user chooses the authorized iOS folder root. Reads are bounded and confined to that root; no symlink escapes, arbitrary paths or full-drive upload.
- User previews the exact released content and selects a recipient/audience. Gateway authenticates the owner and client and checks a revocable grant bound to **packet + owner + client principal + expiry** for every read.
- HTTPS and encrypted-at-rest storage do **not** mean end-to-end encryption when the gateway can read/serve the packet.
- Revocation blocks **future** gateway access; it **cannot erase data already read or retained by an AI provider**.
- Text read from a file is **untrusted source data**, not instructions for the AI agent or authorization for tool execution.
- Temp Cloud/project vault retention, OCR, Vectorize/embeddings, unrestricted live relay, autonomous file edits, BYOK chat UI and automated sync are **not first-build requirements**.

## Build gates and source of truth

The [Roadmap](ROADMAP.md) defines R0 documentation review, R1a device proof, R1b approved upload, R1c authenticated MCP/client test, R2 minimal companion, R3 production gateway, R4 SQLite/FTS and later optional UI/live relay/vault. [Architecture](docs/ARCHITECTURE.md) defines layers, and the [MCP Bridge Contract](docs/drivemind-mcp-bridge.spec.md) defines precise initial tool/auth/security behavior. The [historical v0.1 bridge spec](docs/archive/drivemind-mcp-bridge-v0.1-legacy.md) is archived **not authoritative for MVP**.

CairnStone chain `drivemind` records accepted source/history; canonical C0000 START HERE stays intact until owner-reviewed acceptance. A docs commit/PR is **not** permission to merge, deploy, modify files on an SSD, or claim working mobile MCP integration.

The first success is **one user-approved SSD excerpt correctly retrieved in an existing AI chat**.
