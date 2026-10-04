import { z } from 'zod'
import type Category from '@/models/entities/Category'

export const categoryFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'El nombre es obligatorio.')
    .max(100, 'Máximo 100 caracteres.'),
  description: z.string().max(1000, 'Máximo 1000 caracteres.').optional(),
  parent: z.custom<Category | null>(() => true),
})
export type CategoryFormValues = z.infer<typeof categoryFormSchema>
