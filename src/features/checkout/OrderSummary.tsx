import type Order from '@/models/entities/Order'
import { formatMoney } from '@/lib/money'
import { attributesLabel } from '@/lib/product'

export function OrderSummary({ order }: { order: Order }) {
  return (
    <div className="flex flex-col gap-4 rounded-(--radius-lg) border border-(--border) bg-(--surface) p-5">
      <h2 className="m-0 text-base font-semibold text-(--text)">
        Pedido #{order.id}
      </h2>

      <ul className="m-0 flex list-none flex-col gap-3 p-0">
        {order.items.map((item) => (
          <li key={item.id} className="flex justify-between gap-3 text-sm">
            <div className="min-w-0">
              <p className="m-0 font-medium text-(--text)">
                {item.quantity} x {item.productName}
              </p>
              <p className="m-0 text-xs text-(--text-muted)">
                {attributesLabel(item.attributes) || item.sku}
              </p>
            </div>
            <span className="whitespace-nowrap">
              {formatMoney(item.lineTotal, order.currency)}
            </span>
          </li>
        ))}
      </ul>

      <dl className="m-0 flex flex-col gap-2 border-t border-(--border) pt-3 text-sm">
        <div className="flex justify-between">
          <dt className="text-(--text-muted)">Subtotal</dt>
          <dd className="m-0">{formatMoney(order.subtotal, order.currency)}</dd>
        </div>
        {Number(order.discountTotal) > 0 && (
          <div className="flex justify-between text-(--success)">
            <dt>Descuento{order.couponCode ? ` (${order.couponCode})` : ''}</dt>
            <dd className="m-0">
              -{formatMoney(order.discountTotal, order.currency)}
            </dd>
          </div>
        )}
        <div className="flex justify-between text-base font-bold">
          <dt>Total</dt>
          <dd className="m-0">{formatMoney(order.total, order.currency)}</dd>
        </div>
      </dl>
    </div>
  )
}
