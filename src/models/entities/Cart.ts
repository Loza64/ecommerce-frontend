import BaseEntity from '@/sdk/model/entities/BaseEntity'
import type { DiscountType } from './Coupon'
import type { ProductImage, VariantAttributes } from './Product'

export type CartStatus = 'active' | 'abandoned' | 'converted'

export interface CartItem extends BaseEntity {
  quantity: number
  priceAtAddition: number
  currentPrice: number
  /** true si el vendedor cambió el precio después de agregarlo */
  priceChanged: boolean
  stockQuantity: number
  lineTotal: number
  productVariant: { id: number; sku: string; attributes: VariantAttributes }
  product: { id: number; name: string; image: ProductImage | null }
}

export default interface Cart extends BaseEntity {
  status: CartStatus
  items: CartItem[]
  coupon: {
    id: number
    code: string
    discountType: DiscountType
    discountValue: number
    expirationDate: string
    /** Vendedor dueño del cupón; null = cupón de la plataforma */
    seller: { id: number; username: string; name: string } | null
    /** false si el carrito ya no tiene productos a los que aplique */
    applicable: boolean
  } | null
  subtotal: number
  discount: number
  total: number
}
