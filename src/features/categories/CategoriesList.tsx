import { useMemo, useState } from 'react'
import { Pencil, Plus, RotateCw, Trash2 } from 'lucide-react'
import { useFindAll } from '@/hooks/core/useFindAll'
import useCrud from '@/hooks/core/useCrud'
import { categoryService } from '@/api'
import Category from '@/models/entities/Category'
import { Toolbar } from '@/components/ui/Toolbar'
import { SearchBox } from '@/components/ui/SearchBox'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { Table, type TableColumn } from '@/components/ui/Table'
import errorResponse from '@/utils/errorResponse'
import { CategoryForm } from './CategoryForm'

const PAGE_SIZE = 10

export default function CategoriesList() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [showDeleted, setShowDeleted] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | number | null>(null)
  const [toDelete, setToDelete] = useState<Category | null>(null)

  const queryParams = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      ...(search ? { search } : {}),
      ...(showDeleted ? { deleted: true } : {}),
    }),
    [page, search, showDeleted]
  )

  const query = useFindAll<Category>({
    service: categoryService,
    queryKey: 'categories',
    queryParams,
  })
  const categories = query.data?.data ?? []
  const pagination = query.data?.pagination
    ? { ...query.data.pagination, itemsLabel: 'categorías' }
    : null

  const crud = useCrud<Category>({
    service: categoryService,
    queryKey: 'categories',
  })

  const onSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const openCreate = () => {
    setEditingId(null)
    setModalOpen(true)
  }

  const openEdit = (category: Category) => {
    setEditingId(category.id!)
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
      // p. ej. la categoría tiene subcategorías o productos
      errorResponse({ error })
    }
    setToDelete(null)
  }

  const restore = async (category: Category) => {
    try {
      await crud.restore({ id: category.id! })
    } catch (error) {
      errorResponse({ error })
    }
  }

  const columns: TableColumn<Category>[] = [
    { title: 'Nombre', dataIndex: 'name', key: 'name' },
    {
      title: 'Tipo',
      key: 'type',
      render: (_v, record) =>
        record.parent ? `Subcategoría de ${record.parent.name}` : 'Principal',
    },
    {
      title: 'Descripción',
      key: 'description',
      render: (_v, record) => record.description ?? '—',
    },
    {
      title: 'Estado',
      key: 'status',
      render: (_v, record) =>
        record.deletedAt ? (
          <Badge variant="neutral">Eliminada</Badge>
        ) : (
          <Badge variant="success">Activa</Badge>
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
            Nueva categoría
          </Button>
        }
      >
        <SearchBox
          placeholder="Buscar categorías..."
          value={search}
          onValueChange={onSearch}
        />

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={showDeleted}
            onChange={(e) => setShowDeleted(e.target.checked)}
          />
          Mostrar eliminadas
        </label>
      </Toolbar>

      <Table
        columns={columns}
        data={categories}
        loading={query.isLoading}
        emptyText="No se encontraron categorías."
        pagination={pagination}
        onPageChange={setPage}
      />

      <Modal
        open={modalOpen}
        title={editingId ? 'Editar categoría' : 'Nueva categoría'}
        onClose={closeModal}
      >
        <CategoryForm
          categoryId={editingId}
          onSaved={closeModal}
          onCancelled={closeModal}
        />
      </Modal>

      <ConfirmModal
        open={!!toDelete}
        tone="danger"
        title="Eliminar categoría"
        description={
          <>
            ¿Seguro que quieres eliminar <strong>{toDelete?.name}</strong>? No
            se puede eliminar si tiene subcategorías o productos.
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
