import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js'
import { CreditCard, ShieldAlert } from 'lucide-react'
import { toast } from 'react-toastify'
import { orderService } from '@/api'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { useTheme } from '@/hooks/useTheme'
import { RoutesEnum } from '@/enum/routes..app'
import { formatMoney } from '@/lib/money'
import { getStripe } from '@/lib/stripe'
import { clearPendingCheckout, getPendingCheckout } from '@/lib/pendingCheckout'
import errorResponse from '@/utils/errorResponse'
import { OrderSummary } from './OrderSummary'

function PaymentForm({
  orderId,
  total,
  currency,
}: {
  orderId: string
  total: number
  currency: string
}) {
  const stripe = useStripe()
  const elements = useElements()
  const navigate = useNavigate()
  const [message, setMessage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!stripe || !elements) {
      return
    }
    setSubmitting(true)
    setMessage(null)

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}${RoutesEnum.CHECKOUT_RESULT}?order=${orderId}`,
      },
      // solo redirige cuando el método de pago lo exige (3D Secure, bancos...)
      redirect: 'if_required',
    })

    if (error) {
      setMessage(error.message ?? 'No se pudo procesar el pago.')
      setSubmitting(false)
      return
    }
    // el pedido se marca como pagado cuando llega el webhook de Stripe
    navigate(`${RoutesEnum.CHECKOUT_RESULT}?order=${orderId}`)
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-5 rounded-(--radius-lg) border border-(--border) bg-(--surface) p-5"
    >
      <h2 className="m-0 text-base font-semibold text-(--text)">
        Método de pago
      </h2>
      <PaymentElement />
      {message && (
        <span className="form-error" role="alert">
          {message}
        </span>
      )}
      <Button
        type="submit"
        variant="primary"
        fullWidth
        className="py-3"
        disabled={!stripe || !elements || submitting}
      >
        {submitting
          ? 'Procesando pago...'
          : `Pagar ${formatMoney(total, currency)}`}
      </Button>
    </form>
  )
}

export default function PayPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { theme } = useTheme()
  const [cancelling, setCancelling] = useState(false)

  const orderId = searchParams.get('order') ?? ''
  const pending = orderId ? getPendingCheckout(orderId) : null
  const stripePromise = getStripe()

  const cancelOrder = async () => {
    setCancelling(true)
    try {
      await orderService.cancel(orderId)
      clearPendingCheckout(orderId)
      void queryClient.invalidateQueries({ queryKey: ['orders'] })
      void queryClient.invalidateQueries({ queryKey: ['cart'] })
      toast.info('Pedido cancelado. Tus productos volvieron al carrito.')
      navigate(RoutesEnum.CART)
    } catch (error) {
      errorResponse({ error })
      setCancelling(false)
    }
  }

  if (!pending) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="No pudimos retomar este pago"
        description="La sesión de pago ya no está disponible. Cancela el pedido desde Mis compras y vuelve a intentarlo desde el carrito."
        action={
          <Link to={RoutesEnum.MY_ORDERS} className="no-underline">
            <Button variant="primary">Ir a mis compras</Button>
          </Link>
        }
      />
    )
  }

  if (!stripePromise) {
    return (
      <EmptyState
        icon={CreditCard}
        title="Los pagos no están disponibles"
        description="Falta configurar la clave pública de Stripe (VITE_STRIPE_PUBLISHABLE_KEY)."
      />
    )
  }

  return (
    <>
      <h1 className="m-0 mb-5 text-xl font-bold text-(--text)">
        Finalizar compra
      </h1>
      <div className="grid items-start gap-6 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-3">
          <Elements
            key={theme}
            stripe={stripePromise}
            options={{
              clientSecret: pending.clientSecret,
              appearance: { theme: theme === 'dark' ? 'night' : 'stripe' },
            }}
          >
            <PaymentForm
              orderId={orderId}
              total={pending.order.total}
              currency={pending.order.currency}
            />
          </Elements>
          <button
            type="button"
            className="cursor-pointer self-start border-none bg-transparent p-0 text-[13px] text-(--text-muted) hover:text-(--danger)"
            disabled={cancelling}
            onClick={cancelOrder}
          >
            {cancelling ? 'Cancelando...' : 'Cancelar pedido'}
          </button>
        </div>

        <OrderSummary order={pending.order} />
      </div>
    </>
  )
}
