import type { ReactNode } from 'react'

/**
 * Field grid for a tab panel. No heading: the tab itself names the section, and
 * repeating it inside the panel is noise -- the Vue app does not do it either.
 */
export default function Section({ children }: { title?: string; children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{children}</div>
}
