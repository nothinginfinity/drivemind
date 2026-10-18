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
2. **Refresh**: bounded safe listing/index scan while running.
3. **Connection Status**: selected root, last index date, local/offline/snapshot status, recent releases.
4. **Access Controls**: review snippets/packet, approve export, revoke and clear cached grants.

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
- `build_context_packet`: return a bounded preapproved packet or create an on-device approval request; a tool call alone does not authorize reading unapproved files.

All tool results carry `source_mode` (`approved_snapshot`, `live_verified`, `local_only`), packet/revision IDs, date, bounded source path labels and appropriate expiration. Tool-only hosts receive useful structured/text data. UI-capable hosts may receive separate `ui://` resource for a file browser/approval panel, but **MCP Apps support must be verified per host and per mobile client**.

## Minimal end-to-end proof

1. iPhone folder picker selects one external SSD folder.
2. Native validates selected root and reads one bounded text excerpt.
3. User previews and approves that excerpt for a specified remote destination.
4. Authenticated gateway persists only this expiring packet, not a whole-drive mirror.
5. Existing ChatGPT/Claude/Grok client calls `search_files` or `read_file_chunks`; result cites source and acknowledges snapshot age.
6. Revoke/expire -> tool access denied. Wrong principal -> denied. Disconnected SSD does not masquerade as available live access.

## Security and non-goals

Read-only MVP. No silent full drive copy, no server-side path-based filesystem API, no automatic file mutation, no unrestricted background access, no in-app AI chat or BYOK LLM client. Secure outbound data policy on phone, scoped short-lived server grants and deletions, size/charset/type filters, path/root validation, audit and negative tests all required.

**Previous design artifacts:** `apps/web` is a mock UI and has a failed Pages build; `apps/ios/DriveMindApp` is an unverified Swift/WKWebView scaffold. Neither is evidence of a deployable app. The new native build path should remain independent of the legacy Pages build failure.

**Current authority:** C0000 registry is accepted, *application implementation is not*. Documentation on a review branch is proposal/evidence until independent review and owner gate.
