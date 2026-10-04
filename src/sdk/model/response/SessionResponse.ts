import type User from '../../../models/entities/User'

export default interface SessionResponse {
  token: string
  refreshToken: string
  data: User
}
