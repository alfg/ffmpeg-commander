import { useEffect, useState } from 'react'
import { host } from '@/lib/ffmpegd'

export const FFMPEGD_INSTALL_URL = 'https://github.com/alfg/ffmpegd#install'

// The socket takes a moment to open on page load, so wait before telling
// someone whose daemon is running fine how to install it.
export const SETUP_DELAY_MS = 1500

const link = 'text-accent underline underline-offset-2 hover:text-accent-hover'
// nowrap keeps a command in one piece rather than breaking it mid-line on a phone.
const code = 'rounded bg-sunken px-1 font-mono text-xs whitespace-nowrap'

// host:port without the scheme, for display. Falls back to the raw address.
export function displayAddress(): string {
  try {
    return new URL(host()).host
  } catch {
    return host()
  }
}

/**
 * How to get ffmpegd running, shown wherever ffmpegd is enabled but not
 * connected. For the first SETUP_DELAY_MS it only says it is connecting, so a
 * normal connect does not flash install steps; the parent unmounts it once the
 * socket opens.
 *
 * `explain` adds a sentence on what ffmpegd is, for places that don't already
 * say so (the Options tab does, right above it).
 */
export default function FfmpegdSetup({ explain = true }: { explain?: boolean }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const id = window.setTimeout(() => setVisible(true), SETUP_DELAY_MS)
    return () => window.clearTimeout(id)
  }, [])

  if (!visible) {
    return (
      <p className="text-sm text-muted">
        Connecting to ffmpegd at <code className={code}>{displayAddress()}</code>…
      </p>
    )
  }

  return (
    <div role="status" className="rounded-lg border border-line bg-panel p-4 text-sm text-fg">
      <p className="font-medium">
        Can&apos;t reach ffmpegd at <code className={code}>{displayAddress()}</code>
      </p>
      <p className="mt-1 text-muted">
        {explain ? 'ffmpegd is a small companion app that runs these commands on your computer. ' : ''}
        To set it up:
      </p>
      <ol className="mt-2 list-decimal space-y-1.5 pl-5">
        <li>
          Install it with Homebrew: <code className={code}>brew install alfg/tap/ffmpegd</code>.
          For Windows, Go or Docker, see{' '}
          <a href={FFMPEGD_INSTALL_URL} target="_blank" rel="noopener noreferrer" className={link}>
            the install guide
          </a>
          . ffmpegd 0.1.0 and earlier can&apos;t connect to this site, so update an older copy.
        </li>
        <li>
          Run <code className={code}>ffmpegd</code> in the folder with your videos. Input and output
          paths are relative to that folder.
        </li>
        <li>This page connects on its own once ffmpegd is running.</li>
      </ol>
    </div>
  )
}
