# DriveMind Web UI

This is the PWA-style frontend for DriveMind.

It can run in two modes:

## 1. Mock browser mode

Used during early development.

No native bridge required.

## 2. iOS embedded mode

Runs inside the native iOS shell.

Uses `window.DriveMindNative` to call native file access tools.

## Commands

```bash
pnpm install
pnpm dev:web
```
