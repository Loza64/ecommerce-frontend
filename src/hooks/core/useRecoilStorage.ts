import { useEffect } from 'react'
import { AtomEffect, atomFamily, useRecoilState, RecoilState } from 'recoil'
import { ZodType, z } from 'zod'
import CryptoJS from 'crypto-js'
import { sdkSettings } from '@/sdk/core/SdkSettings'

export const localStorageEffectWithZod = <T>(
  storageKey: string,
  schema: ZodType<T>
): AtomEffect<T | undefined> => {
  return ({ setSelf, onSet }) => {
    if (typeof window === 'undefined') {
      return
    }

    const SECRET_KEY = sdkSettings.secretKey
    const savedValue = localStorage.getItem(storageKey)

    if (savedValue) {
      try {
        const bytes = CryptoJS.AES.decrypt(savedValue, SECRET_KEY)
        const decrypted = bytes.toString(CryptoJS.enc.Utf8)
        const parsed: unknown = JSON.parse(decrypted)
        const result = schema.safeParse(parsed)

        if (result.success) {
          setSelf(result.data)
        } else {
          console.warn(`Invalid data in localStorage for key: ${storageKey}`)
          localStorage.removeItem(storageKey)
        }
      } catch (error) {
        console.error(
          `Failed to parse localStorage for key: ${storageKey}`,
          error
        )
        localStorage.removeItem(storageKey)
      }
    }

    onSet((newValue, _, isReset) => {
      if (isReset || newValue === undefined) {
        localStorage.removeItem(storageKey)
      } else {
        try {
          const stringified = JSON.stringify(newValue)
          const encrypted = CryptoJS.AES.encrypt(
            stringified,
            SECRET_KEY
          ).toString()
          localStorage.setItem(storageKey, encrypted)
        } catch (error) {
          console.error(
            `Failed to save to localStorage for key: ${storageKey}`,
            error
          )
        }
      }
    })
  }
}

const anyValueSchema = z.unknown()

export const dynamicRecoilFamily = atomFamily<unknown | undefined, string>({
  key: 'storage_recoil_family',
  default: undefined,
  effects_UNSTABLE: (param) => [
    localStorageEffectWithZod(`recoil_${param}`, anyValueSchema),
  ],
})

export default function useRecoilStorage<T>(key: string, defaultValue?: T) {
  const [state, setState] = useRecoilState<T | undefined>(
    dynamicRecoilFamily(key) as RecoilState<T | undefined>
  )

  useEffect(() => {
    if (state === undefined && defaultValue !== undefined) {
      setState(defaultValue)
    }
  }, [state, defaultValue, setState])

  return [state, setState] as const
}
