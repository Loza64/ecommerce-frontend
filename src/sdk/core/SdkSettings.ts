type StorageLocal = {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export default class SdkSettings {
  private storage: StorageLocal

  constructor(storage: StorageLocal = localStorage) {
    this.storage = storage
  }

  get apiService(): string {
    try {
      const url = new URL(import.meta.env.VITE_API_SERVICE).origin
      if (!url) {
        throw new Error('VITE_API_SERVICE not defined in environment')
      }
      return url
    } catch {
      throw new Error('Failed to get authService from environment')
    }
  }

  set token(value: string) {
    try {
      this.storage.setItem('token', value)
    } catch (err) {
      console.warn('Failed to set token in storage', err)
    }
  }

  get token(): string | null {
    const token = this.storage.getItem('token')
    return token
  }

  removeToken() {
    try {
      this.storage.removeItem('token')
    } catch (err) {
      console.warn('Failed to remove token from storage', err)
    }
  }

  set refreshToken(value: string) {
    try {
      this.storage.setItem('refreshToken', value)
    } catch (err) {
      console.warn('Failed to set refreshToken in storage', err)
    }
  }

  get refreshToken(): string | null {
    return this.storage.getItem('refreshToken')
  }

  removeRefreshToken() {
    try {
      this.storage.removeItem('refreshToken')
    } catch (err) {
      console.warn('Failed to remove refreshToken from storage', err)
    }
  }

  get secretKey(): string {
    try {
      const key = import.meta.env.VITE_SECRET_KEY
      if (!key) {
        throw new Error('VITE_SECRET_KEY not defined in environment')
      }
      return key
    } catch {
      throw new Error('Failed to get secretKey from environment')
    }
  }
}

export const sdkSettings = new SdkSettings()
