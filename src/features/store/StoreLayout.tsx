import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  LayoutDashboard,
  LogOut,
  Package,
  Receipt,
  Search,
  ShoppingCart,
  Store,
  TrendingUp,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useSession } from '@/hooks/useSession'
import { useCart } from '@/hooks/useCart'
import { RoutesEnum } from '@/enum/routes..app'
import { roles } from '@/enum/role'

const menuLink =
  'flex items-center gap-2.5 rounded-(--radius-sm) px-3 py-2 text-[13px] font-medium text-(--text) no-underline hover:bg-(--surface-muted)'

function AccountMenu() {
  const { profile, logout } = useSession()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) {
      return
    }
    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  if (!profile) {
    return null
  }

  const isAdmin =
    profile.role?.name === roles.admin ||
    profile.role?.name === roles.super_admin

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-full border border-(--border) bg-(--surface) py-1 pr-3 pl-1 text-[13px] font-medium text-(--text) hover:bg-(--surface-muted)"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-(--primary-soft) text-[13px] font-bold text-(--primary)">
          {profile.username.charAt(0).toUpperCase()}
        </span>
        <span className="max-[560px]:hidden">{profile.username}</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-40 mt-2 flex w-56 flex-col gap-0.5 rounded-(--radius-md) border border-(--border) bg-(--surface) p-1.5 shadow-(--select-shadow)"
        >
          <Link
            to={RoutesEnum.MY_ORDERS}
            className={menuLink}
            onClick={() => setOpen(false)}
          >
            <Receipt size={16} />
            Mis compras
          </Link>
          <Link
            to={RoutesEnum.MY_PRODUCTS}
            className={menuLink}
            onClick={() => setOpen(false)}
          >
            <Package size={16} />
            Mis productos
          </Link>
          <Link
            to={RoutesEnum.MY_SALES}
            className={menuLink}
            onClick={() => setOpen(false)}
          >
            <TrendingUp size={16} />
            Mis ventas
          </Link>
          {isAdmin && (
            <Link
              to={RoutesEnum.DASHBOARD}
              className={menuLink}
              onClick={() => setOpen(false)}
            >
              <LayoutDashboard size={16} />
              Panel de administración
            </Link>
          )}
          <hr className="my-1 border-0 border-t border-(--border)" />
          <button
            type="button"
            className={`${menuLink} w-full cursor-pointer border-none bg-transparent text-left`}
            onClick={() => {
              setOpen(false)
              void logout()
            }}
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  )
}

export default function StoreLayout({ children }: { children: ReactNode }) {
  const { profile } = useSession()
  const { itemCount } = useCart()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [term, setTerm] = useState(searchParams.get('search') ?? '')

  const onSearch = (event: FormEvent) => {
    event.preventDefault()
    const value = term.trim()
    navigate(value ? `/?search=${encodeURIComponent(value)}` : RoutesEnum.HOME)
  }

  return (
    <div className="flex min-h-dvh flex-col bg-(--bg)">
      <header className="sticky top-0 z-30 border-b border-(--border) bg-(--surface)">
        <div className="mx-auto flex w-full max-w-[1200px] flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-6">
          <Link
            to={RoutesEnum.HOME}
            className="flex items-center gap-2.5 text-(--text) no-underline"
          >
            <span className="inline-flex h-[30px] w-[30px] items-center justify-center rounded-(--radius-sm) bg-(--primary) text-sm font-bold text-(--primary-contrast)">
              M
            </span>
            <span className="text-[15px] font-semibold tracking-tight">
              Marketplace
            </span>
          </Link>

          <form
            role="search"
            onSubmit={onSearch}
            className="relative order-last w-full min-[780px]:order-none min-[780px]:max-w-[440px] min-[780px]:flex-1"
          >
            <Search
              size={16}
              className="pointer-events-none absolute top-1/2 left-[10px] -translate-y-1/2 text-(--text-muted)"
            />
            <input
              type="search"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Buscar productos"
              aria-label="Buscar productos"
              className="w-full rounded-(--radius-sm) border border-(--border) bg-(--surface) py-2.5 pr-3 pl-[34px] font-sans text-[13px] text-(--text) focus:border-(--primary) focus:ring-2 focus:ring-(--primary-soft) focus:outline-none"
            />
          </form>

          <span className="flex-1 min-[780px]:hidden" />

          <nav className="flex items-center gap-2.5 min-[780px]:ml-auto">
            {profile ? (
              <>
                <Link
                  to={RoutesEnum.MY_PRODUCTS}
                  className="inline-flex items-center gap-1.5 rounded-(--radius-sm) px-3 py-2 text-[13px] font-semibold text-(--text) no-underline hover:bg-(--surface-muted) max-[560px]:hidden"
                >
                  <Store size={16} />
                  Vender
                </Link>
                <Link
                  to={RoutesEnum.CART}
                  className="relative inline-flex h-[34px] w-[34px] items-center justify-center rounded-(--radius-sm) border border-(--border) bg-(--surface) text-(--text) hover:bg-(--surface-muted)"
                  aria-label={`Carrito, ${itemCount} productos`}
                >
                  <ShoppingCart size={17} />
                  {itemCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 inline-flex min-w-[18px] items-center justify-center rounded-full bg-(--primary) px-1 text-[11px] leading-[18px] font-bold text-(--primary-contrast)">
                      {itemCount}
                    </span>
                  )}
                </Link>
                <AccountMenu />
              </>
            ) : (
              <>
                <Link to={RoutesEnum.LOGIN} className="no-underline">
                  <Button variant="ghost">Ingresar</Button>
                </Link>
                <Link to={RoutesEnum.SIGNUP} className="no-underline">
                  <Button variant="primary">Crear cuenta</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-6 sm:px-6">
        {children}
      </main>
    </div>
  )
}
