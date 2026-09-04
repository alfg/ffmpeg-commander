import { Status, type Job, type Progress } from '@/lib/ffmpegd'

interface Props {
  jobs: Job[]
  progress: Progress | null
  connected: boolean
  onCancel: (id: number) => void
  onRestart: (id: number) => void
  onToggleDetails: (id: number, shown: boolean) => void
  onClear: () => void
}

const badge: Record<string, string> = {
  [Status.QUEUED]: 'bg-sunken text-fg',
  [Status.ENCODING]: 'bg-accent text-accent-fg',
  [Status.COMPLETED]: 'bg-terminal/25 text-fg',
  [Status.CANCELLED]: 'bg-danger/15 text-danger',
  [Status.ERROR]: 'bg-danger/15 text-danger',
}

const btn =
  'rounded border border-line px-2 py-1 text-xs font-medium hover:bg-sunken ' +
  'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none'

function ProgressBar({ progress }: { progress: Progress | null }) {
  const percent = Math.max(0, Math.min(100, progress?.percent ?? 0))
  return (
    <div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-sunken">
        <div className="h-full bg-accent transition-[width]" style={{ width: `${percent}%` }} />
      </div>
      {progress?.speed || progress?.fps ? (
        <p className="mt-1 text-center font-mono text-[11px] text-muted">
          {progress.speed} @ {progress.fps} FPS
        </p>
      ) : null}
    </div>
  )
}

export default function Queue({
  jobs,
  progress,
  connected,
  onCancel,
  onRestart,
  onToggleDetails,
  onClear,
}: Props) {
  // Newest first, matching the Vue table's default sort.
  const ordered = [...jobs].sort((a, b) => b.id - a.id)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <p className="text-sm text-muted">
          {connected ? (
            <span className="text-terminal">● ffmpegd online</span>
          ) : (
            <span className="text-danger">● ffmpegd offline</span>
          )}
        </p>
        <button type="button" onClick={onClear} className={`${btn} ml-auto`} disabled={!jobs.length}>
          Clear all
        </button>
      </div>

      {ordered.length === 0 ? (
        <p className="rounded-lg border border-line bg-panel p-6 text-center text-sm text-muted">
          Nothing queued. Build a command and press Encode.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {ordered.map((job) => (
            <li key={job.id} className="rounded-lg border border-line bg-panel p-3">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded px-1.5 py-0.5 text-xs font-medium ${badge[job.status] ?? ''}`}
                >
                  {job.status}
                </span>
                <span className="min-w-0 flex-1 truncate font-mono text-sm">
                  {job.input} → {job.output}
                </span>

                <button
                  type="button"
                  className={btn}
                  onClick={() => onToggleDetails(job.id, job._showDetails)}
                >
                  {job._showDetails ? 'Hide' : 'Details'}
                </button>

                {job.status === Status.QUEUED || job.status === Status.ENCODING ? (
                  <button type="button" className={btn} onClick={() => onCancel(job.id)}>
                    Cancel
                  </button>
                ) : null}

                {job.status === Status.ERROR || job.status === Status.CANCELLED ? (
                  <button type="button" className={btn} onClick={() => onRestart(job.id)}>
                    Retry
                  </button>
                ) : null}
              </div>

              {job.status === Status.ENCODING ? (
                <div className="mt-2">
                  <ProgressBar progress={progress} />
                </div>
              ) : null}

              {job.error ? (
                <p className="mt-2 rounded bg-danger/10 p-2 font-mono text-xs text-danger">
                  {job.error}
                </p>
              ) : null}

              {job._showDetails ? (
                <pre className="mt-2 overflow-x-auto rounded bg-code-bg p-2 font-mono text-xs text-code-fg">
                  {JSON.stringify(job.payload, null, 2)}
                </pre>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
