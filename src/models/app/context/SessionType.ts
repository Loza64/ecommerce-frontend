import type { UseMutateAsyncFunction } from '@tanstack/react-query'
import type SessionResponse from '@/sdk/model/response/SessionResponse'
import type User from '@/models/entities/User'

export interface SignUpPayload {
  username: string
  name: string
  surname: string
  email: string
  password: string
}

export default interface SessionType {
  profile?: User | null
  login: UseMutateAsyncFunction<
    SessionResponse,
    unknown,
    { username: string; password: string }
  >
  signup: UseMutateAsyncFunction<SessionResponse, unknown, SignUpPayload>
  saveSession: (session: SessionResponse) => void
  logout: () => Promise<void>
  loading: {
    profile: boolean
    login: boolean
    signup: boolean
  }
}
