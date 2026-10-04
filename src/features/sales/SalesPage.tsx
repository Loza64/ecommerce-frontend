import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp } from 'lucide-react'
import { useFindAll } from '@/hooks/core/useFindAll'
import { saleService } from '@/api'
import type { Sale } from '@/models/entities/Order'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Table, type TableColumn } from '@/components/ui/Table'
import { RoutesEnum } from '@/enum/routes..app'
import { formatDateTime } from '@/lib/date'
import { formatMoney } from '@/lib/money'
import { attributesLabel } from '@/lib/product'

const PAGE_SIZE = 10

export default function SalesPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)

  const query = useFindAll<Sale>({
    service: saleService,
    queryKey: 'sales',
    queryParams: { page, pageSize: PAGE_SIZE },
  })
  const sales = query.data?.data ?? []
  const pagination = query.data?.pagination
    ? { ...query.data.pagination, itemsLabel: 'ventas' }
    : null

  const columns: TableColumn<Sale>[] = [
    {
      title: 'Producto',
      key: 'product',
      render: (_v, record) => (
        <div className="flex flex-col">
          <span className="font-medium">{record.productName}</span>
          <span className="text-xs text-(--text-muted)">
            {attributesLabel(record.attributes) || record.sku}
          </span>
        </div>
      ),
    },
    {
      title: 'Cantidad',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'right',
    },
    {
      title: 'Precio',
      key: 'unitPrice',
      align: 'right',
      render: (_v, record) => formatMoney(record.unitPrice),
    },
    {
      title: 'Total',
      key: 'lineTotal',
      align: 'right',
      render: (_v, record) =>
        Number(record.discountAmount) > 0 ? (
          <div className="flex flex-col items-end">
            <span className="font-medium">{formatMoney(record.netTotal)}</span>
            <span className="text-xs text-(--text-muted)">
              {formatMoney(record.lineTotal)} −{' '}
              {formatMoney(record.discountAmount)}
              {record.order.couponCode ? ` (${record.order.couponCode})` : ''}
            </span>
          </div>
        ) : (
          formatMoney(record.lineTotal)
        ),
    },
    {
      title: 'Comprador',
      key: 'buyer',
      render: (_v, record) =>
        record.order.buyer?.name || record.order.buyer?.username || '—',
    },
    {
      title: 'Pagado el',
      key: 'paidAt',
      render: (_v, record) => formatDateTime(record.order.paidAt),
    },
    {
      title: 'Pedido',
      key: 'order',
      render: (_v, record) => `#${record.order.id}`,
    },
  ]

  if (!query.isLoading && sales.length === 0 && page === 1) {
    return (
      <EmptyState
        icon={TrendingUp}
        title="Aún no tienes ventas"
        description="Cuando alguien pague uno de tus productos, la venta aparecerá aquí."
        action={
          <Button
            variant="primary"
            onClick={() => navigate(RoutesEnum.MY_PRODUCTS)}
          >
            Ver mis productos
          </Button>
        }
      />
    )
  }

  return (
    <Table
      columns={columns}
      data={sales}
      loading={query.isLoading}
      emptyText="No hay ventas."
      pagination={pagination}
      onPageChange={setPage}
    />
  )
}
