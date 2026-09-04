import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest'
import { render, screen, cleanup, act, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '@/App'
import storage from '@/lib/storage'
import { FFMPEGD_KEY, POLL_MS, QUEUE_KEY, Status } from '@/lib/ffmpegd'

/** Minimal stand-in for the daemon: records sends, lets tests drive events. */
class FakeSocket {
  static instances: FakeSocket[] = []
  static CONNECTING = 0
  static OPEN = 1
  static CLOSING = 2
  static CLOSED = 3
  readyState = 0
  sent: string[] = []
  onopen: (() => void) | null = null
  onclose: (() => void) | null = null
  onerror: (() => void) | null = null
  onmessage: ((e: { data: string }) => void) | null = null
  closed = false

  url: string

  constructor(url: string) {
    this.url = url
    FakeSocket.instances.push(this)
  }
  send(data: string) {
    this.sent.push(data)
  }
  close() {
    this.closed = true
    this.readyState = 3
    this.onclose?.()
  }
  open() {
    this.readyState = 1
    this.onopen?.()
  }
  emit(payload: unknown) {
    this.onmessage?.({ data: JSON.stringify(payload) })
  }
}

const socket = () => FakeSocket.instances.at(-1)!

const enableFfmpegd = () => localStorage.setItem(FFMPEGD_KEY, 'true')

const queueJob = (over: Partial<Record<string, unknown>> = {}) =>
  storage.setItem(QUEUE_KEY, [
    {
      id: 1,
      input: 'in.mp4',
      output: 'out.mp4',
      status: Status.QUEUED,
      payload: { video: { codec: 'libx264' } },
      _showDetails: false,
      ...over,
    },
  ])

beforeEach(() => {
  FakeSocket.instances = []
  vi.stubGlobal('WebSocket', FakeSocket as never)
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('ffmpegd', () => {
  it('stays out of the way until enabled', () => {
    render(<App />)
    expect(screen.queryByRole('tab', { name: 'Builder' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Encode' })).toBeNull()
    expect(FakeSocket.instances).toHaveLength(0)
  })

  it('connects and reveals the Queue tab once enabled', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('tab', { name: 'Options' }))

    await user.click(screen.getByLabelText(/ffmpegd daemon/))

    expect(FakeSocket.instances).toHaveLength(1)
    expect(screen.getByRole('tab', { name: 'Queue' })).toBeTruthy()
    expect(screen.getByRole('tab', { name: 'Builder' })).toBeTruthy()
  })

  it('offers Encode only once the socket is actually open', async () => {
    enableFfmpegd()
    render(<App />)
    expect(screen.queryByRole('button', { name: 'Encode' })).toBeNull()

    await act(async () => socket().open())

    expect(screen.getByRole('button', { name: 'Encode' })).toBeTruthy()
  })

  it('queues a job and dispatches it to the daemon', async () => {
    const user = userEvent.setup()
    enableFfmpegd()
    render(<App />)
    await act(async () => socket().open())

    await user.click(screen.getByRole('button', { name: 'Encode' }))

    await waitFor(() => expect(socket().sent).toHaveLength(1))
    const sent = JSON.parse(socket().sent[0])
    expect(sent.type).toBe('encode')
    expect(sent.input).toBe('input.mp4')
    expect(sent.output).toBe('output.mp4')
    // The daemon takes the payload as a JSON string, not an object.
    expect(typeof sent.payload).toBe('string')
    expect(JSON.parse(sent.payload).video.codec).toBe('libx264')
  })

  it('marks a job completed at 100 percent', async () => {
    enableFfmpegd()
    queueJob()
    render(<App />)
    await act(async () => socket().open())
    await waitFor(() => expect(socket().sent).toHaveLength(1))

    await act(async () => socket().emit({ percent: 100 }))

    expect(storage.getAll(QUEUE_KEY)[0].status).toBe(Status.COMPLETED)
  })

  it('records the daemon error on the job', async () => {
    enableFfmpegd()
    queueJob()
    render(<App />)
    await act(async () => socket().open())
    await waitFor(() => expect(socket().sent).toHaveLength(1))

    await act(async () => socket().emit({ err: 'no such encoder' }))

    const job = storage.getAll(QUEUE_KEY)[0]
    expect(job.status).toBe(Status.ERROR)
    expect(job.error).toBe('no such encoder')
  })

  it('does not dispatch a second job while one is encoding', async () => {
    vi.useFakeTimers()
    enableFfmpegd()
    storage.setItem(QUEUE_KEY, [
      { id: 1, input: 'a', output: 'a2', status: Status.QUEUED, payload: {}, _showDetails: false },
      { id: 2, input: 'b', output: 'b2', status: Status.QUEUED, payload: {}, _showDetails: false },
    ])
    render(<App />)
    await act(async () => socket().open())

    await act(async () => {
      vi.advanceTimersByTime(POLL_MS * 4)
    })

    // Four poll ticks, still exactly one job in flight.
    expect(socket().sent).toHaveLength(1)
    const statuses = storage.getAll(QUEUE_KEY).map((j) => j.status)
    expect(statuses.filter((s) => s === Status.ENCODING)).toHaveLength(1)
  })

  it('runs one poll timer, not one per tick', async () => {
    vi.useFakeTimers()
    const setInterval = vi.spyOn(globalThis, 'setInterval')
    enableFfmpegd()
    render(<App />)
    await act(async () => socket().open())

    await act(async () => {
      vi.advanceTimersByTime(POLL_MS * 5)
    })

    // The Vue version started a fresh queue interval on every tick of an outer
    // one, so timers grew without bound for as long as the page stayed open.
    expect(setInterval.mock.calls.length).toBeLessThanOrEqual(2)
    setInterval.mockRestore()
  })

  it('does not close a socket mid-handshake', async () => {
    // StrictMode mounts effects twice in dev, so the first socket is torn down
    // while still connecting. Closing it there makes the browser log a failed
    // connection; waiting for the handshake keeps the console clean.
    enableFfmpegd()
    const { unmount } = render(<App />)
    const ws = socket()
    expect(ws.readyState).toBe(FakeSocket.CONNECTING)

    unmount()

    expect(ws.closed).toBe(false)
    await act(async () => ws.open())
    expect(ws.closed).toBe(true)
  })

  it('closes the socket and stops retrying when disabled again', async () => {
    const user = userEvent.setup()
    enableFfmpegd()
    render(<App />)
    await act(async () => socket().open())
    const first = socket()

    await user.click(screen.getByRole('tab', { name: 'Options' }))
    await user.click(screen.getByLabelText(/ffmpegd daemon/))

    expect(first.closed).toBe(true)
    expect(FakeSocket.instances).toHaveLength(1)
  })
})
