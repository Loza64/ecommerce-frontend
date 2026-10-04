import { useMemo, useState } from 'react'
import { Pencil, Plus, RotateCw, Trash2 } from 'lucide-react'
import { useFindAll } from '@/hooks/core/useFindAll'
import useCrud from '@/hooks/core/useCrud'
import { userService } from '@/api'
import User from '@/models/entities/User'
import { Toolbar } from '@/components/ui/Toolbar'
import { SearchBox } from '@/components/ui/SearchBox'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { Table, type TableColumn } from '@/components/ui/Table'
import { UserForm } from './UserForm'

const PAGE_SIZE = 10

export default function UsersList() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [showDeleted, setShowDeleted] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | number | null>(null)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)

  const queryParams = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      ...(search ? { search } : {}),
      ...(showDeleted ? { deleted: true } : {}),
    }),
    [page, search, showDeleted]
  )

  const usersQuery = useFindAll<User>({
    service: userService,
    queryKey: 'users',
    queryParams,
  })
  const users = usersQuery.data?.data ?? []
  const pagination = usersQuery.data?.pagination
    ? { ...usersQuery.data.pagination, itemsLabel: 'usuarios' }
    : null

  const crud = useCrud<User>({ service: userService, queryKey: 'users' })

  const onSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const openCreate = () => {
    setEditingId(null)
    setModalOpen(true)
  }

  const openEdit = (user: User) => {
    setEditingId(user.id!)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingId(null)
  }

  const remove = (user: User) => {
    setUserToDelete(user)
  }

  const confirmDelete = async () => {
    if (!userToDelete) {
      return
    }
    await crud.delete({ id: userToDelete.id! })
    setUserToDelete(null)
  }

  const restore = (user: User) => {
    crud.restore({ id: user.id! })
  }

  const columns: TableColumn<User>[] = [
    { title: 'Usuario', dataIndex: 'username', key: 'username' },
    {
      title: 'Nombre',
      key: 'fullname',
      render: (_v, record) =>
        `${record.name ?? ''} ${record.surname ?? ''}`.trim(),
    },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Rol',
      key: 'role',
      render: (_v, record) => record.role?.name ?? '—',
    },
    {
      title: 'Estado',
      key: 'status',
      render: (_v, record) =>
        record.deletedAt ? (
          <Badge variant="neutral">Eliminado</Badge>
        ) : record.blocked ? (
          <Badge variant="danger">Bloqueado</Badge>
        ) : (
          <Badge variant="success">Activo</Badge>
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
                onClick={() => remove(record)}
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
            Nuevo usuario
          </Button>
        }
      >
        <SearchBox
          placeholder="Buscar usuarios..."
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
        data={users}
        loading={usersQuery.isLoading}
        emptyText="No se encontraron usuarios."
        pagination={pagination}
        onPageChange={setPage}
      />

      <Modal
        open={modalOpen}
        title={editingId ? 'Editar usuario' : 'Nuevo usuario'}
        onClose={closeModal}
      >
        <UserForm
          userId={editingId}
          onSaved={closeModal}
          onCancelled={closeModal}
        />
      </Modal>

      <ConfirmModal
        open={!!userToDelete}
        tone="danger"
        title="Eliminar usuario"
        description={
          <>
            ¿Seguro que quieres eliminar a{' '}
            <strong>{userToDelete?.username}</strong>? Podrás restaurarlo más
            adelante desde &quot;Mostrar eliminados&quot;.
          </>
        }
        confirmText="Eliminar"
        cancelText="Cancelar"
        loading={crud.isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setUserToDelete(null)}
      />
    </>
  )
}
