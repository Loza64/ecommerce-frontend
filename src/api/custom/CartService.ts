import Cart from '@/models/entities/Cart'
import Service from '@/sdk/core/Service'
import type { ServiceConfig } from '@/sdk/model/core/ParamsService'

/**
 * El backend responde 403 cuando se intenta comprar un producto propio.
 * Se desactiva el aviso genérico de "sin permiso" para mostrar el mensaje real.
 */
const config: ServiceConfig = { onForbidden: () => undefined }

export default class CartService extends Service<Cart> {
  constructor() {
    super({ endpoint: 'cart' })
  }

  public async get(): Promise<Cart> {
    const res = await this.axios.get<Cart>('cart')
    return res.data
  }

  public async clear(): Promise<Cart> {
    const res = await this.axios.delete<Cart>('cart')
    return res.data
  }

  public async addItem(
    productVariantId: number,
    quantity: number
  ): Promise<Cart> {
    const res = await this.axios.post<Cart>(
      'cart/items',
      { productVariant: { id: productVariantId }, quantity },
      config
    )
    return res.data
  }

  public async updateItem(itemId: number, quantity: number): Promise<Cart> {
    const res = await this.axios.patch<Cart>(
      `cart/items/${itemId}`,
      { quantity },
      config
    )
    return res.data
  }

  public async removeItem(itemId: number): Promise<Cart> {
    const res = await this.axios.delete<Cart>(`cart/items/${itemId}`)
    return res.data
  }

  public async applyCoupon(code: string): Promise<Cart> {
    const res = await this.axios.post<Cart>('cart/coupon', { code })
    return res.data
  }

  public async removeCoupon(): Promise<Cart> {
    const res = await this.axios.delete<Cart>('cart/coupon')
    return res.data
  }
}
