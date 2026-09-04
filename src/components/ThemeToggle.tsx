import { useTheme } from '@/hooks/useTheme'
import type { Theme } from '@/lib/theme'

const iconProps = {
  width: 15,
  height: 15,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

const options: { value: Theme; label: string; icon: React.ReactNode }[] = [
  {
    value: 'light',
    label: 'Light',
    icon: (
      <svg {...iconProps}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </svg>
    ),
  },
  {
    value: 'system',
    label: 'System',
    icon: (
      <svg {...iconProps}>
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8m-4-4v4" />
      </svg>
    ),
  },
  {
    value: 'dark',
    label: 'Dark',
    icon: (
      <svg {...iconProps}>
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
      </svg>
    ),
  },
]

/**
 * Three-state control rather than a two-state switch: "system" has to be
 * reachable, otherwise a first-time visitor is stuck with whichever of the two
 * we guessed and can never hand the choice back to their OS.
 */
export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div
      role="radiogroup"
      aria-label="Colour theme"
      className="flex items-center gap-0.5 rounded-md border border-white/15 bg-white/5 p-0.5"
    >
      {options.map((option) => {
        const selected = theme === option.value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={option.label}
            title={option.label}
            onClick={() => setTheme(option.value)}
            className={[
              'rounded px-1 py-1 transition-colors sm:px-1.5',
              'focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:outline-none',
              selected ? 'bg-white/15 text-chrome-fg' : 'text-chrome-fg/55 hover:text-chrome-fg',
            ].join(' ')}
          >
            {option.icon}
          </button>
        )
      })}
    </div>
  )
}
