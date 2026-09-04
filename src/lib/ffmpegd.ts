export const QUEUE_KEY = 'queue'
export const FFMPEGD_KEY = 'ffmpegd'
const WS_URI_KEY = 'ws_uri'
const HOST_KEY = 'host'

export const RETRY_MS = 5000
export const POLL_MS = 5000

export const Status = {
  QUEUED: 'queued',
  ENCODING: 'encoding',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  ERROR: 'error',
} as const

export type JobStatus = (typeof Status)[keyof typeof Status]

/** Terminal states: nothing further will happen to the job on its own. */
export const isFinished = (status: JobStatus) =>
  status === Status.COMPLETED || status === Status.CANCELLED || status === Status.ERROR

export interface Job {
  id: number
  input: string
  output: string
  status: JobStatus
  payload: unknown
  error?: string
  _showDetails: boolean
}

export interface Progress {
  percent?: number
  speed?: string
  fps?: number
  err?: string
}

export interface FileListing {
  cwd?: string
  folders?: string[]
  files?: { name: string }[]
}

// Both default to the page's own origin and are overridable from localStorage,
// so a daemon elsewhere can be pointed at without a rebuild.
//
// Same-origin is the only default that can actually work: ffmpegd rejects a
// websocket upgrade whose Origin is not its own host:port, so the page must
// either be served by the daemon itself or reach it through a proxy on the
// page's own origin. The Vue app hardcoded localhost:8080, which only connected
// when the page happened to be served from there too.
const sameOriginWs = () => `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`

export const wsUri = () => {
  try {
    return localStorage.getItem(WS_URI_KEY) || sameOriginWs()
  } catch {
    return sameOriginWs()
  }
}

export const host = () => {
  try {
    return localStorage.getItem(HOST_KEY) || window.location.origin
  } catch {
    return window.location.origin
  }
}

export async function listFiles(prefix = ''): Promise<FileListing> {
  const res = await fetch(`${host()}/files?prefix=${encodeURIComponent(prefix)}`)
  if (!res.ok) throw new Error(`ffmpegd responded ${res.status}`)
  return (await res.json()) as FileListing
}

export function readEnabled(): boolean {
  try {
    return localStorage.getItem(FFMPEGD_KEY) === 'true'
  } catch {
    return false
  }
}

export function writeEnabled(value: boolean): void {
  try {
    localStorage.setItem(FFMPEGD_KEY, String(value))
  } catch {
    // Storage blocked; the setting holds for this page only.
  }
}

/** The message ffmpegd expects for an encode job. */
export const encodeMessage = (job: Job) =>
  JSON.stringify({
    type: 'encode',
    input: job.input,
    output: job.output,
    payload: JSON.stringify(job.payload),
  })
