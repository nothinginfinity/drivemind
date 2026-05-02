# DriveMind iOS App

This folder will contain the native iOS shell.

The iOS shell is responsible for:

- selecting external drive folders
- accessing files through iOS permissions
- listing files
- reading file chunks
- running or calling the local indexer
- hosting the web UI or bridging to native UI
- storing API keys securely in Keychain

## Initial implementation options

Option A: SwiftUI native app

Option B: Swift native shell + WKWebView frontend

Option C: Capacitor app + custom iOS file access plugin

**Recommended first path:** Swift native shell + WKWebView frontend

This gives the project native iOS file access while keeping the UI portable.

## Native bridge methods

The native app should eventually expose:

```
connectDrive()
listFiles()
indexDrive()
searchIndex(query)
readFile(fileId)
readFileChunk(fileId, offset, length)
summarizeFile(fileId)
generateManifest()
```
