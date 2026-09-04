import { useState } from 'react'

const KEY = 'banner-dismissed'
const HREF = 'https://video-commander.com?ref=ffmpeg-commander'

// Dismissal expires rather than being permanent. This banner is the funnel to
// the commercial product, and a single stray click should not close that channel
// for a returning visitor forever.
const DISMISS_DAYS = 30
const DISMISS_MS = DISMISS_DAYS * 24 * 60 * 60 * 1000

function readDismissed(): boolean {
  try {
    const at = Number(localStorage.getItem(KEY))
    return Boolean(at) && Date.now() - at < DISMISS_MS
  } catch {
    return false
  }
}

/** Cross-promo for video-commander.com. */
export default function Banner() {
  const [dismissed, setDismissed] = useState(readDismissed)

  if (dismissed) return null

  const dismiss = () => {
    try {
      localStorage.setItem(KEY, String(Date.now()))
    } catch {
      // Private browsing or blocked storage: dismiss for this session only.
    }
    setDismissed(true)
  }

  return (
    <div className="border-b border-promo/30 bg-promo/8">
      <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-2">
        <p className="min-w-0 flex-1 text-sm text-balance">
          Skip the terminal. <strong className="font-semibold">Video Commander</strong> runs the
          encode — free for personal use.
        </p>
        {/* A button rather than an inline link: this is the one thing on the
            page we actually want clicked. */}
        <a
          href={HREF}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-md bg-promo px-3 py-1.5 text-sm font-semibold text-promo-fg transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-promo focus-visible:ring-offset-1 focus-visible:outline-none"
        >
          Download
        </a>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          className="shrink-0 rounded px-1.5 text-lg leading-none opacity-50 hover:opacity-100"
        >
          ×
        </button>
      </div>
    </div>
  )
}
