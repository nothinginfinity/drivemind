import { useState } from 'react'
import { connectDrive, listFiles, isConnected } from '../lib/driveAccess'
import type { SearchableFileRecord } from '../lib/mockData'

interface DriveConnectPanelProps {
  onFilesLoaded?: (files: SearchableFileRecord[]) => void
}

export function DriveConnectPanel({ onFilesLoaded }: DriveConnectPanelProps) {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>(
    isConnected() ? 'connected' : 'idle'
  )
  const [driveName, setDriveName] = useState<string | null>(null)
  const [fileCount, setFileCount] = useState<number>(0)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)

  async function handleConnect() {
    setStatus('connecting')
    setErrorMsg(null)

    const result = await connectDrive()
    if (!result.ok) {
      setStatus('error')
      setErrorMsg(result.error ?? 'Unknown error')
      return
    }

    setDriveName(result.name ?? 'Drive')
    setStatus('connected')
    setScanning(true)

    const files = await listFiles()
    setFileCount(files.length)
    setScanning(false)
    onFilesLoaded?.(files)
  }

  return (
    <section className="card">
      <h2>Drive</h2>

      {status === 'idle' && (
        <>
          <p className="drive-hint">
            Connect a folder from your Files app or external SSD.
          </p>
          <button onClick={handleConnect} className="drive-connect-btn">
            Connect Drive
          </button>
        </>
      )}

      {status === 'connecting' && (
        <p className="drive-hint">Opening folder picker…</p>
      )}

      {status === 'connected' && (
        <div className="drive-status">
          <span className="drive-status-dot" />
          <span className="drive-status-name">{driveName}</span>
          {scanning
            ? <span className="drive-scanning">Scanning…</span>
            : <span className="drive-file-count">{fileCount.toLocaleString()} files</span>
          }
        </div>
      )}

      {status === 'error' && (
        <>
          <p className="drive-error">{errorMsg}</p>
          <button onClick={handleConnect} className="drive-connect-btn">
            Try Again
          </button>
        </>
      )}
    </section>
  )
}
