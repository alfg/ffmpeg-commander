import { describe, it, expect, afterEach, vi } from 'vitest'
import { host, parseAddress, writeAddress, wsUri } from '@/lib/ffmpegd'

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

describe('parseAddress', () => {
  it.each([
    ['mybox:9000', 'http://mybox:9000'],
    ['  mybox:9000  ', 'http://mybox:9000'],
    ['192.168.1.20:8080', 'http://192.168.1.20:8080'],
    ['http://mybox:9000/', 'http://mybox:9000'],
    ['https://ffmpegd.example.com/some/path', 'https://ffmpegd.example.com'],
    ['ws://mybox:9000/ws', 'http://mybox:9000'],
    ['wss://mybox/ws', 'https://mybox'],
  ])('reads %j as %s', (input, expected) => {
    expect(parseAddress(input)).toBe(expected)
  })

  it.each(['', '   ', 'ftp://mybox:21', 'http://', 'my box:9000'])('rejects %j', (input) => {
    expect(parseAddress(input)).toBeNull()
  })
})

describe('a saved daemon address', () => {
  it('drives both the file endpoint and the socket', () => {
    at('https://ffmpeg-commander.com/')
    writeAddress('https://mybox:9443')
    expect(host()).toBe('https://mybox:9443')
    expect(wsUri()).toBe('wss://mybox:9443/ws')
  })

  it('replaces a stale ws_uri override', () => {
    at('https://ffmpeg-commander.com/')
    localStorage.setItem('ws_uri', 'ws://old:1/ws')
    writeAddress('http://mybox:9000')
    expect(wsUri()).toBe('ws://mybox:9000/ws')
  })

  it('falls back to the default once cleared', () => {
    at('https://ffmpeg-commander.com/')
    writeAddress('http://mybox:9000')
    writeAddress(null)
    expect(host()).toBe('http://localhost:8080')
    expect(wsUri()).toBe('ws://localhost:8080/ws')
  })
})
