import { useCallback, useState, useEffect } from 'react'

export default function useQueryParams<const T extends readonly string[]>(
  querys: T
) {
  type Keys = T[number]

  const isAllowed = useCallback(
    (key: string): key is Keys => querys.includes(key as Keys),
    [querys]
  )

  const [params, setParams] = useState<Record<Keys, string | null>>(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const result = {} as Record<Keys, string | null>
    ;(querys as readonly Keys[]).forEach((q) => {
      result[q] = urlParams.get(q)
    })
    return result
  })

  const updateParams = useCallback(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const result = {} as Record<Keys, string | null>
    ;(querys as readonly Keys[]).forEach((q) => {
      result[q] = urlParams.get(q)
    })
    setParams(result)
  }, [querys])

  useEffect(() => {
    const onPopState = () => updateParams()
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [updateParams])

  const setUrlParam = useCallback(
    (key: Keys, value: string, options?: { replace?: boolean }) => {
      if (!isAllowed(key)) {
        return
      }
      const url = new URL(window.location.href)
      url.searchParams.set(key, value)
      if (options?.replace) {
        window.history.replaceState({}, '', url.toString())
      } else {
        window.history.pushState({}, '', url.toString())
      }
      updateParams()
    },
    [isAllowed, updateParams]
  )

  const removeUrlParam = useCallback(
    (key: Keys, options?: { replace?: boolean }) => {
      if (!isAllowed(key)) {
        return
      }
      const url = new URL(window.location.href)
      url.searchParams.delete(key)
      if (options?.replace) {
        window.history.replaceState({}, '', url.toString())
      } else {
        window.history.pushState({}, '', url.toString())
      }
      updateParams()
    },
    [isAllowed, updateParams]
  )

  const setUrlParams = useCallback(
    (
      parameters: Partial<Record<Keys, string>>,
      options?: { replace?: boolean }
    ) => {
      const url = new URL(window.location.href)
      ;(Object.entries(parameters) as [Keys, string | undefined][]).forEach(
        ([key, value]) => {
          if (!isAllowed(key)) {
            return
          }
          if (value === undefined) {
            return
          }
          url.searchParams.set(key, value)
        }
      )
      if (options?.replace) {
        window.history.replaceState({}, '', url.toString())
      } else {
        window.history.pushState({}, '', url.toString())
      }
      updateParams()
    },
    [isAllowed, updateParams]
  )

  return {
    params,
    setUrlParam,
    removeUrlParam,
    setUrlParams,
  }
}
