import { useState } from 'react'

interface Props {
  cmd: string
  isSavedPreset: boolean
  canEncode: boolean
  encoding: boolean
  onEncode: () => void
  showJson: boolean
  onToggleJson: () => void
  onSave: () => void
  onSaveAsNew: () => void
  onDelete: () => void
  onReset: () => void
}

const btn =
  'rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ' +
  'focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none'

const quiet = `${btn} border-line text-fg hover:bg-sunken focus-visible:ring-ring`

export default function Toolbar({
  cmd,
  isSavedPreset,
  canEncode,
  encoding,
  onEncode,
  showJson,
  onToggleJson,
  onSave,
  onSaveAsNew,
  onDelete,
  onReset,
}: Props) {
  const [copied, setCopied] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

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
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={copy}
        className={`${btn} border-accent bg-accent text-accent-fg hover:bg-accent-hover focus-visible:ring-ring`}
      >
        {copied ? 'Copied' : 'Copy'}
      </button>

      {/* Only offered once a daemon is actually listening. */}
      {canEncode ? (
        <button
          type="button"
          onClick={onEncode}
          className={`${btn} border-terminal bg-terminal/15 text-fg hover:bg-terminal/25 focus-visible:ring-ring`}
        >
          {encoding ? 'Encoding…' : 'Encode'}
        </button>
      ) : null}

      <button
        type="button"
        onClick={onToggleJson}
        aria-pressed={showJson}
        className={quiet}
      >
        {showJson ? 'Hide JSON' : 'Show JSON'}
      </button>

      <button type="button" onClick={onSave} className={quiet}>
        {isSavedPreset ? 'Save' : 'Save preset'}
      </button>

      {/* Only meaningful once you are editing something already saved. */}
      {isSavedPreset ? (
        <button type="button" onClick={onSaveAsNew} className={quiet}>
          Save as new
        </button>
      ) : null}

      <div className="ml-auto flex items-center gap-2">
        {isSavedPreset ? (
          confirmingDelete ? (
            <>
              <span className="text-sm text-muted">Delete preset?</span>
              <button
                type="button"
                onClick={() => {
                  onDelete()
                  setConfirmingDelete(false)
                }}
                className={`${btn} border-danger bg-danger text-accent-fg focus-visible:ring-danger`}
              >
                Delete
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                className={quiet}
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              className={`${btn} border-danger/40 text-danger hover:bg-danger/10 focus-visible:ring-danger`}
            >
              Delete
            </button>
          )
        ) : null}

        <button
          type="button"
          onClick={onReset}
          className={`${btn} border-danger/40 text-danger hover:bg-danger/10 focus-visible:ring-danger`}
        >
          Reset
        </button>
      </div>
    </div>
  )
}
