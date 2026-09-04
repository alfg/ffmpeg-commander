import type { ReactNode } from 'react'

interface FieldProps {
  label: string
  htmlFor?: string
  hint?: string
  children: ReactNode
}

/** Label + control + optional hint. Replaces bootstrap-vue's b-form-group. */
export default function Field({ label, htmlFor, hint, children }: FieldProps) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <label htmlFor={htmlFor} className="text-xs font-medium text-muted">
        {label}
      </label>
      {children}
      {hint ? <p className="text-xs text-muted">{hint}</p> : null}
    </div>
  )
}
