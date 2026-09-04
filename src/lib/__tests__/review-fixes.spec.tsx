import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, cleanup, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '@/App'
import ffmpeg from '@/lib/ffmpeg'
import storage from '@/lib/storage'
import util from '@/lib/util'
import { deepMerge } from '@/lib/merge'
import { reconcile } from '@/lib/reconcile'
import createDefaultForm from '@/lib/defaults'
import { FFMPEGD_KEY } from '@/lib/ffmpegd'
import type { IFFMpegOptionsForm } from '@/lib/types'

const command = () =>
  screen.getByTestId('command').textContent?.replace(/\s+/g, ' ').trim() ?? ''
const openTab = (u: ReturnType<typeof userEvent.setup>, name: string) =>
  u.click(screen.getByRole('tab', { name }))
const form = () => createDefaultForm() as unknown as IFFMpegOptionsForm

/** Enforces the real contract: send() before OPEN throws. */
class FakeSocket {
  static instances: FakeSocket[] = []
  static CONNECTING = 0
  static OPEN = 1
  readyState = 0
  sent: string[] = []
  onopen: (() => void) | null = null
  onclose: (() => void) | null = null
  onerror: (() => void) | null = null
  onmessage: ((e: { data: string }) => void) | null = null
  url: string
  constructor(url: string) {
    this.url = url
    FakeSocket.instances.push(this)
  }
  send(d: string) {
    if (this.readyState !== 1) throw new Error('InvalidStateError: Still in CONNECTING state')
    this.sent.push(d)
  }
  close() {
    this.readyState = 3
    this.onclose?.()
  }
  open() {
    this.readyState = 1
    this.onopen?.()
  }
}

beforeEach(() => {
  FakeSocket.instances = []
  vi.stubGlobal('WebSocket', FakeSocket as never)
})
afterEach(cleanup)

describe('ffmpegd reconnect', () => {
  it('does not report connected while the new socket is still connecting', async () => {
    const user = userEvent.setup()
    localStorage.setItem(FFMPEGD_KEY, 'true')
    render(<App />)
    await act(async () => FakeSocket.instances[0].open())
    expect(screen.getByRole('button', { name: 'Encode' })).toBeTruthy()

    await openTab(user, 'Options')
    await user.click(screen.getByLabelText(/ffmpegd daemon/)) // off
    await user.click(screen.getByLabelText(/ffmpegd daemon/)) // on

    expect(FakeSocket.instances.at(-1)!.readyState).toBe(FakeSocket.CONNECTING)
    expect(screen.queryByRole('button', { name: 'Encode' })).toBeNull()
  })

  it('keeps you on the tab you were using when ffmpegd is toggled', async () => {
    const user = userEvent.setup()
    render(<App />)
    await openTab(user, 'Options')

    await user.click(screen.getByLabelText(/ffmpegd daemon/))

    // The switch just flipped must still be on screen.
    expect(screen.getByLabelText(/ffmpegd daemon/)).toBeTruthy()
    expect(screen.getByRole('tab', { name: 'Options' })).toHaveProperty('ariaSelected', 'true')
  })
})

describe('container changes reconcile the whole form', () => {
  it('renames the output when a preset sets the container', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.selectOptions(screen.getByLabelText('Preset'), 'vp9-3000-1080p')

    // VP9/Opus into an mp4 muxer was the bug.
    expect(command()).toContain('output.webm')
    expect(command()).not.toContain('output.mp4')
  })

  it('drops a codec the new container cannot carry', async () => {
    const user = userEvent.setup()
    render(<App />)
    expect(command()).toContain('-c:v libx264')

    await user.selectOptions(screen.getByLabelText('Container'), 'webm')
    await openTab(user, 'Video')

    // The select must agree with the form and with the command.
    const codec = screen.getByLabelText<HTMLSelectElement>('Codec', { selector: '#video-codec' })
    expect(command()).toContain(`-c:v ${codec.value === 'vp8' ? 'libvpx' : 'libvpx-vp9'}`)
    expect(command()).not.toContain('libx264')
  })

  it('drops an encoder preset the new codec does not support', () => {
    const next = reconcile({
      ...form(),
      video: { ...form().video, codec: 'vp9', preset: 'veryslow' },
    })
    expect(next.video.preset).toBe('none')
  })
})

describe('options persistence', () => {
  it('remembers extra flags and log level across a reload', async () => {
    const user = userEvent.setup()
    const first = render(<App />)
    await openTab(user, 'Options')
    await user.click(screen.getByLabelText('Overwrite output files without asking.'))
    await user.selectOptions(screen.getByLabelText('Log level'), 'debug')
    expect(command()).toContain('-y')
    first.unmount()

    render(<App />)
    expect(command()).toContain('-y')
    expect(command()).toContain('-loglevel debug')
    expect(storage.getItem('options')).toEqual(['y'])
    expect(storage.getItem('loglevel')).toBe('debug')
  })
})

describe('saved presets survive a form that gains fields', () => {
  it('deep merges a partial snapshot rather than replacing sections', () => {
    // A snapshot saved before a field existed is missing it.
    const partial = { filters: { deband: true } }
    const merged = deepMerge(form() as unknown as Record<string, unknown>, partial)
    const cmd = ffmpeg.build(util.transform(merged as unknown as IFFMpegOptionsForm) as never)

    expect(cmd).toContain('deband')
    expect(cmd).not.toContain('NaN')
  })
})

describe('audio bitrate guard', () => {
  it('omits -b:a when custom quality has no bitrate', () => {
    const cmd = ffmpeg.build(
      util.transform({
        ...form(),
        audio: { ...form().audio, codec: 'aac', quality: 'custom' },
      }) as never,
    )
    // A bare -b:a made ffmpeg read the output path as the bitrate.
    expect(cmd).not.toContain('-b:a')
    expect(cmd).toContain('output.mp4')
  })
})
