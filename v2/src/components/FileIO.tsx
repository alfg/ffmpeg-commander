import Field from '@/components/ui/Field'
import form from '@/lib/form'
import type { IFFMpegOptionsForm } from '@/lib/types'

interface Props {
  value: IFFMpegOptionsForm['io']
  onChange: (patch: Partial<IFFMpegOptionsForm['io']>) => void
}

const control =
  'border border-line bg-panel px-2 py-1.5 text-sm text-fg focus:z-10 focus:border-accent ' +
  'focus:ring-1 focus:ring-accent focus:outline-none'

/** Protocol select + filename, as an attached input group. */
function Row({
  id,
  label,
  value,
  placeholder,
  onChange,
}: {
  id: string
  label: string
  value: string
  placeholder: string
  onChange: (v: string) => void
}) {
  return (
    <Field label={label} htmlFor={id}>
      <div className="flex min-w-0">
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
        <input
          id={id}
          className={`${control} -ml-px w-full min-w-0 rounded-r`}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </Field>
  )
}

export default function FileIO({ value, onChange }: Props) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Row
        id="io-input"
        label="Input"
        value={value.input}
        placeholder="Example: input.mp4"
        onChange={(input) => onChange({ input })}
      />
      <Row
        id="io-output"
        label="Output"
        value={value.output}
        placeholder="Example: output.mp4"
        onChange={(output) => onChange({ output })}
      />
    </div>
  )
}
