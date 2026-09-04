import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen, cleanup, waitFor } from '@testing-library/react'
import GitHubBadge from '@/components/GitHubBadge'

const ok = (stargazers_count: number) =>
  vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ stargazers_count }) }))

afterEach(cleanup)

describe('GitHubBadge', () => {
  it('renders the star count once fetched, abbreviated', async () => {
    vi.stubGlobal('fetch', ok(1084))
    render(<GitHubBadge />)

    expect(await screen.findByText('1.1K')).toBeTruthy()
    expect(screen.getByRole('link').getAttribute('aria-label')).toBe(
      'View this project on GitHub, 1,084 stars',
    )
  })

  it('still renders the link when the request fails', async () => {
    // The default stub in test-setup rejects.
    render(<GitHubBadge />)

    const link = screen.getByRole('link')
    expect(link.getAttribute('href')).toBe('https://github.com/alfg/ffmpeg-commander')
    await waitFor(() => expect(link.getAttribute('aria-label')).toBe('View this project on GitHub'))
    expect(screen.getByText('Star')).toBeTruthy()
  })

  it('renders the link when GitHub rate limits the request', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: false, status: 403 })))
    render(<GitHubBadge />)

    await waitFor(() =>
      expect(screen.getByRole('link').getAttribute('aria-label')).toBe(
        'View this project on GitHub',
      ),
    )
  })

  it('caches the count so a second mount makes no request', async () => {
    const fetchOk = ok(1084)
    vi.stubGlobal('fetch', fetchOk)

    const first = render(<GitHubBadge />)
    await screen.findByText('1.1K')
    expect(fetchOk).toHaveBeenCalledTimes(1)
    first.unmount()

    render(<GitHubBadge />)
    expect(screen.getByText('1.1K')).toBeTruthy()
    expect(fetchOk).toHaveBeenCalledTimes(1)
  })

  it('refetches once the cache has expired', async () => {
    localStorage.setItem(
      'gh-stars',
      JSON.stringify({ count: 900, at: Date.now() - 7 * 60 * 60 * 1000 }),
    )
    const fetchOk = ok(1084)
    vi.stubGlobal('fetch', fetchOk)

    render(<GitHubBadge />)

    expect(await screen.findByText('1.1K')).toBeTruthy()
    expect(fetchOk).toHaveBeenCalledTimes(1)
  })

  it('ignores a malformed response rather than rendering NaN', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({}) })))
    render(<GitHubBadge />)

    await waitFor(() =>
      expect(screen.getByRole('link').getAttribute('aria-label')).toBe(
        'View this project on GitHub',
      ),
    )
    expect(screen.queryByText(/NaN/)).toBeNull()
  })
})
