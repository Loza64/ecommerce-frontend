import { RoutesEnum } from '@/enum/routes..app'
import { roles } from '@/enum/role'

export const productPath = (id: string | number) => `/products/${id}`

/** Admins van al panel; el resto de usuarios, a la tienda. */
export const homeRouteFor = (roleName?: string | null): RoutesEnum =>
  roleName === roles.admin || roleName === roles.super_admin
    ? RoutesEnum.DASHBOARD
    : RoutesEnum.HOME
