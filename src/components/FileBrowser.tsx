import { useCallback, useEffect, useState } from 'react'
import { listFiles, type FileListing } from '@/lib/ffmpegd'

interface Props {
  onSelect: (path: string) => void
  onClose: () => void
}

/** A folder ends in "/", which is how the daemon distinguishes the two. */
const isFolder = (label: string) => label.endsWith('/')

export default function FileBrowser({ onSelect, onClose }: Props) {
  const [prefix, setPrefix] = useState('')
  const [listing, setListing] = useState<FileListing>({})
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (next: string) => {
    try {
      setError(null)
      setListing(await listFiles(next))
      setPrefix(next)
    } catch {
      setError('Could not reach ffmpegd.')
    }
  }, [])

  useEffect(() => {
    // Fetching the root listing from ffmpegd on mount is external-system
    // synchronisation, which is what effects are for.
    // eslint-disable-next-line react/set-state-in-effect
    void load('')
  }, [load])

  const entries = [
    ...(listing.folders ?? []).map((label) => ({ label })),
    ...(listing.files ?? []).map((f) => ({ label: f.name })),
  ].filter((e) => e.label !== prefix)

  const goUp = () => {
    const parts = prefix.split('/')
    parts.splice(-2, 1) // Drop the last segment, keeping the trailing slash.
    void load(parts.join('/'))
  }

  return (
    <div className="absolute top-full right-0 left-0 z-30 mt-1 max-h-72 overflow-y-auto rounded-md border border-line bg-panel p-2 shadow-lg">
      <div className="mb-1 flex items-center gap-2">
        <span className="min-w-0 flex-1 truncate font-mono text-xs text-muted">
          {listing.cwd ?? prefix ?? '/'}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="rounded px-2 py-0.5 text-xs hover:bg-sunken"
        >
          Close
        </button>
      </div>

      {error ? <p className="p-2 text-sm text-danger">{error}</p> : null}

      <ul className="text-sm">
        {prefix !== '' ? (
          <li>
            <button
              type="button"
              onClick={goUp}
              className="w-full rounded px-2 py-1 text-left font-mono hover:bg-sunken"
            >
              ..
            </button>
          </li>
        ) : null}
        {entries.map((entry) => (
          <li key={entry.label}>
            <button
              type="button"
              onClick={() => (isFolder(entry.label) ? void load(entry.label) : onSelect(entry.label))}
              className="w-full rounded px-2 py-1 text-left font-mono hover:bg-sunken"
            >
              {entry.label}
            </button>
          </li>
        ))}
        {!error && entries.length === 0 ? (
          <li className="px-2 py-1 text-muted">Empty.</li>
        ) : null}
      </ul>
    </div>
  )
}
