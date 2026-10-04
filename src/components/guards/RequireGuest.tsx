import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { sdkSettings } from '@/sdk/core/SdkSettings'
import { RoutesEnum } from '@/enum/routes..app'

export function RequireGuest({ children }: { children: ReactNode }) {
  if (sdkSettings.token) {
    return <Navigate to={RoutesEnum.HOME} replace />
  }
  return <>{children}</>
}
