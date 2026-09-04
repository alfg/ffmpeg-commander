export interface Option {
  name: string
  value: string | boolean
}

interface SelectProps {
  id?: string
  value: string
  options: Option[]
  onChange: (value: string) => void
}

const base =
  'w-full rounded border border-line bg-panel px-2 py-1.5 text-sm text-fg ' +
  'focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none'

/** Replaces b-form-select. */
export default function Select({ id, value, options, onChange }: SelectProps) {
  return (
    <select id={id} className={base} value={value} onChange={(e) => onChange(e.target.value)}>
      {/* Keyed by name as well as value: the size list legitimately repeats
          widths (1440p and 1600p are both 2560 wide), and keying on value alone
          makes React drop one of the pair. */}
      {options.map((o) => (
        <option key={`${o.name}-${o.value}`} value={String(o.value)}>
          {o.name}
        </option>
      ))}
    </select>
  )
}
