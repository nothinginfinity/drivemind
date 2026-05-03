# DriveMind iOS App

## Status

**Phase 2 — Native shell skeleton complete.**

## Architecture

```
DriveMindApp (SwiftUI)
  └─ ContentView
      ├─ WebViewController       ← WKWebView hosting the React web UI
      │     └─ NativeBridge        ← WKScriptMessageHandler (JS ↔ Swift)
      └─ DriveConnectView        ← bottom-sheet overlay when no drive connected
          └─ DocumentPickerView   ← UIDocumentPickerViewController (.folder)

DriveManager (ObservableObject)
  ├─ connectDrive(url:)         ← starts security-scoped access, saves bookmark
  ├─ listFiles()                ← recursive FileManager enumeration
  └─ readFileChunk(path:)       ← reads up to N bytes from a file
```

## Bridge protocol

The web UI calls the native layer via `window.DriveMindNative`:

```js
// Check connection status
const result = await window.DriveMindNative.connectDrive();
// result: { ok: true, connected: true, mode: "native" }

// List all indexed files
const result = await window.DriveMindNative.listFiles();
// result: { ok: true, payload: { files: [FileRecord, ...] } }

// Read a file chunk
const result = await window.DriveMindNative.readFileChunk("/path/to/file", 20000);
// result: { ok: true, payload: { text: "..." } }
```

The bridge shim is injected at `document_start` by `WebViewController` so it is
always available before the React app mounts.

## iOS requirements

- iOS 17+
- Xcode 15+
- Physical device recommended for external drive testing (simulators cannot mount USB drives)

## Development setup

```bash
# 1. Start the Vite dev server (web UI auto-loads in the WKWebView in DEBUG builds)
cd apps/web && pnpm dev

# 2. Open the iOS project in Xcode
open apps/ios/DriveMindApp/Package.swift

# 3. Run on a connected iPhone
# Select your device in the Xcode toolbar and press Run.
```

## Production build

```bash
# Build the web UI
pnpm build:web

# Copy dist/ into the Xcode bundle resources
# (Xcode build phase script — to be added in Phase 3)
cp -r apps/web/dist apps/ios/DriveMindApp/dist
```

## Phase 2 success criteria

- [x] User can choose a folder from Files app
- [x] Native layer lists files in selected folder
- [x] Web UI can receive file list through bridge (`window.DriveMindNative.listFiles()`)
- [x] Bookmark persistence: folder access survives app restart
- [x] Security-scoped resource access correctly started/stopped
