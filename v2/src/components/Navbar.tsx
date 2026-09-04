import GitHubBadge from './GitHubBadge'

export default function Navbar() {
  return (
    <nav className="bg-chrome text-chrome-fg">
      <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
        <a href="/" className="flex items-center gap-2 font-medium hover:opacity-90">
          <img src="/ffmpeg.svg" width="24" height="24" alt="" />
          FFmpeg Commander
        </a>
        <div className="ml-auto">
          <GitHubBadge />
        </div>
      </div>
    </nav>
  )
}
