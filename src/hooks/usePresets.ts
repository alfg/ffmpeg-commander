import { useCallback, useState } from 'react'
import createDefaultForm from '@/lib/defaults'
import presets, { type IPresetOption } from '@/lib/presets'
import { deepMerge } from '@/lib/merge'
import { reconcile } from '@/lib/reconcile'
import type { IFFMpegOptionsForm } from '@/lib/types'

const SAVED_PREFIX = 'preset-'

export const isSavedPreset = (id: string) => id.startsWith(SAVED_PREFIX)

// getPresetOptions() mutates and returns the same module-level array, so a bare
// setState with it would be the identical reference and never re-render. Copy it.
const readGroups = () =>
  presets.getPresetOptions().map((g) => ({ ...g, data: [...g.data] }))

interface Options {
  form: IFFMpegOptionsForm
  setForm: (form: IFFMpegOptionsForm) => void
}

/**
 * The preset picker and the save/delete controls.
 *
 * Three kinds of id share one select, as in the Vue app: "custom" means the
 * defaults, a bundled slug loads read-only JSON, and a "preset-" id is one of
 * the user's own from localStorage. Only the last kind can be saved over or
 * deleted, which is what gates the extra buttons.
 */
export function usePresets({ form, setForm }: Options) {
  const [groups, setGroups] = useState(readGroups)
  const [presetId, setPresetId] = useState('custom')
  const [presetName, setPresetName] = useState<string | null>(null)

  const select = useCallback(
    (id: string) => {
      setPresetId(id)

      if (id === 'custom') {
        setForm(createDefaultForm() as unknown as IFFMpegOptionsForm)
        setPresetName(null)
        return
      }

      if (isSavedPreset(id)) {
        const saved = presets.getPresetFromLocalStorage(id)
        if (!saved) return
        // Apply the snapshot onto pristine defaults rather than the current
        // form, so nothing from the previous preset survives underneath.
        const merged = deepMerge(
          createDefaultForm() as unknown as Record<string, unknown>,
          saved.data as Record<string, unknown>,
        )
        setForm(reconcile(merged as unknown as IFFMpegOptionsForm))
        setPresetName(saved.name)
        return
      }

      const preset = presets.getPreset(id) as Partial<IFFMpegOptionsForm> | undefined
      const base = createDefaultForm() as unknown as IFFMpegOptionsForm
      setForm(
        preset
          ? reconcile({
              ...base,
              format: { ...base.format, ...preset.format },
              video: { ...base.video, ...preset.video },
              audio: { ...base.audio, ...preset.audio },
            })
          : base,
      )
      setPresetName(null)
    },
    [setForm],
  )

  // Passing a name updates the preset with that id; passing none creates a new
  // one. That is the contract savePresetToLocalStorage already had.
  const save = useCallback(
    (asNew = false) => {
      const name = asNew ? '' : (presetName ?? '')
      const id = presets.savePresetToLocalStorage(presetId, name, form)
      setGroups(readGroups())
      setPresetId(id)
      setPresetName(name || id)
    },
    [form, presetId, presetName],
  )

  const rename = useCallback((name: string) => setPresetName(name), [])

  const remove = useCallback(() => {
    if (!isSavedPreset(presetId)) return
    presets.deletePreset(presetId)
    setGroups(readGroups())
    select('custom')
  }, [presetId, select])

  const savedOptions: IPresetOption[] = groups.find((g) => g.id === 'saved')?.data ?? []

  return {
    groups,
    presetId,
    presetName,
    isSaved: isSavedPreset(presetId),
    savedCount: savedOptions.length,
    select,
    save,
    rename,
    remove,
  }
}
