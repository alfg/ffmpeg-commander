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
    <div className="border-b border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-100">
      <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-2 text-sm">
        <p className="flex-1 text-center">
          ffmpeg-commander builds the command.{' '}
          <a href={HREF} target="_blank" rel="noopener noreferrer" className="font-semibold underline">
            Video Commander
          </a>{' '}
          runs the whole workflow. <span aria-hidden>→</span>
        </p>
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
