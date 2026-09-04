interface InputProps {
  id?: string
  value: string
  placeholder?: string
  type?: 'text' | 'number'
  onChange: (value: string) => void
}

const base =
  'w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-sm ' +
  'focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none ' +
  'dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100'

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
