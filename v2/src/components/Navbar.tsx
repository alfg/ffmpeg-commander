import GitHubBadge from './GitHubBadge'
import ThemeToggle from './ThemeToggle'

export default function Navbar() {
  return (
    <nav className="bg-chrome text-chrome-fg">
      <div className="mx-auto flex max-w-3xl items-center gap-2 px-4 py-3 sm:gap-3">
        {/* The wordmark is set as a shell command: the app's whole job is
            producing one. aria-label keeps the spoken name the product name,
            since "chevron ffmpeg hyphen commander" helps nobody. */}
        <a
          href="/"
          aria-label="FFmpeg Commander"
          className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
        >
          <img src="/ffmpeg.svg" width="24" height="24" alt="" />
          <span aria-hidden className="font-mono text-[13px] font-semibold tracking-tight sm:text-[15px]">
            <span className="text-terminal">❯</span> ffmpeg-commander
            <span className="ml-0.5 hidden h-[1.05em] w-[9px] -mb-[3px] bg-terminal animate-caret motion-reduce:animate-none sm:inline-block" />
          </span>
        </a>
        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <ThemeToggle />
          <GitHubBadge />
        </div>
      </div>
    </nav>
  )
}
