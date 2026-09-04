interface InputProps {
  id?: string
  value: string
  placeholder?: string
  type?: 'text' | 'number'
  onChange: (value: string) => void
}

const base =
  'w-full rounded border border-line bg-panel px-2 py-1.5 text-sm text-fg ' +
  'focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none'

/** Replaces b-form-input. */
export default function Input({ id, value, placeholder, type = 'text', onChange }: InputProps) {
  return (
    <input
      id={id}
      type={type}
      className={base}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}
