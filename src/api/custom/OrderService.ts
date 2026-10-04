import Order, { CheckoutResponse } from '@/models/entities/Order'
import Service from '@/sdk/core/Service'

export default class OrderService extends Service<Order> {
  constructor() {
    super({ endpoint: 'orders' })
  }

  /**
   * Crea el pedido y el pago en Stripe. La clave de idempotencia permite
   * reintentar sin duplicar pedidos si la respuesta se pierde.
   */
  public async checkout(idempotencyKey: string): Promise<CheckoutResponse> {
    const res = await this.axios.post<CheckoutResponse>(
      'orders/checkout',
      undefined,
      {
        headers: { 'Idempotency-Key': idempotencyKey },
        onForbidden: () => undefined,
      }
    )
    return res.data
  }

  public async cancel(orderId: string | number): Promise<Order> {
    const res = await this.axios.post<Order>(`orders/${orderId}/cancel`)
    return res.data
  }
}
