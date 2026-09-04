import { useMemo, useState } from 'react'
import { toJsonString } from '@/lib/json'
import type { IFFMpegOptionsForm } from '@/lib/types'

export default function JsonViewer({ form }: { form: IFFMpegOptionsForm }) {
  const json = useMemo(() => toJsonString(form), [form])
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(json)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard blocked; leave the label alone.
    }
  }

  return (
    <section className="rounded-lg border border-line bg-panel">
      <header className="flex items-center gap-2 border-b border-line px-3 py-2">
        <h2 className="text-xs font-semibold tracking-wide text-muted uppercase">JSON format</h2>
        <button
          type="button"
          onClick={copy}
          className="ml-auto rounded border border-line px-2 py-0.5 text-xs font-medium hover:bg-sunken focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </header>
      <pre
        data-testid="json"
        className="overflow-x-auto rounded-b-lg bg-code-bg p-3 font-mono text-xs text-code-fg"
      >
        {json}
      </pre>
    </section>
  )
}
