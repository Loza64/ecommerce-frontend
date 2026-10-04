import type Order from '@/models/entities/Order'

/**
 * El backend solo entrega el clientSecret al crear el pedido. Se guarda en
 * sessionStorage para poder retomar el pago si el usuario recarga la página.
 */
export interface PendingCheckout {
  order: Order
  clientSecret: string
}

const key = (orderId: string | number) => `pending_checkout_${orderId}`

export function savePendingCheckout(data: PendingCheckout): void {
  try {
    sessionStorage.setItem(key(data.order.id!), JSON.stringify(data))
  } catch {
    // sin sessionStorage el pago sigue funcionando; solo no se puede retomar
  }
}

export function getPendingCheckout(
  orderId: string | number
): PendingCheckout | null {
  try {
    const raw = sessionStorage.getItem(key(orderId))
    return raw ? (JSON.parse(raw) as PendingCheckout) : null
  } catch {
    return null
  }
}

export function clearPendingCheckout(orderId: string | number): void {
  try {
    sessionStorage.removeItem(key(orderId))
  } catch {
    // nada que limpiar
  }
}
