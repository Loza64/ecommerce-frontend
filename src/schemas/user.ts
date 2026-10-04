import { z } from 'zod'
import type Role from '@/models/entities/Role'

export const userFormSchema = z.object({
  username: z.string().min(1, 'El usuario es obligatorio.'),
  name: z.string().optional(),
  surname: z.string().min(1, 'El apellido es obligatorio.'),
  email: z
    .string()
    .min(1, 'El email es obligatorio.')
    .email('Ingresa un email válido.'),
  password: z.string().optional(),
  blocked: z.boolean(),
  role: z.custom<Role | null>(() => true),
})
export type UserFormValues = z.infer<typeof userFormSchema>

export function validatePasswordRequiredOnCreate(
  isEditing: boolean,
  password?: string
): string | null {
  if (isEditing) {
    return null
  }
  if (!password) {
    return 'La contraseña es obligatoria.'
  }
  return null
}
