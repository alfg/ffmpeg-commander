import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import Navbar from '@/components/Navbar'

afterEach(cleanup)

describe('Navbar', () => {
  it('is announced as the product name, not the shell prompt', () => {
    render(<Navbar />)
    // The wordmark reads "> ffmpeg-commander" with a caret; spelling that out
    // helps nobody, so the visual text is hidden and the link is labelled.
    const home = screen.getByRole('link', { name: 'FFmpeg Commander' })
    expect(home.getAttribute('href')).toBe('/')
  })

  it('renders the wordmark as a command', () => {
    render(<Navbar />)
    expect(screen.getByRole('link', { name: 'FFmpeg Commander' }).textContent).toContain(
      'ffmpeg-commander',
    )
  })

  it('keeps the GitHub badge in the same bar', () => {
    render(<Navbar />)
    expect(screen.getByRole('link', { name: /View this project on GitHub/ })).toBeTruthy()
  })
})
