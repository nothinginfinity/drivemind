/**
 * driveAccess.ts
 *
 * Unified drive access layer.
 * - In a WKWebView (iOS native shell): delegates to window.DriveMindNative bridge
 * - In Safari / Chrome (PWA): uses the File System Access API (showDirectoryPicker)
 * - Falls back to a mock data set if neither is available
 */

import type { SearchableFileRecord } from './mockData'

// ─── Type guards ─────────────────────────────────────────────────────────────

function hasNativeBridge(): boolean {
  return typeof window !== 'undefined' &&
    typeof (window as any).DriveMindNative?.listFiles === 'function'
}

function hasFileSystemAccess(): boolean {
  return typeof window !== 'undefined' &&
    typeof (window as any).showDirectoryPicker === 'function'
}

// ─── Drive state ─────────────────────────────────────────────────────────────

let _directoryHandle: FileSystemDirectoryHandle | null = null

export function getConnectedHandle(): FileSystemDirectoryHandle | null {
  return _directoryHandle
}

export function isConnected(): boolean {
  return !!_directoryHandle || hasNativeBridge()
}

// ─── Connect ─────────────────────────────────────────────────────────────────

export async function connectDrive(): Promise<{ ok: boolean; name?: string; error?: string }> {
  // Path 1: native bridge (WKWebView)
  if (hasNativeBridge()) {
    const result = await (window as any).DriveMindNative.connectDrive()
    return result.ok
      ? { ok: true, name: 'External Drive' }
      : { ok: false, error: result.error?.message }
  }

  // Path 2: File System Access API (Safari 17.4+, Chrome)
  if (hasFileSystemAccess()) {
    try {
      _directoryHandle = await (window as any).showDirectoryPicker({ mode: 'read' })
      return { ok: true, name: _directoryHandle!.name }
    } catch (err: any) {
      if (err.name === 'AbortError') return { ok: false, error: 'Cancelled' }
      return { ok: false, error: err.message }
    }
  }

  return { ok: false, error: 'File System Access API not supported in this browser.' }
}

// ─── List files ──────────────────────────────────────────────────────────────

export async function listFiles(): Promise<SearchableFileRecord[]> {
  // Path 1: native bridge
  if (hasNativeBridge()) {
    const result = await (window as any).DriveMindNative.listFiles()
    if (!result.ok) return []
    return (result.payload?.files ?? []) as SearchableFileRecord[]
  }

  // Path 2: File System Access API
  if (_directoryHandle) {
    return await walkDirectory(_directoryHandle, _directoryHandle.name)
  }

  return []
}

// ─── Read chunk ───────────────────────────────────────────────────────────────

export async function readFileChunk(fileId: string, maxBytes = 20_000): Promise<string | null> {
  // Path 1: native bridge
  if (hasNativeBridge()) {
    const result = await (window as any).DriveMindNative.readFileChunk(fileId, maxBytes)
    return result.ok ? result.payload?.text ?? null : null
  }

  // Path 2: File System Access — fileId is the path relative to root, '/' separated
  if (_directoryHandle) {
    try {
      const parts = fileId.replace(/^\//, '').split('/')
      let dir: FileSystemDirectoryHandle = _directoryHandle
      for (const part of parts.slice(0, -1)) {
        dir = await dir.getDirectoryHandle(part)
      }
      const fileHandle = await dir.getFileHandle(parts[parts.length - 1])
      const file = await fileHandle.getFile()
      const slice = file.slice(0, maxBytes)
      return await slice.text()
    } catch {
      return null
    }
  }

  return null
}

// ─── Directory walker ─────────────────────────────────────────────────────────

async function walkDirectory(
  dirHandle: FileSystemDirectoryHandle,
  basePath: string,
  depth = 0
): Promise<SearchableFileRecord[]> {
  if (depth > 8) return [] // Guard against deeply nested trees
  const records: SearchableFileRecord[] = []

  for await (const [name, handle] of (dirHandle as any).entries()) {
    if (name.startsWith('.')) continue // skip hidden

    if (handle.kind === 'file') {
      const file: File = await (handle as FileSystemFileHandle).getFile()
      const path = `${basePath}/${name}`
      const ext = name.includes('.') ? name.split('.').pop()?.toLowerCase() : undefined

      const record: SearchableFileRecord = {
        file_id: path,
        drive_id: basePath.split('/')[0],
        path,
        name,
        extension: ext,
        size_bytes: file.size,
        modified_at: new Date(file.lastModified).toISOString(),
        indexed_status: 'pending_metadata',
        tags: []
      }

      // Auto-read text files under 100 KB for immediate search
      if (isTextFile(ext) && file.size < 100_000) {
        try { record.text = await file.text() } catch { /* skip */ }
      }

      records.push(record)
    } else if (handle.kind === 'directory') {
      const sub = await walkDirectory(handle as FileSystemDirectoryHandle, `${basePath}/${name}`, depth + 1)
      records.push(...sub)
    }
  }

  return records
}

function isTextFile(ext: string | undefined): boolean {
  if (!ext) return false
  return [
    'txt', 'md', 'json', 'jsonl', 'csv', 'html', 'xml',
    'js', 'ts', 'tsx', 'jsx', 'py', 'swift', 'sql',
    'log', 'yaml', 'yml', 'toml', 'sh', 'env'
  ].includes(ext)
}
