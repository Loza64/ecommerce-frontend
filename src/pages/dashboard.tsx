import { useMemo, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { LogOut, Menu } from 'lucide-react'
import { RequireAuth } from '@/components/guards/RequireAuth'
import { SidebarMenu } from '@/components/ui/SidebarMenu'
import { useSession } from '@/hooks/useSession'
import { DASHBOARD_MENU, type MenuItem } from '@/config/dashboardMenu'
import { RoutesEnum } from '@/enum/routes..app'
import { cn } from '@/lib/utils'

function findActiveLabel(
  items: MenuItem[],
  currentPath: string
): string | undefined {
  for (const item of items) {
    if (item.route && currentPath.startsWith(item.route)) {
      return item.label
    }
    if (item.children) {
      const childLabel = findActiveLabel(item.children, currentPath)
      if (childLabel) {
        return childLabel
      }
    }
  }
  return undefined
}

function DashboardLayout() {
  const { profile, logout } = useSession()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const pageTitle = useMemo(
    () => findActiveLabel(DASHBOARD_MENU, location.pathname) ?? 'Dashboard',
    [location.pathname]
  )

  const handleLogout = async () => {
    await logout()
    navigate(RoutesEnum.LOGIN)
  }

  return (
    <div
      className={cn(
        'relative flex h-dvh w-full overflow-hidden bg-[var(--background)]',
        sidebarOpen && 'sidebar-is-open'
      )}
    >
      {/* 1. OVERLAY  */}
      <div
        className="sidebar-overlay fixed inset-0 z-40 bg-black/50 min-[901px]:hidden"
        onClick={() => setSidebarOpen(false)}
      />

      {/* 2. SIDEBAR */}
      <aside className="app-sidebar flex flex-col bg-[var(--sidebar-bg)] px-3 py-4 text-[var(--sidebar-text)]">
        <div className="flex items-center gap-2.5 px-2 pt-2 pb-5">
          <span className="inline-flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--primary)] text-sm font-bold text-[var(--primary-contrast)]">
            A
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-[var(--sidebar-text-active)]">
            Admin Panel
          </span>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto">
          <SidebarMenu
            items={DASHBOARD_MENU}
            currentPath={location.pathname}
            onNavigate={() => setSidebarOpen(false)}
          />
        </nav>

        <button
          type="button"
          className="mt-auto flex items-center gap-2.5 rounded-[var(--radius-sm)] border-none bg-transparent px-3 py-2.5 text-left text-sm font-medium text-[var(--sidebar-text)] hover:bg-white/[0.06] hover:text-[var(--sidebar-text-active)]"
          onClick={handleLogout}
        >
          <LogOut size={18} />
          <span>Cerrar sesión</span>
        </button>
      </aside>

      {/* 3. CONTENIDO PRINCIPAL */}
      <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex flex-shrink-0 items-center gap-3 border-b border-[var(--border)] bg-[var(--surface)] px-6 py-3.5">
          <button
            type="button"
            className="hidden h-[34px] w-[34px] items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] max-[900px]:inline-flex"
            onClick={() => setSidebarOpen((open) => !open)}
            aria-label="Abrir menú"
          >
            <Menu size={20} />
          </button>

          <h1 className="m-0 flex-1 text-[17px] font-semibold">{pageTitle}</h1>

          {profile && (
            <div className="flex items-center gap-2">
              <span className="inline-flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[var(--primary-soft)] text-[13px] font-bold text-[var(--primary)]">
                {profile.username.charAt(0).toUpperCase()}
              </span>
              <span className="text-[13px] font-medium text-[var(--text-muted)] max-[560px]:hidden">
                {profile.username}
              </span>
            </div>
          )}
        </header>

        <main className="w-full flex-1 overflow-y-auto p-6 max-[900px]:p-4">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default function Dashboard() {
  return (
    <RequireAuth>
      <DashboardLayout />
    </RequireAuth>
  )
}
