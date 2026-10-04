import { useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { ImageOff, ShoppingCart, Tag, Trash2, X } from 'lucide-react'
import { toast } from 'react-toastify'
import { orderService } from '@/api'
import { useCart } from '@/hooks/useCart'
import { queryKeys } from '@/config/queryClient'
import type { CartItem } from '@/models/entities/Cart'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { QuantityStepper } from '@/components/ui/QuantityStepper'
import { RoutesEnum } from '@/enum/routes..app'
import { formatMoney } from '@/lib/money'
import { newIdempotencyKey } from '@/lib/idempotency'
import { savePendingCheckout } from '@/lib/pendingCheckout'
import { attributesLabel, imageUrl } from '@/lib/product'
import { productPath } from '@/lib/routes'
import errorResponse from '@/utils/errorResponse'

const MAX_PER_ITEM = 99

function CartItemRow({
  item,
  busy,
  onQuantity,
  onRemove,
}: {
  item: CartItem
  busy: boolean
  onQuantity: (quantity: number) => void
  onRemove: () => void
}) {
  const image = imageUrl(item.product.image, true)
  const maxQuantity = Math.max(1, Math.min(item.stockQuantity, MAX_PER_ITEM))
  const notEnoughStock = item.quantity > item.stockQuantity

  return (
    <li className="flex gap-4 border-b border-(--border) py-4 last:border-b-0">
      <Link
        to={productPath(item.product.id)}
        className="h-20 w-20 shrink-0 overflow-hidden rounded-(--radius-md) bg-(--surface-muted)"
        aria-label={item.product.name}
      >
        {image ? (
          <img src={image} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-(--text-muted)">
            <ImageOff size={22} />
          </span>
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              to={productPath(item.product.id)}
              className="block truncate text-sm font-semibold text-(--text) no-underline hover:text-(--primary)"
            >
              {item.product.name}
            </Link>
            <p className="m-0 text-xs text-(--text-muted)">
              {attributesLabel(item.productVariant.attributes) ||
                item.productVariant.sku}
            </p>
          </div>
          <span className="text-sm font-semibold whitespace-nowrap">
            {formatMoney(item.lineTotal)}
          </span>
        </div>

        {item.priceChanged && (
          <p className="m-0 text-xs text-(--warning)">
            El precio cambió de {formatMoney(item.priceAtAddition)} a{' '}
            {formatMoney(item.currentPrice)}. Se aplicará el nuevo precio al
            pagar.
          </p>
        )}
        {notEnoughStock && (
          <p className="m-0 text-xs text-(--danger)">
            {item.stockQuantity === 0
              ? 'Este producto se agotó. Quítalo para continuar.'
              : `Solo quedan ${item.stockQuantity} unidades. Reduce la cantidad para continuar.`}
          </p>
        )}

        <div className="mt-1 flex items-center justify-between gap-3">
          <QuantityStepper
            value={item.quantity}
            max={maxQuantity}
            disabled={busy}
            onChange={onQuantity}
          />
          <Button
            variant="icon-danger"
            tooltip="Quitar del carrito"
            disabled={busy}
            onClick={onRemove}
          >
            <Trash2 size={15} />
          </Button>
        </div>
      </div>
    </li>
  )
}

export default function CartPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const {
    cart,
    isLoading,
    refetch,
    updateItem,
    removeItem,
    clear,
    applyCoupon,
    removeCoupon,
  } = useCart()
  const [couponCode, setCouponCode] = useState('')
  const [paying, setPaying] = useState(false)
  // misma clave mientras se reintenta la misma compra; nueva clave tras un error de negocio
  const idempotencyKey = useRef<string | null>(null)

  const busy =
    updateItem.isPending || removeItem.isPending || clear.isPending || paying

  const run = async (action: () => Promise<unknown>) => {
    try {
      await action()
    } catch (error) {
      errorResponse({ error })
    }
  }

  const onApplyCoupon = async (event: FormEvent) => {
    event.preventDefault()
    const code = couponCode.trim()
    if (!code) {
      return
    }
    await run(async () => {
      await applyCoupon.mutateAsync(code)
      setCouponCode('')
      toast.success('Cupón aplicado.')
    })
  }

  const checkout = async () => {
    idempotencyKey.current ??= newIdempotencyKey()
    setPaying(true)
    try {
      const { order, clientSecret } = await orderService.checkout(
        idempotencyKey.current
      )
      idempotencyKey.current = null
      void queryClient.invalidateQueries({ queryKey: queryKeys.cart })
      void queryClient.invalidateQueries({ queryKey: ['orders'] })

      if (clientSecret) {
        savePendingCheckout({ order, clientSecret })
        navigate(`${RoutesEnum.CHECKOUT}?order=${order.id}`)
      } else {
        // total 0: el pedido ya quedó pagado sin pasar por Stripe
        navigate(`${RoutesEnum.CHECKOUT_RESULT}?order=${order.id}`)
      }
    } catch (error) {
      const { status, message } = errorResponse({ error, alert: false })
      // sin respuesta o error del servidor: se conserva la clave para reintentar sin duplicar
      if (status >= 400 && status < 500) {
        idempotencyKey.current = null
      }
      toast.error(message)
      if (status === 409) {
        // precio, stock o cupón cambiaron: se recarga el carrito para revisarlo
        void refetch()
      }
    } finally {
      setPaying(false)
    }
  }

  if (isLoading) {
    return <div className="form-loading-state">Cargando carrito...</div>
  }

  if (!cart || cart.items.length === 0) {
    return (
      <EmptyState
        icon={ShoppingCart}
        title="Tu carrito está vacío"
        description="Agrega productos para verlos aquí y pagarlos."
        action={
          <Link to={RoutesEnum.HOME} className="no-underline">
            <Button variant="primary">Ver productos</Button>
          </Link>
        }
      />
    )
  }

  const hasStockProblem = cart.items.some(
    (item) => item.quantity > item.stockQuantity
  )

  return (
    <>
      <h1 className="m-0 mb-5 text-xl font-bold text-(--text)">Tu carrito</h1>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_340px]">
        <section className="rounded-(--radius-lg) border border-(--border) bg-(--surface) px-5">
          <ul className="m-0 list-none p-0">
            {cart.items.map((item) => (
              <CartItemRow
                key={item.id}
                item={item}
                busy={busy}
                onQuantity={(quantity) =>
                  run(() =>
                    updateItem.mutateAsync({
                      itemId: Number(item.id),
                      quantity,
                    })
                  )
                }
                onRemove={() =>
                  run(() => removeItem.mutateAsync(Number(item.id)))
                }
              />
            ))}
          </ul>
          <div className="border-t border-(--border) py-3">
            <button
              type="button"
              className="cursor-pointer border-none bg-transparent p-0 text-[13px] text-(--text-muted) hover:text-(--danger)"
              disabled={busy}
              onClick={() => run(() => clear.mutateAsync())}
            >
              Vaciar carrito
            </button>
          </div>
        </section>

        <aside className="flex flex-col gap-4 rounded-(--radius-lg) border border-(--border) bg-(--surface) p-5">
          <h2 className="m-0 text-base font-semibold text-(--text)">Resumen</h2>

          {cart.coupon ? (
            <div className="flex items-center justify-between gap-2 rounded-(--radius-md) bg-(--success-soft) px-3 py-2 text-[13px] text-(--success)">
              <span className="inline-flex items-center gap-1.5 font-semibold">
                <Tag size={14} />
                {cart.coupon.code}
              </span>
              <button
                type="button"
                aria-label="Quitar cupón"
                className="inline-flex cursor-pointer border-none bg-transparent p-0 text-(--success)"
                disabled={removeCoupon.isPending}
                onClick={() => run(() => removeCoupon.mutateAsync())}
              >
                <X size={15} />
              </button>
            </div>
          ) : (
            <form onSubmit={onApplyCoupon} className="flex gap-2">
              <input
                className="field-input"
                placeholder="Código de cupón"
                aria-label="Código de cupón"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
              />
              <Button
                type="submit"
                variant="ghost"
                disabled={!couponCode.trim() || applyCoupon.isPending}
              >
                Aplicar
              </Button>
            </form>
          )}

          <dl className="m-0 flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-(--text-muted)">Subtotal</dt>
              <dd className="m-0">{formatMoney(cart.subtotal)}</dd>
            </div>
            {Number(cart.discount) > 0 && (
              <div className="flex justify-between text-(--success)">
                <dt>Descuento</dt>
                <dd className="m-0">-{formatMoney(cart.discount)}</dd>
              </div>
            )}
            <div className="flex justify-between border-t border-(--border) pt-3 text-base font-bold">
              <dt>Total</dt>
              <dd className="m-0">{formatMoney(cart.total)}</dd>
            </div>
          </dl>

          <Button
            variant="primary"
            fullWidth
            className="py-3"
            disabled={busy || hasStockProblem}
            onClick={checkout}
          >
            {paying ? 'Preparando el pago...' : 'Continuar al pago'}
          </Button>
          {hasStockProblem && (
            <p className="m-0 text-xs text-(--danger)">
              Corrige las cantidades marcadas para poder pagar.
            </p>
          )}
        </aside>
      </div>
    </>
  )
}
