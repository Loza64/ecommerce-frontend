import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import useCrud from '@/hooks/core/useCrud'
import { userService, roleService } from '@/api'
import User from '@/models/entities/User'
import Role from '@/models/entities/Role'
import { FormField } from '@/components/ui/FormField'
import { Button } from '@/components/ui/Button'
import { SelectApi } from '@/components/ui/SelectApi'
import {
  userFormSchema,
  validatePasswordRequiredOnCreate,
  type UserFormValues,
} from '@/schemas/user'

export interface UserFormProps {
  userId: string | number | null
  onSaved: () => void
  onCancelled: () => void
}

export function UserForm({ userId, onSaved, onCancelled }: UserFormProps) {
  const crud = useCrud<User>({ service: userService, queryKey: 'users' })
  const [formError, setFormError] = useState<string | null>(null)
  const saving = crud.isCreating || crud.isUpdating

  const { data: editUser, isLoading: loadingEdit } = crud.useFindById({
    id: userId ?? '',
  })
  const isEditing = userId !== null && userId !== undefined

  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: '',
      name: '',
      surname: '',
      email: '',
      password: '',
      blocked: false,
      role: null,
    },
  })

  useEffect(() => {
    if (editUser && isEditing) {
      reset({
        username: editUser.username,
        name: editUser.name ?? '',
        surname: editUser.surname,
        email: editUser.email,
        password: '',
        blocked: editUser.blocked,
        role: editUser.role ?? null,
      })
    }
  }, [editUser, isEditing, reset])

  const onSubmit = async (values: UserFormValues) => {
    const passwordError = validatePasswordRequiredOnCreate(
      isEditing,
      values.password
    )
    if (passwordError) {
      setError('password', { message: passwordError })
      return
    }

    setFormError(null)
    const payload: Partial<User> & { password?: string } = {
      username: values.username,
      name: values.name,
      surname: values.surname,
      email: values.email,
      blocked: values.blocked,
      role: values.role ? ({ id: values.role.id } as Role) : undefined,
    }
    if (!isEditing && values.password) {
      payload.password = values.password
    }

    try {
      if (isEditing) {
        await crud.update({ id: userId, payload })
      } else {
        await crud.create({ payload: payload as User })
      }
      onSaved()
    } catch {
      setFormError(
        'No se pudo guardar el usuario. Revisa los datos e intenta de nuevo.'
      )
    }
  }

  if (isEditing && loadingEdit) {
    return (
      <div className="form-loading-state">Cargando datos del usuario...</div>
    )
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit(onSubmit)} noValidate>
      <FormField
        label="Usuario"
        htmlFor="username"
        error={errors.username?.message}
      >
        <input
          id="username"
          className="field-input"
          type="text"
          {...register('username')}
        />
      </FormField>

      <FormField label="Nombre" htmlFor="name">
        <input
          id="name"
          className="field-input"
          type="text"
          {...register('name')}
        />
      </FormField>

      <FormField
        label="Apellido"
        htmlFor="surname"
        error={errors.surname?.message}
      >
        <input
          id="surname"
          className="field-input"
          type="text"
          {...register('surname')}
        />
      </FormField>

      <FormField label="Email" htmlFor="email" error={errors.email?.message}>
        <input
          id="email"
          className="field-input"
          type="email"
          {...register('email')}
        />
      </FormField>

      {!isEditing && (
        <FormField
          label="Contraseña"
          htmlFor="password"
          error={errors.password?.message}
        >
          <input
            id="password"
            className="field-input"
            type="password"
            {...register('password')}
          />
        </FormField>
      )}

      <FormField label="Rol">
        <Controller
          control={control}
          name="role"
          render={({ field }) => (
            <SelectApi<Role>
              service={roleService}
              querySearch={(search) => ({ search })}
              value={field.value}
              onChange={(value) =>
                field.onChange(
                  Array.isArray(value) ? (value[0] ?? null) : value
                )
              }
              placeholder="Selecciona un rol"
            />
          )}
        />
      </FormField>

      {isEditing && (
        <label className="form-toggle">
          <input type="checkbox" {...register('blocked')} />
          Usuario bloqueado
        </label>
      )}

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
