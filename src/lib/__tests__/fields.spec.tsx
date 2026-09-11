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

describe('profiles follow the codec (#35)', () => {
  const profileOptions = () =>
    Array.from((screen.getByLabelText('Profile') as HTMLSelectElement).options).map((o) => o.value)

  it('offers only HEVC profiles for hevc_nvenc', async () => {
    const user = userEvent.setup()
    render(<App />)
    await openTab(user, 'Video')

    await user.selectOptions(screen.getByLabelText('Codec', { selector: '#video-codec' }), 'hevc_nvenc')

    expect(profileOptions()).toEqual(['none', 'main', 'main10', 'rext'])
  })

  it('drops a profile the new codec does not accept', async () => {
    const user = userEvent.setup()
    render(<App />)
    await openTab(user, 'Video')

    await user.selectOptions(screen.getByLabelText('Profile'), 'high')
    expect(command()).toContain('-profile:v high')

    await user.selectOptions(screen.getByLabelText('Codec', { selector: '#video-codec' }), 'hevc_nvenc')
    expect(command()).not.toContain('-profile:v')
    expect((screen.getByLabelText('Profile') as HTMLSelectElement).value).toBe('none')
  })

  it('keeps a profile both codecs accept', async () => {
    const user = userEvent.setup()
    render(<App />)
    await openTab(user, 'Video')

    await user.selectOptions(screen.getByLabelText('Profile'), 'main')
    await user.selectOptions(screen.getByLabelText('Codec', { selector: '#video-codec' }), 'x265')
    expect(command()).toContain('-profile:v main')
  })
})

describe('new controls reach the command', () => {
  it('Fit keeps the aspect ratio of a custom size (#46)', async () => {
    const user = userEvent.setup()
    render(<App />)
    await openTab(user, 'Video')

    expect(screen.queryByLabelText('Fit')).toBeNull()
    await user.selectOptions(screen.getByLabelText('Size'), 'custom')
    await user.selectOptions(screen.getByLabelText('Fit'), 'true')

    expect(command()).toContain('force_original_aspect_ratio=decrease')
  })

  it('Delay adds adelay to the audio filters (#38)', async () => {
    const user = userEvent.setup()
    render(<App />)
    await openTab(user, 'Filters')

    const delay = screen.getByLabelText('Delay (ms)')
    await user.clear(delay)
    await user.type(delay, '150')

    expect(command()).toContain('-af "adelay=delays=150:all=1"')
  })
})

describe('two-pass without a bit rate', () => {
  it('flags the missing bit rate until one is entered', async () => {
    const user = userEvent.setup()
    render(<App />)
    await openTab(user, 'Video')

    expect(screen.queryByRole('alert')).toBeNull()
    await user.selectOptions(screen.getByLabelText('Rate control'), '2')
    expect(screen.getByRole('alert').textContent).toContain('Two-pass needs a target bit rate')

    await user.type(screen.getByLabelText('Bit rate'), '3000k')
    expect(screen.queryByRole('alert')).toBeNull()
    expect(command()).toContain('-b:v 3000k')
  })

  it('does not flag VP9, which has its own default bit rate', async () => {
    const user = userEvent.setup()
    render(<App />)
    await openTab(user, 'Format')
    await user.selectOptions(screen.getByLabelText('Container'), 'webm')
    await openTab(user, 'Video')
    await user.selectOptions(screen.getByLabelText('Codec', { selector: '#video-codec' }), 'vp9')
    await user.selectOptions(screen.getByLabelText('Rate control'), '2')

    expect(screen.queryByRole('alert')).toBeNull()
  })
})

describe('filters on a copied stream', () => {
  it('warns on the Filters and Audio tabs until the audio is re-encoded', async () => {
    const user = userEvent.setup()
    render(<App />)
    await openTab(user, 'Filters')

    expect(screen.queryByRole('alert')).toBeNull()
    await user.type(screen.getByLabelText('Delay (ms)'), '5')
    expect(screen.getByRole('alert').textContent).toContain('audio codec is set to copy')

    await openTab(user, 'Audio')
    expect(screen.getByRole('alert').textContent).toContain('Copy cannot be filtered')

    await user.selectOptions(screen.getByLabelText('Codec', { selector: '#audio-codec' }), 'aac')
    expect(screen.queryByRole('alert')).toBeNull()
    expect(command()).toContain('-c:a aac -af "adelay=delays=5:all=1"')
  })

  it('warns on the Video tab when a copied video stream is resized', async () => {
    const user = userEvent.setup()
    render(<App />)
    await openTab(user, 'Video')

    await user.selectOptions(screen.getByLabelText('Codec', { selector: '#video-codec' }), 'copy')
    expect(screen.queryByRole('alert')).toBeNull()
    await user.selectOptions(screen.getByLabelText('Size'), '1280')
    expect(screen.getByRole('alert').textContent).toContain('Copy cannot be filtered, resized')
  })
})
