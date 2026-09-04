import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import App from '@/App'

afterEach(cleanup)

// The page is almost entirely form controls, so the handful of indexable
// elements are easy to delete by accident during a refactor.
describe('page copy', () => {
  it('has exactly one h1, naming what the tool does', () => {
    render(<App />)
    const h1s = screen.getAllByRole('heading', { level: 1 })
    expect(h1s).toHaveLength(1)
    expect(h1s[0].textContent).toContain('FFmpeg Command Generator')
  })

  it('keeps the descriptive prose', () => {
    render(<App />)
    expect(screen.getByText(/without memorizing every flag/)).toBeTruthy()
    expect(screen.getByText('What You Can Configure')).toBeTruthy()
    expect(screen.getByText(/H.264 and VP9 presets/)).toBeTruthy()
  })

  it('keeps the collapsed copy in the DOM so it is still indexed', () => {
    render(<App />)
    // A <details> summary hides its content visually, but it is rendered and
    // crawlable. Losing that distinction would quietly cost the page its text.
    const details = screen.getByText('What You Can Configure').closest('details')
    expect(details).toBeTruthy()
    expect(details!.textContent).toContain('deinterlacing and denoise')
    expect(details!.open).toBe(false)
  })
})
