import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '@/App'
import { toJsonString } from '@/lib/json'
import createDefaultForm from '@/lib/defaults'
import type { IFFMpegOptionsForm } from '@/lib/types'

const form = () => createDefaultForm() as unknown as IFFMpegOptionsForm

afterEach(cleanup)

describe('toJsonString', () => {
  it('drops nulls so the set values are visible', () => {
    const json = JSON.parse(toJsonString(form()))
    // bitrate and the clip times are null on a default form.
    expect(json.video).not.toHaveProperty('bitrate')
    expect(json.format).not.toHaveProperty('startTime')
    expect(json.video.codec).toBe('libx264')
  })

  it('keeps values that are falsy but meaningful', () => {
    const json = JSON.parse(toJsonString(form()))
    // faststart is false, not absent; the daemon distinguishes the two.
    expect(json.video.faststart).toBe(false)
    expect(json.filter.deband).toBe(false)
  })

  it('is the ffmpegd payload, not the form', () => {
    const json = JSON.parse(toJsonString(form()))
    // Codec slugs are resolved to encoder names on the way out.
    expect(json.video.codec).toBe('libx264')
    expect(json.filter.contrast).toBe('1')
  })
})

describe('JSON viewer', () => {
  it('is hidden until asked for, and toggles back', async () => {
    const user = userEvent.setup()
    render(<App />)
    expect(screen.queryByTestId('json')).toBeNull()

    await user.click(screen.getByRole('button', { name: 'Show JSON' }))
    expect(screen.getByTestId('json')).toBeTruthy()

    await user.click(screen.getByRole('button', { name: 'Hide JSON' }))
    expect(screen.queryByTestId('json')).toBeNull()
  })

  it('tracks the form as it changes', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Show JSON' }))
    expect(screen.getByTestId('json').textContent).toContain('libx264')

    await user.click(screen.getByRole('tab', { name: 'Video' }))
    await user.selectOptions(screen.getByLabelText('Codec'), 'x265')

    expect(screen.getByTestId('json').textContent).toContain('libx265')
  })
})
