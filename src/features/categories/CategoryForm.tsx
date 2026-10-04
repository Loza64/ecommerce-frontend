import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import useCrud from '@/hooks/core/useCrud'
import { categoryService } from '@/api'
import Category from '@/models/entities/Category'
import { FormField } from '@/components/ui/FormField'
import { Button } from '@/components/ui/Button'
import { SelectApi } from '@/components/ui/SelectApi'
import { categoryFormSchema, type CategoryFormValues } from '@/schemas/category'
import errorResponse from '@/utils/errorResponse'

export interface CategoryFormProps {
  categoryId: string | number | null
  onSaved: () => void
  onCancelled: () => void
}

export function CategoryForm({
  categoryId,
  onSaved,
  onCancelled,
}: CategoryFormProps) {
  const crud = useCrud<Category>({
    service: categoryService,
    queryKey: 'categories',
  })
  const [formError, setFormError] = useState<string | null>(null)
  const saving = crud.isCreating || crud.isUpdating
  const isEditing = categoryId !== null && categoryId !== undefined

  const { data: editCategory, isLoading: loadingEdit } = crud.useFindById({
    id: categoryId ?? '',
  })

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: { name: '', description: '', parent: null },
  })

  useEffect(() => {
    if (editCategory && isEditing) {
      reset({
        name: editCategory.name,
        description: editCategory.description ?? '',
        parent: editCategory.parent
          ? ({ ...editCategory.parent } as Category)
          : null,
      })
    }
  }, [editCategory, isEditing, reset])

  const onSubmit = async (values: CategoryFormValues) => {
    setFormError(null)
    // las relaciones se envían como { id }
    const payload: Partial<Category> = {
      name: values.name,
      description: values.description || undefined,
      parent: values.parent ? { id: Number(values.parent.id) } : undefined,
    }

    try {
      if (isEditing) {
        await crud.update({ id: categoryId, payload })
      } else {
        await crud.create({ payload: payload as Category })
      }
      onSaved()
    } catch (error) {
      setFormError(errorResponse({ error, alert: false }).message)
    }
  }

  if (isEditing && loadingEdit) {
    return (
      <div className="form-loading-state">
        Cargando datos de la categoría...
      </div>
    )
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit(onSubmit)} noValidate>
      <FormField
        label="Nombre"
        htmlFor="category-name"
        error={errors.name?.message}
      >
        <input
          id="category-name"
          className="field-input"
          type="text"
          {...register('name')}
        />
      </FormField>

      <FormField
        label="Descripción"
        htmlFor="category-description"
        error={errors.description?.message}
      >
        <textarea
          id="category-description"
          className="field-input"
          rows={3}
          {...register('description')}
        />
      </FormField>

      <FormField
        label="Categoría padre"
        hint="Déjala vacía para crear una categoría principal. Solo hay dos niveles."
      >
        <Controller
          control={control}
          name="parent"
          render={({ field }) => (
            <SelectApi<Category>
              service={categoryService}
              querySearch={(search) => ({ search })}
              queryParams={{ root: true, pageSize: 200 }}
              value={field.value}
              onChange={(value) =>
                field.onChange(
                  Array.isArray(value) ? (value[0] ?? null) : value
                )
              }
              placeholder="Sin categoría padre"
            />
          )}
        />
      </FormField>

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
