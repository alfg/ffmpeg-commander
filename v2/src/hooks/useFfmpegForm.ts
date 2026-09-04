import { useCallback, useEffect, useMemo, useState } from 'react'
import createDefaultForm from '@/lib/defaults'
import ffmpeg from '@/lib/ffmpeg'
import util from '@/lib/util'
import type { IFFMpegOptionsForm } from '@/lib/types'

// The defaults are shaped a little loosely against IFFMpegOptionsForm (numbers
// and nulls where the interface says string) -- see the note in src/lib/defaults.
// Casting in one place keeps that wart from spreading through the components.
const freshForm = () => createDefaultForm() as unknown as IFFMpegOptionsForm

function formFromUrl(): IFFMpegOptionsForm {
  const form = freshForm()
  const query = Object.fromEntries(new URLSearchParams(window.location.search))
  util.transformFromQueryParams(form, query)
  return form
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

  const reset = useCallback(() => setForm(freshForm()), [])

  return { form, cmd, update, reset, setForm }
}
