import { useEffect, useState } from 'react'

const REPO = 'alfg/ffmpeg-commander'
const API = `https://api.github.com/repos/${REPO}`
const CACHE_KEY = 'gh-stars'
const TTL_MS = 6 * 60 * 60 * 1000

interface Cached {
  count: number
  at: number
}

function readCache(): number | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { count, at } = JSON.parse(raw) as Cached
    return Date.now() - at < TTL_MS ? count : null
  } catch {
    return null
  }
}

function writeCache(count: number) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ count, at: Date.now() } satisfies Cached))
  } catch {
    // Storage blocked; the count just gets refetched next load.
  }
}

const compact = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 })

/**
 * Repo link with the live star count.
 *
 * The count is cached for six hours so a returning visitor does not spend one of
 * their 60 unauthenticated GitHub API calls per hour on it. Every failure path
 * -- offline, rate limited, blocked storage -- falls back to rendering the link
 * without a count rather than hiding the link.
 */
export default function GitHubBadge() {
  const [stars, setStars] = useState<number | null>(readCache)

  useEffect(() => {
    if (stars !== null) return
    let cancelled = false

    fetch(API)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((data: { stargazers_count?: number }) => {
        if (cancelled || typeof data.stargazers_count !== 'number') return
        setStars(data.stargazers_count)
        writeCache(data.stargazers_count)
      })
      .catch(() => {
        // Leave the count off; the link still works.
      })

    return () => {
      cancelled = true
    }
  }, [stars])

  return (
    <a
      href={`https://github.com/${REPO}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={
        stars === null
          ? 'View this project on GitHub'
          : `View this project on GitHub, ${stars.toLocaleString('en')} stars`
      }
      className="flex items-center gap-1.5 rounded-md border border-white/20 bg-white/5 px-2 py-1.5 text-sm sm:gap-2 sm:px-2.5 transition-colors hover:border-white/35 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:outline-none"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
      </svg>
      <span className="hidden font-medium sm:inline">Star</span>
      {stars !== null ? (
        <>
          <span aria-hidden className="hidden h-4 w-px bg-white/25 sm:inline-block" />
          <span aria-hidden className="tabular-nums">
            {compact.format(stars)}
          </span>
        </>
      ) : null}
    </a>
  )
}
