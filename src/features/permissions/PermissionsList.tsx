import { useMemo, useState } from 'react'
import { Pencil } from 'lucide-react'
import { useFindAll } from '@/hooks/core/useFindAll'
import { permissionService } from '@/api'
import Permissions from '@/models/entities/Permissions'
import { Toolbar } from '@/components/ui/Toolbar'
import { SearchBox } from '@/components/ui/SearchBox'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Table, type TableColumn } from '@/components/ui/Table'
import { PermissionForm } from './PermissionForm'

const PAGE_SIZE = 10

export default function PermissionsList() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingPermission, setEditingPermission] =
    useState<Permissions | null>(null)

  const queryParams = useMemo(
    () => ({ page, pageSize: PAGE_SIZE, ...(search ? { search } : {}) }),
    [page, search]
  )

  const permissionsQuery = useFindAll<Permissions>({
    service: permissionService,
    queryKey: 'permissions',
    queryParams,
  })
  const permissions = permissionsQuery.data?.data ?? []
  const pagination = permissionsQuery.data?.pagination
    ? { ...permissionsQuery.data.pagination, itemsLabel: 'permisos' }
    : null

  const onSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const openEdit = (permission: Permissions) => {
    setEditingPermission(permission)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingPermission(null)
  }

  const columns: TableColumn<Permissions>[] = [
    {
      title: 'Nombre',
      key: 'name',
      render: (_v, record) => <Badge variant="neutral">{record.name}</Badge>,
    },
    {
      title: 'Título',
      dataIndex: 'title',
      key: 'title',
      render: (value) =>
        value === null || value === undefined ? 'N/A' : String(value),
    },
    {
      title: '',
      key: 'actions',
      width: '60px',
      render: (_v, record) => (
        <div className="row-actions">
          <Button
            variant="icon"
            tooltip="Editar título"
            onClick={() => openEdit(record)}
          >
            <Pencil size={15} />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <Toolbar
        actions={
          <span className="hint">
            Los permisos se generan automáticamente a partir de los endpoints
            del backend.
          </span>
        }
      >
        <SearchBox
          placeholder="Buscar permisos..."
          value={search}
          onValueChange={onSearch}
        />
      </Toolbar>

      <Table
        columns={columns}
        data={permissions}
        rowKey="id"
        loading={permissionsQuery.isLoading}
        emptyText="No se encontraron permisos."
        pagination={pagination}
        onPageChange={setPage}
      />

      <Modal open={modalOpen} title="Editar permiso" onClose={closeModal}>
        <PermissionForm
          permission={editingPermission}
          onSaved={closeModal}
          onCancelled={closeModal}
        />
      </Modal>
    </div>
  )
}
