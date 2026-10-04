import { useMemo, useState } from 'react'
import { Pencil, Plus, RotateCw, Trash2 } from 'lucide-react'
import { useFindAll } from '@/hooks/core/useFindAll'
import useCrud from '@/hooks/core/useCrud'
import { productService } from '@/api'
import Product from '@/models/entities/Product'
import { Toolbar } from '@/components/ui/Toolbar'
import { SearchBox } from '@/components/ui/SearchBox'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { Table, type TableColumn } from '@/components/ui/Table'
import { ImageWithBlurHash } from '@/components/ui/ImageWithBlurHash'
import { formatMoney } from '@/lib/money'
import { imageUrl, mainImage, priceRange, totalStock } from '@/lib/product'
import errorResponse from '@/utils/errorResponse'
import { ProductForm } from './ProductForm'

const PAGE_SIZE = 10

export type ProductsScope = 'mine' | 'all'

/**
 * `mine`: productos del usuario (incluye eliminados, para restaurarlos).
 * `all`: todo el catálogo, para moderación (el backend solo permite editar
 * o eliminar a quien tenga MANAGE_PRODUCTS o sea SUPER_ADMIN).
 */
export function ProductsManager({ scope }: { scope: ProductsScope }) {
  const isMine = scope === 'mine'
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [showDeleted, setShowDeleted] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | number | null>(null)
  const [toDelete, setToDelete] = useState<Product | null>(null)

  const queryParams = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      ...(search ? { search } : {}),
      ...(isMine && showDeleted ? { deleted: true } : {}),
    }),
    [page, search, showDeleted, isMine]
  )

  const query = useFindAll<Product>({
    service: productService,
    endpoint: isMine ? 'products/mine' : undefined,
    queryKey: 'products',
    queryParams,
  })
  const products = query.data?.data ?? []
  const pagination = query.data?.pagination
    ? { ...query.data.pagination, itemsLabel: 'productos' }
    : null

  const crud = useCrud<Product>({
    service: productService,
    queryKey: 'products',
  })

  const onSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const openCreate = () => {
    setEditingId(null)
    setModalOpen(true)
  }

  const openEdit = (product: Product) => {
    setEditingId(product.id!)
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

  const restore = async (product: Product) => {
    try {
      await crud.restore({ id: product.id! })
    } catch (error) {
      errorResponse({ error })
    }
  }

  const columns: TableColumn<Product>[] = [
    {
      title: '',
      key: 'image',
      width: '64px',
      render: (_v, record) => (
        <div className="h-11 w-11 overflow-hidden rounded-(--radius-md) bg-(--surface-muted)">
          <ImageWithBlurHash
            src={imageUrl(mainImage(record), true)}
            alt={record.name ?? ''}
          />
        </div>
      ),
    },
    {
      title: 'Producto',
      key: 'name',
      render: (_v, record) => (
        <div className="flex flex-col">
          <span className="font-medium">{record.name}</span>
          <span className="text-xs text-(--text-muted)">
            {record.category?.parent?.name
              ? `${record.category.parent.name} › ${record.category.name}`
              : (record.category?.name ?? 'Sin categoría')}
          </span>
        </div>
      ),
    },
    ...(isMine
      ? []
      : [
          {
            title: 'Vendedor',
            key: 'seller',
            render: (_v: unknown, record: Product) =>
              record.seller
                ? `${record.seller.name} (@${record.seller.username})`
                : '—',
          },
        ]),
    {
      title: 'Precio',
      key: 'price',
      align: 'right',
      render: (_v, record) => {
        const { min, max } = priceRange(record.variants)
        return min === max
          ? formatMoney(min)
          : `${formatMoney(min)} – ${formatMoney(max)}`
      },
    },
    {
      title: 'Stock',
      key: 'stock',
      align: 'right',
      render: (_v, record) => totalStock(record.variants),
    },
    {
      title: 'Estado',
      key: 'status',
      render: (_v, record) =>
        record.deletedAt ? (
          <Badge variant="neutral">Eliminado</Badge>
        ) : totalStock(record.variants) === 0 ? (
          <Badge variant="warning">Agotado</Badge>
        ) : (
          <Badge variant="success">Publicado</Badge>
        ),
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
            Nuevo producto
          </Button>
        }
      >
        <SearchBox
          placeholder={
            isMine ? 'Buscar en mis productos...' : 'Buscar productos...'
          }
          value={search}
          onValueChange={onSearch}
        />

        {isMine && (
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={showDeleted}
              onChange={(e) => {
                setShowDeleted(e.target.checked)
                setPage(1)
              }}
            />
            Mostrar eliminados
          </label>
        )}
      </Toolbar>

      <Table
        columns={columns}
        data={products}
        loading={query.isLoading}
        emptyText={
          isMine
            ? 'Todavía no has publicado productos.'
            : 'No se encontraron productos.'
        }
        pagination={pagination}
        onPageChange={setPage}
      />

      <Modal
        open={modalOpen}
        title={editingId ? 'Editar producto' : 'Nuevo producto'}
        widthPx={680}
        onClose={closeModal}
      >
        <ProductForm
          productId={editingId}
          onSaved={closeModal}
          onCancelled={closeModal}
        />
      </Modal>

      <ConfirmModal
        open={!!toDelete}
        tone="danger"
        title="Eliminar producto"
        description={
          <>
            ¿Seguro que quieres eliminar <strong>{toDelete?.name}</strong>?
            Desaparecerá del catálogo y de los carritos activos. Las compras ya
            realizadas conservan su historial.
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
