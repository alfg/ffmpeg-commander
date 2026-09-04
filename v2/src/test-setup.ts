import { afterEach, beforeEach, vi } from 'vitest'

// No test should reach the network. Anything that calls fetch without stubbing
// it deliberately gets a rejection, which is the same path a real outage takes.
beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn(() => Promise.reject(new Error('network disabled in tests'))),
  )
  localStorage.clear()
})

afterEach(() => {
  vi.unstubAllGlobals()
})
