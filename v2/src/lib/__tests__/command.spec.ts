import { describe, it, expect } from 'vitest'
import { parseCommand } from '@/lib/command'

describe('parseCommand', () => {
  it('splits a command into fragments and attaches descriptions', () => {
    const fragments = parseCommand('ffmpeg -i input.mp4 -c:v libx264 -c:a copy output.mp4')

    expect(fragments.map((f) => f.value)).toEqual([
      'ffmpeg', '-i', 'input.mp4', '-c:v', 'libx264', '-c:a', 'copy', 'output.mp4',
    ])
    expect(fragments[0].description).toBe('Command used to run FFmpeg.')
    expect(fragments[1].description).toBe('Input file.')
    // Values, as opposed to flags, have no tooltip of their own.
    expect(fragments[2].description).toBeUndefined()
    expect(fragments[7].description).toBeUndefined()
  })

  it('splits the -vf filtergraph into one fragment per filter', () => {
    const fragments = parseCommand('ffmpeg -i in.mp4 -vf "deband,yadif=1:-1:0" out.mp4')

    const vf = fragments.find((f) => f.value === '-vf')
    expect(vf?.description).toContain('filtergraph')
    expect(vf?.filters?.map((f) => f.value)).toEqual(['"deband', 'yadif=1:-1:0"'])
    expect(vf?.filters?.[0].description).toBeTruthy()
  })

  it('consumes the filtergraph argument rather than repeating it', () => {
    const fragments = parseCommand('ffmpeg -i in.mp4 -vf "deband" out.mp4')
    expect(fragments.map((f) => f.value)).toEqual(['ffmpeg', '-i', 'in.mp4', '-vf', 'out.mp4'])
  })

  it('matches filters on a prefix, so arguments do not defeat the lookup', () => {
    const fragments = parseCommand('ffmpeg -i in.mp4 -vf "scale=1920:-1" out.mp4')
    const scale = fragments.find((f) => f.value === '-vf')?.filters?.[0]
    // A lone filter keeps both quotes; only a comma split strips the inner one.
    expect(scale?.value).toBe('"scale=1920:-1"')
    expect(scale?.description).toBeTruthy()
  })

  it('handles -af the same way', () => {
    const fragments = parseCommand('ffmpeg -i in.mp4 -af "volume=0.5" out.mp4')
    const af = fragments.find((f) => f.value === '-af')
    expect(af?.filters?.map((f) => f.value)).toEqual(['"volume=0.5"'])
  })

  it('survives a trailing -vf with no argument', () => {
    expect(() => parseCommand('ffmpeg -vf')).not.toThrow()
    expect(parseCommand('ffmpeg -vf').at(-1)?.filters).toEqual([{ value: '' }])
  })

  it('describes both flags of a two-pass command', () => {
    const fragments = parseCommand(
      'ffmpeg -i in.mp4 -b:v 3000k -pass 1 /dev/null && ffmpeg -i in.mp4 -pass 2 out.mp4',
    )
    const passes = fragments.filter((f) => f.value === '-pass')
    expect(passes).toHaveLength(2)
    passes.forEach((p) => expect(p.description).toContain('two-pass'))
  })
})
