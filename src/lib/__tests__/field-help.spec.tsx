import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen, cleanup, within, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '@/App'
import Field from '@/components/ui/Field'
import fieldHelp from '@/lib/fieldHelp'

afterEach(cleanup)

const openTab = (user: ReturnType<typeof userEvent.setup>, name: string) =>
  user.click(screen.getByRole('tab', { name }))

// Every control id in the editor. Only the active tab is mounted, so visit each
// one, with every conditional control switched on: clip times, custom size and
// fit, the CRF slider, the custom audio bit rate, and the daemon address, plus
// the orientation that replaces width and height for the preset sizes.
async function collectControlIds() {
  window.history.replaceState(
    null,
    '',
    '/?format.clip=true&video.size=custom&video.pass=crf&audio.quality=custom',
  )
  localStorage.setItem('ffmpegd', 'true')
  vi.stubGlobal('WebSocket', class {
    close() {}
  })
  const user = userEvent.setup()
  render(<App />)

  const ids = new Set(['io-input', 'io-output'])
  const collect = () =>
    document.querySelectorAll('input[id], select[id], textarea[id]').forEach((el) => ids.add(el.id))
  for (const tab of ['Format', 'Video', 'Audio', 'Filters', 'Options']) {
    await openTab(user, tab)
    collect()
    // Orientation only shows for the preset sizes, not Custom.
    if (tab === 'Video') {
      await user.selectOptions(screen.getByLabelText('Size'), '1280')
      collect()
    }
  }
  return ids
}

describe('field help coverage', () => {
  it('has an entry only for controls that exist', async () => {
    const ids = await collectControlIds()
    expect(Object.keys(fieldHelp).filter((id) => !ids.has(id))).toEqual([])
  })

  it('explains every Format, Video, Audio and Filters control', async () => {
    const controls = [...(await collectControlIds())].filter((id) =>
      /^(io|format|video|audio|filters)-/.test(id))
    expect(controls.length).toBeGreaterThan(40)
    expect(controls.filter((id) => !fieldHelp[id])).toEqual([])
  })
})

describe('help popover', () => {
  it('opens on hover with the explanation and the flag, and closes on leave', async () => {
    const user = userEvent.setup()
    render(<App />)
    await openTab(user, 'Video')

    const button = screen.getByRole('button', { name: 'About Encoder preset' })
    expect(screen.queryByRole('tooltip')).toBeNull()

    await user.hover(button)
    const tip = screen.getByRole('tooltip')
    expect(tip.textContent).toContain('Trades encoding speed for compression')
    expect(within(tip).getByText('-preset')).toBeTruthy()
    expect(button.getAttribute('aria-describedby')).toBe(tip.id)

    await user.unhover(button)
    expect(screen.queryByRole('tooltip')).toBeNull()
  })

  it('explains the option currently selected', async () => {
    const user = userEvent.setup()
    render(<App />)
    await openTab(user, 'Video')

    await user.selectOptions(screen.getByLabelText('Tune'), 'animation')
    await user.hover(screen.getByRole('button', { name: 'About Tune' }))

    expect(screen.getByRole('tooltip').textContent).toContain('Animation: Cartoons and anime')
  })

  it('opens from the keyboard and closes on Escape', async () => {
    const user = userEvent.setup()
    render(<App />)
    await openTab(user, 'Filters')

    act(() => screen.getByRole('button', { name: 'About Deinterlace' }).focus())
    expect(screen.getByRole('tooltip').textContent).toContain('interlaced video')

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('tooltip')).toBeNull()
  })

  it('stays open when tapped, until focus moves on', async () => {
    const user = userEvent.setup()
    render(<App />)
    await openTab(user, 'Audio')

    await user.pointer({ keys: '[TouchA]', target: screen.getByRole('button', { name: 'About Sample rate' }) })
    expect(screen.getByRole('tooltip').textContent).toContain('48k is standard for video')

    await user.click(screen.getByLabelText('Sample rate'))
    expect(screen.queryByRole('tooltip')).toBeNull()
  })

  it('explains the sliders too', async () => {
    const user = userEvent.setup()
    render(<App />)
    await openTab(user, 'Filters')

    await user.hover(screen.getByRole('button', { name: 'About Gamma' }))
    expect(screen.getByRole('tooltip').textContent).toContain('10 is neutral')
  })

  it('renders no button for a control without help', () => {
    render(
      <Field label="Mystery" htmlFor="no-such-help">
        <input id="no-such-help" />
      </Field>,
    )
    expect(screen.queryByRole('button')).toBeNull()
  })
})
