import { sdkSettings } from '@/sdk/core/SdkSettings'
import { queryClient, queryKeys } from '@/config/queryClient'
import axios, { type AxiosInstance, type AxiosError } from 'axios'
import { toast } from 'react-toastify'
import type SessionResponse from '@/sdk/model/response/SessionResponse'

const DEFAULT_TIMEOUT_MS = 60_000

export interface AxiosInstanceParams {
  origin: string
  initPath: string
}

const logout = () => {
  sdkSettings.removeToken()
  sdkSettings.removeRefreshToken()
  queryClient.setQueryData(queryKeys.session, null)
  window.location.href = '/login'
}

let refreshPromise: Promise<string> | null = null

const refreshAccessToken = (origin: string): Promise<string> => {
  if (refreshPromise) {
    return refreshPromise
  }
  refreshPromise = (async () => {
    const refreshToken = sdkSettings.refreshToken
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }
    const { data } = await axios.post<SessionResponse>(
      `${origin}/api/auth/refresh`,
      { refreshToken }
    )
    sdkSettings.token = data.token
    sdkSettings.refreshToken = data.refreshToken
    return data.token
  })().finally(() => {
    refreshPromise = null
  })

  return refreshPromise
}

const handleUnauthorized = async (
  error: AxiosError,
  origin: string,
  instance: AxiosInstance
) => {
  const originalRequest = error.config!
  if (originalRequest.isRetryAfterRefresh) {
    return Promise.reject(error)
  }
  originalRequest.isRetryAfterRefresh = true
  try {
    const newToken = await refreshAccessToken(origin)
    originalRequest.headers.Authorization = `Bearer ${newToken}`
    return instance(originalRequest)
  } catch {
    if (originalRequest.onUnauthorized) {
      originalRequest.onUnauthorized()
    } else {
      toast.warning('Su sesión ha expirado')
      logout()
    }
    return Promise.reject(error)
  }
}

const handleForbidden = (error: AxiosError) => {
  const onForbidden = error.config?.onForbidden
  if (onForbidden) {
    onForbidden()
  } else {
    toast.warning('No tienes permiso para realizar esta petición')
  }
  return Promise.reject(error)
}

const attachRequestInterceptor = (instance: AxiosInstance) => {
  instance.interceptors.request.use((config) => {
    const token = sdkSettings.token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }

    return config
  })
}

const attachResponseInterceptor = (instance: AxiosInstance, origin: string) => {
  instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      const status = error.response?.status
      if (status === 401) {
        return handleUnauthorized(error, origin, instance)
      }
      if (status === 403) {
        return handleForbidden(error)
      }
      return Promise.reject(error)
    }
  )
}

export const AxiosConfig = ({
  origin,
  initPath,
}: AxiosInstanceParams): AxiosInstance => {
  const instance = axios.create({
    baseURL: `${origin}/${initPath}`,
    timeout: DEFAULT_TIMEOUT_MS,
  })
  attachRequestInterceptor(instance)
  attachResponseInterceptor(instance, origin)
  return instance
}
