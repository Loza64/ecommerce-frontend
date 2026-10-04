import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
    },
  },
})

export const queryKeys = {
  session: ['session'],
  users: ['users'],
  roles: ['roles'],
  permissions: ['permissions'],
  cart: ['cart'],
  products: ['products'],
  categories: ['categories'],
  coupons: ['coupons'],
  orders: ['orders'],
  sales: ['sales'],
}
