import type Product from '@/models/entities/Product'
import type {
  ProductImage,
  ProductVariant,
  VariantAttributes,
} from '@/models/entities/Product'

export function imageUrl(
  image: ProductImage | null | undefined,
  preferThumbnail = false
): string | undefined {
  if (!image) {
    return undefined
  }
  if (preferThumbnail && image.eager?.length) {
    return image.eager[0].secureUrl
  }
  return image.secureUrl ?? image.url
}

export function mainImage(product: Product): ProductImage | undefined {
  return product.images[0]
}

export function priceRange(variants: ProductVariant[]): {
  min: number
  max: number
} {
  if (!variants.length) {
    return { min: 0, max: 0 }
  }
  const prices = variants.map((v) => Number(v.price))
  return { min: Math.min(...prices), max: Math.max(...prices) }
}

export function totalStock(variants: ProductVariant[]): number {
  return variants.reduce((sum, v) => sum + Number(v.stockQuantity), 0)
}

export function attributesLabel(attributes?: VariantAttributes): string {
  if (!attributes) {
    return ''
  }
  return Object.entries(attributes)
    .map(([key, value]) => `${key}: ${String(value)}`)
    .join(', ')
}

/** Un usuario no puede comprar sus propios productos. */
export function isOwnProduct(
  product: Pick<Product, 'seller'>,
  profileId?: string | number | null
): boolean {
  if (profileId === undefined || profileId === null || !product.seller) {
    return false
  }
  return String(product.seller.id) === String(profileId)
}
