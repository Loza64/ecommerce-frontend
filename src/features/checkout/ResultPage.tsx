import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle2, Clock, XCircle } from 'lucide-react'
import { orderService } from '@/api'
import { Button } from '@/components/ui/Button'
import { RoutesEnum } from '@/enum/routes..app'
import { clearPendingCheckout } from '@/lib/pendingCheckout'
import { OrderSummary } from './OrderSummary'

const POLL_INTERVAL_MS = 2000
const MAX_POLLS = 15

export default function ResultPage() {
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('order') ?? ''
  // Stripe agrega este parámetro cuando vuelve de una redirección (3D Secure)
  const redirectStatus = searchParams.get('redirect_status')

  const {
    data: order,
    isError,
    fetchStatus,
  } = useQuery({
    queryKey: ['orders', orderId],
    queryFn: () => orderService.findById({ id: orderId }),
    enabled: !!orderId,
    // el webhook de Stripe confirma el pago de forma asíncrona: se consulta hasta verlo pagado
    refetchInterval: (query) =>
      query.state.data?.status === 'pending_payment' &&
      query.state.dataUpdateCount < MAX_POLLS
        ? POLL_INTERVAL_MS
        : false,
    staleTime: 0,
  })

  const status = order?.status

  useEffect(() => {
    if (orderId && (status === 'paid' || status === 'cancelled')) {
      clearPendingCheckout(orderId)
    }
  }, [orderId, status])

  let icon = <Clock size={26} />
  let tone = 'bg-(--warning-soft) text-(--warning)'
  let title = 'Confirmando tu pago...'
  let description = 'Esto suele tardar unos segundos. No cierres esta página.'

  if (isError || !orderId) {
    icon = <XCircle size={26} />
    tone = 'bg-(--danger-soft) text-(--danger)'
    title = 'No encontramos este pedido'
    description = 'Revisa tus compras para ver el estado de tus pedidos.'
  } else if (status === 'paid') {
    icon = <CheckCircle2 size={26} />
    tone = 'bg-(--success-soft) text-(--success)'
    title = 'Pago confirmado'
    description = 'Recibimos tu pago. El vendedor ya puede preparar tu pedido.'
  } else if (status === 'cancelled' || redirectStatus === 'failed') {
    icon = <XCircle size={26} />
    tone = 'bg-(--danger-soft) text-(--danger)'
    title = 'El pago no se completó'
    description =
      'No se realizó ningún cobro. Puedes volver a intentarlo desde el carrito.'
  } else if (status === 'pending_payment' && fetchStatus === 'idle') {
    // terminó la espera del webhook y el pedido sigue sin confirmarse
    description =
      'Todavía no recibimos la confirmación del pago. Revisa Mis compras en unos minutos: si no se confirma, el pedido se cancela solo.'
  }

  return (
    <div className="mx-auto flex max-w-[480px] flex-col items-center gap-5 text-center">
      <span
        className={`inline-flex h-14 w-14 items-center justify-center rounded-full ${tone}`}
      >
        {icon}
      </span>
      <div className="flex flex-col gap-1.5">
        <h1 className="m-0 text-xl font-bold text-(--text)">{title}</h1>
        <p className="m-0 text-[13px] text-(--text-muted)">{description}</p>
      </div>

      {order && (
        <div className="w-full text-left">
          <OrderSummary order={order} />
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-3">
        <Link to={RoutesEnum.MY_ORDERS} className="no-underline">
          <Button variant="primary">Ver mis compras</Button>
        </Link>
        <Link
          to={status === 'cancelled' ? RoutesEnum.CART : RoutesEnum.HOME}
          className="no-underline"
        >
          <Button variant="ghost">
            {status === 'cancelled' ? 'Volver al carrito' : 'Seguir comprando'}
          </Button>
        </Link>
      </div>
    </div>
  )
}
