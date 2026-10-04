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
    maxUses: z.string().trim(),
    maxUsesPerUser: z.string().trim(),
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

    const limits: Array<['maxUses' | 'maxUsesPerUser', string]> = [
      ['maxUses', data.maxUses],
      ['maxUsesPerUser', data.maxUsesPerUser],
    ]
    for (const [field, raw] of limits) {
      if (raw === '') {
        continue
      }
      const n = Number(raw)
      if (!Number.isInteger(n) || n < 1) {
        ctx.addIssue({
          code: 'custom',
          path: [field],
          message: 'Ingresa un entero mayor o igual a 1, o déjalo vacío.',
        })
      }
    }
    if (
      data.maxUses !== '' &&
      data.maxUsesPerUser !== '' &&
      Number(data.maxUsesPerUser) > Number(data.maxUses)
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['maxUsesPerUser'],
        message: 'No puede superar el límite total de usos.',
      })
    }
  })
export type CouponFormValues = z.infer<typeof couponFormSchema>
