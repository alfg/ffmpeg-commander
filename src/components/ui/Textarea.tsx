interface TextareaProps {
  id?: string
  value: string
  placeholder?: string
  rows?: number
  onChange: (value: string) => void
}

const base =
  'w-full min-w-0 rounded border border-line bg-panel px-2 py-1.5 font-mono text-sm text-fg ' +
  'focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none'

/** Replaces b-form-textarea. */
export default function Textarea({ id, value, placeholder, rows = 2, onChange }: TextareaProps) {
  return (
    <textarea
      id={id}
      rows={rows}
      className={base}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}
