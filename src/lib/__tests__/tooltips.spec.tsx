import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup, within, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CommandOutput from '@/components/CommandOutput'

const CMD = 'ffmpeg -i input.mp4 -c:v libx264 -vf "deband,yadif=1:-1:0" -c:a copy output.mp4'

// Each fragment is wrapped, so target the inner span that carries the handlers.
const token = (text: string) =>
  screen.getByText(text, { selector: 'span[data-fragment]' })

afterEach(cleanup)

describe('command tooltips', () => {
  it('shows a tooltip on hover, naming the flag and describing it', async () => {
    const user = userEvent.setup()
    render(<CommandOutput cmd={CMD} />)

    expect(screen.queryByRole('tooltip')).toBeNull()

    await user.hover(token('-c:v'))

    const tip = screen.getByRole('tooltip')
    expect(within(tip).getByText('-c:v')).toBeTruthy()
    expect(tip.textContent).toContain('Selects a video codec')
  })

  it('hides the tooltip when the pointer leaves', async () => {
    const user = userEvent.setup()
    render(<CommandOutput cmd={CMD} />)

    await user.hover(token('-i'))
    expect(screen.getByRole('tooltip')).toBeTruthy()

    await user.unhover(token('-i'))
    expect(screen.queryByRole('tooltip')).toBeNull()
  })

  it('shows nothing for a token with no description', async () => {
    const user = userEvent.setup()
    render(<CommandOutput cmd={CMD} />)

    await user.hover(token('input.mp4'))
    expect(screen.queryByRole('tooltip')).toBeNull()
  })

  it('describes each filter in a filtergraph separately', async () => {
    const user = userEvent.setup()
    render(<CommandOutput cmd={CMD} />)

    await user.hover(token('"deband'))
    expect(screen.getByRole('tooltip').textContent).toContain('band')

    await user.unhover(token('"deband'))
    await user.hover(token('yadif=1:-1:0"'))
    // Quotes are stripped from the title, as the Vue popover did.
    expect(within(screen.getByRole('tooltip')).getByText('yadif=1:-1:0')).toBeTruthy()
  })

  it('renders the authored markup in a description', async () => {
    const user = userEvent.setup()
    render(<CommandOutput cmd={CMD} />)

    await user.hover(token('-vf'))
    // The -vf tip contains <em>, <code> and a link.
    expect(screen.getByRole('tooltip').querySelector('a')).toBeTruthy()
  })

  it('opens on keyboard focus and closes on Escape', async () => {
    const user = userEvent.setup()
    render(<CommandOutput cmd={CMD} />)

    const el = token('-c:a')
    el.focus()
    // React listens on focusin; jsdom's .focus() does not always deliver it.
    fireEvent.focusIn(el)
    expect(screen.getByRole('tooltip')).toBeTruthy()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('tooltip')).toBeNull()
  })

  it('only makes describable tokens focusable', () => {
    render(<CommandOutput cmd={CMD} />)
    expect(token('-c:v').tabIndex).toBe(0)
    expect(token('input.mp4').tabIndex).toBe(-1)
  })

  it('keeps the displayed command faithful to the generated one', () => {
    render(<CommandOutput cmd={CMD} />)
    const shown = screen.getByTestId('command').textContent?.replace(/\s+/g, ' ').trim()
    // The filtergraph gains a space after its comma for hoverability; nothing else moves.
    expect(shown).toBe(CMD.replace('deband,yadif', 'deband, yadif'))
  })
})
