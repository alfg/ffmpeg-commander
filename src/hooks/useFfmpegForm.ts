import { useCallback, useEffect, useMemo, useState } from 'react'
import createDefaultForm from '@/lib/defaults'
import ffmpeg from '@/lib/ffmpeg'
import { reconcile } from '@/lib/reconcile'
import storage from '@/lib/storage'
import util from '@/lib/util'
import type { IFFMpegOptionsForm } from '@/lib/types'

// The defaults are shaped a little loosely against IFFMpegOptionsForm (numbers
// and nulls where the interface says string) -- see the note in src/lib/defaults.
// Casting in one place keeps that wart from spreading through the components.
const freshForm = () => createDefaultForm() as unknown as IFFMpegOptionsForm

const OPTIONS_KEY = 'options'
const LOGLEVEL_KEY = 'loglevel'

/** Extra flags and log level persist, as they did in the Vue app, under the
 *  same keys so an existing visitor keeps their settings. */
function restoreOptions(form: IFFMpegOptionsForm): IFFMpegOptionsForm {
  const extra = storage.getItem<string[]>(OPTIONS_KEY)
  const loglevel = storage.getItem<string>(LOGLEVEL_KEY)
  return {
    ...form,
    options: {
      ...form.options,
      ...(Array.isArray(extra) ? { extra: extra as unknown as string } : {}),
      ...(typeof loglevel === 'string' ? { loglevel } : {}),
    },
  }
}

function formFromUrl(): IFFMpegOptionsForm {
  const form = freshForm()
  const query = Object.fromEntries(new URLSearchParams(window.location.search))
  util.transformFromQueryParams(form, query)
  // A shared link can set a container, which the output name has to follow.
  return reconcile(restoreOptions(form))
}

/**
 * Owns the editor form, the generated command, and the URL round trip.
 *
 * The Vue app did this with a deep watcher on `form`; here it is derived state
 * plus one effect. The query-param names are a public contract -- recipe pages
 * deep link into them -- so both directions go through util, never ad hoc.
 */
export function useFfmpegForm() {
  const [form, setForm] = useState<IFFMpegOptionsForm>(formFromUrl)

  const cmd = useMemo(() => ffmpeg.build(util.transform(form) as never), [form])

  useEffect(() => {
    const params = util.transformToQueryParams(form) as Record<string, string>
    const qs = new URLSearchParams(params).toString()
    window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname)
  }, [form])

  const update = useCallback(
    <S extends keyof IFFMpegOptionsForm>(section: S, patch: Partial<IFFMpegOptionsForm[S]>) => {
      setForm((prev) => ({ ...prev, [section]: { ...prev[section], ...patch } }))
    },
    [],
  )

  /**
   * Format changes go through here rather than `update` because choosing a
   * container also renames the output file. The Vue app did this from a deep
   * watcher that fired on every form change; keying it to the container edit
   * keeps it from rewriting the field while someone is typing in it.
   */
  const updateFormat = useCallback((patch: Partial<IFFMpegOptionsForm['format']>) => {
    setForm((prev) => {
      const next = { ...prev, format: { ...prev.format, ...patch } }
      if (patch.container && patch.container !== prev.format.container) {
        return reconcile(next)
      }
      return next
    })
  }, [])

  /**
   * Video edits go through here because changing the codec can invalidate the
   * encoder preset, which is filtered by codec.
   */
  const updateVideo = useCallback((patch: Partial<IFFMpegOptionsForm['video']>) => {
    setForm((prev) => {
      const next = { ...prev, video: { ...prev.video, ...patch } }
      return patch.codec && patch.codec !== prev.video.codec ? reconcile(next) : next
    })
  }, [])

  const updateOptions = useCallback((patch: Partial<IFFMpegOptionsForm['options']>) => {
    setForm((prev) => {
      const options = { ...prev.options, ...patch }
      try {
        if ('extra' in patch) storage.setItem(OPTIONS_KEY, options.extra)
        if ('loglevel' in patch) storage.setItem(LOGLEVEL_KEY, options.loglevel)
      } catch {
        // Storage blocked; the setting holds for this page only.
      }
      return { ...prev, options }
    })
  }, [])

  const reset = useCallback(() => setForm(freshForm()), [])

  return { form, cmd, update, updateFormat, updateVideo, updateOptions, reset, setForm }
}
