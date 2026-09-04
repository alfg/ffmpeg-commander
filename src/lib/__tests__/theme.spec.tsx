import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ThemeToggle from '@/components/ThemeToggle'
import { resolveTheme } from '@/lib/theme'

const isDark = () => document.documentElement.classList.contains('dark')

const stubSystemDark = (matches: boolean) =>
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({
      matches,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  )

afterEach(cleanup)

describe('resolveTheme', () => {
  it('follows the system preference when set to system', () => {
    stubSystemDark(true)
    expect(resolveTheme('system')).toBe('dark')
    stubSystemDark(false)
    expect(resolveTheme('system')).toBe('light')
  })

  it('ignores the system preference when set explicitly', () => {
    stubSystemDark(true)
    expect(resolveTheme('light')).toBe('light')
    stubSystemDark(false)
    expect(resolveTheme('dark')).toBe('dark')
  })
})

describe('ThemeToggle', () => {
  it('offers light, system and dark', () => {
    render(<ThemeToggle />)
    expect(screen.getAllByRole('radio').map((r) => r.getAttribute('aria-label'))).toEqual([
      'Light',
      'System',
      'Dark',
    ])
  })

  it('defaults to system, so a first visit follows the OS', () => {
    render(<ThemeToggle />)
    expect(screen.getByRole('radio', { name: 'System' }).getAttribute('aria-checked')).toBe('true')
  })

  it('applies the class to the document when dark is chosen', async () => {
    const user = userEvent.setup()
    render(<ThemeToggle />)
    expect(isDark()).toBe(false)

    await user.click(screen.getByRole('radio', { name: 'Dark' }))

    expect(isDark()).toBe(true)
    expect(screen.getByRole('radio', { name: 'Dark' }).getAttribute('aria-checked')).toBe('true')
  })

  it('goes back to light', async () => {
    const user = userEvent.setup()
    render(<ThemeToggle />)

    await user.click(screen.getByRole('radio', { name: 'Dark' }))
    await user.click(screen.getByRole('radio', { name: 'Light' }))

    expect(isDark()).toBe(false)
  })

  it('remembers the choice across mounts', async () => {
    const user = userEvent.setup()
    const first = render(<ThemeToggle />)
    await user.click(screen.getByRole('radio', { name: 'Dark' }))
    first.unmount()

    render(<ThemeToggle />)
    expect(screen.getByRole('radio', { name: 'Dark' }).getAttribute('aria-checked')).toBe('true')
    expect(isDark()).toBe(true)
  })

  it('honours a dark system preference when left on system', () => {
    stubSystemDark(true)
    render(<ThemeToggle />)
    expect(isDark()).toBe(true)
  })

  it('survives storage being unavailable', async () => {
    const user = userEvent.setup()
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    render(<ThemeToggle />)

    await user.click(screen.getByRole('radio', { name: 'Dark' }))

    // The choice still applies for this page even though it cannot be saved.
    expect(isDark()).toBe(true)
    vi.restoreAllMocks()
  })
})
