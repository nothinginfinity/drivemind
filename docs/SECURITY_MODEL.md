# Security Model

DriveMind is local-first and privacy-preserving.

## Principles

1. The drive stays local.
2. The full drive is never uploaded.
3. LLM calls receive only selected snippets or files.
4. API keys are user-owned.
5. Destructive actions require explicit confirmation.
6. Index data should be stored locally.

## API keys

User API keys should be stored in the iOS Keychain.

Never store API keys in:

- plain text files
- localStorage
- repo files
- exported manifests

## LLM context policy

Default behavior:

```txt
Search locally first.
Send only top relevant chunks.
Include file paths and metadata.
Limit context size.
Ask before sending full files.
```

## File modification policy

MVP should be read-only.
Future versions may support:

- tagging
- sidecar notes
- manifest writing
- file renaming
- folder organization

All write actions must require user confirmation.

## Sidecar metadata

Prefer writing DriveMind metadata to app storage first.
Future optional sidecar files:

```
.drivemind/
  manifest.json
  tags.json
  recipes.json
```

Only write sidecar files after user approval.
