import type ErrorResponse from '@/sdk/model/response/ErrorResponse'
import type { AxiosError } from 'axios'
import { toast } from 'react-toastify'

export default function errorResponse({
  error,
  alert = true,
}: {
  error: unknown
  alert?: boolean
}): ErrorResponse {
  let status = 500
  let message = 'Ocurrió un error desconocido'

  if (
    error &&
    typeof error === 'object' &&
    'isAxiosError' in error &&
    (error as AxiosError).isAxiosError
  ) {
    const axiosError = error as AxiosError<Partial<ErrorResponse>>

    if (axiosError.response?.data) {
      const data = axiosError.response.data
      status = data.status ?? 500
      message = data.message ?? message
    } else if (axiosError.request) {
      status = 0
      message = 'No se pudo conectar con el servidor'
    } else {
      message = axiosError.message ?? message
    }
  }
  // Si es un Error nativo de JS
  else if (error instanceof Error) {
    message = error.message ?? message
  }

  if (alert) {
    toast.error(message)
  }

  return { status, message }
}
