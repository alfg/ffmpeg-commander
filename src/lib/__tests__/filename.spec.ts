import { describe, it, expect } from 'vitest'
import { retargetExtension } from '@/lib/filename'

describe('retargetExtension', () => {
  it('swaps a plain extension', () => {
    expect(retargetExtension('output.mp4', 'mkv')).toBe('output.mkv')
  })

  it('only touches the trailing extension', () => {
    // String.replace would have produced "clip.mkv.mp4" here.
    expect(retargetExtension('clip.mp4.mp4', 'mkv')).toBe('clip.mp4.mkv')
    expect(retargetExtension('my.mp4.video.mp4', 'webm')).toBe('my.mp4.video.webm')
  })

  it('leaves a filename with no extension alone', () => {
    expect(retargetExtension('output', 'mkv')).toBe('output')
    expect(retargetExtension('', 'mkv')).toBe('')
  })

  it('leaves URL outputs alone rather than mangling them', () => {
    // extname is not path aware, so these would otherwise become "rtmp://a.mkv".
    expect(retargetExtension('rtmp://host.com/live/stream', 'mkv')).toBe(
      'rtmp://host.com/live/stream',
    )
    expect(retargetExtension('http://server.net:8080/out', 'webm')).toBe(
      'http://server.net:8080/out',
    )
  })

  it('leaves a dotted directory alone', () => {
    expect(retargetExtension('my.folder/output', 'mkv')).toBe('my.folder/output')
  })

  it('still retargets a file inside a dotted directory', () => {
    expect(retargetExtension('my.folder/output.mp4', 'mkv')).toBe('my.folder/output.mkv')
  })

  it('handles every container the app offers', () => {
    for (const c of ['mp4', 'mkv', 'webm', 'mpg', 'avi', 'ogv', 'flv', 'mp3', 'm4a', 'ogg', 'flac', 'wav']) {
      expect(retargetExtension('output.mp4', c)).toBe(`output.${c}`)
    }
  })
})
