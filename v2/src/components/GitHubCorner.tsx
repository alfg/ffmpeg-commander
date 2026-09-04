const REPO = 'https://github.com/alfg/ffmpeg-commander'

/** The corner ribbon from the Vue app, kept as-is -- it is part of the identity. */
export default function GitHubCorner() {
  return (
    <a
      href={REPO}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="View source on GitHub"
      className="group absolute top-0 right-0 z-10"
    >
      <svg width="70" height="70" viewBox="0 0 250 250" aria-hidden className="fill-green-700 text-white">
        <path d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z" />
        <path
          d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2"
          fill="currentColor"
          style={{ transformOrigin: '130px 106px' }}
          className="origin-[130px_106px] transition-transform group-hover:animate-pulse"
        />
        <path
          d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.4 187.2,61.2 190.9,64.9 C194.5,68.5 197.7,72.9 199.8,77.9 C213.5,80.6 215.8,85.3 215.8,85.3 C212.3,93.5 206.5,96.4 204.9,97.0 C204.7,102.7 202.5,108.2 197.9,112.9 C181.5,129.2 167.9,122.9 157.3,114.5 C157.5,116.8 156.7,119.8 154.3,123.0 L140.5,136.9 C139.4,138.0 140.8,141.8 140.9,141.7 Z"
          fill="currentColor"
        />
      </svg>
    </a>
  )
}
