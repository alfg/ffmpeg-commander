const HREF =
  'https://www.producthunt.com/products/ffmpeg-commander?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-ffmpeg-commander'
const SRC = 'https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1263419&t=1790766831054'
const ALT = 'FFmpeg Commander - A web GUI for generating FFmpeg command-line operations. | Product Hunt'

/**
 * Product Hunt badge, kept in the footer now that launch day is over.
 *
 * Two images toggled by the theme class rather than a <picture> with
 * prefers-color-scheme, since the theme here is the user's choice and can
 * disagree with their OS.
 */
export default function ProductHuntBadge() {
  return (
    <a href={HREF} target="_blank" rel="noopener noreferrer" className="shrink-0">
      <img alt={ALT} width="185" height="40" src={`${SRC}&theme=light`} className="dark:hidden" />
      <img alt={ALT} width="185" height="40" src={`${SRC}&theme=dark`} className="hidden dark:block" />
    </a>
  )
}
