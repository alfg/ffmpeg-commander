import type { ReactNode } from 'react'

/** Replaces the b-card / b-tab grouping of the Vue editor. */
export default function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
      <h2 className="mb-3 text-sm font-semibold tracking-wide text-gray-900 uppercase dark:text-gray-100">
        {title}
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{children}</div>
    </section>
  )
}
