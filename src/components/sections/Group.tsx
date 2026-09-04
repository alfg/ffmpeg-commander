import type { ReactNode } from 'react'

/** A labelled band of fields inside a tab panel. */
export default function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="mb-3 text-xs font-semibold tracking-wide text-muted uppercase">{title}</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{children}</div>
    </div>
  )
}
