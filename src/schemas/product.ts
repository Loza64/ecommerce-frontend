import { z } from 'zod'
import type Category from '@/models/entities/Category'
import type ImageAsset from '@/models/app/photos/ImageAsset'

export const MAX_IMAGES = 10
export const MAX_VARIANTS = 50

export const productFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'El nombre es obligatorio.')
    .max(200, 'Máximo 200 caracteres.'),
  description: z
    .string()
    .trim()
    .min(1, 'La descripción es obligatoria.')
    .max(5000, 'Máximo 5000 caracteres.'),
  category: z.custom<Category | null>((value) => !!value, {
    message: 'Selecciona una categoría.',
  }),
  images: z.custom<ImageAsset[]>(
    (value) =>
      Array.isArray(value) && value.length >= 1 && value.length <= MAX_IMAGES,
    { message: `Agrega entre 1 y ${MAX_IMAGES} imágenes.` }
  ),
})
export type ProductFormValues = z.infer<typeof productFormSchema>

export const variantFormSchema = z
  .object({
    sku: z
      .string()
      .trim()
      .min(1, 'El SKU es obligatorio.')
      .max(100, 'Máximo 100 caracteres.')
      .regex(
        /^[A-Za-z0-9._-]+$/,
        'Solo letras, números, punto, guion y guion bajo.'
      ),
    price: z.string().min(1, 'El precio es obligatorio.'),
    stockQuantity: z.string().min(1, 'El stock es obligatorio.'),
    attributes: z.array(z.object({ key: z.string(), value: z.string() })),
  })
  .superRefine((data, ctx) => {
    const price = Number(data.price)
    if (!Number.isFinite(price) || price < 0.01) {
      ctx.addIssue({
        code: 'custom',
        path: ['price'],
        message: 'Ingresa un precio mayor a 0.',
      })
    } else if (Math.round(price * 100) / 100 !== price) {
      ctx.addIssue({
        code: 'custom',
        path: ['price'],
        message: 'Usa máximo 2 decimales.',
      })
    }

    const stock = Number(data.stockQuantity)
    if (!Number.isInteger(stock) || stock < 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['stockQuantity'],
        message: 'El stock debe ser un número entero, 0 o mayor.',
      })
    }

    const keys = data.attributes
      .map((attribute) => attribute.key.trim().toLowerCase())
      .filter(Boolean)
    if (new Set(keys).size !== keys.length) {
      ctx.addIssue({
        code: 'custom',
        path: ['attributes'],
        message: 'No repitas el nombre de un atributo.',
      })
    }
    if (data.attributes.some((a) => a.key.trim() && !a.value.trim())) {
      ctx.addIssue({
        code: 'custom',
        path: ['attributes'],
        message: 'Completa el valor de cada atributo.',
      })
    }
  })
export type VariantFormValues = z.infer<typeof variantFormSchema>
