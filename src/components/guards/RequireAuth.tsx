import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { sdkSettings } from '@/sdk/core/SdkSettings'
import { RoutesEnum } from '@/enum/routes..app'

export function RequireAuth({ children }: { children: ReactNode }) {
  if (!sdkSettings.token) {
    return <Navigate to={RoutesEnum.LOGIN} replace />
  }
  return <>{children}</>
}
