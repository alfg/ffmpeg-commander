import HelpTip from './HelpTip'

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
      {/* The help button sits outside the label: a button inside a label also
          activates the slider when clicked. */}
      <div className="flex items-center justify-between gap-1 text-xs font-medium text-muted">
        <span className="flex items-center gap-1">
          <label htmlFor={id}>{label}</label>
          <HelpTip id={id} label={label} />
        </span>
        <span className="font-mono text-fg tabular-nums">{value}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-sunken accent-fg"
      />
    </div>
  )
}
