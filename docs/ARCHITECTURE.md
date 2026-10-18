# DriveMind Architecture — Relay-First

**Status:** proposed 2026-10-18 doc candidate, subject to review/owner acceptance. Follow [ROADMAP.md](../ROADMAP.md) for milestones and gates. Older React/WKWebView/chat experiments are legacy scaffolding, not MVP requirements.

## Product shape: the missing capability

```text
                  ChatGPT / Claude / Grok / other MCP-capable host
                      | standard MCP tools (host support verified)
                +-----v-----------------------------+
                | DriveMind HTTPS MCP gateway       |
                | auth / policy / TTL / audit        |
                | optional MCP Apps in-chat UI      |
                | (only where host supports it)     |
                +------|----------------------------+
                       | approved packet/cache, or
                       | separately proven live queue
                +------v----------------------------+
                | minimal SwiftUI iPhone companion  |
                | picker / scoped files / consent   |
                | optional SQLite + FTS index       |
                +------|----------------------------+
                       | security-scoped access
                  Selected external SSD folder
```

**The native iOS app is a permission-holder and data source, not an AI conversation client.** The AI host handles chat/reasoning; DriveMind exposes the tool/data capability. The optional embedded MCP Apps UI is rendered by a compatible AI host, not by the iOS app.

## Four minimal native controls

1. **Connect Drive**: document/folder picker, security-scoped access, persisted bookmark where supported and revalidation.
2. **Refresh Connection**: revalidate bookmark/root permission and bounded directory listing; comprehensive SQLite/FTS indexing is deferred to R4.
3. **Connection Status**: selected root, last index date, local/offline/snapshot status, recent releases.
4. **Access Controls**: review snippets/packet and client audience, approve export, revoke future reads and clear cached grants. Explicitly warn that already delivered LLM/provider context **cannot** be recalled.

Prefer a small SwiftUI view. A WKWebView/React dashboard is *optional* only if a later measured need justifies its bridge/testing complexity. Native must not accept arbitrary filesystem paths from a web view or MCP server. Use stable opaque identifiers and canonical root containment with symlink rejection.

## Runtime modes (strictly distinguish)

| Mode | Data source | Exposed to remote LLM? | Limit |
| --- | --- | --- | --- |
| Local | physical SSD + iPhone | No by default | Native active permission only |
| Approved snapshot | explicitly released, TTL-bounded excerpt in authenticated gateway | Yes, only scoped packet | Not live SSD access |
| Live relay (experimental) | phone app responding while reachable | Only after separate verified device transport/consent proof | iOS suspends ordinary background apps |
| Project vault (later) | explicitly retained selected Cloudflare working set | Scoped yes | Separate persistence decision |

Cloudflare cannot directly access a plugged-in SSD. Do not rely on a web page or a switched-away native app to respond continuously. If not reachable, reply with a truthful offline/pending outcome and expiration. Avoid falsely advertising "always-on iPhone MCP server."

## Thin MCP contract

Start with four tools only:
- `drive_status`: mode, reachable status, packet freshness, last indexed/released time; never invent live reachability.
- `search_files`: search within explicitly approved packet scope at R3; add local index search only with proven authenticated phone transport.
- `read_file_chunks`: bounded approved chunk identifiers, no client-supplied raw paths; cite immutable packet/source revision.
- `build_context_packet`: assemble only a bounded subset of **already approved** packet chunks; no on-device approval request, new release or unapproved device access in R3.

All tool results carry `source_mode` (`approved_snapshot`, `live_verified`, `local_only`) **only for provenance**, plus a separate `connection_status` (`reachable`, `offline`, `pending`, `unknown`) with a last-observed timestamp for device reachability; they include packet/revision IDs, capture time, bounded source path labels and expiration. Snapshot availability does not prove live device reachability. Tool-only hosts receive useful structured/text data. UI-capable hosts may receive separate `ui://` resource for a file browser/approval panel, but **MCP Apps support must be verified per host and per mobile client**.

## Minimal end-to-end proof — three independently evidenced stages

1. **R1a / no network:** on a physical iPhone + real USB-C SSD, native picker selects one root and previews one bounded allowlisted text excerpt. Test actual drive power/filesystem format, suspension/replug, bookmark revalidation and manual re-grant.
2. **R1b / no MCP:** preview exact excerpt and recipient, explicitly approve, then upload an HTTPS short-lived packet to an isolated test Worker using a development-only token. Test wrong-principal denial and revoke/expiry. Development-token authentication **must not ship** to production.
3. **R1c / client MCP:** connect one existing AI client to the now-authenticated gateway and read exact approved bytes with truthful source label and citation. Test browser-vs-iPhone connector availability, OAuth principal binding, and in-chat UI independently. No native live-phone response is required for a snapshot tool call.

**Default R1 budgets (test values):** 16,384 UTF-8 bytes per excerpt, 65,536 UTF-8 bytes per serialized packet (including metadata), 1 hour default TTL, 24 hour maximum. Initial safe-text extensions: `.txt`, `.md`, `.json`, `.csv`, `.log`. Reject rather than silently truncate oversize, binary or unapproved data. Live queued relay remains **NO-GO** pending separate R5 proof.

## Security and non-goals

Read-only MVP. No silent full drive copy, no server-side path-based filesystem API, no automatic file mutation, no unrestricted background access, no in-app AI chat or BYOK LLM client. Secure outbound data policy on phone, short-lived server grants, size/charset/type limits, path/root validation, auditing and negative tests are required.

**Pairing and client authorization:** pair native device with DriveMind owner; independently authenticate MCP client (production OAuth-compatible binding); validate token issuer/audience/expiry; every read requires a release grant scoped to owner + approved packet + exact client principal + expiry. Development tokens are R1b sandbox-only. No one LLM tool call can authorize a new device read/release. HTTPS + encryption at rest **is not end-to-end encryption** if gateway can serve plaintext.

**Prompt injection:** file snippets, titles, code blocks and metadata returned by MCP are untrusted data and must not carry agent-facing `instructions`, tool-use authority or hidden exfiltration commands. Host-side tool policy remains in control. Revocation prevents future gateway reads but **cannot erase content already received in an AI conversation**.

**Previous design artifacts:** `apps/web` is a mock UI and has a failed Pages build; `apps/ios/DriveMindApp` is an unverified Swift/WKWebView scaffold. Neither is evidence of a deployable app. The new native build path should remain independent of the legacy Pages build failure.

**Current authority:** C0000 registry is accepted, *application implementation is not*. Documentation on a review branch is proposal/evidence until independent review and owner gate.
