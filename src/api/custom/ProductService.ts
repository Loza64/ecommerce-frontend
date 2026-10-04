import Product, { ProductVariant } from '@/models/entities/Product'
import Service from '@/sdk/core/Service'

export type VariantPayload = Pick<
  ProductVariant,
  'sku' | 'price' | 'stockQuantity' | 'attributes'
>

export default class ProductService extends Service<Product> {
  constructor() {
    super({ endpoint: 'products' })
  }

  public async addVariant(
    productId: string | number,
    payload: VariantPayload
  ): Promise<void> {
    await this.axios.post(`products/${productId}/variants`, payload)
  }

  public async updateVariant(
    productId: string | number,
    variantId: string | number,
    payload: Partial<VariantPayload>
  ): Promise<void> {
    await this.axios.put(`products/${productId}/variants/${variantId}`, payload)
  }

  public async removeVariant(
    productId: string | number,
    variantId: string | number
  ): Promise<void> {
    await this.axios.delete(`products/${productId}/variants/${variantId}`)
  }
}
