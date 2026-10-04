import 'axios'

declare module 'axios' {
  export interface AxiosRequestConfig {
    onUnauthorized?: () => void
    onForbidden?: () => void
    isRetryAfterRefresh?: boolean
  }
}
