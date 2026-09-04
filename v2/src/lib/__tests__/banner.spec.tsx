import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Banner from '@/components/Banner'

afterEach(cleanup)

describe('Banner', () => {
  it('links to video-commander with the referral tag', () => {
    render(<Banner />)
    expect(screen.getByRole('link').getAttribute('href')).toBe(
      'https://video-commander.com?ref=ffmpeg-commander',
    )
  })

  it('names the friction, what the product does, and that it is free', () => {
    render(<Banner />)
    const link = screen.getByRole('link').textContent
    expect(link).toContain('Skip the terminal')
    expect(link).toContain('Video Commander runs the encode')
    expect(link).toContain('Free for personal use')
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
