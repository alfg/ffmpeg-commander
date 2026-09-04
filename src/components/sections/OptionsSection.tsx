import Field from '@/components/ui/Field'
import Select from '@/components/ui/Select'
import Toggle from '@/components/ui/Toggle'
import form from '@/lib/form'
import type { IFFMpegOptionsForm } from '@/lib/types'

interface Props {
  value: IFFMpegOptionsForm['options']
  onChange: (patch: Partial<IFFMpegOptionsForm['options']>) => void
  ffmpegdEnabled: boolean
  onFfmpegdChange: (enabled: boolean) => void
}

export default function OptionsSection({
  value,
  onChange,
  ffmpegdEnabled,
  onFfmpegdChange,
}: Props) {
  // `extra` is typed as string in lib/types but is really a string[]; see the
  // note in lib/defaults.ts.
  const extra = value.extra as unknown as string[]

  const toggle = (flag: string, on: boolean) => {
    const next = on ? [...extra, flag] : extra.filter((f) => f !== flag)
    onChange({ extra: next as unknown as string })
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="mb-2 text-xs font-semibold tracking-wide text-muted uppercase">
          Extra flags
        </h3>
        <div className="flex flex-col">
          {form.extraOptions.map((o) => (
            <Toggle
              key={o.value}
              id={`options-${o.value}`}
              checked={extra.includes(o.value)}
              label={o.text}
              onChange={(on) => toggle(o.value, on)}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-xs font-semibold tracking-wide text-muted uppercase">ffmpegd</h3>
        <Toggle
          id="options-ffmpegd"
          checked={ffmpegdEnabled}
          label="Send encode jobs to a local ffmpegd daemon (experimental)."
          onChange={onFfmpegdChange}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Field label="Log level" htmlFor="options-loglevel">
          <Select
            id="options-loglevel"
            value={value.loglevel}
            options={form.logLevels}
            onChange={(loglevel) => onChange({ loglevel })}
          />
        </Field>
      </div>
    </div>
  )
}
