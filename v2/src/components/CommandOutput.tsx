import { useState } from 'react'

/**
 * The Vue app split the command into per-token fragments with a tooltip each
 * (Command.vue + CommandFragment.vue + lib/tooltips). That is still to port;
 * this shows the whole command and keeps the copy affordance.
 */
export default function CommandOutput({ cmd }: { cmd: string }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(cmd)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="rounded-lg bg-chrome p-4 text-chrome-fg">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-wide uppercase">Command</h2>
        <button
          type="button"
          onClick={copy}
          className="rounded border border-white/25 px-2 py-1 text-xs hover:bg-white/10"
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <code className="block overflow-x-auto font-mono text-sm break-words whitespace-pre-wrap">
        {cmd}
      </code>
    </div>
  )
}
