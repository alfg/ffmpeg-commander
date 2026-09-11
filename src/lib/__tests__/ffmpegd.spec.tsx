import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest'
import { render, screen, cleanup, act, waitFor, fireEvent, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '@/App'
import storage from '@/lib/storage'
import { FFMPEGD_KEY, POLL_MS, QUEUE_KEY, Status } from '@/lib/ffmpegd'
import { FFMPEGD_INSTALL_URL, SETUP_DELAY_MS } from '@/components/FfmpegdSetup'

const commandText = () =>
  screen.getByTestId('command').textContent?.replace(/\s+/g, ' ').trim() ?? ''

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

  it('reconnects to a daemon address saved in Options', async () => {
    enableFfmpegd()
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('tab', { name: 'Options' }))
    const first = socket()

    await user.type(screen.getByLabelText('Daemon address'), 'mybox:9000')
    expect(FakeSocket.instances).toHaveLength(1)
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(socket().url).toBe('ws://mybox:9000/ws')
    expect(first).not.toBe(socket())
    expect((screen.getByLabelText('Daemon address') as HTMLInputElement).value).toBe('http://mybox:9000')
    expect(localStorage.getItem('host')).toBe('http://mybox:9000')
  })

  it('rejects an address it cannot parse and keeps the connection', async () => {
    enableFfmpegd()
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('tab', { name: 'Options' }))

    await user.type(screen.getByLabelText('Daemon address'), 'ftp://mybox')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(screen.getByRole('alert').textContent).toContain('Enter a host and port')
    expect(FakeSocket.instances).toHaveLength(1)
    expect(localStorage.getItem('host')).toBeNull()
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

  it('lets you browse the daemon machine for the input file', async () => {
    const user = userEvent.setup()
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              cwd: '/Users/alf/media',
              folders: ['clips/'],
              files: [{ name: './bbb.mp4' }],
            }),
        }),
      ),
    )
    enableFfmpegd()
    render(<App />)
    await act(async () => socket().open())

    // Nothing until the field is focused.
    expect(screen.queryByText('./bbb.mp4')).toBeNull()
    await user.click(screen.getByLabelText('Input'))

    expect(await screen.findByText('/Users/alf/media')).toBeTruthy()
    await user.click(screen.getByText('./bbb.mp4'))

    expect(screen.getByLabelText<HTMLInputElement>('Input').value).toBe('./bbb.mp4')
    // The browser closes on pick. (The filename itself is still on the page --
    // it is in the generated command now.)
    expect(screen.queryByText('/Users/alf/media')).toBeNull()
    expect(commandText()).toContain('-i ./bbb.mp4')
  })

  it('swaps the protocol picker for the browser only while connected', async () => {
    enableFfmpegd()
    render(<App />)
    // Not connected yet: the protocol select is still the way in.
    expect(screen.getByLabelText('Input protocol')).toBeTruthy()

    await act(async () => socket().open())

    expect(screen.queryByLabelText('Input protocol')).toBeNull()
    // The output field never gets a browser -- it names a file that does not
    // exist yet -- but it does lose its protocol picker once ffmpegd is on.
    expect(screen.queryByLabelText('Output protocol')).toBeNull()
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

describe('ffmpegd setup hint and status', () => {
  const text = () => document.body.textContent ?? ''
  const wait = (ms: number) => act(async () => { vi.advanceTimersByTime(ms) })

  it('links to the install guide from Options, even while ffmpegd is off', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('tab', { name: 'Options' }))

    const link = screen.getByRole('link', { name: 'Install ffmpegd' })
    expect(link.getAttribute('href')).toBe(FFMPEGD_INSTALL_URL)
    expect(text()).not.toContain('Connecting to ffmpegd')
    expect(text()).not.toContain("Can't reach ffmpegd")
  })

  it('says it is connecting, then shows setup steps if nothing answers', async () => {
    vi.useFakeTimers()
    enableFfmpegd()
    render(<App />)
    fireEvent.click(screen.getByRole('tab', { name: 'Options' }))

    // A normal connect takes a moment; don't flash install steps at it.
    await wait(SETUP_DELAY_MS - 100)
    expect(text()).toContain('Connecting to ffmpegd at localhost:3000')
    expect(text()).not.toContain("Can't reach ffmpegd")

    await wait(200)
    const hint = screen.getByRole('status')
    expect(hint.textContent).toContain("Can't reach ffmpegd at localhost:3000")
    expect(hint.textContent).toContain('brew install alfg/tap/ffmpegd')
    expect(hint.textContent).toContain('ffmpegd 0.1.0 and earlier can\'t connect to this site')
    expect(within(hint).getByRole('link', { name: 'the install guide' }).getAttribute('href'))
      .toBe(FFMPEGD_INSTALL_URL)
  })

  it('shows that it connected, in place of the steps', async () => {
    vi.useFakeTimers()
    enableFfmpegd()
    render(<App />)
    fireEvent.click(screen.getByRole('tab', { name: 'Options' }))
    await wait(SETUP_DELAY_MS)
    expect(text()).toContain("Can't reach ffmpegd")

    await act(async () => socket().open())
    expect(screen.getByRole('status').textContent).toContain('Connected to ffmpegd at localhost:3000')
    expect(text()).not.toContain("Can't reach ffmpegd")
    expect(text()).not.toContain('Connecting to ffmpegd')
  })

  it('names a saved daemon address', async () => {
    vi.useFakeTimers()
    enableFfmpegd()
    localStorage.setItem('host', 'http://mybox:9000')
    render(<App />)
    fireEvent.click(screen.getByRole('tab', { name: 'Options' }))
    await wait(SETUP_DELAY_MS)

    expect(screen.getByRole('status').textContent).toContain("Can't reach ffmpegd at mybox:9000")
  })

  it('shows the same steps on the Queue while offline', async () => {
    vi.useFakeTimers()
    enableFfmpegd()
    render(<App />)
    fireEvent.click(screen.getByRole('tab', { name: 'Queue' }))
    await wait(SETUP_DELAY_MS)

    expect(screen.getByText('● ffmpegd offline')).toBeTruthy()
    expect(screen.getByRole('status').textContent).toContain('Run ffmpegd in the folder with your videos')
  })
})
