import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '@/App'

// Every control added to close the gap against the Vue app, checked by the only
// thing that matters: does turning it actually change the generated command.

const command = () =>
  screen.getByTestId('command').textContent?.replace(/\s+/g, ' ').trim() ?? ''

const openTab = (user: ReturnType<typeof userEvent.setup>, name: string) =>
  user.click(screen.getByRole('tab', { name }))

afterEach(cleanup)

describe('the video codec "None"', () => {
  it('emits -vn and hides the controls it would silence', async () => {
    const user = userEvent.setup()
    render(<App />)
    await openTab(user, 'Video')

    await user.selectOptions(screen.getByLabelText('Codec', { selector: '#video-codec' }), 'none')

    expect(command()).toBe('ffmpeg -i input.mp4 -vn -c:a copy output.mp4')
    expect(screen.queryByLabelText('Encoder preset')).toBeNull()
    expect(screen.queryByLabelText('Size')).toBeNull()
  })

  it('drops the video filters along with the stream', async () => {
    const user = userEvent.setup()
    render(<App />)

    await openTab(user, 'Filters')
    await user.selectOptions(screen.getByLabelText('Denoise'), 'light')
    expect(command()).toContain('-vf "removegrain=22"')

    await openTab(user, 'Video')
    await user.selectOptions(screen.getByLabelText('Codec', { selector: '#video-codec' }), 'none')
    expect(command()).not.toContain('-vf')
  })
})

describe('video controls reach the command', () => {
  it.each([
    ['Pixel format', 'yuv420p', '-pix_fmt yuv420p'],
    ['Tune', 'film', '-tune film'],
    ['Profile', 'high', '-profile:v high'],
    ['Level', '4.2', '-level 4.2'],
    ['Aspect', '16:9', '-aspect 16:9'],
    ['Speed', '2*PTS', 'setpts=2*PTS'],
    ['Faststart', 'true', '-movflags faststart'],
  ])('%s', async (label, value, expected) => {
    const user = userEvent.setup()
    render(<App />)
    await openTab(user, 'Video')

    await user.selectOptions(screen.getByLabelText(label), value)

    expect(command()).toContain(expected)
  })

  it.each([
    ['Min rate', '1000k', '-minrate 1000k'],
    ['Max rate', '5000k', '-maxrate 5000k'],
    ['Buffer size', '6000k', '-bufsize 6000k'],
    ['GOP size', '72', '-g 72'],
  ])('%s', async (label, value, expected) => {
    const user = userEvent.setup()
    render(<App />)
    await openTab(user, 'Video')

    await user.type(screen.getByLabelText(label), value)

    expect(command()).toContain(expected)
  })

  it('CRF is a slider, and only applies under CRF rate control', async () => {
    const user = userEvent.setup()
    render(<App />)
    await openTab(user, 'Video')

    expect(screen.queryByLabelText(/CRF/)).toBeNull()
    await user.selectOptions(screen.getByLabelText('Rate control'), 'crf')

    const crf = screen.getByLabelText(/CRF/)
    expect(crf.getAttribute('type')).toBe('range')
    expect(crf.getAttribute('max')).toBe('51')
    expect(command()).toContain('-crf')
  })

  it('scaling only applies once there is something to scale', async () => {
    const user = userEvent.setup()
    render(<App />)
    await openTab(user, 'Video')

    await user.selectOptions(screen.getByLabelText('Scaling'), 'lanczos')
    expect(command()).not.toContain('flags=lanczos')

    await user.selectOptions(screen.getByLabelText('Size'), '1280')
    expect(command()).toContain('scale=1280:-1:flags=lanczos')
  })

  it('codec options become the encoder params flag', async () => {
    const user = userEvent.setup()
    render(<App />)
    await openTab(user, 'Video')

    await user.type(screen.getByLabelText('Codec options'), 'keyint=72')

    expect(command()).toContain('-x264-params keyint=72')
  })

  it('GOP size is hidden for codecs that do not take -g', async () => {
    const user = userEvent.setup()
    render(<App />)
    await openTab(user, 'Video')
    expect(screen.getByLabelText('GOP size')).toBeTruthy()

    await user.selectOptions(screen.getByLabelText('Codec'), 'x265')

    expect(screen.queryByLabelText('GOP size')).toBeNull()
  })
})

describe('audio controls reach the command', () => {
  it('volume becomes an audio filter', async () => {
    const user = userEvent.setup()
    render(<App />)
    await openTab(user, 'Audio')

    const volume = screen.getByLabelText('Volume')
    await user.clear(volume)
    await user.type(volume, '50')

    expect(command()).toContain('-af "volume=0.5"')
  })
})
