import BaseEntity from '@/sdk/model/entities/BaseEntity'

export type DiscountType = 'percentage' | 'fixed'

export default interface Coupon extends BaseEntity {
  code: string
  discountType: DiscountType
  discountValue: number
  expirationDate: string
  /** Vendedor dueño del cupón; null = cupón de la plataforma */
  seller: { id: number; username: string; name: string } | null
  /** Usos totales permitidos; null = sin límite */
  maxUses: number | null
  /** Usos permitidos por comprador; null = sin límite */
  maxUsesPerUser: number | null
  /** Pedidos pendientes de pago o pagados que usaron el cupón */
  usesCount: number
}
