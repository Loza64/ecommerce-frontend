import { Button } from '@/components/ui/Button'
import { useTheme } from '@/hooks/useTheme'
import { Moon, Sun } from 'lucide-react'
import { Outlet } from 'react-router-dom'

export default function AppShell() {
  const { theme, toggleTheme } = useTheme()

  return (
    <>
      <Outlet />
      <Button
        variant="icon"
        className="fixed right-5 bottom-5 z-200 shadow-[0_8px_20px_rgba(15,18,25,0.15)]"
        tooltip={
          theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'
        }
        onClick={toggleTheme}
      >
        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
      </Button>
    </>
  )
}
