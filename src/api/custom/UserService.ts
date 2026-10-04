import { SignUpPayload } from '@/models/app/context/SessionType'
import User from '@/models/entities/User'
import { sdkSettings } from '@/sdk/core/SdkSettings'
import Service from '@/sdk/core/Service'
import SessionResponse from '@/sdk/model/response/SessionResponse'

export default class UserService extends Service<User> {
  constructor() {
    super({
      origin: sdkSettings.apiService,
      endpoint: '/users',
    })
  }

  public async login({
    username,
    password,
    onUnauthorized,
  }: {
    username: string
    password: string
    onUnauthorized?: () => void
  }): Promise<SessionResponse> {
    const res = await this.axios.post<SessionResponse>(
      '/auth/login',
      { username, password },
      { onUnauthorized }
    )
    return res.data
  }

  public async signUp({
    payload,
  }: {
    payload: SignUpPayload
  }): Promise<SessionResponse> {
    const res = await this.axios.post<SessionResponse>('/auth/signup', payload)
    return res.data
  }

  public async profile(): Promise<User> {
    const res = await this.axios.get<User>('/auth/profile')
    return res.data
  }

  public async logout({
    refreshToken,
  }: {
    refreshToken: string
  }): Promise<void> {
    await this.axios.post<void>('/auth/logout', { refreshToken })
  }
}
