import { useState } from 'react'

const KEY = 'banner-dismissed'
const HREF = 'https://video-commander.com?ref=ffmpeg-commander'

/** Cross-promo for video-commander.com, dismissible and remembered per browser. */
export default function Banner() {
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(KEY) === 'true'
    } catch {
      return false
    }
  })

  if (dismissed) return null

  const dismiss = () => {
    try {
      localStorage.setItem(KEY, 'true')
    } catch {
      // Private browsing or blocked storage: dismiss for this session only.
    }
    setDismissed(true)
  }

  return (
    <div className="border-b border-accent/25 bg-accent/10 text-fg">
      <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-2 text-sm">
        {/* The whole line is the target, not just the product name: every
            clause is about the product, and a wider hit area is worth more than
            a tidy inline link. */}
        <a
          href={HREF}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 text-center text-balance hover:underline"
        >
          Skip the terminal. <strong className="font-semibold">Video Commander</strong> runs
          the encode and validates the output. Free for personal use.{' '}
          <span aria-hidden>→</span>
        </a>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          className="shrink-0 rounded px-1.5 text-lg leading-none opacity-60 hover:opacity-100"
        >
          ×
        </button>
      </div>
    </div>
  )
}
