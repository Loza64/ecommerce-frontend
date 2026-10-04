import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { ThemeContext } from '../ThemeContext'
import {
  DEFAULT_DARK_COLORS,
  DEFAULT_LIGHT_COLORS,
  buildThemeBaseVars,
  type Theme,
  type ThemeBaseColors,
} from '@/models/app/theme'
import { normalizeHex } from '@/lib/color'

const THEME_STORAGE_KEY = 'theme'
const COLORS_STORAGE_KEY = 'theme-colors'

interface StoredPalettes {
  light: ThemeBaseColors
  dark: ThemeBaseColors
}

function getInitialTheme(): Theme {
  const stored = localStorage.getItem(THEME_STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') {
    return stored
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

function loadStoredPalettes(): StoredPalettes {
  try {
    const raw = localStorage.getItem(COLORS_STORAGE_KEY)
    if (!raw) {
      return {
        light: { ...DEFAULT_LIGHT_COLORS },
        dark: { ...DEFAULT_DARK_COLORS },
      }
    }
    const parsed = JSON.parse(raw) as Partial<StoredPalettes>
    return {
      light: { ...DEFAULT_LIGHT_COLORS, ...parsed.light },
      dark: { ...DEFAULT_DARK_COLORS, ...parsed.dark },
    }
  } catch {
    return {
      light: { ...DEFAULT_LIGHT_COLORS },
      dark: { ...DEFAULT_DARK_COLORS },
    }
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme)
  const [initial] = useState(loadStoredPalettes)
  const [lightColors, setLightColors] = useState<ThemeBaseColors>(initial.light)
  const [darkColors, setDarkColors] = useState<ThemeBaseColors>(initial.dark)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  useEffect(() => {
    const base = theme === 'dark' ? darkColors : lightColors
    const vars = buildThemeBaseVars(base)
    const root = document.documentElement.style
    for (const [name, value] of Object.entries(vars)) {
      root.setProperty(name, value)
    }
  }, [theme, lightColors, darkColors])

  useEffect(() => {
    const payload: StoredPalettes = { light: lightColors, dark: darkColors }
    localStorage.setItem(COLORS_STORAGE_KEY, JSON.stringify(payload))
  }, [lightColors, darkColors])

  const toggleTheme = useCallback(() => {
    setThemeState((current) => (current === 'light' ? 'dark' : 'light'))
  }, [])

  const palette = useCallback(
    (mode: Theme) => (mode === 'dark' ? darkColors : lightColors),
    [lightColors, darkColors]
  )

  const setColor = useCallback(
    (mode: Theme, key: keyof ThemeBaseColors, value: string) => {
      const fallback =
        mode === 'dark' ? DEFAULT_DARK_COLORS[key] : DEFAULT_LIGHT_COLORS[key]
      const hex = normalizeHex(value, fallback)
      const setter = mode === 'dark' ? setDarkColors : setLightColors
      setter((current) => ({ ...current, [key]: hex }))
    },
    []
  )

  const resetMode = useCallback((mode: Theme) => {
    if (mode === 'dark') {
      setDarkColors({ ...DEFAULT_DARK_COLORS })
    } else {
      setLightColors({ ...DEFAULT_LIGHT_COLORS })
    }
  }, [])

  const resetAll = useCallback(() => {
    setLightColors({ ...DEFAULT_LIGHT_COLORS })
    setDarkColors({ ...DEFAULT_DARK_COLORS })
  }, [])

  const value = useMemo(
    () => ({
      theme,
      toggleTheme,
      setTheme: setThemeState,
      lightColors,
      darkColors,
      palette,
      setColor,
      resetMode,
      resetAll,
    }),
    [
      theme,
      toggleTheme,
      lightColors,
      darkColors,
      palette,
      setColor,
      resetMode,
      resetAll,
    ]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
