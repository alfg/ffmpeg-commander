import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Banner from '@/components/Banner'

afterEach(cleanup)

describe('Banner', () => {
  it('links to video-commander with the referral tag', () => {
    render(<Banner />)
    expect(screen.getByRole('link', { name: 'Download' }).getAttribute('href')).toBe(
      'https://video-commander.com?ref=ffmpeg-commander',
    )
  })

  it('names the friction, what the product does, and that it is free', () => {
    render(<Banner />)
    expect(document.body.textContent).toContain('Skip the terminal')
    expect(document.body.textContent).toContain('Video Commander')
    expect(document.body.textContent).toContain('free for personal use')
  })

  it('offers a button, not just an inline link', () => {
    render(<Banner />)
    const cta = screen.getByRole('link', { name: 'Download' })
    expect(cta.getAttribute('href')).toBe('https://video-commander.com?ref=ffmpeg-commander')
    expect(cta.getAttribute('target')).toBe('_blank')
  })

  it('lets a dismissal lapse rather than closing the funnel forever', async () => {
    const user = userEvent.setup()
    const first = render(<Banner />)
    await user.click(screen.getByLabelText('Dismiss'))
    first.unmount()

    // Still dismissed today.
    const second = render(<Banner />)
    expect(screen.queryByRole('link')).toBeNull()
    second.unmount()

    // Back after the window passes.
    localStorage.setItem('banner-dismissed', String(Date.now() - 31 * 24 * 60 * 60 * 1000))
    render(<Banner />)
    expect(screen.getByRole('link', { name: 'Download' })).toBeTruthy()
  })

  it('stays dismissed across mounts', async () => {
    const user = userEvent.setup()
    const first = render(<Banner />)
    await user.click(screen.getByLabelText('Dismiss'))
    expect(screen.queryByRole('link')).toBeNull()
    first.unmount()

    render(<Banner />)
    expect(screen.queryByRole('link')).toBeNull()
  })
})
