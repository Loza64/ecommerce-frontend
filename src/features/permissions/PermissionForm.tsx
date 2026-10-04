import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import useCrud from '@/hooks/core/useCrud'
import { permissionService } from '@/api'
import Permissions from '@/models/entities/Permissions'
import { FormField } from '@/components/ui/FormField'
import { Button } from '@/components/ui/Button'
import {
  permissionFormSchema,
  type PermissionFormValues,
} from '@/schemas/permission'

export interface PermissionFormProps {
  permission: Permissions | null
  onSaved: () => void
  onCancelled: () => void
}

export function PermissionForm({
  permission,
  onSaved,
  onCancelled,
}: PermissionFormProps) {
  const crud = useCrud<Permissions>({
    service: permissionService,
    queryKey: 'permissions',
  })
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PermissionFormValues>({
    resolver: zodResolver(permissionFormSchema),
    defaultValues: { title: permission?.title ?? '' },
  })

  useEffect(() => {
    if (permission) {
      reset({ title: permission.title })
    }
  }, [permission, reset])

  const onSubmit = async (values: PermissionFormValues) => {
    if (!permission) {
      return
    }
    setFormError(null)
    try {
      await crud.update({
        id: permission.id!,
        payload: { title: values.title },
      })
      onSaved()
    } catch {
      setFormError('No se pudo actualizar el permiso. Intenta de nuevo.')
    }
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit(onSubmit)} noValidate>
      <FormField
        label="Título"
        htmlFor="permission-title"
        error={errors.title?.message}
      >
        <input
          id="permission-title"
          className="field-input"
          type="text"
          {...register('title')}
        />
      </FormField>

      {permission && (
        <>
          <FormField label="Método">
            <input
              className="field-input"
              type="text"
              value={permission.method}
              disabled
            />
          </FormField>

          <FormField label="Ruta">
            <input
              className="field-input"
              type="text"
              value={permission.path}
              disabled
            />
          </FormField>
        </>
      )}

      {formError && <span className="form-error">{formError}</span>}

      <div className="form-actions">
        <Button variant="ghost" onClick={onCancelled}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" disabled={crud.isUpdating}>
          {crud.isUpdating ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    </form>
  )
}
