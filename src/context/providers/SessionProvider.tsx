import { type ReactNode, useCallback } from 'react'
import { toast } from 'react-toastify'
import { useNavigate, useLocation } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { SessionContext } from '../SessionContext'
import { sdkSettings } from '@/sdk/core/SdkSettings'
import { queryKeys } from '@/config/queryClient'
import { userService } from '@/api'
import SessionResponse from '@/sdk/model/response/SessionResponse'
import User from '@/models/entities/User'
import SessionType, { SignUpPayload } from '@/models/app/context/SessionType'
import errorResponse from '@/utils/errorResponse'
import { RoutesEnum } from '@/enum/routes..app'
import { homeRouteFor } from '@/lib/routes'

const service = userService
const settings = sdkSettings

export default function SessionProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()

  const token = settings.token

  const { data: profile, isLoading: profileLoading } = useQuery<User>({
    queryKey: queryKeys.session,
    queryFn: () => service.profile(),
    enabled: !!token,
    retry: false,
  })

  const loginMutation = useMutation({
    mutationFn: (payload: { username: string; password: string }) =>
      service.login(payload),
  })

  const signupMutation = useMutation({
    mutationFn: (payload: SignUpPayload) => service.signUp({ payload }),
  })

  const saveSession = useCallback(
    ({ token, data, refreshToken }: SessionResponse) => {
      settings.token = token
      settings.refreshToken = refreshToken
      queryClient.setQueryData(queryKeys.session, data)
      navigate(homeRouteFor(data.role?.name), { replace: true })
    },
    [navigate, queryClient]
  )

  const logout = useCallback(async () => {
    try {
      const refreshToken = settings.refreshToken
      if (refreshToken) {
        await service.logout({ refreshToken })
        settings.removeRefreshToken()
      }
      settings.removeToken()
      queryClient.setQueryData(queryKeys.session, null)
      toast.info('Sesión cerrada correctamente.')

      if (location.pathname !== RoutesEnum.LOGIN) {
        navigate(RoutesEnum.LOGIN, { replace: true })
      }
    } catch (error) {
      errorResponse({ error })
    }
  }, [navigate, location.pathname, queryClient])

  const value: SessionType = {
    profile,
    login: loginMutation.mutateAsync,
    signup: signupMutation.mutateAsync,
    saveSession,
    logout,
    loading: {
      profile: profileLoading,
      login: loginMutation.isPending,
      signup: signupMutation.isPending,
    },
  }

  if (profileLoading && token) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-sm text-(--text-muted)">
        Cargando sesión...
      </div>
    )
  }

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  )
}
