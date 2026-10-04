import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cartService } from '@/api'
import { queryKeys } from '@/config/queryClient'
import { sdkSettings } from '@/sdk/core/SdkSettings'
import type Cart from '@/models/entities/Cart'

/** Carrito activo del usuario. Todas las mutaciones devuelven el carrito actualizado. */
export function useCart() {
  const queryClient = useQueryClient()

  const query = useQuery<Cart>({
    queryKey: queryKeys.cart,
    queryFn: () => cartService.get(),
    enabled: !!sdkSettings.token,
  })

  const setCart = (cart: Cart) => {
    queryClient.setQueryData(queryKeys.cart, cart)
  }

  const addItem = useMutation({
    mutationFn: (params: { variantId: number; quantity: number }) =>
      cartService.addItem(params.variantId, params.quantity),
    onSuccess: setCart,
  })

  const updateItem = useMutation({
    mutationFn: (params: { itemId: number; quantity: number }) =>
      cartService.updateItem(params.itemId, params.quantity),
    onSuccess: setCart,
  })

  const removeItem = useMutation({
    mutationFn: (itemId: number) => cartService.removeItem(itemId),
    onSuccess: setCart,
  })

  const clear = useMutation({
    mutationFn: () => cartService.clear(),
    onSuccess: setCart,
  })

  const applyCoupon = useMutation({
    mutationFn: (code: string) => cartService.applyCoupon(code),
    onSuccess: setCart,
  })

  const removeCoupon = useMutation({
    mutationFn: () => cartService.removeCoupon(),
    onSuccess: setCart,
  })

  const itemCount =
    query.data?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0

  return {
    cart: query.data,
    isLoading: query.isLoading,
    refetch: query.refetch,
    itemCount,
    addItem,
    updateItem,
    removeItem,
    clear,
    applyCoupon,
    removeCoupon,
  }
}
