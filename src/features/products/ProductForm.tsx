import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import useCrud from '@/hooks/core/useCrud'
import { categoryService, productService, uploadService } from '@/api'
import Category from '@/models/entities/Category'
import Product, { type ProductVariant } from '@/models/entities/Product'
import type ImageAsset from '@/models/app/photos/ImageAsset'
import { FormField } from '@/components/ui/FormField'
import { Button } from '@/components/ui/Button'
import { SelectApi } from '@/components/ui/SelectApi'
import { ImageDropzone } from '@/components/ui/ImageDropzone'
import {
  MAX_IMAGES,
  productFormSchema,
  type ProductFormValues,
} from '@/schemas/product'
import { imageUrl } from '@/lib/product'
import errorResponse from '@/utils/errorResponse'
import {
  VariantsManager,
  type VariantDraft,
  type VariantRow,
} from './VariantsManager'

export interface ProductFormProps {
  productId: string | number | null
  onSaved: () => void
  onCancelled: () => void
}

let localVariantCounter = 0
const nextLocalKey = () => `local-${(localVariantCounter += 1)}`

function toRow(variant: ProductVariant): VariantRow {
  return {
    key: variant.id!,
    sku: variant.sku,
    price: Number(variant.price),
    stockQuantity: Number(variant.stockQuantity),
    attributes: Object.fromEntries(
      Object.entries(variant.attributes ?? {}).map(([key, value]) => [
        key,
        String(value),
      ])
    ),
  }
}

function categoryLabel(category: Category): string {
  return category.parent?.name
    ? `${category.parent.name} › ${category.name}`
    : category.name
}

export function ProductForm({
  productId,
  onSaved,
  onCancelled,
}: ProductFormProps) {
  const queryClient = useQueryClient()
  const crud = useCrud<Product>({
    service: productService,
    queryKey: 'products',
  })
  const isEditing = productId !== null && productId !== undefined
  const saving = crud.isCreating || crud.isUpdating

  const [formError, setFormError] = useState<string | null>(null)
  const [variantsError, setVariantsError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  // en alta, las variantes viven en memoria hasta guardar el producto
  const [draftVariants, setDraftVariants] = useState<VariantRow[]>([])

  const {
    data: product,
    isLoading: loadingEdit,
    refetch,
  } = crud.useFindById({ id: productId ?? '' })

  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: { name: '', description: '', category: null, images: [] },
  })

  useEffect(() => {
    if (product && isEditing) {
      reset({
        name: product.name,
        description: product.description,
        category: product.category
          ? ({ ...product.category } as Category)
          : null,
        images: product.images.map((image) => ({
          id: image.id,
          url: imageUrl(image, true),
        })),
      })
    }
  }, [product, isEditing, reset])

  const variants: VariantRow[] = useMemo(
    () => (isEditing ? (product?.variants ?? []).map(toRow) : draftVariants),
    [isEditing, product, draftVariants]
  )

  /** Sube las imágenes nuevas y devuelve los ids en el orden elegido. */
  const resolveImageIds = async (assets: ImageAsset[]): Promise<number[]> => {
    const files = assets.filter((asset) => !asset.id && asset.file)
    const uploaded = files.length
      ? await uploadService.uploadMany(files.map((asset) => asset.file!))
      : []
    let next = 0
    return assets.map((asset) =>
      asset.id ? Number(asset.id) : Number(uploaded[next++].id)
    )
  }

  const onSubmit = async (values: ProductFormValues) => {
    setFormError(null)
    setVariantsError(null)

    if (!isEditing && draftVariants.length === 0) {
      setVariantsError('Agrega al menos una variante con su precio y stock.')
      return
    }

    try {
      setUploading(true)
      const imageIds = await resolveImageIds(values.images)
      setUploading(false)

      // las relaciones se envían como { id } (objeto) o [{ id }] (lista)
      const base = {
        name: values.name,
        description: values.description,
        category: { id: Number(values.category!.id) },
        images: imageIds.map((id) => ({ id })),
      }

      if (isEditing) {
        await crud.update({ id: productId, payload: base })
      } else {
        await crud.create({
          payload: {
            ...base,
            variants: draftVariants.map(
              ({ sku, price, stockQuantity, attributes }) => ({
                sku,
                price,
                stockQuantity,
                attributes,
              })
            ),
          },
        })
      }
      onSaved()
    } catch (error) {
      setUploading(false)
      const { message } = errorResponse({ error, alert: false })
      setFormError(message)
      if (/imagen|image/i.test(message)) {
        setError('images', { message })
      }
    }
  }

  // ── variantes ────────────────────────────────────────────────────────────
  const refreshProduct = async () => {
    await refetch()
    await queryClient.invalidateQueries({ queryKey: ['products'] })
  }

  const createVariant = async (draft: VariantDraft) => {
    setVariantsError(null)
    if (!isEditing) {
      setDraftVariants((rows) => [...rows, { key: nextLocalKey(), ...draft }])
      return
    }
    try {
      await productService.addVariant(productId, draft)
      await refreshProduct()
    } catch (error) {
      errorResponse({ error })
      throw error
    }
  }

  const updateVariant = async (row: VariantRow, draft: VariantDraft) => {
    setVariantsError(null)
    if (!isEditing) {
      setDraftVariants((rows) =>
        rows.map((item) =>
          item.key === row.key ? { key: row.key, ...draft } : item
        )
      )
      return
    }
    try {
      await productService.updateVariant(productId, row.key, draft)
      await refreshProduct()
    } catch (error) {
      errorResponse({ error })
      throw error
    }
  }

  const removeVariant = async (row: VariantRow) => {
    setVariantsError(null)
    if (!isEditing) {
      setDraftVariants((rows) => rows.filter((item) => item.key !== row.key))
      return
    }
    try {
      await productService.removeVariant(productId, row.key)
      await refreshProduct()
    } catch (error) {
      // p. ej. un producto siempre conserva al menos una variante
      errorResponse({ error })
    }
  }

  if (isEditing && loadingEdit) {
    return (
      <div className="form-loading-state">Cargando datos del producto...</div>
    )
  }

  const busy = saving || uploading

  return (
    <form className="form-grid" onSubmit={handleSubmit(onSubmit)} noValidate>
      <FormField
        label="Nombre"
        htmlFor="product-name"
        error={errors.name?.message}
      >
        <input
          id="product-name"
          className="field-input"
          type="text"
          {...register('name')}
        />
      </FormField>

      <FormField
        label="Descripción"
        htmlFor="product-description"
        error={errors.description?.message}
      >
        <textarea
          id="product-description"
          className="field-input"
          rows={4}
          {...register('description')}
        />
      </FormField>

      <FormField label="Categoría" error={errors.category?.message}>
        <Controller
          control={control}
          name="category"
          render={({ field }) => (
            <SelectApi<Category>
              service={categoryService}
              querySearch={(search) => ({ search })}
              queryParams={{ pageSize: 200 }}
              renderOption={categoryLabel}
              value={field.value}
              onChange={(value) =>
                field.onChange(
                  Array.isArray(value) ? (value[0] ?? null) : value
                )
              }
              placeholder="Selecciona una categoría"
            />
          )}
        />
      </FormField>

      <FormField
        label="Imágenes"
        hint={`Entre 1 y ${MAX_IMAGES}. La primera es la imagen principal.`}
        error={errors.images?.message}
      >
        <Controller
          control={control}
          name="images"
          render={({ field }) => (
            <ImageDropzone
              value={field.value}
              onChange={field.onChange}
              maxFiles={MAX_IMAGES}
              disabled={busy}
              onError={(message) => setError('images', { message })}
            />
          )}
        />
      </FormField>

      <VariantsManager
        variants={variants}
        onCreate={createVariant}
        onUpdate={updateVariant}
        onRemove={removeVariant}
      />
      {variantsError && <span className="form-error">{variantsError}</span>}

      {formError && <span className="form-error">{formError}</span>}

      <div className="form-actions">
        <Button variant="ghost" onClick={onCancelled}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" disabled={busy}>
          {uploading
            ? 'Subiendo imágenes...'
            : saving
              ? 'Guardando...'
              : 'Guardar'}
        </Button>
      </div>
    </form>
  )
}
