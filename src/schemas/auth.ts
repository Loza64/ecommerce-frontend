import { z } from 'zod'

export const loginSchema = z.object({
  username: z.string().min(1, 'El usuario es obligatorio.'),
  password: z.string().min(1, 'La contraseña es obligatoria.'),
})
export type LoginFormValues = z.infer<typeof loginSchema>

export const signupSchema = z
  .object({
    username: z.string().min(1, 'El usuario es obligatorio.'),
    name: z.string().min(1, 'El nombre es obligatorio.'),
    surname: z.string().min(1, 'El apellido es obligatorio.'),
    email: z
      .string()
      .min(1, 'El email es obligatorio.')
      .email('Ingresa un email válido.'),
    password: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres.'),
    confirmPassword: z.string().min(1, 'Confirma la contraseña.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmPassword'],
  })
export type SignupFormValues = z.infer<typeof signupSchema>
