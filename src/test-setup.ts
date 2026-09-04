import { afterEach, beforeEach, vi } from 'vitest'

// No test should reach the network. Anything that calls fetch without stubbing
// it deliberately gets a rejection, which is the same path a real outage takes.
beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn(() => Promise.reject(new Error('network disabled in tests'))),
  )
  localStorage.clear()
  document.documentElement.classList.remove('dark')
  // The app mirrors form state into the query string, so a test that changes
  // the form leaves it there for the next one to read back on mount.
  window.history.replaceState(null, '', '/')

  // jsdom ships no matchMedia. Default to a light system preference so theme
  // behaviour is exercised rather than skipped; individual tests can restub it.
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
})
