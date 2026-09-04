import util from '@/lib/util'

/**
 * Swaps the output file's extension so it matches the chosen container.
 *
 * Ported from Editor.updateOutput() in the Vue app, with two corrections.
 *
 * The original did `output.replace(ext, '.' + container)`, and String.replace
 * swaps the *first* match: "clip.mp4.mp4" became "clip.mkv.mp4" rather than
 * "clip.mp4.mkv". Slicing the tail avoids that.
 *
 * It also ran on any filename with a dot in it, and util.extname is not path
 * aware -- it just takes everything after the last dot. For the URL outputs this
 * app offers from the protocol dropdown ("rtmp://host.com/live") that yields an
 * "extension" of ".com/live", and rewriting it mangles the URL. Anything with a
 * separator in the extension is left alone.
 */
export function retargetExtension(filename: string, container: string): string {
  const ext = util.extname(filename)
  if (!ext || ext.includes('/') || ext.includes('\\')) return filename
  return `${filename.slice(0, -ext.length)}.${container}`
}
