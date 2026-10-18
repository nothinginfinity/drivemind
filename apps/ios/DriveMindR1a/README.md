# DriveMind R1a â isolated native iPhone proof

This is the **functional R1a implementation candidate**, separate from the legacy WebView/React shell in `apps/ios/DriveMindApp` and from docs-only PR #1. No server, network, background relay, in-app AI/chat, WebView or remote MCP access is part of this target.

## Behavior
1. On a physical USB-C iPhone, attach a readable external SSD and open **DriveMind**.
2. Tap **Choose USB-C drive folder**, pick a folder using iOS Files.
3. Observe permission and folder connection status. A shallow, bounded listing exposes up to 200 immediate children with extensions `.txt`, `.md`, `.json`, `.csv`, `.log`. It never recursively indexes the SSD.
4. Tap one file, confirm **Read locally**, and view a **16,384-byte maximum** UTF-8 excerpt. Reads use a coordinated file access, O_NOFOLLOW, regular-file check, symlink-resolved immediate-parent confinement and byte-bounded FileHandle. Binary/invalid UTF-8 and ineligible paths fail closed. If longer than the bound, truncation is clearly labeled.
5. Clear preview; use **Refresh connection** to revalidate the selected folder and listing, or **Revoke local folder access** to clear the saved bookmark and active scope.
6. Move DriveMind to the background: the local preview is cleared. This is *not* a persistent live network relay.

Bookmarks are created where the provider supports them. Every launch attempts to resolve and revalidate the bookmark and security scope; stale, unavailable, revoked, or unplugged roots require the operator to reselect. iOS File Provider and SSD behaviors are **not proven** until physical testing.

## Unsigned CI build (macOS runner)
```sh
brew install xcodegen
xcodegen generate --spec apps/ios/DriveMindR1a/project.yml --project apps/ios/DriveMindR1a
xcodebuild -project apps/ios/DriveMindR1a/DriveMindR1a.xcodeproj \
  -scheme DriveMindR1a -configuration Debug -sdk iphonesimulator \
  -destination 'generic/platform=iOS Simulator' CODE_SIGNING_ALLOWED=NO build
```

See `.github/workflows/ios-r1a.yml`. This is a compiler check, **not** a signed IPA, TestFlight deployment, or proof of physical SSD access. Grok / Grok Bot may subsequently wire App Store Connect CI signing and TestFlight with operator-controlled credentials and distinct authorization.

## Owner device acceptance (not yet performed)
- [ ] External USB-C drive visible in Files; select approved root
- [ ] Only eligible root children appear; no sibling/parent/symlink escape
- [ ] Explicit local read approval; bounded UTF-8 text, exact length and truncation
- [ ] Denied, binary, missing, symlink, large file, and unplugged-drive failure cases
- [ ] Bookmark restart/replug behavior, reselect path, manual revoke
- [ ] Foreground/background transition clears local excerpt
- [ ] Record device/iOS/SSD format, cable/power details and errors

Do **not** merge this candidate or promote the CairnStone `drivemind` chain/path heads without a separate owner acceptance decision. R1b network packet and R1c MCP remain separate future gates.
