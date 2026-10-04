import BaseEntity from '@/sdk/model/entities/BaseEntity'
import type { VariantAttributes } from './Product'

export type OrderStatus = 'pending_payment' | 'paid' | 'cancelled'

export interface OrderItem extends BaseEntity {
  productVariantId: number | null
  productName: string
  sku: string
  attributes: VariantAttributes
  quantity: number
  unitPrice: number
  lineTotal: number
}

export default interface Order extends BaseEntity {
  status: OrderStatus
  subtotal: number
  discountTotal: number
  total: number
  currency: string
  couponCode: string | null
  paidAt: string | null
  items: OrderItem[]
}

/** Vista del vendedor: item vendido en un pedido ya pagado */
export interface Sale extends OrderItem {
  order: {
    id: number
    status: OrderStatus
    paidAt: string | null
    buyer: { id: number; username: string; name: string } | null
  }
}

export interface CheckoutResponse {
  order: Order
  /** null cuando el total es 0 (pedido pagado sin pasar por Stripe) */
  clientSecret: string | null
}
