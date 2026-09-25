import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '@/App'
import ffmpeg from '@/lib/ffmpeg'
import util from '@/lib/util'
import createDefaultForm from '@/lib/defaults'
import { reconcile } from '@/lib/reconcile'
import type { IFFMpegOptionsForm } from '@/lib/types'
import { makeForm } from './fixtures/form'

afterEach(() => {
  cleanup()
  window.history.replaceState(null, '', '/')
})

const build = (overrides = {}) => ffmpeg.build(util.transform(makeForm(overrides)) as never)
const nvenc = (video = {}) => build({ video: { codec: 'hevc_nvenc', ...video } })
const form = () => createDefaultForm() as unknown as IFFMpegOptionsForm
const reconciled = (video: Partial<IFFMpegOptionsForm['video']>) =>
  reconcile({ ...form(), video: { ...form().video, ...video } }).video

const command = () =>
  screen.getByTestId('command').textContent?.replace(/\s+/g, ' ').trim() ?? ''
const openTab = (u: ReturnType<typeof userEvent.setup>, name: string) =>
  u.click(screen.getByRole('tab', { name }))
const options = (label: string) =>
  Array.from(screen.getByLabelText<HTMLSelectElement>(label).options).map((o) => o.value)

describe('NVENC rate control', () => {
  it('uses -rc vbr -cq for constant quality, not -crf', () => {
    expect(nvenc({ pass: 'crf', crf: 24 }))
      .toBe('ffmpeg -i input.mp4 -c:v hevc_nvenc -rc vbr -cq 24 -c:a copy output.mp4')
  })

  it('uses -rc cbr with the bit rate', () => {
    expect(nvenc({ pass: 'cbr', bitrate: '6000k' }))
      .toBe('ffmpeg -i input.mp4 -c:v hevc_nvenc -b:v 6000k -rc cbr -c:a copy output.mp4')
  })

  it('uses -rc constqp with the slider as -qp', () => {
    expect(nvenc({ pass: 'constqp', crf: 20 }))
      .toBe('ffmpeg -i input.mp4 -c:v hevc_nvenc -rc constqp -qp 20 -c:a copy output.mp4')
  })

  it('leaves VBR to the encoder default', () => {
    expect(nvenc({ pass: '1', bitrate: '5M' }))
      .toBe('ffmpeg -i input.mp4 -c:v hevc_nvenc -b:v 5M -c:a copy output.mp4')
  })

  it('never writes a two-command encode', () => {
    expect(build({ video: { codec: 'h264_nvenc', pass: '2', bitrate: '5M' } }))
      .toBe('ffmpeg -i input.mp4 -c:v h264_nvenc -b:v 5M -c:a copy output.mp4')
  })

  it('emits multipass, AQ and lookahead', () => {
    expect(nvenc({ preset: 'p6', nvenc_multipass: 'qres', nvenc_aq: 'both', nvenc_lookahead: '32' }))
      .toBe('ffmpeg -i input.mp4 -c:v hevc_nvenc -preset p6 -multipass qres -spatial-aq 1 -temporal-aq 1 -rc-lookahead 32 -c:a copy output.mp4')
  })

  it.each([['spatial', '-spatial-aq 1'], ['temporal', '-temporal-aq 1']])('emits %s AQ alone', (aq, flag) => {
    expect(nvenc({ nvenc_aq: aq })).toContain(flag)
    expect(nvenc({ nvenc_aq: aq }).match(/-(spatial|temporal)-aq/g)).toHaveLength(1)
  })

  it.each(['', '0', 'abc'])('drops a lookahead of %j', (nvenc_lookahead) => {
    expect(nvenc({ nvenc_lookahead })).not.toContain('-rc-lookahead')
  })

  it('ignores the NVENC settings for other encoders', () => {
    expect(build({ video: { nvenc_multipass: 'fullres', nvenc_aq: 'both', nvenc_lookahead: '20' } }))
      .toBe('ffmpeg -i input.mp4 -c:v libx264 -c:a copy output.mp4')
  })
})

describe('NVENC reconcile', () => {
  it.each([
    ['medium', { preset: 'p4', nvenc_multipass: 'disabled', tune: 'none' }],
    ['fast', { preset: 'p1', nvenc_multipass: 'disabled', tune: 'none' }],
    ['slow', { preset: 'p7', nvenc_multipass: 'fullres', tune: 'none' }],
    ['hp', { preset: 'p1', nvenc_multipass: 'disabled', tune: 'none' }],
    ['hq', { preset: 'p7', nvenc_multipass: 'disabled', tune: 'none' }],
    ['bd', { preset: 'p5', nvenc_multipass: 'disabled', tune: 'none' }],
    ['lossless', { preset: 'p4', nvenc_multipass: 'disabled', tune: 'lossless' }],
    ['losslesshp', { preset: 'p1', nvenc_multipass: 'disabled', tune: 'lossless' }],
  ])('moves preset %s to what ffmpeg ran it as', (preset, expected) => {
    expect(reconciled({ codec: 'h264_nvenc', preset })).toMatchObject(expected)
  })

  it('keeps a Multipass already chosen over the one slow implies', () => {
    expect(reconciled({ codec: 'hevc_nvenc', preset: 'slow', nvenc_multipass: 'qres' }).nvenc_multipass).toBe('qres')
  })

  it('drops a P preset for other encoders', () => {
    expect(reconciled({ codec: 'x264', preset: 'p5' }).preset).toBe('none')
  })

  it('turns 2 Pass into single-command Multipass', () => {
    expect(reconciled({ codec: 'hevc_nvenc', pass: '2' })).toMatchObject({ pass: '1', nvenc_multipass: 'fullres' })
  })

  it.each(['cbr', 'constqp'])('drops NVENC-only rate control %s for other encoders', (pass) => {
    expect(reconciled({ codec: 'x265', pass }).pass).toBe('1')
  })

  it('drops a level HEVC does not define', () => {
    expect(reconciled({ codec: 'hevc_nvenc', level: '4.2' }).level).toBe('none')
    expect(reconciled({ codec: 'hevc_nvenc', level: '5.1' }).level).toBe('5.1')
    expect(reconciled({ codec: 'x264', level: '4.2' }).level).toBe('4.2')
  })
})

describe('NVENC settings travel', () => {
  const settings = {
    codec: 'hevc_nvenc', pass: 'constqp', crf: '19', nvenc_multipass: 'fullres', nvenc_aq: 'spatial', nvenc_lookahead: '24',
  }

  it('round-trip through the URL, QP included', () => {
    const params = util.transformToQueryParams(makeForm({ video: settings }) as never) as Record<string, string>
    const restored = form()
    util.transformFromQueryParams(restored, params)
    expect(restored.video).toMatchObject(settings)
  })

  it('leave the URL alone at their defaults', () => {
    const params = util.transformToQueryParams(makeForm({ video: { codec: 'hevc_nvenc' } }) as never)
    expect(Object.keys(params).filter((k) => k.startsWith('video.nvenc'))).toEqual([])
  })

  it('reach the ffmpegd payload', () => {
    expect(util.transformToJSON(makeForm({ video: settings })).video).toMatchObject({
      codec: 'hevc_nvenc', pass: 'constqp', crf: '19', nvenc_multipass: 'fullres', nvenc_aq: 'spatial', nvenc_lookahead: '24',
    })
  })
})

describe('NVENC controls', () => {
  const pickCodec = (user: ReturnType<typeof userEvent.setup>, codec: string) =>
    user.selectOptions(screen.getByLabelText('Codec', { selector: '#video-codec' }), codec)

  it('swaps in NVENC rate control and the NVENC group', async () => {
    const user = userEvent.setup()
    render(<App />)
    await openTab(user, 'Video')
    expect(screen.queryByLabelText('Multipass')).toBeNull()

    await pickCodec(user, 'h264_nvenc')
    expect(options('Rate control')).toEqual(['crf', '1', 'cbr', 'constqp'])
    expect(options('Encoder preset')).toEqual(['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'none'])

    await user.selectOptions(screen.getByLabelText('Multipass'), 'qres')
    await user.selectOptions(screen.getByLabelText('Adaptive quantization'), 'spatial')
    expect(command()).toContain('-multipass qres -spatial-aq 1')
  })

  it('carries the CRF slider over as CQ, and relabels it QP', async () => {
    const user = userEvent.setup()
    render(<App />)
    await openTab(user, 'Video')
    await user.selectOptions(screen.getByLabelText('Rate control'), 'crf')

    await pickCodec(user, 'hevc_nvenc')
    expect(screen.getByLabelText('CQ')).toBeTruthy()
    expect(command()).toContain('-rc vbr -cq 23')
    expect(command()).not.toContain('-crf')

    await user.selectOptions(screen.getByLabelText('Rate control'), 'constqp')
    expect(screen.getByLabelText('QP')).toBeTruthy()
    expect(command()).toContain('-rc constqp -qp 23')
  })

  it('asks for a bit rate in CBR', async () => {
    const user = userEvent.setup()
    render(<App />)
    await openTab(user, 'Video')
    await pickCodec(user, 'hevc_nvenc')

    await user.selectOptions(screen.getByLabelText('Rate control'), 'cbr')
    expect(screen.getByText('CBR needs a target bit rate.')).toBeTruthy()
  })

  it('replaces a hidden 2 Pass with Multipass on switching to NVENC', async () => {
    const user = userEvent.setup()
    render(<App />)
    await openTab(user, 'Video')
    await user.selectOptions(screen.getByLabelText('Rate control'), '2')
    await user.type(screen.getByLabelText('Bit rate'), '4M')
    expect(command()).toContain('-pass 2')

    await pickCodec(user, 'hevc_nvenc')
    expect(command()).not.toContain('-pass')
    expect(command()).toContain('-multipass fullres')
    expect(screen.getByLabelText<HTMLSelectElement>('Rate control').value).toBe('1')
  })

  it('resets a level the select no longer offers', async () => {
    const user = userEvent.setup()
    render(<App />)
    await openTab(user, 'Video')
    await user.selectOptions(screen.getByLabelText('Level'), '4.2')

    await pickCodec(user, 'hevc_nvenc')
    expect(options('Level')).not.toContain('4.2')
    expect(screen.getByLabelText<HTMLSelectElement>('Level').value).toBe('none')
    expect(command()).not.toContain('-level')
  })

  it('offers NVENC in MKV', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.selectOptions(screen.getByLabelText('Container'), 'mkv')
    await openTab(user, 'Video')
    expect(options('Codec')).toEqual(expect.arrayContaining(['h264_nvenc', 'hevc_nvenc']))
  })
})
