import BaseEntity from '@/sdk/model/entities/BaseEntity'

export type DiscountType = 'percentage' | 'fixed'

export default interface Coupon extends BaseEntity {
  code: string
  discountType: DiscountType
  discountValue: number
  expirationDate: string
}
