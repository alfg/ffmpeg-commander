import { useCallback, useEffect, useRef, useState } from 'react'
import storage from '@/lib/storage'
import {
  encodeMessage,
  isFinished,
  POLL_MS,
  QUEUE_KEY,
  readEnabled,
  RETRY_MS,
  Status,
  writeEnabled,
  wsUri,
  type Job,
  type JobStatus,
  type Progress,
} from '@/lib/ffmpegd'

/**
 * The ffmpegd connection and the encode queue.
 *
 * The Vue version nested two 5s intervals: one polled for the socket being open
 * and, every time it fired, started *another* interval to pump the queue. Those
 * were never cleared, so an hour of uptime left hundreds of timers racing to
 * dispatch the same job. Here the socket and the pump are each one effect with
 * cleanup, and the pump only runs while connected.
 */
export function useFfmpegd() {
  const [enabled, setEnabledState] = useState(readEnabled)
  const [socketOpen, setSocketOpen] = useState(false)
  const [jobs, setJobs] = useState<Job[]>(() => storage.getAll(QUEUE_KEY) as Job[])
  const [progress, setProgress] = useState<Progress | null>(null)

  const socket = useRef<WebSocket | null>(null)
  // Which job the daemon is currently reporting on. Progress messages carry no
  // job id, so this is the only way to attribute them.
  const activeId = useRef<number | null>(null)
  const onMessage = useRef<(event: MessageEvent) => void>(() => {})

  const connected = enabled && socketOpen

  const refresh = useCallback(() => setJobs(storage.getAll(QUEUE_KEY) as Job[]), [])

  const setStatus = useCallback(
    (id: number, status: JobStatus) => {
      storage.updateStatus(QUEUE_KEY, id, status)
      refresh()
    },
    [refresh],
  )

  const handleMessage = useCallback((event: MessageEvent) => {
    let data: Progress
    try {
      data = JSON.parse(event.data as string) as Progress
    } catch {
      return
    }
    setProgress(data)

    const id = activeId.current
    if (id === null) return

    if (data.err) {
      storage.setError(QUEUE_KEY, id, data.err)
      setStatus(id, Status.ERROR)
      activeId.current = null
      setProgress(null)
    } else if (data.percent === 100) {
      setStatus(id, Status.COMPLETED)
      activeId.current = null
      setProgress(null)
    }
  }, [setStatus])

  // Kept current in an effect: writing to a ref during render is a hazard, and
  // the socket needs the latest closure without being torn down to get it.
  useEffect(() => {
    onMessage.current = handleMessage
  }, [handleMessage])

  // Connection, with retry while enabled.
  useEffect(() => {
    if (!enabled) return

    let stopped = false
    let retry: number | undefined

    const open = () => {
      if (stopped) return
      const ws = new WebSocket(wsUri())
      socket.current = ws
      ws.onopen = () => setSocketOpen(true)
      ws.onmessage = (event) => onMessage.current(event)
      ws.onerror = () => ws.close()
      ws.onclose = () => {
        setSocketOpen(false)
        if (!stopped) retry = window.setTimeout(open, RETRY_MS)
      }
    }
    open()

    return () => {
      stopped = true
      window.clearTimeout(retry)
      const ws = socket.current
      socket.current = null
      if (!ws) return

      // Drop the handlers first so tearing down cannot schedule a retry or
      // report a disconnect for a socket nobody is listening to any more.
      ws.onclose = null
      ws.onerror = null
      ws.onmessage = null

      if (ws.readyState === WebSocket.CONNECTING) {
        // Closing mid-handshake makes browsers log the attempt as a failure --
        // visible in dev, where StrictMode mounts the effect twice. Let the
        // handshake finish, then close it quietly.
        ws.onopen = () => ws.close()
        return
      }

      ws.onopen = null
      ws.close()
    }
  }, [enabled])

  /**
   * Dispatch the next queued job, if nothing is already encoding.
   *
   * Called on a timer and also the moment a job is added, so pressing Encode
   * acts immediately instead of waiting out a poll interval as the Vue app did.
   */
  const pump = useCallback(() => {
    if (!connected) return

    const items = storage.getAll(QUEUE_KEY) as Job[]
    setJobs(items)

    const encoding = items.find((j) => j.status === Status.ENCODING)
    if (encoding) {
      activeId.current = encoding.id
      return
    }

    const next = items.find((j) => j.status === Status.QUEUED)
    if (!next) {
      activeId.current = null
      return
    }

    activeId.current = next.id
    socket.current?.send(encodeMessage(next))
    storage.updateStatus(QUEUE_KEY, next.id, Status.ENCODING)
    setJobs(storage.getAll(QUEUE_KEY) as Job[])
  }, [connected])

  // One timer, cleaned up when the connection goes away.
  useEffect(() => {
    if (!connected) return
    // The queue lives in localStorage and the daemon drives it, so reading it on
    // connect is exactly the external-system synchronisation this rule allows.
    // eslint-disable-next-line react/set-state-in-effect
    pump()
    const id = window.setInterval(pump, POLL_MS)
    return () => window.clearInterval(id)
  }, [connected, pump])

  const setEnabled = useCallback((value: boolean) => {
    setEnabledState(value)
    writeEnabled(value)
  }, [])

  const enqueue = useCallback(
    (input: string, output: string, payload: unknown) => {
      storage.add(QUEUE_KEY, {
        id: Date.now(),
        type: 'encode',
        payload,
        status: Status.QUEUED,
        input,
        output,
        _showDetails: false,
      } as never)
      refresh()
      pump()
    },
    [refresh, pump],
  )

  const cancel = useCallback((id: number) => setStatus(id, Status.CANCELLED), [setStatus])
  const restart = useCallback((id: number) => setStatus(id, Status.QUEUED), [setStatus])

  const toggleDetails = useCallback(
    (id: number, shown: boolean) => {
      storage.toggleDetails(QUEUE_KEY, id, !shown)
      refresh()
    },
    [refresh],
  )

  const clear = useCallback(() => {
    storage.deleteAll(QUEUE_KEY)
    activeId.current = null
    refresh()
  }, [refresh])

  return {
    enabled,
    setEnabled,
    connected,
    jobs,
    progress,
    encoding: jobs.some((j) => j.status === Status.ENCODING),
    enqueue,
    cancel,
    restart,
    toggleDetails,
    clear,
    isFinished,
  }
}
