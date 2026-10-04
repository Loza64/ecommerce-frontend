import { z } from 'zod'
import type Permissions from '@/models/entities/Permissions'

export const roleFormSchema = z.object({
  name: z.string().min(2, 'El nombre es obligatorio.'),
  active: z.boolean(),
  permissions: z.custom<Permissions[]>((value) => Array.isArray(value), {
    message: 'Selecciona al menos un permiso.',
  }),
})
export type RoleFormValues = z.infer<typeof roleFormSchema>
