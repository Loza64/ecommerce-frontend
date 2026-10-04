import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { RequireGuest } from '@/components/guards/RequireGuest'
import { FormField } from '@/components/ui/FormField'
import { Button } from '@/components/ui/Button'
import { useSession } from '@/hooks/useSession'
import { signupSchema, type SignupFormValues } from '@/schemas/auth'
import { RoutesEnum } from '@/enum/routes..app'
import errorResponse from '@/utils/errorResponse'

function SignupPage() {
  const { signup, saveSession } = useSession()
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    mode: 'onBlur',
  })

  const onSubmit = async (values: SignupFormValues) => {
    setError(null)
    try {
      // confirmPassword solo se valida en el front; el backend lo rechaza
      const { username, name, surname, email, password } = values
      const session = await signup({ username, name, surname, email, password })
      saveSession(session)
    } catch (err: unknown) {
      const res = errorResponse({ error: err, alert: false }) as {
        message?: string
      }
      setError(
        res?.message ||
          'No se pudo crear la cuenta. Revisa los datos e intenta de nuevo.'
      )
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="auth-brand-mark">A</span>
          <span className="auth-brand-name">Admin Panel</span>
        </div>

        <h1 className="auth-title">Crea tu cuenta</h1>
        <p className="auth-subtitle">Completa tus datos para registrarte</p>

        {/* Mensaje de error general de la API / Servidor */}
        {error && (
          <div className="form-error-global mb-4 text-sm text-red-500">
            {error}
          </div>
        )}

        <form
          className="form-grid"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <FormField
            label="Usuario"
            htmlFor="username"
            error={errors.username?.message}
          >
            <input
              id="username"
              className="field-input"
              type="text"
              autoComplete="username"
              {...register('username')}
            />
          </FormField>

          <div className="auth-row">
            <FormField
              label="Nombre"
              htmlFor="name"
              error={errors.name?.message}
            >
              <input
                id="name"
                className="field-input"
                type="text"
                autoComplete="given-name"
                {...register('name')}
              />
            </FormField>

            <FormField
              label="Apellido"
              htmlFor="surname"
              error={errors.surname?.message}
            >
              <input
                id="surname"
                className="field-input"
                type="text"
                autoComplete="family-name"
                {...register('surname')}
              />
            </FormField>
          </div>

          <FormField
            label="Email"
            htmlFor="email"
            error={errors.email?.message}
          >
            <input
              id="email"
              className="field-input"
              type="email"
              autoComplete="email"
              {...register('email')}
            />
          </FormField>

          <FormField
            label="Contraseña"
            htmlFor="password"
            hint="Mínimo 8 caracteres"
            error={errors.password?.message}
          >
            <input
              id="password"
              className="field-input"
              type="password"
              autoComplete="new-password"
              {...register('password')}
            />
          </FormField>

          <FormField
            label="Confirmar contraseña"
            htmlFor="confirmPassword"
            error={errors.confirmPassword?.message}
          >
            <input
              id="confirmPassword"
              className="field-input"
              type="password"
              autoComplete="new-password"
              {...register('confirmPassword')}
            />
          </FormField>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
          </Button>
        </form>

        <p className="auth-footer">
          ¿Ya tienes cuenta? <Link to={RoutesEnum.LOGIN}>Inicia sesión</Link>
        </p>
      </div>
    </div>
  )
}

export default function Signup() {
  return (
    <RequireGuest>
      <SignupPage />
    </RequireGuest>
  )
}
