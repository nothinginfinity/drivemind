# iOS File Access Notes

DriveMind requires native iOS file access.

A pure PWA is not enough for the first iPhone version because iOS Safari does not provide reliable full external-drive folder traversal for web apps.

## Required native capabilities

DriveMind needs an iOS native shell that can:

- open a folder picker
- allow the user to select an external drive folder
- list files recursively
- read files in chunks
- store access permissions where possible
- expose safe file operations to the UI

## User flow

```txt
1. Plug external SSD into iPhone.
2. Open DriveMind.
3. Tap Connect Drive.
4. iOS Files picker opens.
5. User chooses a folder on the SSD.
6. DriveMind indexes that folder.
```

## Access model

The app should never assume it owns the entire drive.
The user explicitly grants access to a folder.
DriveMind should store a drive record:

```json
{
  "drive_id": "drive_001",
  "display_name": "Samsung T7",
  "root_label": "DriveMind Vault",
  "last_indexed_at": null
}
```

## Important constraints

- Background indexing may be limited by iOS.
- Long scans should keep the app open.
- Large files should be streamed in chunks.
- The app should gracefully handle disconnected drives.
