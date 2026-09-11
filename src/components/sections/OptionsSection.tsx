import { useState, type FormEvent } from 'react'
import Field from '@/components/ui/Field'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Toggle from '@/components/ui/Toggle'
import { defaultHost, parseAddress } from '@/lib/ffmpegd'
import form from '@/lib/form'
import type { IFFMpegOptionsForm } from '@/lib/types'

interface Props {
  value: IFFMpegOptionsForm['options']
  onChange: (patch: Partial<IFFMpegOptionsForm['options']>) => void
  ffmpegdEnabled: boolean
  onFfmpegdChange: (enabled: boolean) => void
  /** Saved daemon origin, or '' when the default is in use. */
  ffmpegdAddress: string
  onFfmpegdAddressChange: (origin: string | null) => void
}

const btn =
  'rounded-md border border-line px-3 py-1.5 text-sm font-medium text-fg transition-colors ' +
  'hover:bg-sunken focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none'

/**
 * Where ffmpegd is listening. Applied on Save rather than per keystroke, since
 * every change reconnects the socket.
 */
function DaemonAddress({ value, onChange }: { value: string; onChange: (origin: string | null) => void }) {
  const [draft, setDraft] = useState(value)
  const [invalid, setInvalid] = useState(false)

  const save = (e: FormEvent) => {
    e.preventDefault()
    if (!draft.trim()) {
      setInvalid(false)
      onChange(null)
      return
    }
    const origin = parseAddress(draft)
    setInvalid(!origin)
    if (origin) {
      setDraft(origin)
      onChange(origin)
    }
  }

  return (
    <form onSubmit={save} className="mt-3 max-w-md">
      <Field
        label="Daemon address"
        htmlFor="options-ffmpegd-address"
        hint="Host and port of ffmpegd, e.g. mybox:9000. Leave empty for the default."
        error={invalid ? 'Enter a host and port, like localhost:8080, or an http(s) URL.' : undefined}
      >
        <div className="flex gap-2">
          <Input
            id="options-ffmpegd-address"
            value={draft}
            placeholder={defaultHost()}
            onChange={setDraft}
          />
          <button type="submit" className={btn}>Save</button>
        </div>
      </Field>
    </form>
  )
}

export default function OptionsSection({
  value,
  onChange,
  ffmpegdEnabled,
  onFfmpegdChange,
  ffmpegdAddress,
  onFfmpegdAddressChange,
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
        {ffmpegdEnabled ? (
          <DaemonAddress value={ffmpegdAddress} onChange={onFfmpegdAddressChange} />
        ) : null}
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
