import { useState } from 'react'
import FileBrowser from '@/components/FileBrowser'
import Field from '@/components/ui/Field'
import form from '@/lib/form'
import type { IFFMpegOptionsForm } from '@/lib/types'

interface Props {
  value: IFFMpegOptionsForm['io']
  onChange: (patch: Partial<IFFMpegOptionsForm['io']>) => void
  ffmpegdEnabled: boolean
  ffmpegdConnected: boolean
}

const control =
  'border border-line bg-panel px-2 py-1.5 text-sm text-fg focus:z-10 focus:border-ring ' +
  'focus:ring-1 focus:ring-ring focus:outline-none'

interface RowProps {
  id: string
  label: string
  value: string
  placeholder: string
  showProtocol: boolean
  onChange: (v: string) => void
  onFocus?: () => void
  children?: React.ReactNode
}

/** Protocol select + filename, as an attached input group. */
function Row({
  id,
  label,
  value,
  placeholder,
  showProtocol,
  onChange,
  onFocus,
  children,
}: RowProps) {
  return (
    <Field label={label} htmlFor={id}>
      <div className="relative flex min-w-0">
        {showProtocol ? (
          <select
            aria-label={`${label} protocol`}
            className={`${control} w-24 shrink-0 rounded-l`}
            value=""
            onChange={(e) => {
              if (e.target.value) onChange(e.target.value)
            }}
          >
            <option value="">File</option>
            {form.protocols.map((p) => (
              <option key={p.name} value={p.value}>
                {p.name}
              </option>
            ))}
          </select>
        ) : null}
        <input
          id={id}
          className={`${control} -ml-px w-full min-w-0 rounded-r ${showProtocol ? '' : 'rounded-l'}`}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
        />
        {children}
      </div>
    </Field>
  )
}

export default function FileIO({ value, onChange, ffmpegdEnabled, ffmpegdConnected }: Props) {
  const [browsing, setBrowsing] = useState(false)

  // With a daemon attached, the input is picked from the machine ffmpegd runs
  // on rather than typed, so the protocol list gives way to the browser. The
  // output stays a plain field -- it names a file that does not exist yet.
  const canBrowse = ffmpegdEnabled && ffmpegdConnected

  return (
    <div
      className="grid gap-3 sm:grid-cols-2"
      onKeyDown={(e) => {
        if (e.key === 'Escape') setBrowsing(false)
      }}
    >
      <Row
        id="io-input"
        label="Input"
        value={value.input}
        placeholder={canBrowse ? 'Choose a file…' : 'Example: input.mp4'}
        showProtocol={!canBrowse}
        onChange={(input) => onChange({ input })}
        onFocus={canBrowse ? () => setBrowsing(true) : undefined}
      >
        {canBrowse && browsing ? (
          <FileBrowser
            onSelect={(file) => {
              onChange({ input: file })
              setBrowsing(false)
            }}
            onClose={() => setBrowsing(false)}
          />
        ) : null}
      </Row>

      <Row
        id="io-output"
        label="Output"
        value={value.output}
        placeholder="Example: output.mp4"
        showProtocol={!ffmpegdEnabled}
        onChange={(output) => onChange({ output })}
      />
    </div>
  )
}
