import { useState } from 'react'

interface Props {
  cmd: string
  onReset: () => void
}

const btn =
  'rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ' +
  'focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none'

export default function Toolbar({ cmd, onReset }: Props) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(cmd)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard blocked (insecure origin or denied permission); leave the
      // label alone rather than claiming a copy that did not happen.
    }
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <button
        type="button"
        onClick={copy}
        className={`${btn} border-accent bg-accent text-accent-fg hover:bg-accent-hover focus-visible:ring-ring`}
      >
        {copied ? 'Copied' : 'Copy'}
      </button>

      <button
        type="button"
        onClick={onReset}
        className={`${btn} border-danger/40 text-danger hover:bg-danger/10 focus-visible:ring-danger`}
      >
        Reset
      </button>
    </div>
  )
}
