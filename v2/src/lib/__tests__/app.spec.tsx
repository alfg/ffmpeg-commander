import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '@/App'

// End-to-end proof that the ported modules are wired correctly: a real user
// interaction has to flow through form state -> util.transform -> ffmpeg.build
// and land in both the rendered command and the URL.

// The command renders as one span per fragment so each can be hovered, so read
// the block as a whole and normalise the whitespace those spans introduce.
const commandText = () =>
  screen.getByTestId('command').textContent?.replace(/\s+/g, ' ').trim()

// The editor sections live behind tabs, so a control has to be revealed before
// it can be driven.
const openTab = (user: ReturnType<typeof userEvent.setup>, name: string) =>
  user.click(screen.getByRole('tab', { name }))

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

    await openTab(user, 'Video')
    await user.selectOptions(screen.getByLabelText('Codec', { selector: '#video-codec' }), 'x265')

    expect(commandText()).toBe('ffmpeg -i input.mp4 -c:v libx265 -c:a copy output.mp4')
  })

  it('writes non-default state to the URL using the contract param names', async () => {
    const user = userEvent.setup()
    render(<App />)

    await openTab(user, 'Video')
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

  it('shows one tab panel at a time and switches on click', async () => {
    const user = userEvent.setup()
    render(<App />)

    // Format is selected on load.
    expect(screen.getByRole('tab', { name: 'Format' })).toHaveProperty('ariaSelected', 'true')
    expect(screen.queryByLabelText('Encoder preset')).toBeNull()

    await openTab(user, 'Video')

    expect(screen.getByRole('tab', { name: 'Video' })).toHaveProperty('ariaSelected', 'true')
    expect(screen.getByLabelText('Encoder preset')).toBeTruthy()
    expect(screen.queryByLabelText('Container')).toBeNull()
  })

  it('moves between tabs with the arrow keys', async () => {
    const user = userEvent.setup()
    render(<App />)

    const format = screen.getByRole('tab', { name: 'Format' })
    format.focus()
    await user.keyboard('{ArrowRight}')

    expect(screen.getByRole('tab', { name: 'Video' })).toHaveProperty('ariaSelected', 'true')
    expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Video' }))

    // Wraps backwards from the first tab to the last.
    await user.keyboard('{ArrowLeft}{ArrowLeft}')
    expect(screen.getByRole('tab', { name: 'Options' })).toHaveProperty('ariaSelected', 'true')
  })

  it('keeps the command visible from every tab', async () => {
    const user = userEvent.setup()
    render(<App />)

    for (const name of ['Video', 'Audio', 'Filters', 'Options']) {
      await openTab(user, name)
      expect(commandText()).toBe('ffmpeg -i input.mp4 -c:v libx264 -c:a copy output.mp4')
    }
  })

  it('narrows the audio codec list to what the container supports', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.selectOptions(screen.getByLabelText('Container'), 'webm')
    await openTab(user, 'Audio')

    const audioCodecs = Array.from(
      screen.getByLabelText<HTMLSelectElement>('Codec', { selector: '#audio-codec' }).options,
    ).map((o) => o.value)
    expect(audioCodecs).toContain('opus')
    expect(audioCodecs).not.toContain('ac3')
  })
})
