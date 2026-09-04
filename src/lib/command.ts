import tooltips from '@/lib/tooltips'

export interface Fragment {
  value: string
  description?: string
  /** Present only on -vf / -af, whose argument is split into its filters. */
  filters?: Fragment[]
}

/**
 * Splits a generated command into hoverable fragments with their descriptions.
 *
 * Ported from the getToolTips method in Command.vue. Kept as a pure function so
 * the parsing is testable without rendering anything.
 *
 * -vf and -af are special-cased: their argument is a comma-separated filtergraph,
 * and each filter gets its own fragment so it can be described individually.
 */
export function parseCommand(commandStr: string): Fragment[] {
  const cmd = commandStr.split(' ')
  const output: Fragment[] = []
  let skip: number | undefined

  cmd.forEach((el, i) => {
    if (skip === i) return

    const fragment: Fragment = { value: el }
    const desc = tooltips.find((t) => t.value === el)
    if (desc) fragment.description = desc.tip

    if (el === '-vf' || el === '-af') {
      const filters = (cmd[i + 1] ?? '').split(',')
      fragment.filters = filters.map((filter) => {
        const f: Fragment = { value: filter }
        // Filters carry their arguments (scale=1920:-1), so match on a prefix
        // rather than equality.
        const filterDesc = tooltips.find((t) => filter.includes(t.value))
        if (filterDesc) f.description = filterDesc.tip
        return f
      })
      skip = i + 1
    }
    output.push(fragment)
  })

  return output
}
