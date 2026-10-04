import { createContext } from 'react'
import type { Theme, ThemeBaseColors } from '@/models/app/theme'

export interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
  lightColors: ThemeBaseColors
  darkColors: ThemeBaseColors
  palette: (mode: Theme) => ThemeBaseColors
  setColor: (mode: Theme, key: keyof ThemeBaseColors, value: string) => void
  resetMode: (mode: Theme) => void
  resetAll: () => void
}

export const ThemeContext = createContext<ThemeContextValue | undefined>(
  undefined
)
