import { useCallback, useEffect, useState } from 'react'
import { applyTheme, readStoredTheme, THEME_KEY, type Theme } from '@/lib/theme'

/**
 * Owns the light/dark/system preference.
 *
 * "system" is the default and stays live: if the OS flips while the page is
 * open, the page follows. An explicit choice wins until it is changed back.
 */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(readStoredTheme)

  useEffect(() => {
    applyTheme(theme)
    if (theme !== 'system') return

    // matchMedia is absent in some non-browser environments (jsdom among them),
    // in which case "system" simply resolves once and does not track changes.
    const media = window.matchMedia?.('(prefers-color-scheme: dark)')
    if (!media) return

    const onChange = () => applyTheme('system')
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [theme])

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next)
    try {
      localStorage.setItem(THEME_KEY, next)
    } catch {
      // Storage blocked; the choice holds for this page only.
    }
  }, [])

  return { theme, setTheme }
}
