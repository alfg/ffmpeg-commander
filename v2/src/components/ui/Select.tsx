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
  'w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-sm ' +
  'focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none ' +
  'dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100'

/** Replaces b-form-select. */
export default function Select({ id, value, options, onChange }: SelectProps) {
  return (
    <select id={id} className={base} value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((o) => (
        <option key={String(o.value)} value={String(o.value)}>
          {o.name}
        </option>
      ))}
    </select>
  )
}
