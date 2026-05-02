# Future Phone Sync

Phone-to-phone sync is not part of the MVP.

DriveMind should be built so future sync can use the local index and manifest system.

## Future model

```txt
Storage Phone:
  external SSD connected
  DriveMind indexes drive
  advertises manifest

Main Phone:
  requests manifest
  searches metadata
  requests selected files
```

## Transport plan

Bluetooth:
- discovery
- pairing
- metadata
- compressed manifests
- small text files
- prompt packs
- recipes

Wi-Fi / peer-to-peer:
- large files
- images
- PDFs
- videos
- bulk transfers

## Future protocol objects

- drive manifest
- file request
- chunk transfer
- transfer receipt
- device identity
- pairing record

## Design requirement

The current manifest format should be small, compressible, and transferable over Bluetooth later.
