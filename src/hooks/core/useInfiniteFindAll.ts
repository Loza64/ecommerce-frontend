import { AbstractService } from '@/sdk/model/core/AbstractService'
import BaseEntity from '@/sdk/model/entities/BaseEntity'
import PaginationResponse from '@/sdk/model/response/PaginationResponse'
import {
  useInfiniteQuery,
  useQueryClient,
  InfiniteData,
  UseInfiniteQueryOptions,
} from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type QueryData<Entity extends BaseEntity> = PaginationResponse<Entity>
type QueryKey = readonly unknown[]

type InfiniteOpts<
  Entity extends BaseEntity,
  Selected = InfiniteData<QueryData<Entity>>,
> = UseInfiniteQueryOptions<QueryData<Entity>, Error, Selected, QueryKey>

export interface UseInfiniteListOptions<
  Entity extends BaseEntity,
  Selected = InfiniteData<QueryData<Entity>>,
> extends Omit<
  InfiniteOpts<Entity, Selected>,
  'queryKey' | 'queryFn' | 'getNextPageParam' | 'initialPageParam'
> {
  service: AbstractService<Entity>
  endpoint?: string
  queryKey: string | string[]
  queryParams?: Record<string, unknown>
  onUnauthorized?: () => void
  onForbidden?: () => void
  getNextPageParam: NonNullable<
    InfiniteOpts<Entity, Selected>['getNextPageParam']
  >
  initialPageParam?: InfiniteOpts<Entity, Selected>['initialPageParam']
}

export type InfiniteFindAllResult<Entity extends BaseEntity> = InfiniteData<
  QueryData<Entity>
>

const EMPTY_INFINITE_CACHE = {
  pages: [],
  pageParams: [],
}

const useInfiniteFindAll = <
  Entity extends BaseEntity,
  Selected = InfiniteData<QueryData<Entity>>,
>({
  service,
  endpoint,
  queryKey,
  queryParams = {},
  getNextPageParam,
  initialPageParam = undefined,
  onForbidden,
  onUnauthorized,
  ...options
}: UseInfiniteListOptions<Entity, Selected>) => {
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

  const hook = useInfiniteQuery<QueryData<Entity>, Error, Selected, QueryKey>({
    queryKey: finalQueryKey,
    queryFn: ({ pageParam }) =>
      service.findAll({
        endpoint,
        config: {
          params: {
            ...queryParams,
            ...(pageParam !== null &&
            typeof pageParam === 'object' &&
            !Array.isArray(pageParam)
              ? pageParam
              : {}),
          },
          onUnauthorized,
          onForbidden,
        },
      }),
    getNextPageParam,
    initialPageParam,
    ...options,
  })

  // ─── Cache helpers ──────────────────────────────────────────────────────────

  const getSafeCache = useCallback(
    (old?: InfiniteFindAllResult<Entity>): InfiniteFindAllResult<Entity> =>
      old ?? { ...EMPTY_INFINITE_CACHE },
    []
  )

  const updateInfiniteCacheData = useCallback(
    (
      updater: (
        base: InfiniteFindAllResult<Entity>
      ) => InfiniteFindAllResult<Entity>
    ) => {
      queryClient.setQueryData<InfiniteFindAllResult<Entity>>(
        finalQueryKey,
        (old) => updater(getSafeCache(old))
      )
    },
    [queryClient, finalQueryKey, getSafeCache]
  )

  const addItemInCache = useCallback(
    (item: Entity) => {
      updateInfiniteCacheData((base) => {
        if (base.pages.length === 0) {
          return base
        }

        const alreadyExists = base.pages.some((page) =>
          page.data.some((i) => i.id === item.id)
        )
        if (alreadyExists) {
          return base
        }

        return {
          ...base,
          pages: base.pages.map((page, index) =>
            index === 0 ? { ...page, data: [item, ...page.data] } : page
          ),
        }
      })
    },
    [updateInfiniteCacheData]
  )

  const updateItemInCache = useCallback(
    (id: string | number, updater: (item: Entity) => Entity) => {
      updateInfiniteCacheData((base) => ({
        ...base,
        pages: base.pages.map((page) => ({
          ...page,
          data: page.data.map((item) =>
            item.id === id ? updater(item) : item
          ),
        })),
      }))
    },
    [updateInfiniteCacheData]
  )

  const removeItemInCache = useCallback(
    (id: string | number) => {
      updateInfiniteCacheData((base) => ({
        ...base,
        pages: base.pages.map((page) => ({
          ...page,
          data: page.data.filter((item) => item.id !== id),
        })),
      }))
    },
    [updateInfiniteCacheData]
  )

  const emptyCache = useCallback(() => {
    updateInfiniteCacheData(() => ({ ...EMPTY_INFINITE_CACHE }))
  }, [updateInfiniteCacheData])

  return {
    ...hook,
    finalQueryKey,
    addItemInCache,
    updateItemInCache,
    removeItemInCache,
    emptyCache,
  }
}

export default useInfiniteFindAll
