import Field from '@/components/ui/Field'
import Range from '@/components/ui/Range'
import Select from '@/components/ui/Select'
import form from '@/lib/form'
import type { IFFMpegOptionsForm } from '@/lib/types'

interface Props {
  value: IFFMpegOptionsForm['filters']
  onChange: (patch: Partial<IFFMpegOptionsForm['filters']>) => void
}

type Filters = IFFMpegOptionsForm['filters']

const toggles = [
  { key: 'deband', options: form.deband },
  { key: 'deflicker', options: form.deflicker },
  { key: 'deshake', options: form.deshake },
  { key: 'dejudder', options: form.dejudder },
] as const

const selects = [
  { key: 'denoise', options: form.denoise },
  { key: 'deinterlace', options: form.deinterlace },
] as const

const eq = [
  { key: 'contrast', min: -100, max: 100 },
  { key: 'brightness', min: -100, max: 100 },
  { key: 'saturation', min: 0, max: 300 },
  { key: 'gamma', min: 0, max: 100 },
] as const

const label = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export default function FiltersSection({ value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="mb-3 text-xs font-semibold tracking-wide text-gray-500 uppercase">Video</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {toggles.map(({ key, options }) => (
            <Field key={key} label={label(key)} htmlFor={`filters-${key}`}>
              <Select
                id={`filters-${key}`}
                value={String(value[key])}
                options={options}
                onChange={(v) => onChange({ [key]: v === 'true' } as Partial<Filters>)}
              />
            </Field>
          ))}
          {selects.map(({ key, options }) => (
            <Field key={key} label={label(key)} htmlFor={`filters-${key}`}>
              <Select
                id={`filters-${key}`}
                value={String(value[key])}
                options={options}
                onChange={(v) => onChange({ [key]: v } as Partial<Filters>)}
              />
            </Field>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-xs font-semibold tracking-wide text-gray-500 uppercase">
          Colour
        </h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {eq.map(({ key, min, max }) => (
            <Range
              key={key}
              id={`filters-${key}`}
              label={label(key)}
              value={String(value[key])}
              min={min}
              max={max}
              onChange={(v) => onChange({ [key]: v } as Partial<Filters>)}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-xs font-semibold tracking-wide text-gray-500 uppercase">Audio</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Range
            id="filters-acontrast"
            label="Acontrast"
            value={String(value.acontrast)}
            min={0}
            max={100}
            onChange={(acontrast) => onChange({ acontrast })}
          />
        </div>
      </div>
    </div>
  )
}
