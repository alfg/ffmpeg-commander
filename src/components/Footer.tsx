import pkg from '../../package.json'

const links = [
  { href: 'https://github.com/alfg/ffmpeg-commander/issues', label: 'Report a Bug' },
  { href: 'https://ffmpeg.org/ffmpeg.html', label: 'FFmpeg Documentation' },
]

export default function Footer() {
  return (
    <footer className="mx-auto max-w-3xl px-4 pt-6 pb-10">
      <hr className="mb-4 border-line" />
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
        <span className="font-mono text-xs">
          {pkg.name}-{pkg.version}
        </span>
        {links.map((l) => (
          <a key={l.href} href={l.href} className="hover:text-fg">
            {l.label}
          </a>
        ))}
        <span className="ml-auto">
          Built with <span className="text-red-500">♥</span> by{' '}
          <a href="https://github.com/alfg" className="hover:text-fg">
            alfg
          </a>
        </span>
      </div>
    </footer>
  )
}
