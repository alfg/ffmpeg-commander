import { useId, useRef, useState, type ReactNode } from 'react'

export interface Tab {
  id: string
  label: ReactNode
  content: ReactNode
}

interface TabsProps {
  tabs: Tab[]
  align?: 'left' | 'right'
}

/**
 * Underlined tab bar with roving focus and arrow-key navigation.
 *
 * Hand-rolled rather than pulled from a component library: it is the one
 * behavioural widget the editor needs, and keeping it local leaves the choice
 * of primitives open. Swapping in a library's Tabs later is a drop-in.
 */
export default function Tabs({ tabs, align = 'left' }: TabsProps) {
  const [active, setActive] = useState(0)
  const baseId = useId()
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  const onKeyDown = (e: React.KeyboardEvent) => {
    const last = tabs.length - 1
    let next: number | null = null
    if (e.key === 'ArrowRight') next = active === last ? 0 : active + 1
    if (e.key === 'ArrowLeft') next = active === 0 ? last : active - 1
    if (e.key === 'Home') next = 0
    if (e.key === 'End') next = last
    if (next === null) return
    e.preventDefault()
    setActive(next)
    refs.current[next]?.focus()
  }

  return (
    <div>
      {/* A lone tab is noise: the strip appears when there is a choice. Keeping
          the panels mounted either way is what stops a tab appearing or
          disappearing from remounting its content. */}
      <div
        role="tablist"
        onKeyDown={onKeyDown}
        hidden={tabs.length < 2}
        className={[
          'flex gap-1 overflow-x-auto border-b border-line',
          align === 'right' ? 'justify-end' : '',
        ].join(' ')}
      >
        {tabs.map((tab, i) => {
          const selected = i === active
          return (
            <button
              key={tab.id}
              ref={(el) => {
                refs.current[i] = el
              }}
              role="tab"
              type="button"
              id={`${baseId}-tab-${tab.id}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(i)}
              className={[
                'relative -mb-px shrink-0 rounded-t px-3 py-2 text-sm font-medium whitespace-nowrap',
                'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                selected
                  ? 'border-b-2 border-accent text-accent'
                  : 'border-b-2 border-transparent text-muted hover:text-fg',
              ].join(' ')}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {tabs.map((tab, i) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`${baseId}-panel-${tab.id}`}
          aria-labelledby={`${baseId}-tab-${tab.id}`}
          hidden={i !== active}
          className="pt-4"
        >
          {i === active ? tab.content : null}
        </div>
      ))}
    </div>
  )
}
