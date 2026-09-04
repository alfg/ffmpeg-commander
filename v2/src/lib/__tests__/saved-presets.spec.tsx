import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '@/App'
import storage from '@/lib/storage'

const command = () =>
  screen.getByTestId('command').textContent?.replace(/\s+/g, ' ').trim() ?? ''

const openTab = (user: ReturnType<typeof userEvent.setup>, name: string) =>
  user.click(screen.getByRole('tab', { name }))

const presetSelect = () => screen.getByLabelText<HTMLSelectElement>('Preset')

const savedGroup = () =>
  Array.from(presetSelect().querySelectorAll('optgroup')).find(
    (g) => g.label === 'Saved (Local Storage)',
  )

/** Pick a non-default codec so the form is distinguishable from the defaults. */
const makeItDistinctive = async (user: ReturnType<typeof userEvent.setup>) => {
  await openTab(user, 'Video')
  await user.selectOptions(screen.getByLabelText('Codec'), 'x265')
  await openTab(user, 'Format')
}

afterEach(cleanup)

describe('saved presets', () => {
  it('has no saved entries and no save-related controls to start', () => {
    render(<App />)
    expect(savedGroup()?.children.length ?? 0).toBe(0)
    expect(screen.getByRole('button', { name: 'Save preset' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Save as new' })).toBeNull()
    expect(screen.queryByLabelText('Preset name')).toBeNull()
  })

  it('saves the current form and selects it', async () => {
    const user = userEvent.setup()
    render(<App />)
    await makeItDistinctive(user)

    await user.click(screen.getByRole('button', { name: 'Save preset' }))

    expect(savedGroup()?.children.length).toBe(1)
    expect(presetSelect().value).toMatch(/^preset-/)
    expect(screen.getByLabelText('Preset name')).toBeTruthy()
    expect(storage.getItems('presets')).toHaveLength(1)
  })

  it('reloads a saved preset after switching away', async () => {
    const user = userEvent.setup()
    render(<App />)
    await makeItDistinctive(user)
    await user.click(screen.getByRole('button', { name: 'Save preset' }))
    const savedId = presetSelect().value

    await user.selectOptions(presetSelect(), 'custom')
    expect(command()).toContain('libx264')

    await user.selectOptions(presetSelect(), savedId)
    expect(command()).toContain('libx265')
  })

  it('renaming and saving updates the entry in place', async () => {
    const user = userEvent.setup()
    render(<App />)
    await makeItDistinctive(user)
    await user.click(screen.getByRole('button', { name: 'Save preset' }))

    const name = screen.getByLabelText('Preset name')
    await user.clear(name)
    await user.type(name, 'My x265')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(storage.getItems('presets')).toHaveLength(1)
    expect(within(savedGroup()!).getByText('My x265')).toBeTruthy()
  })

  it('"save as new" adds a second entry rather than overwriting', async () => {
    const user = userEvent.setup()
    render(<App />)
    await makeItDistinctive(user)
    await user.click(screen.getByRole('button', { name: 'Save preset' }))

    await user.click(screen.getByRole('button', { name: 'Save as new' }))

    expect(storage.getItems('presets')).toHaveLength(2)
    expect(savedGroup()?.children.length).toBe(2)
  })

  it('deleting asks first, then removes the preset', async () => {
    const user = userEvent.setup()
    render(<App />)
    await makeItDistinctive(user)
    await user.click(screen.getByRole('button', { name: 'Save preset' }))

    await user.click(screen.getByRole('button', { name: 'Delete' }))
    expect(screen.getByText('Delete preset?')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(storage.getItems('presets')).toHaveLength(1)

    await user.click(screen.getByRole('button', { name: 'Delete' }))
    await user.click(screen.getByRole('button', { name: 'Delete' }))

    expect(storage.getItems('presets')).toHaveLength(0)
    expect(presetSelect().value).toBe('custom')
    expect(command()).toContain('libx264')
  })

  it('survives a reload, which is the whole point of saving', async () => {
    const user = userEvent.setup()
    const first = render(<App />)
    await makeItDistinctive(user)
    await user.click(screen.getByRole('button', { name: 'Save preset' }))
    const savedId = presetSelect().value
    first.unmount()

    render(<App />)
    expect(savedGroup()?.children.length).toBe(1)
    await user.selectOptions(presetSelect(), savedId)
    expect(command()).toContain('libx265')
  })

  it('a bundled preset is not treated as one of yours', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.selectOptions(presetSelect(), 'h264-fast-720p30')

    expect(screen.queryByLabelText('Preset name')).toBeNull()
    expect(screen.queryByRole('button', { name: 'Delete' })).toBeNull()
    expect(command()).toContain('-crf 21')
  })

  it('loading a preset does not leave the previous one underneath', async () => {
    const user = userEvent.setup()
    render(<App />)

    // A preset that sets a bitrate, then one that does not.
    await user.selectOptions(presetSelect(), 'h264-high-profile-level-4.2-6000-1080p')
    expect(command()).toContain('-b:v 6000K')

    await user.selectOptions(presetSelect(), 'h264-fast-720p30')
    expect(command()).not.toContain('-b:v')
  })
})
