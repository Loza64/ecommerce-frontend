import { useMemo, useState } from 'react'
import { Pencil, Plus, RotateCw, Trash2 } from 'lucide-react'
import { useFindAll } from '@/hooks/core/useFindAll'
import useCrud from '@/hooks/core/useCrud'
import { roleService } from '@/api'
import Role from '@/models/entities/Role'
import { Toolbar } from '@/components/ui/Toolbar'
import { SearchBox } from '@/components/ui/SearchBox'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { Table, type TableColumn } from '@/components/ui/Table'
import { RoleForm } from './RoleForm'

const PAGE_SIZE = 10

export default function RolesList() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [showDeleted, setShowDeleted] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | number | null>(null)
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null)

  const queryParams = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      ...(search ? { search } : {}),
      ...(showDeleted ? { deleted: true } : {}),
    }),
    [page, search, showDeleted]
  )

  const rolesQuery = useFindAll<Role>({
    service: roleService,
    queryKey: 'roles',
    queryParams,
  })
  const roles = rolesQuery.data?.data ?? []
  const pagination = rolesQuery.data?.pagination
    ? { ...rolesQuery.data.pagination, itemsLabel: 'roles' }
    : null

  const crud = useCrud<Role>({ service: roleService, queryKey: 'roles' })

  const onSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const openCreate = () => {
    setEditingId(null)
    setModalOpen(true)
  }

  const openEdit = (role: Role) => {
    setEditingId(role.id!)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingId(null)
  }

  const remove = (role: Role) => {
    setRoleToDelete(role)
  }

  const confirmDelete = async () => {
    if (!roleToDelete) {
      return
    }
    await crud.delete({ id: roleToDelete.id! })
    setRoleToDelete(null)
  }

  const restore = (role: Role) => {
    crud.restore({ id: role.id! })
  }

  const columns: TableColumn<Role>[] = [
    { title: 'Nombre', dataIndex: 'name', key: 'name' },
    {
      title: 'Permisos',
      key: 'permissions',
      render: (_v, record) => `${record.permissions?.length ?? 0} permisos`,
    },
    {
      title: 'Estado',
      key: 'status',
      render: (_v, record) =>
        record.deletedAt ? (
          <Badge variant="neutral">Eliminado</Badge>
        ) : record.active ? (
          <Badge variant="success">Activo</Badge>
        ) : (
          <Badge variant="danger">Inactivo</Badge>
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
            Nuevo rol
          </Button>
        }
      >
        <SearchBox
          placeholder="Buscar roles..."
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
        data={roles}
        loading={rolesQuery.isLoading}
        emptyText="No se encontraron roles."
        pagination={pagination}
        onPageChange={setPage}
      />

      <Modal
        open={modalOpen}
        title={editingId ? 'Editar rol' : 'Nuevo rol'}
        onClose={closeModal}
      >
        <RoleForm
          roleId={editingId}
          onSaved={closeModal}
          onCancelled={closeModal}
        />
      </Modal>

      <ConfirmModal
        open={!!roleToDelete}
        tone="danger"
        title="Eliminar rol"
        description={
          <>
            ¿Seguro que quieres eliminar el rol{' '}
            <strong>{roleToDelete?.name}</strong>?
          </>
        }
        confirmText="Eliminar"
        cancelText="Cancelar"
        loading={crud.isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setRoleToDelete(null)}
      />
    </>
  )
}
