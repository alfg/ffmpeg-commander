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

// ffmpegd listens on localhost:8080 by default and only accepts a fixed list of
// origins (see allowedOrigins in ffmpegd's cmd/ffmpegd.go). Both endpoints are
// overridable from localStorage, so a daemon elsewhere can be pointed at without
// a rebuild.
//
// When the page itself is on localhost -- the Vite dev server, whose config
// proxies /ws and /files to the daemon -- talk to our own origin so the proxy
// is used. Anywhere else, such as the deployed site, the daemon runs on the
// visitor's machine, so talk to it there directly.
export const DAEMON_ORIGIN = 'http://localhost:8080'

const LOCAL_HOSTNAMES = ['localhost', '127.0.0.1', '[::1]']
const isLocalPage = () => LOCAL_HOSTNAMES.includes(window.location.hostname)

const defaultHost = () => (isLocalPage() ? window.location.origin : DAEMON_ORIGIN)

const defaultWsUri = () => {
  if (!isLocalPage()) return `${DAEMON_ORIGIN.replace(/^http/, 'ws')}/ws`
  return `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`
}

export const wsUri = () => {
  try {
    return localStorage.getItem(WS_URI_KEY) || defaultWsUri()
  } catch {
    return defaultWsUri()
  }
}

export const host = () => {
  try {
    return localStorage.getItem(HOST_KEY) || defaultHost()
  } catch {
    return defaultHost()
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
