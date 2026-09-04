/**
 * The Vue app split the command into per-token fragments with a tooltip each
 * (Command.vue + CommandFragment.vue + lib/tooltips). That is still to port;
 * the block itself keeps the black monospace look it has always had, and stays
 * darker than the page in both themes so it reads as output, not as a field.
 */
export default function CommandOutput({ cmd }: { cmd: string }) {
  return (
    <div className="rounded-lg bg-gray-950 p-4 ring-1 ring-black/10 dark:bg-black dark:ring-white/10">
      <code className="block overflow-x-auto font-mono text-sm leading-relaxed font-semibold break-words whitespace-pre-wrap text-gray-50">
        {cmd}
      </code>
    </div>
  )
}
