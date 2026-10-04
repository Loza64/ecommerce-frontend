import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import useCrud from '@/hooks/core/useCrud'
import { roleService, permissionService } from '@/api'
import Role from '@/models/entities/Role'
import Permissions from '@/models/entities/Permissions'
import { FormField } from '@/components/ui/FormField'
import { Button } from '@/components/ui/Button'
import { SelectApi } from '@/components/ui/SelectApi'
import { roleFormSchema, type RoleFormValues } from '@/schemas/role'

export interface RoleFormProps {
  roleId: string | number | null
  onSaved: () => void
  onCancelled: () => void
}

const renderPermission = (item: Permissions): string =>
  item.title ?? `${item.name}`

export function RoleForm({ roleId, onSaved, onCancelled }: RoleFormProps) {
  const crud = useCrud<Role>({ service: roleService, queryKey: 'roles' })
  const [formError, setFormError] = useState<string | null>(null)
  const saving = crud.isCreating || crud.isUpdating
  const isEditing = roleId !== null && roleId !== undefined

  const { data: editRole, isLoading: loadingEdit } = crud.useFindById({
    id: roleId ?? '',
  })

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: { name: '', active: true, permissions: [] },
  })

  useEffect(() => {
    if (editRole && isEditing) {
      reset({
        name: editRole.name ?? '',
        active: editRole.active,
        permissions: editRole.permissions ?? [],
      })
    }
  }, [editRole, isEditing, reset])

  const onSubmit = async (values: RoleFormValues) => {
    setFormError(null)
    const payload: Partial<Role> = {
      name: values.name,
      active: values.active,
      permissions: values.permissions.map(({ id }) => ({
        id,
      })) as Permissions[],
    }

    try {
      if (isEditing) {
        await crud.update({ id: roleId, payload })
      } else {
        await crud.create({ payload: payload as Role })
      }
      onSaved()
    } catch {
      setFormError(
        'No se pudo guardar el rol. Revisa los datos e intenta de nuevo.'
      )
    }
  }

  if (isEditing && loadingEdit) {
    return <div className="form-loading-state">Cargando datos del rol...</div>
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit(onSubmit)} noValidate>
      <FormField
        label="Nombre"
        htmlFor="role-name"
        error={errors.name?.message}
      >
        <input
          id="role-name"
          className="field-input"
          type="text"
          {...register('name')}
        />
      </FormField>

      <FormField label="Permisos">
        <Controller
          control={control}
          name="permissions"
          render={({ field }) => (
            <SelectApi<Permissions>
              multiple
              service={permissionService}
              querySearch={(search) => ({ search })}
              queryParams={{ pageSize: 200 }}
              renderOption={renderPermission}
              value={field.value}
              onChange={(value) =>
                field.onChange(
                  Array.isArray(value) ? value : value ? [value] : []
                )
              }
              placeholder="Selecciona permisos"
              notFoundText="No se encontraron permisos"
            />
          )}
        />
      </FormField>

      <label className="form-toggle">
        <input type="checkbox" {...register('active')} />
        Rol activo
      </label>

      {formError && <span className="form-error">{formError}</span>}

      <div className="form-actions">
        <Button variant="ghost" onClick={onCancelled}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    </form>
  )
}
