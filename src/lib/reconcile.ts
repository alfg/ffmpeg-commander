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
  // Encoder presets are gated by the codec, not the container.
  if (!isSupported(form.presets as Supported[], video.preset, video.codec)) {
    video.preset = 'none'
  }

  return {
    ...next,
    video,
    audio,
    io: { ...next.io, output: retargetExtension(next.io.output, container) },
  }
}
