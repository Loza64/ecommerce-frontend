import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Ban, CreditCard, Eye, Receipt } from 'lucide-react'
import { toast } from 'react-toastify'
import { useFindAll } from '@/hooks/core/useFindAll'
import { orderService } from '@/api'
import type Order from '@/models/entities/Order'
import type { OrderStatus } from '@/models/entities/Order'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { EmptyState } from '@/components/ui/EmptyState'
import { Modal } from '@/components/ui/Modal'
import { Table, type TableColumn } from '@/components/ui/Table'
import { Toolbar } from '@/components/ui/Toolbar'
import { OrderSummary } from '@/features/checkout/OrderSummary'
import { RoutesEnum } from '@/enum/routes..app'
import { formatDateTime } from '@/lib/date'
import { formatMoney } from '@/lib/money'
import { ORDER_STATUS_LABEL, ORDER_STATUS_VARIANT } from '@/lib/orderStatus'
import { getPendingCheckout, clearPendingCheckout } from '@/lib/pendingCheckout'
import errorResponse from '@/utils/errorResponse'

const PAGE_SIZE = 10

function itemsSummary(order: Order): string {
  const [first, ...rest] = order.items
  if (!first) {
    return '—'
  }
  return rest.length > 0
    ? `${first.productName} y ${rest.length} más`
    : first.productName
}

export default function OrdersPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<OrderStatus | ''>('')
  const [detail, setDetail] = useState<Order | null>(null)
  const [toCancel, setToCancel] = useState<Order | null>(null)
  const [cancelling, setCancelling] = useState(false)

  const queryParams = useMemo(
    () => ({ page, pageSize: PAGE_SIZE, ...(status ? { status } : {}) }),
    [page, status]
  )

  const query = useFindAll<Order>({
    service: orderService,
    queryKey: 'orders',
    queryParams,
  })
  const orders = query.data?.data ?? []
  const pagination = query.data?.pagination
    ? { ...query.data.pagination, itemsLabel: 'pedidos' }
    : null

  const confirmCancel = async () => {
    if (!toCancel) {
      return
    }
    setCancelling(true)
    try {
      await orderService.cancel(toCancel.id!)
      clearPendingCheckout(toCancel.id!)
      void queryClient.invalidateQueries({ queryKey: ['orders'] })
      void queryClient.invalidateQueries({ queryKey: ['cart'] })
      toast.success('Pedido cancelado. Tus productos volvieron al carrito.')
      setToCancel(null)
    } catch (error) {
      errorResponse({ error })
    } finally {
      setCancelling(false)
    }
  }

  const columns: TableColumn<Order>[] = [
    {
      title: 'Pedido',
      key: 'id',
      width: '90px',
      render: (_v, record) => `#${record.id}`,
    },
    {
      title: 'Fecha',
      key: 'createdAt',
      render: (_v, record) => formatDateTime(record.createdAt),
    },
    {
      title: 'Productos',
      key: 'items',
      render: (_v, record) => itemsSummary(record),
    },
    {
      title: 'Total',
      key: 'total',
      align: 'right',
      render: (_v, record) => formatMoney(record.total, record.currency),
    },
    {
      title: 'Estado',
      key: 'status',
      render: (_v, record) => (
        <Badge variant={ORDER_STATUS_VARIANT[record.status]}>
          {ORDER_STATUS_LABEL[record.status]}
        </Badge>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: '120px',
      render: (_v, record) => {
        const canResume =
          record.status === 'pending_payment' &&
          getPendingCheckout(record.id!) !== null
        return (
          <div className="row-actions">
            {canResume && (
              <Button
                variant="icon-success"
                tooltip="Completar pago"
                onClick={() =>
                  navigate(`${RoutesEnum.CHECKOUT}?order=${record.id}`)
                }
              >
                <CreditCard size={15} />
              </Button>
            )}
            <Button
              variant="icon"
              tooltip="Ver detalle"
              onClick={() => setDetail(record)}
            >
              <Eye size={15} />
            </Button>
            {record.status === 'pending_payment' && (
              <Button
                variant="icon-danger"
                tooltip="Cancelar pedido"
                onClick={() => setToCancel(record)}
              >
                <Ban size={15} />
              </Button>
            )}
          </div>
        )
      },
    },
  ]

  if (!query.isLoading && orders.length === 0 && !status && page === 1) {
    return (
      <EmptyState
        icon={Receipt}
        title="Todavía no has comprado nada"
        description="Cuando hagas tu primera compra, la verás aquí con su estado."
        action={
          <Button variant="primary" onClick={() => navigate(RoutesEnum.HOME)}>
            Ver productos
          </Button>
        }
      />
    )
  }

  return (
    <>
      <Toolbar>
        <select
          className="field-input max-w-[220px]"
          aria-label="Filtrar por estado"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as OrderStatus | '')
            setPage(1)
          }}
        >
          <option value="">Todos los estados</option>
          <option value="pending_payment">Pendientes de pago</option>
          <option value="paid">Pagados</option>
          <option value="cancelled">Cancelados</option>
        </select>
      </Toolbar>

      <Table
        columns={columns}
        data={orders}
        loading={query.isLoading}
        emptyText="No hay pedidos con ese estado."
        pagination={pagination}
        onPageChange={setPage}
      />

      <Modal
        open={!!detail}
        title="Detalle del pedido"
        widthPx={480}
        onClose={() => setDetail(null)}
      >
        {detail && <OrderSummary order={detail} />}
      </Modal>

      <ConfirmModal
        open={!!toCancel}
        tone="danger"
        title="Cancelar pedido"
        description={
          <>
            ¿Seguro que quieres cancelar el pedido{' '}
            <strong>#{toCancel?.id}</strong>? Los productos volverán a tu
            carrito.
          </>
        }
        confirmText="Cancelar pedido"
        cancelText="Volver"
        loading={cancelling}
        onConfirm={confirmCancel}
        onCancel={() => setToCancel(null)}
      />
    </>
  )
}
