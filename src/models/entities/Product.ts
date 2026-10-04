import BaseEntity from '@/sdk/model/entities/BaseEntity'
import type { UploadVariant } from './Upload'

export type VariantAttributes = Record<string, string | number | boolean>

export interface ProductVariant extends BaseEntity {
  sku: string
  price: number
  stockQuantity: number
  attributes?: VariantAttributes
}

/** Las imágenes se envían como { id } y se reciben con su metadata. */
export interface ProductImage {
  id: number
  url?: string
  secureUrl?: string
  eager?: UploadVariant[] | null
}

export interface ProductSeller {
  id: number
  username: string
  name: string
}

export default interface Product extends BaseEntity {
  name: string
  description: string
  category: {
    id: number
    name?: string
    parent?: { id: number; name: string } | null
  } | null
  seller?: ProductSeller | null
  images: ProductImage[]
  variants: ProductVariant[]
}
