import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { parseCommand, type Fragment } from '@/lib/command'

interface Active {
  /** Fragment label shown as the tooltip title. */
  title: string
  /** Tooltip body. Authored HTML from lib/tooltips. */
  description: string
  /** Centre of the trigger, relative to the command block. */
  centre: number
  /** Top of the trigger, relative to the command block. */
  top: number
}

const fragmentBase =
  'inline-block rounded-sm -mx-0.5 px-0.5 transition-colors focus-visible:outline-2 ' +
  'focus-visible:outline-offset-1 focus-visible:outline-terminal'

export default function CommandOutput({ cmd }: { cmd: string }) {
  const fragments = parseCommand(cmd)
  const boxRef = useRef<HTMLDivElement>(null)
  const tipRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState<Active | null>(null)

  // Position the single tooltip against whichever fragment is active, clamped
  // to the command block so a long tip near either edge stays readable. Written
  // straight to the node rather than through state: measuring the tooltip needs
  // it rendered, and setting state here would loop.
  useLayoutEffect(() => {
    const tip = tipRef.current
    const box = boxRef.current
    if (!tip || !box || !active) return
    const width = tip.offsetWidth
    const max = box.clientWidth - width - 8
    tip.style.left = `${Math.round(Math.min(Math.max(active.centre - width / 2, 8), Math.max(max, 8)))}px`
    tip.style.top = `${Math.round(active.top)}px`
  })

  const show = useCallback((el: HTMLElement, fragment: Fragment) => {
    if (!fragment.description) return
    setActive({
      title: fragment.value.replaceAll('"', ''),
      description: fragment.description,
      centre: el.offsetLeft + el.offsetWidth / 2,
      top: el.offsetTop,
    })
  }, [])

  const hide = useCallback(() => setActive(null), [])

  const renderFragment = (fragment: Fragment, key: string, isFilter: boolean) => {
    const describable = Boolean(fragment.description)
    return (
      <span
        key={key}
        data-fragment=""
        // Only describable fragments take focus; making all ~40 tokens
        // tabbable would bury the rest of the page behind them.
        tabIndex={describable ? 0 : undefined}
        aria-describedby={describable && active?.title === fragment.value.replaceAll('"', '')
          ? 'command-tooltip'
          : undefined}
        onMouseEnter={(e) => show(e.currentTarget, fragment)}
        onFocus={(e) => show(e.currentTarget, fragment)}
        onMouseLeave={hide}
        onBlur={hide}
        className={[
          fragmentBase,
          describable ? 'cursor-help' : '',
          isFilter
            ? 'hover:bg-terminal/35 focus-visible:bg-terminal/35'
            : 'hover:bg-white/15 focus-visible:bg-white/15',
        ].join(' ')}
      >
        {fragment.value}
      </span>
    )
  }

  return (
    <div
      ref={boxRef}
      className="relative rounded-lg bg-code-bg p-4 ring-1 ring-line"
      onKeyDown={(e) => {
        if (e.key === 'Escape') hide()
      }}
    >
      <code
        data-testid="command"
        className="block overflow-x-auto font-mono text-sm leading-loose font-semibold whitespace-pre-wrap text-code-fg"
      >
        {fragments.map((fragment, i) => (
          <span key={`fragment-${i}`}>
            {renderFragment(fragment, `f-${i}`, false)}
            {fragment.filters
              ? fragment.filters.map((filter, j) => (
                  <span key={`filter-${i}-${j}`}>
                    {' '}
                    {renderFragment(filter, `ff-${i}-${j}`, true)}
                    {j + 1 === fragment.filters!.length ? '' : ','}
                  </span>
                ))
              : null}{' '}
          </span>
        ))}
      </code>

      {active ? (
        <div
          ref={tipRef}
          id="command-tooltip"
          role="tooltip"
          className="pointer-events-none absolute z-20 max-w-80 -translate-y-full rounded-md bg-panel p-2 text-xs text-fg shadow-lg ring-1 ring-line"
          style={{ marginTop: '-0.5rem' }}
        >
          <p className="mb-1 font-mono font-semibold">{active.title}</p>
          {/* Authored in lib/tooltips.ts, which uses <em>, <code> and links. */}
          <p
            className="leading-snug [&_a]:underline [&_code]:font-mono"
            dangerouslySetInnerHTML={{ __html: active.description }}
          />
        </div>
      ) : null}
    </div>
  )
}
