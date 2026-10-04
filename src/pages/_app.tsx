import SessionProvider from '@/context/providers/SessionProvider'
import { ThemeProvider } from '@/context/providers/ThemeProvider'
import AppShell from '@/features/AppShell'

export default function App() {
  return (
    <ThemeProvider>
      <SessionProvider>
        <AppShell />
      </SessionProvider>
    </ThemeProvider>
  )
}
