import { z } from 'zod'

export const couponFormSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(3, 'El código debe tener al menos 3 caracteres.')
      .max(50, 'Máximo 50 caracteres.')
      .regex(/^[A-Za-z0-9_-]+$/, 'Solo letras, números, guion y guion bajo.'),
    discountType: z.enum(['percentage', 'fixed']),
    discountValue: z.string().min(1, 'El valor es obligatorio.'),
    expirationDate: z.string().min(1, 'La fecha de expiración es obligatoria.'),
  })
  .superRefine((data, ctx) => {
    const value = Number(data.discountValue)
    if (!Number.isFinite(value) || value <= 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['discountValue'],
        message: 'Ingresa un valor mayor a 0.',
      })
    } else if (data.discountType === 'percentage' && value > 100) {
      ctx.addIssue({
        code: 'custom',
        path: ['discountValue'],
        message: 'El porcentaje no puede superar 100.',
      })
    }
  })
export type CouponFormValues = z.infer<typeof couponFormSchema>
