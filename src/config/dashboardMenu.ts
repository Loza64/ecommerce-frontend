import {
  Lock,
  Package,
  Palette,
  Shield,
  Tag,
  Ticket,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { RoutesEnum } from '@/enum/routes..app'

export interface MenuItem {
  label: string
  route?: RoutesEnum
  icon: LucideIcon
  children?: MenuItem[]
}

export const DASHBOARD_MENU: MenuItem[] = [
  { label: 'Usuarios', route: RoutesEnum.USERS, icon: Users },
  { label: 'Productos', route: RoutesEnum.PRODUCTS, icon: Package },
  { label: 'Categorías', route: RoutesEnum.CATEGORIES, icon: Tag },
  { label: 'Cupones', route: RoutesEnum.COUPONS, icon: Ticket },
  {
    label: 'Control de acceso',
    icon: Shield,
    children: [
      { label: 'Roles', route: RoutesEnum.ROLES, icon: Shield },
      { label: 'Permisos', route: RoutesEnum.PERMISSIONS, icon: Lock },
    ],
  },
  { label: 'Apariencia', route: RoutesEnum.SETTINGS, icon: Palette },
]
