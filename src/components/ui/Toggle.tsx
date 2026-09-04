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
          'peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-1',
          checked ? 'bg-accent' : 'bg-line',
        ].join(' ')}
      >
        <span
          className={[
            'block h-4 w-4 rounded-full bg-panel transition-transform',
            checked ? 'translate-x-4' : 'translate-x-0',
          ].join(' ')}
        />
      </span>
      <span className="text-sm text-fg">{label}</span>
    </label>
  )
}
