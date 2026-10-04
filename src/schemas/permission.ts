import { z } from 'zod'

export const permissionFormSchema = z.object({
  title: z.string().min(2, 'El título es obligatorio.'),
})
export type PermissionFormValues = z.infer<typeof permissionFormSchema>
