interface RangeProps {
  id: string
  label: string
  value: string
  min: number
  max: number
  onChange: (value: string) => void
}

/** Labelled slider. The Vue app put the live value in the label; so does this. */
export default function Range({ id, label, value, min, max, onChange }: RangeProps) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <label htmlFor={id} className="flex justify-between text-xs font-medium text-muted">
        <span>{label}</span>
        <span className="font-mono text-fg tabular-nums">{value}</span>
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-sunken accent-accent"
      />
    </div>
  )
}
