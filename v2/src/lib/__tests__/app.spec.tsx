import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '@/App'

// End-to-end proof that the ported modules are wired correctly: a real user
// interaction has to flow through form state -> util.transform -> ffmpeg.build
// and land in both the rendered command and the URL.

const commandText = () => screen.getByText(/^ffmpeg /).textContent

beforeEach(() => window.history.replaceState(null, '', '/'))
afterEach(cleanup)

describe('App', () => {
  it('renders the default command', () => {
    render(<App />)
    expect(commandText()).toBe('ffmpeg -i input.mp4 -c:v libx264 -c:a copy output.mp4')
  })

  it('regenerates the command when a control changes', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.selectOptions(screen.getByLabelText('Codec', { selector: '#video-codec' }), 'x265')

    expect(commandText()).toBe('ffmpeg -i input.mp4 -c:v libx265 -c:a copy output.mp4')
  })

  it('writes non-default state to the URL using the contract param names', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.selectOptions(screen.getByLabelText('Codec', { selector: '#video-codec' }), 'x265')
    await user.selectOptions(screen.getByLabelText('Size'), '1280')

    const params = new URLSearchParams(window.location.search)
    expect(params.get('video.codec')).toBe('x265')
    expect(params.get('video.size')).toBe('1280')
  })

  it('restores state from the URL on load', () => {
    window.history.replaceState(null, '', '/?video.codec=vp9&format.container=webm')
    render(<App />)
    expect(commandText()).toBe('ffmpeg -i input.mp4 -c:v libvpx-vp9 -c:a copy output.mp4')
  })

  it('keeps the URL clean when everything is default', () => {
    render(<App />)
    expect(window.location.search).toBe('')
  })

  it('applies a bundled preset through the picker', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.selectOptions(screen.getByLabelText('Preset'), 'h264-fast-720p30')

    expect(commandText()).toBe(
      'ffmpeg -i input.mp4 -c:v libx264 -preset fast -r 30 -crf 21 -vf "scale=1280:-1" -c:a copy output.mp4',
    )
  })

  it('narrows the audio codec list to what the container supports', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.selectOptions(screen.getByLabelText('Container'), 'webm')

    const audioCodecs = Array.from(
      screen.getByLabelText<HTMLSelectElement>('Codec', { selector: '#audio-codec' }).options,
    ).map((o) => o.value)
    expect(audioCodecs).toContain('opus')
    expect(audioCodecs).not.toContain('ac3')
  })
})
