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

// Both are overridable from localStorage, matching the Vue app, so a daemon on
// another host or port can be pointed at without a rebuild.
export const wsUri = () => {
  try {
    return localStorage.getItem(WS_URI_KEY) || 'ws://localhost:8080/ws'
  } catch {
    return 'ws://localhost:8080/ws'
  }
}

export const host = () => {
  try {
    return localStorage.getItem(HOST_KEY) || 'http://localhost:8080'
  } catch {
    return 'http://localhost:8080'
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
