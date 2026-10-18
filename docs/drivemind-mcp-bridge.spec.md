# DriveMind MCP Bridge — Relay-First MVP Contract

**Status:** proposed R0001 documentation candidate, 2026-10-18; not live or accepted implementation.
**Review inputs:** Claude AC1 `msg:drivemind-r0001-review-claude-20261018`, Grok AC1 `msg:drivemind-r0001-review-grok-20261018`, both reviewed PR #1 at `0ec49ba01ccf8cead78e3de4ed46121fdd0cadc1`.
**Authority:** [ROADMAP](../ROADMAP.md) for milestone gates; [ARCHITECTURE](ARCHITECTURE.md) for system layers. Previous v0.1 chat/web-style spec is archived at [legacy design](archive/drivemind-mcp-bridge-v0.1-legacy.md) for reference **only**; no legacy tools, payloads, app UI or phases are MVP requirements.

## 1. Core capability

**Existing AI app** (ChatGPT/Claude/Grok or other verified MCP client) <-> **authenticated HTTPS DriveMind MCP gateway** <-> **explicitly approved expiring packet** from the **minimal native iPhone SSD companion**.

- iPhone native code owns folder-picker grants, scoped filesystem traversal, bounded file reads, local approval and optional later SQLite search.
- The remote Worker **cannot browse the SSD**. It serves only explicitly released packets at R3. Never present an approved snapshot as live drive access.
- iOS background suspension makes a continuously reachable native server unproven. A live request queue/relay is separate R5 feasibility work, **NO-GO until physical device tests**.
- MCP Apps interactive `ui://` resources are an optional host capability, **not** the remote MCP tool protocol and **not** a way around iOS file permissions. MVP works with tool-only outputs. Check client installation web/mobile and actual iPhone tool exposure independently.
- **No second LLM chat client, BYOK AI provider, React/WebView dependency, broad cloud sync or autonomous file writes in MVP.**

## 2. Three independently testable proof steps

**R1a — device only, no network.** On a physical iPhone with a real USB-C SSD, open the native picker, select a root, read and locally display a bounded text excerpt. Record OS/app/drive/power/filesystem conditions; exercise replug, re-grant, bookmark restore failure, app switch, suspend/resume and disconnect. Never silently restore invalid root access.

**R1b — authorized packet transfer, no MCP dependency.** User reviews an excerpt and explicitly approves its scope and destination; companion uploads a bounded packet via HTTPS to a test Worker using a **sandbox-only developer token**. Assert persisted bytes/provenance, expiration, delete/revoke and unauthorized request denial. Never ship shared static dev-token authentication as production auth.

**R1c — MCP, no live phone needed.** Connect one supported existing AI host to the Worker. Independently test tools/list, auth, one approved packet read returning exact approved bytes and citation, unauthenticated/other-principal denial, and revocation/expiry. Record **where connector can be installed** (web vs iPhone), whether it is exposed to the iPhone chat, OAuth outcome and MCP Apps `ui://` support (separate). A working desktop/web host does **not** prove mobile acceptance.

These are independently testable. A failure in one cannot be hidden by success in another.

## 3. Initial bounded policy (proposed R1 values; adjust only with tests)

| Boundary | Initial rule |
| --- | --- |
| Per selected text excerpt | **16,384 UTF-8 bytes max** |
| Entire released packet, serialized incl. metadata | **65,536 UTF-8 bytes max** |
| Release TTL | **1 hour default**, **24 hours absolute maximum** |
| Initial file type allowlist | `.txt`, `.md`, `.json`, `.csv`, `.log` |
| Root access | One explicitly selected iOS security-scoped root, no symlink escape |
| Network transport | HTTPS only; authenticated principal + scoped packet grant |
| Server reads | Bounded approved IDs and content budgets only; no raw filesystem paths |
| Remote mutation | None: **no** scan, write, delete/move, persistent background process |
| Upload | No whole-drive upload, no automatic folder sync |
| Storage | Encrypted at rest where backed by supported platform security, HTTPS in transit; **not end-to-end encrypted** if Worker decrypts/serves to MCP |

Count **bytes**, not characters. Reject over-budget inputs; do not truncate silently in a way that changes source provenance. File eligibility is based on detected safe text content as well as extension; reject binary, secret and unsupported types. These values are test defaults, not claims of proven safe handling.

## 4. Principal binding and consent

Define distinct actors and credentials:

1. **Native companion / device**: securely pairs with a specific DriveMind owner account; registration/refresh credentials stored in iOS Keychain. Device session is separate from the LLM client's token.
2. **Existing AI client**: independently authenticates to the HTTPS MCP gateway (OAuth-compatible host flow when supported). Gateway validates token issuer, signature, audience, expiry and maps its subject/client binding to the DriveMind owner; no anonymous or shared cross-tenant token. Record per-client iPhone compatibility.
3. **User's release grant**: after a native preview, the owner explicitly chooses a bounded packet, audience/authorized client principal, expiry and release action. A grant is bound to **owner + packet_id + intended client principal + scopes + expiry**; it is checked at every tool read, is revocable, and grants no broader drive access.
4. **Server policy**: enforce tenant isolation and device/client/grant separation, replay/idempotency controls on upload and approval, rotating credentials, TLS, audit metadata without storing packet contents in logs; return deny for mismatched subject or audience.

**R1b may use a temporary local dev token only for isolated test deployment**; R3 must implement production-quality client OAuth/pairing validation or stop at auth gate. An MCP tool call is **never** implicit authorization to expand the file set, trigger a drive scan or upload data. Approval cannot be initiated or completed through a tool response in R3; native user action precedes each new release.

Revocation blocks **future gateway reads**. It cannot recall content already delivered into an LLM conversation or captured by the provider. Say this in the UI and documentation.

## 5. Uniform source and availability fields

`source_mode` is one of **`approved_snapshot`**, **`live_verified`** (not available in initial R3), **`local_only`**. This describes provenance, *not* device reachability. Separately, `connection_status` is **`reachable`**, **`offline`**, **`pending`**, or **`unknown`**. Never mix these enums.

Packets carry `packet_id`, `owner_id` (server-only), `grant_id` (opaque), `source_revision`, `source_modified_at` where available, `captured_at`, `expires_at`, bounded non-sensitive relative path label, file/chunk opaque IDs and `source_mode:approved_snapshot`. They **never** carry a security-scoped bookmark, absolute root path, bearer token or the impression of online live drive access. `drive_status` must report the last **observed** native status and its observation timestamp separately from available packet snapshots; do not infer `reachable` just because a packet exists.

## 6. Exactly four remote MCP tools for R3

All require validated principal and released-packet grant. Inputs never accept arbitrary local paths or raw drive IDs that imply fresh file access.

| Tool | Initial behavior |
| --- | --- |
| `drive_status` | Authenticated status/capability: available approved packet IDs, source/connection state, observation/freshness and TTL. No live-connection claim from cache. |
| `search_files` | Search **only the caller's approved packet text/metadata**, no device scan. `{packet_id,query,limit}`; bounded results/citations. |
| `read_file_chunks` | Read **only explicitly granted** `{packet_id,chunk_ids,max_bytes}`; source label/version, exact bounded text. Opaque IDs, fail closed. |
| `build_context_packet` | Assemble/return subsets of an **already approved** packet only: `{packet_id,chunk_ids,max_bytes}`. May not start an on-device approval, expand authorization or fetch new local files. |

**Native-only actions** are user-controlled Connect Drive, bounded file enumeration/read, Refresh Connection (root/permission revalidation, no background indexing in R2), preview/select/release, revoke. **Later**: SQLite/FTS indexing (R4), live queued requests (R5), optional project vault/manifest (R6). Legacy `browse_folder(path)`, remote `scan_drive`, `summarize_selected_files`, manifest and cloud-promotion tools are **not** authorized MVP endpoints.

Example tool data (illustrative; not a live receipt):

```json
{
  "source_mode": "approved_snapshot",
  "connection_status": "unknown",
  "packet_id": "pkt_example",
  "source_revision": "sha256-of-approved-source-version",
  "captured_at": "2026-10-18T15:00:00Z",
  "expires_at": "2026-10-18T16:00:00Z",
  "sources": [
    {
      "file_id": "opaque_file_1",
      "chunk_id": "opaque_chunk_1",
      "relative_path_label": "Projects/Notes/example.md",
      "text": "User-approved excerpt only",
      "untrusted_source_content": true
    }
  ]
}
```

## 7. Untrusted file data and prompt-injection boundary

File contents, filename text, embedded Markdown/JSON, metadata and snippets are **untrusted data**, not system/developer instructions, not executable commands and not evidence that an agent may invoke its other tools. Do not include an `instructions` field inside context packets or an "Instructions for LLM" block in exported content. Return source bytes in typed fields with explicit untrusted labels; keep gateway/tool rules outside file content. Don't execute commands from files or let content grant itself access/exfiltrate to another tool. AI hosts must apply their own higher-priority policies and tool authorizations.

If secrets are detected or files are likely sensitive, warn and require deliberate review before release; warn that a previously delivered snippet remains in provider context even after deletion.

## 8. Physical iPhone and host matrix; application distribution

Record iPhone model/iOS build, SSD/vendor, cable/adapter and power, Files-visible filesystem format, selected root, bookmark revalidation after unplug/replug, suspend/resume, permission revoke/re-grant, bounded read, size rejection, approved packet upload, per-client connection, web-only vs mobile connector availability, actual iPhone tool visibility, MCP Apps in-chat UI support, expiry and revocation tests. **Do not assume NTFS readability, power sufficiency or bookmark longevity; test real hardware.**

**App Store considerations (non-legal/non-approval guarantee):** Native companion offers real on-device local value (connect, browse/preview, status, consent/revoke); prepare clear review notes and physical-device demonstration for optional external SSD workflow. Check current Apple rules, filesystem permission requirements and any hardware/accessory program requirements against authoritative documentation before asserting exemption or App Store acceptance. Privacy disclosures must reflect real released data/network paths, not merely the default local mode.

## 9. Stop conditions and provenance

- Do not merge this PR, deploy a Worker, promote accepted CairnStone path/chain HEADs, or claim iPhone/MCP live success from docs alone.
- Physical iPhone/SSD R1a, HTTPS upload R1b and external client MCP R1c each require distinct evidence; evidence from one does not establish another.
- Live request relay stays **NO-GO** until real suspension, reachability, token/consent and expiry tests pass.
- Historical May 2026 v0.1 spec remains versioned only in [archive](archive/drivemind-mcp-bridge-v0.1-legacy.md). No legacy `instructions` payload, remotely triggered scanning, chat client or path-based browsing may be copied into the R3 build.
