import form from '@/lib/form'
import { retargetExtension } from '@/lib/filename'
import type { IFFMpegOptionsForm } from '@/lib/types'

interface Supported {
  value: string
  supported?: string[] | null
}

const isSupported = (options: Supported[], value: string, against: string) => {
  const option = options.find((o) => o.value === value)
  return !option || !option.supported || option.supported.includes(against)
}

const firstSupported = (options: Supported[], against: string, fallback: string) =>
  options.find((o) => !o.supported || o.supported.includes(against))?.value ?? fallback

const nvencCodecs = ['h264_nvenc', 'hevc_nvenc']

// NVENC presets ffmpeg has retired or only keeps as aliases, and the P preset
// each one ran as. slow, medium and fast also forced the pass count, so slow
// carries its two passes over as Multipass. The old lossless presets are now
// a tune.
const nvencPresetMoves: Record<string, { preset: string; multipass?: string; tune?: string }> = {
  slow: { preset: 'p7', multipass: 'fullres' },
  medium: { preset: 'p4' },
  fast: { preset: 'p1' },
  hp: { preset: 'p1' },
  hq: { preset: 'p7' },
  bd: { preset: 'p5' },
  lossless: { preset: 'p4', tune: 'lossless' },
  losslesshp: { preset: 'p1', tune: 'lossless' },
}

/**
 * Brings a form back into a consistent state after something upstream changed.
 *
 * Two things can go stale. The output filename carries the previous container's
 * extension, and a codec or encoder preset can be one the new container or codec
 * does not support -- the select then drops the option entirely and displays
 * whatever sits at index 0, while the form still holds the old value and the
 * command still emits it.
 *
 * Applied wherever the container or codec can change: the selects, a preset, and
 * a form restored from the URL.
 */
export function reconcile(next: IFFMpegOptionsForm): IFFMpegOptionsForm {
  const container = next.format.container ?? 'mp4'
  const video = { ...next.video }
  const audio = { ...next.audio }

  if (!isSupported(form.codecs.video as Supported[], video.codec, container)) {
    video.codec = firstSupported(form.codecs.video as Supported[], container, 'copy')
  }
  if (!isSupported(form.codecs.audio as Supported[], audio.codec, container)) {
    audio.codec = firstSupported(form.codecs.audio as Supported[], container, 'copy')
  }
  const nvenc = nvencCodecs.includes(video.codec)
  const move = nvenc ? nvencPresetMoves[video.preset] : undefined
  if (move) {
    video.preset = move.preset
    if (move.multipass && video.nvenc_multipass === 'disabled') video.nvenc_multipass = move.multipass
    if (move.tune) video.tune = move.tune
  }

  // Rate control. NVENC's two passes run inside one encode, as Multipass, and
  // CBR and constant QP are NVENC modes here.
  if (nvenc && video.pass === '2') {
    video.pass = '1'
    if (video.nvenc_multipass === 'disabled') video.nvenc_multipass = 'fullres'
  } else if (!nvenc && !form.passOptions.some((o) => o.value === video.pass)) {
    video.pass = '1'
  }

  // Encoder presets, profiles, tunes and levels are gated by the codec, not the
  // container.
  if (!isSupported(form.presets as Supported[], video.preset, video.codec)) {
    video.preset = 'none'
  }
  if (!isSupported(form.profiles as Supported[], String(video.profile), video.codec)) {
    video.profile = 'none'
  }
  if (!isSupported(form.tunes as Supported[], video.tune, video.codec)) {
    video.tune = 'none'
  }
  if (!isSupported(form.levels as Supported[], video.level, video.codec)) {
    video.level = 'none'
  }

  return {
    ...next,
    video,
    audio,
    io: { ...next.io, output: retargetExtension(next.io.output, container) },
  }
}
