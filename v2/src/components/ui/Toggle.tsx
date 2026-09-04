interface ToggleProps {
  id: string
  checked: boolean
  label: string
  onChange: (checked: boolean) => void
}

/** Switch-style checkbox, replacing bootstrap-vue's `b-form-checkbox switch`. */
export default function Toggle({ id, checked, label, onChange }: ToggleProps) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-2.5 py-1">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className={[
          'mt-0.5 h-5 w-9 shrink-0 rounded-full p-0.5 transition-colors',
          'peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500 peer-focus-visible:ring-offset-1',
          checked ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600',
        ].join(' ')}
      >
        <span
          className={[
            'block h-4 w-4 rounded-full bg-white transition-transform',
            checked ? 'translate-x-4' : 'translate-x-0',
          ].join(' ')}
        />
      </span>
      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
    </label>
  )
}
