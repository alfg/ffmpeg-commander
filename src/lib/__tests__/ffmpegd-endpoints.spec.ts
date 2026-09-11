import { describe, it, expect, afterEach, vi } from 'vitest'
import { host, wsUri } from '@/lib/ffmpegd'

// Where the client looks for the daemon. jsdom's location cannot be navigated,
// so swap window.location for a URL-shaped stand-in per test.
const at = (href: string) => {
  vi.stubGlobal('location', new URL(href))
}

afterEach(() => {
  vi.unstubAllGlobals()
  localStorage.clear()
})

describe('ffmpegd endpoints', () => {
  it('uses the daemon on the visitor machine from the deployed site', () => {
    at('https://ffmpeg-commander.com/?video.codec=x265')
    expect(host()).toBe('http://localhost:8080')
    expect(wsUri()).toBe('ws://localhost:8080/ws')
  })

  it('uses its own origin on localhost, where the dev server proxies to the daemon', () => {
    at('http://localhost:5173/')
    expect(host()).toBe('http://localhost:5173')
    expect(wsUri()).toBe('ws://localhost:5173/ws')
  })

  it('treats 127.0.0.1 as local too', () => {
    at('http://127.0.0.1:5173/')
    expect(wsUri()).toBe('ws://127.0.0.1:5173/ws')
  })

  it('prefers endpoints saved in localStorage', () => {
    at('https://ffmpeg-commander.com/')
    localStorage.setItem('host', 'http://mybox:9000')
    localStorage.setItem('ws_uri', 'ws://mybox:9000/ws')
    expect(host()).toBe('http://mybox:9000')
    expect(wsUri()).toBe('ws://mybox:9000/ws')
  })
})
