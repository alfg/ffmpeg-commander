import type { ReactNode } from 'react'
import HelpTip from './HelpTip'

interface FieldProps {
  label: string
  htmlFor?: string
  hint?: string
  /** Shown in place of the hint when the value would produce a failing command. */
  error?: string
  children: ReactNode
}

/** Label + control + optional hint. Replaces bootstrap-vue's b-form-group. */
export default function Field({ label, htmlFor, hint, error, children }: FieldProps) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <div className="flex items-center gap-1">
        <label htmlFor={htmlFor} className="text-xs font-medium text-muted">
          {label}
        </label>
        {htmlFor ? <HelpTip id={htmlFor} label={label} /> : null}
      </div>
      {children}
      {error ? (
        <p role="alert" className="text-xs text-danger">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  )
}
