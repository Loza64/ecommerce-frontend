import { AbstractService } from '@/sdk/model/core/AbstractService'
import BaseEntity from '@/sdk/model/entities/BaseEntity'
import PaginationResponse from '@/sdk/model/response/PaginationResponse'
import {
  useQuery,
  UseQueryResult,
  UseQueryOptions,
  useQueryClient,
} from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'

type QueryData<Entity extends BaseEntity> = PaginationResponse<Entity>

type QueryOpts<Entity extends BaseEntity> = UseQueryOptions<
  QueryData<Entity>,
  Error,
  QueryData<Entity>,
  readonly unknown[]
>

export interface UseListOptions<Entity extends BaseEntity> extends Omit<
  QueryOpts<Entity>,
  'queryKey' | 'queryFn'
> {
  service: AbstractService<Entity>
  endpoint?: string
  queryParams?: Record<string, unknown>
  queryKey: string | string[]
  onUnauthorized?: () => void
  onForbidden?: () => void
}

export type FindAllResult<Entity extends BaseEntity> = UseQueryResult<
  QueryData<Entity>,
  Error
>

// ─── Constants ────────────────────────────────────────────────────────────────
const EMPTY_PAGINATION: PaginationResponse<never>['pagination'] = {
  total: 0,
  page: 1,
  pageSize: 0,
  nextCursor: '',
  pageCount: 0,
}

export const useFindAll = <Entity extends BaseEntity>({
  service,
  endpoint,
  queryParams = {},
  queryKey,
  onUnauthorized,
  onForbidden,
  ...options
}: UseListOptions<Entity>) => {
  const queryClient = useQueryClient()

  const normalizedQueryKey = useMemo(
    () => (Array.isArray(queryKey) ? queryKey : [queryKey]),
    [queryKey]
  )

  const stableQueryParams = useMemo(
    () => JSON.stringify(queryParams),
    [queryParams]
  )

  const finalQueryKey = useMemo(
    () => [...normalizedQueryKey, endpoint ?? null, stableQueryParams] as const,
    [normalizedQueryKey, endpoint, stableQueryParams]
  )

  // ─── Query ──────────────────────────────────────────────────────────────────
  const hook = useQuery<QueryData<Entity>, Error>({
    queryKey: finalQueryKey,
    queryFn: () =>
      service.findAll({
        endpoint,
        config: { params: queryParams, onForbidden, onUnauthorized },
      }),
    ...options,
  })

  // ─── Cache helpers ──────────────────────────────────────────────────────────
  const getSafeCache = useCallback(
    (old?: QueryData<Entity>): QueryData<Entity> =>
      old ?? { data: [], pagination: { ...EMPTY_PAGINATION } },
    []
  )

  const updateCacheData = useCallback(
    (updater: (base: QueryData<Entity>) => QueryData<Entity>) => {
      queryClient.setQueryData<QueryData<Entity>>(finalQueryKey, (old) =>
        updater(getSafeCache(old))
      )
    },
    [queryClient, finalQueryKey, getSafeCache]
  )

  const addItemInCache = useCallback(
    (item: Entity) => {
      updateCacheData((base) => {
        if (base.data.some((i) => i.id === item.id)) {
          return base
        }
        return { ...base, data: [item, ...base.data] }
      })
    },
    [updateCacheData]
  )

  const updateItemInCache = useCallback(
    (id: string | number, updater: (item: Entity) => Entity) => {
      updateCacheData((base) => ({
        ...base,
        data: base.data.map((item) => (item.id === id ? updater(item) : item)),
      }))
    },
    [updateCacheData]
  )

  const removeItemInCache = useCallback(
    (id: string | number) => {
      updateCacheData((base) => ({
        ...base,
        data: base.data.filter((item) => item.id !== id),
      }))
    },
    [updateCacheData]
  )

  const emptyCache = useCallback(() => {
    updateCacheData(() => getSafeCache())
  }, [updateCacheData, getSafeCache])

  return {
    ...hook,
    finalQueryKey,
    addItemInCache,
    updateItemInCache,
    removeItemInCache,
    emptyCache,
  }
}
