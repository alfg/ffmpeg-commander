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
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="flex justify-between text-xs font-medium text-gray-600 dark:text-gray-400">
        <span>{label}</span>
        <span className="font-mono text-gray-900 tabular-nums dark:text-gray-100">{value}</span>
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-gray-200 accent-blue-600 dark:bg-gray-700"
      />
    </div>
  )
}
