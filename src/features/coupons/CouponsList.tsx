import { useMemo, useState } from 'react'
import { Pencil, Plus, RotateCw, Trash2 } from 'lucide-react'
import dayjs from 'dayjs'
import { useFindAll } from '@/hooks/core/useFindAll'
import useCrud from '@/hooks/core/useCrud'
import { couponService } from '@/api'
import Coupon from '@/models/entities/Coupon'
import { Toolbar } from '@/components/ui/Toolbar'
import { SearchBox } from '@/components/ui/SearchBox'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { Table, type TableColumn } from '@/components/ui/Table'
import { formatMoney } from '@/lib/money'
import { formatDateTime } from '@/lib/date'
import errorResponse from '@/utils/errorResponse'
import { CouponForm } from './CouponForm'

const PAGE_SIZE = 10

export default function CouponsList() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [showDeleted, setShowDeleted] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | number | null>(null)
  const [toDelete, setToDelete] = useState<Coupon | null>(null)

  const queryParams = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      ...(search ? { search } : {}),
      ...(showDeleted ? { deleted: true } : {}),
    }),
    [page, search, showDeleted]
  )

  const query = useFindAll<Coupon>({
    service: couponService,
    queryKey: 'coupons',
    queryParams,
  })
  const coupons = query.data?.data ?? []
  const pagination = query.data?.pagination
    ? { ...query.data.pagination, itemsLabel: 'cupones' }
    : null

  const crud = useCrud<Coupon>({ service: couponService, queryKey: 'coupons' })

  const onSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const openCreate = () => {
    setEditingId(null)
    setModalOpen(true)
  }

  const openEdit = (coupon: Coupon) => {
    setEditingId(coupon.id!)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingId(null)
  }

  const confirmDelete = async () => {
    if (!toDelete) {
      return
    }
    try {
      await crud.delete({ id: toDelete.id! })
    } catch (error) {
      errorResponse({ error })
    }
    setToDelete(null)
  }

  const restore = async (coupon: Coupon) => {
    try {
      await crud.restore({ id: coupon.id! })
    } catch (error) {
      errorResponse({ error })
    }
  }

  const columns: TableColumn<Coupon>[] = [
    { title: 'Código', dataIndex: 'code', key: 'code' },
    {
      title: 'Descuento',
      key: 'discount',
      render: (_v, record) =>
        record.discountType === 'percentage'
          ? `${Number(record.discountValue)}%`
          : formatMoney(record.discountValue),
    },
    {
      title: 'Vence',
      key: 'expiration',
      render: (_v, record) => formatDateTime(record.expirationDate),
    },
    {
      title: 'Estado',
      key: 'status',
      render: (_v, record) => {
        if (record.deletedAt) {
          return <Badge variant="neutral">Eliminado</Badge>
        }
        return dayjs(record.expirationDate).isBefore(dayjs()) ? (
          <Badge variant="danger">Vencido</Badge>
        ) : (
          <Badge variant="success">Vigente</Badge>
        )
      },
    },
    {
      title: '',
      key: 'actions',
      width: '90px',
      render: (_v, record) => (
        <div className="row-actions">
          {record.deletedAt ? (
            <Button
              variant="icon-success"
              tooltip="Restaurar"
              onClick={() => restore(record)}
            >
              <RotateCw size={15} />
            </Button>
          ) : (
            <>
              <Button
                variant="icon"
                tooltip="Editar"
                onClick={() => openEdit(record)}
              >
                <Pencil size={15} />
              </Button>
              <Button
                variant="icon-danger"
                tooltip="Eliminar"
                onClick={() => setToDelete(record)}
              >
                <Trash2 size={15} />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ]

  return (
    <>
      <Toolbar
        actions={
          <Button variant="primary" onClick={openCreate}>
            <Plus size={16} />
            Nuevo cupón
          </Button>
        }
      >
        <SearchBox
          placeholder="Buscar cupones..."
          value={search}
          onValueChange={onSearch}
        />

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={showDeleted}
            onChange={(e) => setShowDeleted(e.target.checked)}
          />
          Mostrar eliminados
        </label>
      </Toolbar>

      <Table
        columns={columns}
        data={coupons}
        loading={query.isLoading}
        emptyText="No se encontraron cupones."
        pagination={pagination}
        onPageChange={setPage}
      />

      <Modal
        open={modalOpen}
        title={editingId ? 'Editar cupón' : 'Nuevo cupón'}
        onClose={closeModal}
      >
        <CouponForm
          couponId={editingId}
          onSaved={closeModal}
          onCancelled={closeModal}
        />
      </Modal>

      <ConfirmModal
        open={!!toDelete}
        tone="danger"
        title="Eliminar cupón"
        description={
          <>
            ¿Seguro que quieres eliminar el cupón{' '}
            <strong>{toDelete?.code}</strong>? Podrás restaurarlo desde
            &quot;Mostrar eliminados&quot;.
          </>
        }
        confirmText="Eliminar"
        cancelText="Cancelar"
        loading={crud.isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  )
}
