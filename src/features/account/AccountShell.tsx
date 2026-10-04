import { NavLink, Outlet } from 'react-router-dom'
import {
  Package,
  Receipt,
  Ticket,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react'
import { RoutesEnum } from '@/enum/routes..app'
import { cn } from '@/lib/utils'

const TABS: { label: string; to: RoutesEnum; icon: LucideIcon }[] = [
  { label: 'Mis compras', to: RoutesEnum.MY_ORDERS, icon: Receipt },
  { label: 'Mis productos', to: RoutesEnum.MY_PRODUCTS, icon: Package },
  { label: 'Mis ventas', to: RoutesEnum.MY_SALES, icon: TrendingUp },
  { label: 'Mis cupones', to: RoutesEnum.MY_COUPONS, icon: Ticket },
]

export default function AccountShell() {
  return (
    <>
      <h1 className="m-0 mb-4 text-xl font-bold text-(--text)">Mi cuenta</h1>

      <nav
        className="mb-5 flex gap-1 overflow-x-auto border-b border-(--border)"
        aria-label="Secciones de la cuenta"
      >
        {TABS.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                '-mb-px inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-[13px] font-semibold whitespace-nowrap no-underline',
                isActive
                  ? 'border-(--primary) text-(--primary)'
                  : 'border-transparent text-(--text-muted) hover:text-(--text)'
              )
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      <Outlet />
    </>
  )
}
