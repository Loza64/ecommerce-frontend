import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { RequireGuest } from '@/components/guards/RequireGuest'
import { FormField } from '@/components/ui/FormField'
import { Button } from '@/components/ui/Button'
import { useSession } from '@/hooks/useSession'
import { loginSchema, type LoginFormValues } from '@/schemas/auth'
import { RoutesEnum } from '@/enum/routes..app'
import errorResponse from '@/utils/errorResponse'

function LoginPage() {
  const { login, saveSession } = useSession()
  const [error, setError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (values: LoginFormValues) => {
    setError(null)
    try {
      const session = await login(values)
      saveSession(session)
    } catch (err) {
      setError(
        errorResponse({ error: err, alert: false }).message ||
          'Usuario o contraseña incorrectos.'
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

        <h1 className="auth-title">Inicia sesión</h1>
        <p className="auth-subtitle">Ingresa tus credenciales para continuar</p>

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

          <FormField
            label="Contraseña"
            htmlFor="password"
            error={errors.password?.message}
          >
            <input
              id="password"
              className="field-input"
              type="password"
              autoComplete="current-password"
              {...register('password')}
            />
          </FormField>

          {error && <span className="form-error">{error}</span>}

          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Ingresando...' : 'Ingresar'}
          </Button>
        </form>

        <p className="auth-footer">
          ¿No tienes cuenta? <Link to={RoutesEnum.SIGNUP}>Crear cuenta</Link>
        </p>
      </div>
    </div>
  )
}

export default function Login() {
  return (
    <RequireGuest>
      <LoginPage />
    </RequireGuest>
  )
}
