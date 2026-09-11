import { useLayoutEffect, useRef, useState } from 'react'
import fieldHelp from '@/lib/fieldHelp'

interface HelpTipProps {
  /** Id of the control this explains; also the key into lib/fieldHelp. */
  id: string
  label: string
}

interface Choice {
  name: string
  note: string
}

// The option currently picked in the control, if the help has a note for it.
// Read from the DOM when the tip opens rather than threaded through as a prop,
// so the sections do not have to pass every value twice. The tip closes
// whenever focus moves to the control, so it cannot show a stale choice.
function currentChoice(id: string, values?: Record<string, string>): Choice | null {
  if (!values) return null
  const el = document.getElementById(id)
  if (!(el instanceof HTMLSelectElement)) return null
  const note = values[el.value]
  return note ? { name: el.selectedOptions[0]?.text ?? el.value, note } : null
}

/**
 * A small "i" beside a field label that explains the setting in a popover,
 * like the tooltips on the generated command. Renders nothing for controls
 * without an entry in lib/fieldHelp.
 *
 * Opens on hover, keyboard focus or tap, and closes on leave, blur or Escape.
 * There is no toggle-on-click: a tap fires focus and click together, and a
 * toggle would open and immediately close it again.
 */
export default function HelpTip({ id, label }: HelpTipProps) {
  const help = fieldHelp[id]
  const [choice, setChoice] = useState<Choice | null>(null)
  const [open, setOpen] = useState(false)
  const tipRef = useRef<HTMLDivElement>(null)
  const tipId = `${id}-help`

  // Keep the popover on screen: shift it left when a right-hand field would
  // push it past the edge (especially on a phone), and open it upwards when
  // there is no room below but there is above.
  useLayoutEffect(() => {
    const tip = tipRef.current
    const anchor = tip?.parentElement
    if (!tip || !anchor) return
    tip.style.transform = ''
    tip.style.top = ''
    tip.style.bottom = ''
    const rect = tip.getBoundingClientRect()
    const overflow = rect.right - (window.innerWidth - 8)
    if (overflow > 0) tip.style.transform = `translateX(-${Math.ceil(overflow)}px)`
    if (rect.bottom > window.innerHeight - 8 && anchor.getBoundingClientRect().top > rect.height + 16) {
      tip.style.top = 'auto'
      tip.style.bottom = 'calc(100% + 0.75rem)'
    }
  })

  if (!help) return null

  const show = () => {
    setChoice(currentChoice(id, help.values))
    setOpen(true)
  }
  const hide = () => setOpen(false)

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-label={`About ${label}`}
        aria-describedby={open ? tipId : undefined}
        onPointerEnter={(e) => {
          if (e.pointerType === 'mouse') show()
        }}
        onPointerLeave={(e) => {
          if (e.pointerType === 'mouse') hide()
        }}
        onFocus={show}
        onClick={show}
        onBlur={hide}
        onKeyDown={(e) => {
          if (e.key === 'Escape') hide()
        }}
        className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full text-muted transition-colors hover:text-fg focus-visible:text-fg focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <svg viewBox="0 0 16 16" aria-hidden className="h-3.5 w-3.5 fill-current">
          <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm0 1.5a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11ZM7.25 7h1.5v4.5h-1.5V7ZM8 4.25a.9.9 0 1 1 0 1.8.9.9 0 0 1 0-1.8Z" />
        </svg>
      </button>

      {open ? (
        <div
          ref={tipRef}
          id={tipId}
          role="tooltip"
          className="pointer-events-none absolute top-full left-0 z-30 mt-1.5 w-72 max-w-[calc(100vw-2rem)] rounded-md bg-panel p-2.5 text-xs leading-snug font-normal text-fg normal-case shadow-lg ring-1 ring-line"
        >
          <p className="mb-1 flex items-baseline justify-between gap-3">
            <span className="font-semibold">{label}</span>
            {help.flag ? (
              <code className="rounded bg-sunken px-1 font-mono text-[11px] text-muted">{help.flag}</code>
            ) : null}
          </p>
          <p>{help.text}</p>
          {choice ? (
            <p className="mt-1.5 border-t border-line pt-1.5">
              <span className="font-medium">{choice.name}:</span> {choice.note}
            </p>
          ) : null}
        </div>
      ) : null}
    </span>
  )
}
