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
        className={`${btn} border-blue-600 bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500`}
      >
        {copied ? 'Copied' : 'Copy'}
      </button>

      <button
        type="button"
        onClick={onReset}
        className={`${btn} border-red-300 text-red-700 hover:bg-red-50 focus-visible:ring-red-500 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950`}
      >
        Reset
      </button>
    </div>
  )
}
