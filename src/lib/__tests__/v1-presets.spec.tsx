import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '@/App'

const command = () =>
  screen.getByTestId('command').textContent?.replace(/\s+/g, ' ').trim() ?? ''

// A preset exactly as the Vue app wrote it: a full form snapshot, with the
// numeric/null types Editor.vue's data() used.
const v1Preset = {
  name: 'preset-2024-01-01T00:00:00.000Z',
  value: 'preset-2024-01-01T00:00:00.000Z',
  data: {
    io: { input: 'input.mp4', output: 'output.mp4' },
    format: { container: 'mkv', clip: false, startTime: null, stopTime: null },
    video: {
      codec: 'x265', preset: 'slow', pass: 'crf', crf: 20, bitrate: null,
      minrate: null, maxrate: null, bufsize: null, gopsize: null,
      pixel_format: 'auto', frame_rate: 'auto', speed: 'auto', tune: 'none',
      profile: 'none', level: 'none', faststart: false, size: 'source',
      width: '1080', height: '1920', format: 'widescreen', aspect: 'auto',
      scaling: 'auto', codec_options: '',
    },
    audio: { codec: 'aac', channel: 'source', quality: 'auto', sampleRate: 'auto', volume: 100 },
    filters: {
      deband: false, deshake: false, deflicker: false, dejudder: false,
      denoise: 'none', deinterlace: 'none', brightness: 0, contrast: 0,
      saturation: 0, gamma: 0, acontrast: 33,
    },
    options: { extra: [], loglevel: 'none' },
  },
}

afterEach(cleanup)

describe('presets saved by the Vue app', () => {
  it('appear in the picker and load correctly', async () => {
    localStorage.setItem('presets', JSON.stringify([v1Preset]))
    const user = userEvent.setup()
    render(<App />)

    await user.selectOptions(screen.getByLabelText('Preset'), v1Preset.value)

    expect(command()).toContain('-c:v libx265')
    expect(command()).toContain('-crf 20')
    expect(command()).toContain('-preset slow')
    expect(command()).toContain('-c:a aac')
    expect(command()).toContain('output.mkv')
    expect(command()).not.toContain('NaN')
    expect(command()).not.toContain('undefined')
  })
})
